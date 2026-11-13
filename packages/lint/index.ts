import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Contract, ContractSchema } from '../schema/contract.js';
import { ExtractOptions, extractPageData } from './extract.js';
import { allRules, explainRule } from './rules/index.js';
import { computeLintResult } from './score.js';
import { LintResult, RuleViolation } from './types.js';

export * from './types.js';
export * from './score.js';
export * from './rules/index.js';

export interface LintOptions extends ExtractOptions {
  contractPath?: string;
}

export async function lint(options: LintOptions): Promise<LintResult> {
  // 1. Extract DOM, geometry, and computed styles via Playwright
  const pageData = await extractPageData(options);

  // 2. Load contract if available
  let contract: Contract | null = null;
  const contractPath = options.contractPath || resolve(process.cwd(), '.auteur-ui', 'contract.json');
  if (existsSync(contractPath)) {
    try {
      const raw = JSON.parse(readFileSync(contractPath, 'utf-8'));
      contract = ContractSchema.parse(raw);
    } catch {
      // Graceful fallback if contract is missing or malformed
      contract = null;
    }
  }

  // 3. Execute deterministic rule checks
  const violations: RuleViolation[] = [];
  const ctx = { data: pageData, contract };

  for (const rule of allRules) {
    try {
      const v = rule.check(ctx);
      violations.push(...v);
    } catch (err) {
      // Never crash on individual rule check failure
      console.warn(`[auteur-ui lint] Rule ${rule.id} encountered an error:`, err);
    }
  }

  // 4. Calculate weighted score & compact token-bounded result
  return computeLintResult(violations);
}

export { explainRule };

