import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { encode } from 'gpt-tokenizer';
// @ts-expect-error No type declaration for JS pipeline module
import { parseSourcesYaml, parseResolutionsYaml, runMergePipeline } from '../pipeline/merge.mjs';
// @ts-expect-error No type declaration for JS pipeline module
import { validateRule, distillSource, VAGUE_PATTERNS } from '../pipeline/distill.mjs';

describe('Phase 9: Distillation Pipeline & Conflict Detection', () => {
  const root = process.cwd();
  const sourcesYmlPath = resolve(root, 'pipeline', 'sources.yml');

  // =========================================================================
  // 1. Sources Catalog Integrity & License Verification
  // =========================================================================
  it('parses pipeline/sources.yml and verifies all 22 requested repositories', () => {
    expect(existsSync(sourcesYmlPath)).toBe(true);
    const raw = readFileSync(sourcesYmlPath, 'utf-8');
    const sources = parseSourcesYaml(raw);

    expect(sources.length).toBe(22);

    const requiredRepos = [
      'pbakaus/impeccable',
      'nextlevelbuilder/ui-ux-pro-max-skill',
      'Leonxlnx/taste-skill',
      'oil-oil/oil-ui',
      'miqdadbadjuber/anti-slop',
      'hardikpandya/stop-slop',
      'petergyang/no-ai-slop',
      'nutlope/hallmark',
      'nutlope/inspo',
      'stevembarclay/pencilplaybook',
      'dannyjpwilliams/ui-sound-design-skill',
      'Barty-Bart/motion-graphics',
      'zeveck/audiogen',
      'cth9191/animate',
      'mattypark/Motion-graphics-skill',
      'VoltAgent/awesome-design-md',
      'bergside/awesome-design-skills',
      'Z4YT0N/awwwards-skill',
      'Ga14ctic/awwwards-skill',
      'AThevon/genjutsu',
      'nateherkai/scroll-craft',
      'superdesigndev/superdesign-skill',
    ];

    for (const repo of requiredRepos) {
      const match = sources.find((s: any) => s.repo === repo);
      expect(match, `Expected repo ${repo} to exist in sources.yml`).toBeDefined();
    }

    // Check skipped unlicensed/proprietary sources
    const matty = sources.find((s: any) => s.repo === 'mattypark/Motion-graphics-skill');
    expect(matty?.status).toBe('skipped');
    expect(matty?.reason).toMatch(/unlicensed/i);

    const zeveck = sources.find((s: any) => s.repo === 'zeveck/audiogen');
    expect(zeveck?.status).toBe('skipped');
    expect(zeveck?.reason).toMatch(/ElevenLabs/i);

    // Active sources must have permissive licenses and attribution
    const active = sources.filter((s: any) => s.status === 'active');
    expect(active.length).toBe(20);
    for (const s of active) {
      expect(['MIT', 'Apache-2.0']).toContain(s.license);
      expect(s.attribution.length).toBeGreaterThan(10);
      expect(s.commit.length).toBeGreaterThan(10);
      expect(s.extract.length).toBeGreaterThan(0);
    }
  });

  // =========================================================================
  // 2. Distill Schema & Statement Constraints
  // =========================================================================
  it('enforces statement <= 20 words and rejects vague subjective statements', () => {
    // Valid rule
    const validRes = validateRule({
      id: 'color/wcag-contrast',
      statement: 'Maintain at least 4.5 to 1 contrast ratio for normal text against background.',
      category: 'COLOR',
      weight: 5,
      source: 'test/repo',
      executable: true,
    });
    expect(validRes.valid).toBe(true);

    // Rule exceeding 20 words
    const longRes = validateRule({
      id: 'type/excessive-words',
      statement: 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one.',
      category: 'TYPE',
      weight: 3,
      source: 'test/repo',
      executable: true,
    });
    expect(longRes.valid).toBe(false);
    expect(longRes.errors.some((e: any) => e.includes('exceeds 20 words'))).toBe(true);

    // Vague rule claiming to be executable
    const vagueRes = validateRule({
      id: 'layout/vague-statement',
      statement: 'Always use good hierarchy when creating elements.',
      category: 'LAYOUT',
      weight: 3,
      source: 'test/repo',
      executable: true,
    });
    expect(vagueRes.valid).toBe(false);
    expect(vagueRes.errors.some((e: any) => e.includes('vague subjective phrase'))).toBe(true);
  });

  // =========================================================================
  // 3. Acceptance Execution on 3 Initial Sources
  // =========================================================================
  it('runs distillation and merge on the 3 initial sources, detecting taste conflicts', async () => {
    const summary = await runMergePipeline({
      sources: [
        'pbakaus/impeccable',
        'nextlevelbuilder/ui-ux-pro-max-skill',
        'Leonxlnx/taste-skill',
      ],
    });

    expect(summary.activeSourcesCount).toBe(3);
    expect(summary.executableCount).toBeGreaterThan(5);
    expect(summary.executableCount).toBeLessThanOrEqual(40);

    // Must detect conflicts
    expect(summary.conflictsCount).toBeGreaterThanOrEqual(2);
    const conflictIds = summary.conflicts.map((c: any) => c.id);
    expect(conflictIds).toContain('conflict-gradient-usage');
    expect(conflictIds).toContain('conflict-border-radius');

    // Artifacts must exist
    expect(existsSync(resolve(root, 'rules.json'))).toBe(true);
    expect(existsSync(resolve(root, 'pipeline', 'CONFLICTS.md'))).toBe(true);
    expect(existsSync(resolve(root, 'advisory.md'))).toBe(true);

    // advisory.md budget check (<= 200 tokens)
    const advisoryContent = readFileSync(resolve(root, 'advisory.md'), 'utf-8');
    const advisoryTokens = encode(advisoryContent).length;
    expect(advisoryTokens).toBeLessThanOrEqual(200);
  });
});

