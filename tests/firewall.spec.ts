import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  matchGlob,
  enforceFirewallConstraints,
  distillLocally,
  executeAsk,
} from '../packages/cli/ask.js';
import { readTrace } from '../packages/cli/trace.js';

describe('Phase 7: Context Firewall (npx auteur-ui ask)', () => {
  const root = process.cwd();
  const testTracePath = resolve(root, '.auteur-ui', 'test-firewall-trace.jsonl');

  beforeEach(() => {
    if (existsSync(testTracePath)) unlinkSync(testTracePath);
  });

  afterEach(() => {
    if (existsSync(testTracePath)) unlinkSync(testTracePath);
  });

  // =========================================================================
  // 1. File Scoping via Glob
  // =========================================================================
  it('scopes files matching glob patterns or directories', () => {
    const mdFiles = matchGlob(root, 'modules/*.md');
    expect(mdFiles.length).toBe(6);
    expect(mdFiles.some((f) => f.endsWith('typography.md'))).toBe(true);

    const dirFiles = matchGlob(root, 'modules');
    expect(dirFiles.length).toBeGreaterThanOrEqual(6);
  });

  // =========================================================================
  // 2. Firewall Invariant: <= 20 lines, no code block > 5 lines, no preamble
  // =========================================================================
  it('enforces hard constraints: <= 20 lines, max 5 lines per code block, no preamble', () => {
    const verboseLLMOutput = [
      'Sure, here is the typography summary for your project:',
      '',
      'Heading levels must follow strict hierarchy.',
      'Always use tabular numbers for metrics.',
      '```css',
      '/* line 1 */',
      '/* line 2 */',
      '/* line 3 */',
      '/* line 4 */',
      '/* line 5 */',
      '/* line 6 - excessive */',
      '/* line 7 - excessive */',
      '```',
      ...Array.from({ length: 30 }, (_, i) => `Extra prose line ${i + 1}`),
    ].join('\n');

    const constrained = enforceFirewallConstraints(verboseLLMOutput, 20, 5);
    const lines = constrained.split('\n');

    // Constraint 1: <= 20 lines
    expect(lines.length).toBeLessThanOrEqual(20);

    // Constraint 2: No preamble
    expect(lines[0].toLowerCase()).not.toContain('sure');
    expect(lines[0].toLowerCase()).not.toContain('here is');

    // Constraint 3: Code block <= 5 code lines + truncation marker
    const codeBlockLines = lines.filter((l) => l.startsWith('/* line'));
    expect(codeBlockLines.length).toBeLessThanOrEqual(5);
  });

  // =========================================================================
  // 3. Deterministic Local Distillation
  // =========================================================================
  it('distills scoped module files deterministically without LLM network call', () => {
    const scopedFiles = [
      {
        path: 'modules/motion.md',
        content: '# Motion\nDuration triplets: --dur-1: 120ms, --dur-2: 200ms, --dur-3: 350ms.\nEasing: cubic-bezier(0.16, 1, 0.3, 1).\nStagger: 40ms.',
      },
      {
        path: 'modules/sound.md',
        content: '# Sound\nProcedural sound cues synthesized via WebAudio.\nVolume default 0.15.\nThrottle: 60ms.',
      },
    ];

    const distilled = distillLocally('What are the motion duration triplets and easing?', scopedFiles);
    expect(distilled).toContain('dur-1');
    expect(distilled.split('\n').length).toBeLessThanOrEqual(20);
  });

  // =========================================================================
  // 4. End-to-End executeAsk & Separate Child Trace Logging
  // =========================================================================
  it('executes ask, returns only distilled answer, and logs child tokens separately', () => {
    const result = executeAsk({
      question: 'What font scales and optical sizing rules apply to typography?',
      scope: 'modules/*.md',
      tracePath: testTracePath,
    });

    // Distilled output constraints
    const lines = result.distilled.split('\n');
    expect(lines.length).toBeLessThanOrEqual(20);
    expect(lines.length).toBeGreaterThan(0);

    // Child tokens vs parent tokens
    expect(result.childTokensEstimate).toBeGreaterThan(1000); // 6 module files context
    expect(result.parentTokensEstimate).toBeLessThan(300); // <= 20 lines distilled
    expect(result.parentTokensEstimate).toBeLessThan(result.childTokensEstimate);

    // Verify trace entry
    expect(existsSync(testTracePath)).toBe(true);
    const traceRecords = readTrace(testTracePath);
    expect(traceRecords).toHaveLength(1);

    const r = traceRecords[0];
    expect(r.phase).toBe('ask');
    expect(r.tokens_estimate).toBe(result.parentTokensEstimate);
    expect(r.child_tokens_estimate).toBe(result.childTokensEstimate);
  });
});
