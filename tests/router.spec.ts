import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { verifyTrace } from '../packages/cli/trace.js';

describe('Router & Skill Invariants (Phase 4)', () => {
  const root = process.cwd();
  const routerPath = resolve(root, 'skill', 'SKILL.md');
  const commandPath = resolve(root, 'skill', 'commands', 'auteur-ui.md');

  // =========================================================================
  // 1. Hard Token Limit Invariant: router SKILL.md <= 500 tokens
  // =========================================================================
  it('HARD CONSTRAINT: skill/SKILL.md must consume <= 500 tokens', () => {
    expect(existsSync(routerPath)).toBe(true);
    const content = readFileSync(routerPath, 'utf-8');
    const tokens = encode(content).length;

    console.log('\n======================================================');
    console.log('   Skill Router Token Budget Audit');
    console.log('======================================================');
    console.log(`Measured tokens : ${tokens} / 500 limit`);
    console.log(`Status          : ${tokens <= 500 ? '✓ PASS' : '✗ FAIL'}`);
    console.log('======================================================\n');

    expect(tokens).toBeLessThanOrEqual(500);
  });

  // =========================================================================
  // 2. Hard Token Limit Invariant: commands/auteur-ui.md <= 120 tokens
  // =========================================================================
  it('HARD CONSTRAINT: skill/commands/auteur-ui.md must consume <= 120 tokens', () => {
    expect(existsSync(commandPath)).toBe(true);
    const content = readFileSync(commandPath, 'utf-8');
    const tokens = encode(content).length;

    console.log(`Command tokens  : ${tokens} / 120 limit`);
    expect(tokens).toBeLessThanOrEqual(120);
  });

  // =========================================================================
  // 3. YAML Frontmatter Validity & Trigger Words
  // =========================================================================
  it('validates YAML frontmatter structure and trigger words in description', () => {
    const content = readFileSync(routerPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).not.toBeNull();

    const fm = frontmatterMatch![1];
    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    const descMatch = fm.match(/^description:\s*(.+)$/m);

    expect(nameMatch).not.toBeNull();
    expect(nameMatch![1].trim()).toBe('auteur-ui');

    expect(descMatch).not.toBeNull();
    const desc = descMatch![1].trim();

    // Assert one single sentence (ends with period, no internal sentence ends)
    expect(desc.endsWith('.')).toBe(true);
    const sentences = desc.split(/(?<=[.!?])\s+(?=[A-Z])/);
    expect(sentences.length).toBe(1);

    // Required trigger words:
    // (ui, design, landing page, dashboard, app, redesign, make it look, avoid generic, animations, typography, polish)
    const requiredTriggers = [
      'ui',
      'design',
      'landing page',
      'dashboard',
      'app',
      'redesign',
      'make it look',
      'avoid generic',
      'animations',
      'typography',
      'polish',
    ];

    const lowerDesc = desc.toLowerCase();
    for (const trigger of requiredTriggers) {
      expect(
        lowerDesc.includes(trigger.toLowerCase()),
        `Trigger word/phrase "${trigger}" must be present in description`
      ).toBe(true);
    }
  });

  // =========================================================================
  // 4. Protocol & Referenced Paths Existence
  // =========================================================================
  it('asserts every path referenced in SKILL.md exists on disk', () => {
    const content = readFileSync(routerPath, 'utf-8');

    // Extract all path candidates in backticks or markdown tables
    // e.g. `.auteur-ui/contract.json`, `looks/index.json`, `code/`, `modules/*.md`
    const codeSpanMatches = Array.from(content.matchAll(/`([^`]+)`/g)).map((m) => m[1]);

    const pathCandidates = codeSpanMatches.filter((s) => {
      // Must look like a path: contains a slash, or ends with .json/.md
      return (
        s.includes('/') ||
        s.endsWith('.json') ||
        s.endsWith('.md')
      );
    });

    expect(pathCandidates.length).toBeGreaterThan(0);

    const verifiedPaths: string[] = [];
    for (const rawPath of pathCandidates) {
      const cleanPath = rawPath.replace(/\/$/, '');
      const fullPath = resolve(root, cleanPath);
      const exists = existsSync(fullPath);
      expect(exists, `Referenced path "${rawPath}" must exist on disk`).toBe(true);
      verifiedPaths.push(rawPath);
    }

    console.log(`Verified ${verifiedPaths.length} referenced paths in SKILL.md:`);
    for (const p of verifiedPaths) {
      console.log(`  ✓ ${p}`);
    }
  });

  // =========================================================================
  // 5. Trace Verification Assertions
  // =========================================================================
  it('trace verify passes on valid 8-phase trace and fails on truncated trace', () => {
    const validFixture = resolve(root, 'tests', 'fixtures', 'trace-valid.jsonl');
    const truncatedFixture = resolve(root, 'tests', 'fixtures', 'trace-truncated.jsonl');

    // 1. Valid trace
    const validResult = verifyTrace(validFixture);
    expect(validResult.success).toBe(true);
    expect(validResult.completedPhases).toHaveLength(8);

    // 2. Truncated trace
    const truncatedResult = verifyTrace(truncatedFixture);
    expect(truncatedResult.success).toBe(false);
    expect(truncatedResult.missingPhase).toBe('human_pick');
  });
});
