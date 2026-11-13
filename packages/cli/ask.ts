import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { appendTrace, estimateTokens } from './trace.js';

export interface AskOptions {
  question: string;
  scope: string;
  tracePath?: string;
  maxLines?: number;
  maxCodeBlockLines?: number;
  adapter?: 'auto' | 'claude' | 'opencode' | 'deterministic';
}

export interface AskResult {
  distilled: string;
  childTokensEstimate: number;
  parentTokensEstimate: number;
  filesInspected: string[];
  adapterUsed: string;
}

/**
 * Minimal zero-dependency glob matcher for file scoping.
 */
export function matchGlob(root: string, pattern: string): string[] {
  const matches: string[] = [];

  // Normalize pattern: remove leading ./
  const cleanPattern = pattern.replace(/^\.\//, '');

  // If pattern is a directory, inspect all files in that directory
  const directPath = resolve(root, cleanPattern);
  if (existsSync(directPath) && statSync(directPath).isDirectory()) {
    const files = readdirSync(directPath);
    for (const f of files) {
      const full = join(directPath, f);
      if (statSync(full).isFile()) {
        matches.push(full);
      }
    }
    return matches;
  }

  // Convert simple glob pattern to RegExp
  // e.g. "modules/*.md" -> /^modules\/[^/]+\.md$/
  // "code/**/*.css" -> /^code\/.*\.css$/
  const regexStr = '^' + cleanPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___DOUBLE_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE_STAR___/g, '.*') + '$';
  const regex = new RegExp(regexStr);

  function walk(dir: string): void {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = relative(root, full);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(full);
        }
      } else if (entry.isFile()) {
        if (regex.test(rel) || regex.test(rel.replace(/\\/g, '/'))) {
          matches.push(full);
        }
      }
    }
  }

  // If pattern starts with a specific root folder (e.g. modules/) start there
  const firstSegment = cleanPattern.split('/')[0];
  if (firstSegment && !firstSegment.includes('*') && existsSync(resolve(root, firstSegment))) {
    walk(resolve(root, firstSegment));
  } else {
    walk(root);
  }

  return matches;
}

/**
 * Enforces firewall invariants:
 * 1. <= 20 lines total
 * 2. No code blocks longer than 5 lines
 * 3. No conversational preamble
 */
export function enforceFirewallConstraints(
  rawText: string,
  maxLines: number = 20,
  maxCodeBlockLines: number = 5
): string {
  // Strip conversational preambles
  let text = rawText
    .replace(/^(Sure[!,.]?|Here is|Here are|Based on|According to|Certainly[!,.]?).*?\n+/i, '')
    .trim();

  const lines = text.split('\n');
  const sanitizedLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLineCount = 0;

  for (const line of lines) {
    if (sanitizedLines.length >= maxLines) break;

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLineCount = 0;
        sanitizedLines.push(line);
      } else {
        inCodeBlock = false;
        sanitizedLines.push(line);
      }
      continue;
    }

    if (inCodeBlock) {
      if (codeBlockLineCount < maxCodeBlockLines) {
        sanitizedLines.push(line);
        codeBlockLineCount++;
      } else if (codeBlockLineCount === maxCodeBlockLines) {
        sanitizedLines.push('/* ... truncated to 5 lines ... */');
        codeBlockLineCount++;
      }
      continue;
    }

    sanitizedLines.push(line);
  }

  // Ensure unclosed code block is closed
  if (inCodeBlock) {
    sanitizedLines.push('```');
  }

  return sanitizedLines.slice(0, maxLines).join('\n').trim();
}

/**
 * Deterministic local fallback extractor when external LLM adapter is unavailable,
 * errored, or unauthenticated. Zero runtime network.
 */
export function distillLocally(
  question: string,
  files: { path: string; content: string }[],
  maxLines: number = 20,
  maxCodeBlockLines: number = 5
): string {
  const qTokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['what', 'which', 'when', 'where', 'how', 'show', 'give', 'tell', 'about'].includes(w));

  const candidateSnippets: { score: number; text: string }[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#')) {
        currentSection = line.replace(/^#+\s*/, '');
      }

      const lower = line.toLowerCase();
      let matchCount = 0;
      for (const token of qTokens) {
        if (lower.includes(token)) matchCount++;
      }

      if (matchCount > 0) {
        // Collect a small window
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length - 1, i + 3);
        const snippet = lines.slice(start, end + 1).join('\n');
        candidateSnippets.push({
          score: matchCount * 2 + (currentSection ? 1 : 0),
          text: snippet,
        });
      }
    }
  }

  candidateSnippets.sort((a, b) => b.score - a.score);

  if (candidateSnippets.length === 0) {
    // Return concise file headers if no direct keyword match
    const summaryLines = files.map(
      (f) => `- ${relative(process.cwd(), f.path)}: ${f.content.slice(0, 100).replace(/\n/g, ' ')}...`
    );
    return enforceFirewallConstraints(summaryLines.join('\n'), maxLines, maxCodeBlockLines);
  }

  const rawCombined = candidateSnippets
    .slice(0, 4)
    .map((s) => s.text)
    .join('\n');

  return enforceFirewallConstraints(rawCombined, maxLines, maxCodeBlockLines);
}

export function executeAsk(options: AskOptions): AskResult {
  const root = process.cwd();
  const matchedFilePaths = matchGlob(root, options.scope);

  if (matchedFilePaths.length === 0) {
    const emptyDistilled = `No files found matching scope: "${options.scope}"`;
    return {
      distilled: emptyDistilled,
      childTokensEstimate: 0,
      parentTokensEstimate: estimateTokens(emptyDistilled),
      filesInspected: [],
      adapterUsed: 'none',
    };
  }

  // Read all scoped files into child context
  const files = matchedFilePaths.map((p) => ({
    path: p,
    content: readFileSync(p, 'utf-8'),
  }));

  const childContext = files
    .map((f) => `--- File: ${relative(root, f.path)} ---\n${f.content}`)
    .join('\n\n');

  const childTokensEstimate = estimateTokens(childContext + '\n\n' + options.question);

  const hardInstruction =
    'You are a disposable sub-agent acting as a context firewall. You are strictly restricted to the provided file contents.\n' +
    'Hard instruction: return <= 20 lines, no code blocks longer than 5 lines, no preamble.\n\n' +
    `Context Files:\n${childContext}\n\n` +
    `Question:\n${options.question}`;

  let distilledText = '';
  let adapterUsed = 'deterministic-fallback';
  const requestedAdapter = options.adapter || (process.env.VITEST ? 'deterministic' : 'auto');

  // 1. Try headless sub-agent adapter (claude -p / opencode run) if enabled
  if (requestedAdapter !== 'deterministic') {
    try {
      const claudeRun = spawnSync('claude', ['-p', '--output-format', 'json', hardInstruction], {
        timeout: 1500,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (claudeRun.status === 0 && claudeRun.stdout) {
        try {
          const json = JSON.parse(claudeRun.stdout);
          const resultText = json.result || json.text || (typeof json === 'string' ? json : '');
          if (resultText && !json.is_error) {
            distilledText = resultText;
            adapterUsed = 'claude-headless';
          }
        } catch {}
      }
    } catch {}
  }

  // 2. Fall back to deterministic local extraction if child sub-agent failed/unavailable
  if (!distilledText) {
    distilledText = distillLocally(
      options.question,
      files,
      options.maxLines ?? 20,
      options.maxCodeBlockLines ?? 5
    );
    adapterUsed = 'deterministic-distiller';
  }

  // Enforce firewall constraints strictly
  const finalDistilled = enforceFirewallConstraints(
    distilledText,
    options.maxLines ?? 20,
    options.maxCodeBlockLines ?? 5
  );

  const parentTokensEstimate = estimateTokens(finalDistilled);

  // Log child token usage separately in the trace
  appendTrace(
    {
      phase: 'ask',
      args: [options.question, '--scope', options.scope],
      tokens_estimate: parentTokensEstimate,
      child_tokens_estimate: childTokensEstimate,
      result: `distilled via ${adapterUsed}`,
    },
    options.tracePath
  );

  return {
    distilled: finalDistilled,
    childTokensEstimate,
    parentTokensEstimate,
    filesInspected: matchedFilePaths,
    adapterUsed,
  };
}

export function runAskCli(args: string[]): void {
  let question = '';
  let scope = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--scope' && args[i + 1]) {
      scope = args[++i];
    } else if (!arg.startsWith('-') && !question) {
      question = arg;
    }
  }

  if (!question || !scope) {
    console.error('Usage: npx auteur-ui ask "<question>" --scope <glob>');
    process.exit(1);
  }

  const result = executeAsk({ question, scope });

  // Output ONLY the distilled answer to stdout
  console.log(result.distilled);
}
