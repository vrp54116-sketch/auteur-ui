import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BUDGET_PRESETS,
  auditBudget,
  loadBudget,
  saveBudget,
  DEFAULT_BUDGET_PATH,
  DEFAULT_STOP_PATH,
} from '../packages/cli/budget.js';
import { estimateTokens, appendTrace } from '../packages/cli/trace.js';
import { TraceRecord } from '../packages/cli/types.js';

describe('Phase 7: Budget Enforcement & Presets', () => {
  const root = process.cwd();
  const testBudgetPath = resolve(root, '.auteur-ui', 'test-budget.json');
  const testStopPath = resolve(root, '.auteur-ui', 'test-STOP');

  beforeEach(() => {
    if (existsSync(testStopPath)) unlinkSync(testStopPath);
    if (existsSync(testBudgetPath)) unlinkSync(testBudgetPath);
  });

  afterEach(() => {
    if (existsSync(testStopPath)) unlinkSync(testStopPath);
    if (existsSync(testBudgetPath)) unlinkSync(testBudgetPath);
  });

  // =========================================================================
  // 1. Preset Definitions & Per-Phase Caps
  // =========================================================================
  it('defines lean (8k), standard (20k), and cinema (40k) presets with per-phase caps', () => {
    expect(BUDGET_PRESETS.lean.total).toBe(8000);
    expect(BUDGET_PRESETS.standard.total).toBe(20000);
    expect(BUDGET_PRESETS.cinema.total).toBe(40000);

    // Sum of phase caps matches total
    for (const preset of ['lean', 'standard', 'cinema'] as const) {
      const cfg = BUDGET_PRESETS[preset];
      const sum = Object.values(cfg.phases).reduce((a, b) => a + b, 0);
      expect(sum).toBe(cfg.total);
    }
  });

  // =========================================================================
  // 2. Documented Heuristic: chars / 4
  // =========================================================================
  it('estimates tokens with documented heuristic (chars / 4)', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('1234')).toBe(1);
    expect(estimateTokens('12345')).toBe(2);
    expect(estimateTokens('a'.repeat(400))).toBe(100);
  });

  // =========================================================================
  // 3. Normal Spend Under Caps
  // =========================================================================
  it('passes under budget with zero warnings and no STOP directive', () => {
    const records: TraceRecord[] = [
      { ts: '1', phase: 'brief', args: [], tokens_estimate: 200, result: 'ok' },
      { ts: '2', phase: 'directions', args: [], tokens_estimate: 350, result: 'ok' },
      { ts: '3', phase: 'preview', args: [], tokens_estimate: 150, result: 'ok' },
      { ts: '4', phase: 'human_pick', args: [], tokens_estimate: 20, result: 'ok' },
      { ts: '5', phase: 'lock', args: [], tokens_estimate: 250, result: 'ok' },
      { ts: '6', phase: 'build', args: [], tokens_estimate: 3000, result: 'ok' },
      { ts: '7', phase: 'lint', args: [], tokens_estimate: 300, result: 'ok' },
      { ts: '8', phase: 'pass', args: [], tokens_estimate: 50, result: 'ok' },
    ];

    const result = auditBudget(records, BUDGET_PRESETS.standard, testStopPath);

    expect(result.halt).toBe(false);
    expect(result.warnings).toHaveLength(0);
    expect(result.totalSpent).toBe(4320);
    expect(existsSync(testStopPath)).toBe(false);
  });

  // =========================================================================
  // 4. Warning at 80% Cap
  // =========================================================================
  it('emits warning when a phase reaches 80% of its cap', () => {
    // In standard, directions cap is 1500; 80% is 1200
    const records: TraceRecord[] = [
      { ts: '1', phase: 'directions', args: [], tokens_estimate: 1250, result: 'ok' },
    ];

    const result = auditBudget(records, BUDGET_PRESETS.standard, testStopPath);

    expect(result.halt).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('directions');
    expect(result.warnings[0]).toContain('83%');
    expect(existsSync(testStopPath)).toBe(false);
  });

  // =========================================================================
  // 5. STOP Directive at 100% Cap
  // =========================================================================
  it('halts and writes .auteur-ui/STOP directive when cap is reached (100%)', () => {
    // In lean, build cap is 4800
    const records: TraceRecord[] = [
      { ts: '1', phase: 'build', args: [], tokens_estimate: 4900, result: 'ok' },
    ];

    const result = auditBudget(records, BUDGET_PRESETS.lean, testStopPath);

    expect(result.halt).toBe(true);
    expect(result.stopReasons.length).toBeGreaterThan(0);
    expect(result.stopReasons[0]).toContain('build');
    expect(existsSync(testStopPath)).toBe(true);

    const stopContent = readFileSync(testStopPath, 'utf-8');
    expect(stopContent).toContain('STOP DIRECTIVE: Budget cap exceeded');
    expect(stopContent).toContain('INSTRUCTION FOR ROUTER: You MUST halt immediately');
  });

  // =========================================================================
  // 6. Persistence & Preset Switching
  // =========================================================================
  it('loads and saves budget configuration', () => {
    saveBudget(BUDGET_PRESETS.cinema, testBudgetPath);
    const loaded = loadBudget(testBudgetPath);
    expect(loaded.preset).toBe('cinema');
    expect(loaded.total).toBe(40000);
    expect(loaded.phases.build).toBe(24000);
  });
});
