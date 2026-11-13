import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { BudgetConfig, BudgetPreset, TraceRecord } from './types.js';
import { DEFAULT_TRACE_PATH, readTrace } from './trace.js';

export const DEFAULT_BUDGET_PATH = '.auteur-ui/budget.json';
export const DEFAULT_STOP_PATH = '.auteur-ui/STOP';

export const BUDGET_PRESETS: Record<BudgetPreset, BudgetConfig> = {
  lean: {
    preset: 'lean',
    total: 8000,
    warning_threshold: 0.8,
    phases: {
      brief: 400,
      directions: 600,
      preview: 200,
      human_pick: 100,
      lock: 400,
      build: 4800,
      lint: 1200,
      pass: 300,
    },
  },
  standard: {
    preset: 'standard',
    total: 20000,
    warning_threshold: 0.8,
    phases: {
      brief: 1000,
      directions: 1500,
      preview: 500,
      human_pick: 200,
      lock: 800,
      build: 12000,
      lint: 3000,
      pass: 1000,
    },
  },
  cinema: {
    preset: 'cinema',
    total: 40000,
    warning_threshold: 0.8,
    phases: {
      brief: 2000,
      directions: 3000,
      preview: 1000,
      human_pick: 400,
      lock: 1600,
      build: 24000,
      lint: 6000,
      pass: 2000,
    },
  },
};

export function loadBudget(budgetPath: string = DEFAULT_BUDGET_PATH): BudgetConfig {
  const fullPath = resolve(process.cwd(), budgetPath);
  if (existsSync(fullPath)) {
    try {
      const raw = readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.preset && BUDGET_PRESETS[parsed.preset as BudgetPreset]) {
        return {
          preset: parsed.preset,
          total: parsed.total || BUDGET_PRESETS[parsed.preset as BudgetPreset].total,
          warning_threshold: parsed.warning_threshold ?? 0.8,
          phases: {
            ...BUDGET_PRESETS[parsed.preset as BudgetPreset].phases,
            ...(parsed.phases || {}),
          },
        };
      }
      return parsed as BudgetConfig;
    } catch {
      // Fall through to default
    }
  }

  // Create default
  const config = BUDGET_PRESETS.standard;
  saveBudget(config, budgetPath);
  return config;
}

export function saveBudget(config: BudgetConfig, budgetPath: string = DEFAULT_BUDGET_PATH): void {
  const fullPath = resolve(process.cwd(), budgetPath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export interface BudgetAuditResult {
  preset: string;
  totalCap: number;
  totalSpent: number;
  childTokensIsolated: number;
  phaseSpend: Record<string, number>;
  phaseCaps: Record<string, number>;
  warnings: string[];
  halt: boolean;
  stopReasons: string[];
  heuristicNotice: string;
}

export function auditBudget(
  records: TraceRecord[],
  config: BudgetConfig,
  stopPath: string = DEFAULT_STOP_PATH
): BudgetAuditResult {
  const phaseSpend: Record<string, number> = {};
  let totalSpent = 0;
  let childTokensIsolated = 0;

  for (const r of records) {
    const spend = r.tokens_estimate || 0;
    phaseSpend[r.phase] = (phaseSpend[r.phase] || 0) + spend;
    totalSpent += spend;
    if (r.child_tokens_estimate) {
      childTokensIsolated += r.child_tokens_estimate;
    }
  }

  const warnings: string[] = [];
  const stopReasons: string[] = [];
  let halt = false;

  // Check per-phase caps
  for (const [phase, cap] of Object.entries(config.phases)) {
    const spent = phaseSpend[phase] || 0;
    if (cap > 0) {
      const ratio = spent / cap;
      if (ratio >= 1.0) {
        halt = true;
        stopReasons.push(
          `Phase "${phase}" exceeded cap: ${spent.toLocaleString()} / ${cap.toLocaleString()} est. tokens (${Math.round(
            ratio * 100
          )}%)`
        );
      } else if (ratio >= (config.warning_threshold ?? 0.8)) {
        warnings.push(
          `Phase "${phase}" approaching cap: ${spent.toLocaleString()} / ${cap.toLocaleString()} est. tokens (${Math.round(
            ratio * 100
          )}%)`
        );
      }
    }
  }

  // Check total cap
  const totalRatio = totalSpent / config.total;
  if (totalRatio >= 1.0) {
    halt = true;
    stopReasons.push(
      `Total spend exceeded budget: ${totalSpent.toLocaleString()} / ${config.total.toLocaleString()} est. tokens (${Math.round(
        totalRatio * 100
      )}%)`
    );
  } else if (totalRatio >= (config.warning_threshold ?? 0.8)) {
    warnings.push(
      `Total spend approaching budget: ${totalSpent.toLocaleString()} / ${config.total.toLocaleString()} est. tokens (${Math.round(
        totalRatio * 100
      )}%)`
    );
  }

  const fullStopPath = resolve(process.cwd(), stopPath);
  if (halt) {
    const stopContent = [
      'STOP DIRECTIVE: Budget cap exceeded.',
      `Date: ${new Date().toISOString()}`,
      `Total spent: ${totalSpent.toLocaleString()} / ${config.total.toLocaleString()} est. tokens`,
      ...stopReasons.map((r) => `- ${r}`),
      '',
      'INSTRUCTION FOR ROUTER: You MUST halt immediately. Do not execute further LLM build turns without human approval.',
    ].join('\n');
    writeFileSync(fullStopPath, stopContent, 'utf-8');
  } else if (existsSync(fullStopPath)) {
    try {
      unlinkSync(fullStopPath);
    } catch {}
  }

  return {
    preset: config.preset,
    totalCap: config.total,
    totalSpent,
    childTokensIsolated,
    phaseSpend,
    phaseCaps: config.phases,
    warnings,
    halt,
    stopReasons,
    heuristicNotice:
      'Token counts are estimated using the standard heuristic (chars / 4) — labeled as an estimate, never claimed as exact.',
  };
}

export function runBudgetCli(args: string[]): void {
  let traceFile = DEFAULT_TRACE_PATH;
  let budgetFile = DEFAULT_BUDGET_PATH;
  let isJson = false;
  let isCheck = false;
  let setPreset: BudgetPreset | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--lean') {
      setPreset = 'lean';
    } else if (arg === '--standard') {
      setPreset = 'standard';
    } else if (arg === '--cinema') {
      setPreset = 'cinema';
    } else if (arg === '--file' && args[i + 1]) {
      traceFile = args[++i];
    } else if (arg === '--budget' && args[i + 1]) {
      budgetFile = args[++i];
    } else if (arg === '--json') {
      isJson = true;
    } else if (arg === '--check') {
      isCheck = true;
    }
  }

  let config = loadBudget(budgetFile);

  if (setPreset) {
    config = BUDGET_PRESETS[setPreset];
    saveBudget(config, budgetFile);
    console.log(`✓ Set budget preset to "--${setPreset}" (${config.total.toLocaleString()} est. tokens cap) in ${budgetFile}`);
  }

  let records: TraceRecord[] = [];
  try {
    records = readTrace(traceFile);
  } catch {
    // If no trace file yet, records is empty
  }

  const audit = auditBudget(records, config);

  if (isJson) {
    console.log(JSON.stringify(audit, null, 2));
    if (isCheck && audit.halt) process.exit(1);
    return;
  }

  console.log('\n======================================================');
  console.log(`   auteur-ui Token Budget Audit [Preset: ${audit.preset.toUpperCase()}]`);
  console.log('======================================================\n');
  console.log(`Target Cap   : ${audit.totalCap.toLocaleString()} est. tokens`);
  console.log(`Total Spend  : ${audit.totalSpent.toLocaleString()} est. tokens (${Math.round((audit.totalSpent / audit.totalCap) * 100)}%)`);
  if (audit.childTokensIsolated > 0) {
    console.log(`Firewall Saved: ${audit.childTokensIsolated.toLocaleString()} child tokens isolated`);
  }
  console.log('\nPhase Breakdown:');
  console.log('------------------------------------------------------');
  console.log(
    'Phase'.padEnd(16) +
    'Est. Spent'.padStart(12) +
    'Cap'.padStart(10) +
    'Spend %'.padStart(10) +
    '  Status'
  );
  console.log('------------------------------------------------------');

  const allPhases = Array.from(
    new Set([...Object.keys(audit.phaseCaps), ...Object.keys(audit.phaseSpend)])
  ).sort();

  for (const ph of allPhases) {
    const spent = audit.phaseSpend[ph] || 0;
    const cap = audit.phaseCaps[ph] || 0;
    const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;
    let status = '✓ OK';
    if (cap > 0) {
      if (spent >= cap) {
        status = '✗ STOP (100%)';
      } else if (spent >= cap * 0.8) {
        status = '⚠ WARN (80%)';
      }
    }

    console.log(
      ph.padEnd(16) +
      spent.toLocaleString().padStart(12) +
      (cap > 0 ? cap.toLocaleString() : '-').padStart(10) +
      (cap > 0 ? `${pct}%` : '-').padStart(10) +
      `  ${status}`
    );
  }
  console.log('------------------------------------------------------');

  if (audit.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of audit.warnings) {
      console.log(`  ⚠ ${w}`);
    }
  }

  if (audit.halt) {
    console.error('\n✗ STOP DIRECTIVE WRITTEN TO .auteur-ui/STOP:');
    for (const r of audit.stopReasons) {
      console.error(`  - ${r}`);
    }
    console.error('The router MUST halt. Refuse further turns without human intervention.\n');
    if (isCheck) {
      process.exit(1);
    }
  } else {
    console.log('\n✓ Budget status: PASS (under caps)');
  }

  console.log(`\nHeuristic notice: ${audit.heuristicNotice}\n`);
}
