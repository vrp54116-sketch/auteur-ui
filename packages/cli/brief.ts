import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { BriefData } from './types.js';
import { appendTrace } from './trace.js';

export function runBrief(args: string[]): BriefData {
  let type = 'dashboard';
  let title = 'Project UI';
  let prompt = 'Build a non-generic UI application';
  let outPath = '.auteur-ui/brief.json';
  let taskPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--type') {
      type = args[++i];
    } else if (arg === '--title') {
      title = args[++i];
    } else if (arg === '--prompt') {
      prompt = args[++i];
    } else if (arg === '--out') {
      outPath = args[++i];
    } else if (arg === '--task') {
      taskPath = args[++i];
    }
  }

  if (taskPath) {
    const fullTaskPath = resolve(process.cwd(), taskPath);
    if (existsSync(fullTaskPath)) {
      try {
        const content = readFileSync(fullTaskPath, 'utf-8');
        if (fullTaskPath.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed.type) type = parsed.type;
          if (parsed.title) title = parsed.title;
          if (parsed.prompt) prompt = parsed.prompt;
        } else {
          const idMatch = content.match(/^id:\s*(.+)$/m);
          const promptMatch = content.match(/^prompt:\s*["']?([^"'\n]+)["']?$/m);
          const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?$/m);
          if (idMatch) type = idMatch[1].trim();
          if (promptMatch) prompt = promptMatch[1].trim();
          if (titleMatch) title = titleMatch[1].trim();
          else if (idMatch) title = idMatch[1].trim();
        }
      } catch {
        // Fall back to defaults
      }
    } else if (taskPath) {
      type = taskPath;
    }
  }

  const brief: BriefData = {
    id: `brief-${Date.now()}`,
    type,
    title,
    prompt,
    createdAt: new Date().toISOString(),
  };

  const fullOut = resolve(process.cwd(), outPath);
  const outDir = dirname(fullOut);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const jsonStr = JSON.stringify(brief, null, 2);
  writeFileSync(fullOut, jsonStr, 'utf-8');
  const tokens = encode(jsonStr).length;

  appendTrace({
    phase: 'brief',
    args,
    tokens_estimate: tokens,
    result: 'ok',
  });

  console.log(`✓ Wrote task brief: ${outPath} (${type}, ~${tokens} tokens)`);
  return brief;
}

