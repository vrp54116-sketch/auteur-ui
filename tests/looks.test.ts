import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { encode } from 'gpt-tokenizer';
import {
  LookSchema,
  LookManifestSchema,
  toContract,
} from '../packages/schema/look.js';
import { ContractSchema, toMarkdown } from '../packages/schema/contract.js';
import { contrastRatio, passesWcagAa } from '../packages/schema/color.js';

describe('Curated Looks & Manifest', () => {
  const looksDir = join(process.cwd(), 'looks');
  const manifestPath = join(looksDir, 'index.json');

  it('validates looks/index.json against manifest schema and asserts <= 600 token budget', () => {
    const raw = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);
    const parsed = LookManifestSchema.parse(manifest);

    expect(parsed.length).toBe(5);

    const tokenCount = encode(raw).length;
    // Manifest budget: <= 600 tokens
    expect(tokenCount).toBeLessThanOrEqual(600);
  });

  const lookIds = [
    'nocturne-editorial',
    'swiss-utility',
    'kinetic-pop',
    'terminal-luxe',
    'paper-editorial',
  ];

  it('contains the expected 5 curated looks', () => {
    const entries = readdirSync(looksDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const id of lookIds) {
      expect(entries).toContain(id);
    }
  });

  for (const id of lookIds) {
    describe(`Look: ${id}`, () => {
      const lookFile = join(looksDir, id, 'look.json');
      const readmeFile = join(looksDir, id, 'README.md');

      it('validates look.json against LookSchema', () => {
        const raw = readFileSync(lookFile, 'utf-8');
        const data = JSON.parse(raw);
        const look = LookSchema.parse(data);
        expect(look.id).toBe(id);

        // Also ensure conversion to Contract is strictly valid
        const contract = toContract(look);
        expect(() => ContractSchema.parse(contract)).not.toThrow();

        // Ensure markdown summary remains under 300 token budget
        const md = toMarkdown(contract);
        const mdTokens = encode(md).length;
        expect(mdTokens).toBeLessThanOrEqual(300);
      });

      it('passes WCAG AA contrast (>= 4.5:1) for text/background token pairs', () => {
        const data = JSON.parse(readFileSync(lookFile, 'utf-8'));
        const tokens = data.palette.tokens;

        const bg = tokens.bg;
        const fg = tokens.fg;
        const fgMuted = tokens.fgMuted;

        expect(bg).toBeDefined();
        expect(fg).toBeDefined();
        expect(fgMuted).toBeDefined();

        const fgContrast = contrastRatio(bg, fg);
        const fgMutedContrast = contrastRatio(bg, fgMuted);

        // WCAG AA requirement for normal body text: >= 4.5
        expect(
          passesWcagAa(bg, fg),
          `fg (${fg}) vs bg (${bg}) failed WCAG AA with ratio ${fgContrast.toFixed(2)}:1`
        ).toBe(true);

        expect(
          passesWcagAa(bg, fgMuted),
          `fgMuted (${fgMuted}) vs bg (${bg}) failed WCAG AA with ratio ${fgMutedContrast.toFixed(2)}:1`
        ).toBe(true);

        expect(fgContrast).toBeGreaterThanOrEqual(4.5);
        expect(fgMutedContrast).toBeGreaterThanOrEqual(4.5);
      });

      it('has a 6-line README describing intent and 3 reference sites', () => {
        const raw = readFileSync(readmeFile, 'utf-8');
        const lines = raw.trim().split('\n');

        expect(lines.length).toBe(6);
        expect(raw).toContain('Reference 1:');
        expect(raw).toContain('Reference 2:');
        expect(raw).toContain('Reference 3:');
        expect(raw).toContain('http');
      });
    });
  }
});
