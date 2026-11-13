import { encode } from 'gpt-tokenizer';
import { RuleViolation, LintResult, LintFailure, LintWarning } from './types.js';

export function computeLintResult(violations: RuleViolation[]): LintResult {
  let score = 100;
  let hasHardFail = false;

  const rawFail: LintFailure[] = [];
  const rawWarnings: LintWarning[] = [];

  for (const v of violations) {
    if (v.isHardFail) {
      hasHardFail = true;
    }

    score -= v.deduction;

    const item = {
      r: v.ruleId,
      sel: v.sel,
      val: v.val,
      want: v.want,
      fix: v.fix,
    };

    if (v.isHardFail || v.deduction >= 4 || v.category === 'slop') {
      rawFail.push(item);
    } else {
      rawWarnings.push(item);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const pass = score >= 80 && !hasHardFail;

  const initialResult: LintResult = {
    score,
    pass,
    fail: rawFail,
    warnings: rawWarnings,
  };

  return enforceTokenBudget(initialResult, 250);
}

/**
 * Ensures that JSON.stringify(result) consumes <= maxTokens (250 tokens)
 * by prioritizing top critical failures and trimming verbose string messages if needed.
 */
export function enforceTokenBudget(result: LintResult, maxTokens: number = 250): LintResult {
  let jsonStr = JSON.stringify(result);
  let tokens = encode(jsonStr).length;

  if (tokens <= maxTokens) {
    return result;
  }

  // If over budget, first drop warnings
  const copy: LintResult = {
    score: result.score,
    pass: result.pass,
    fail: [...result.fail],
    warnings: [],
  };

  jsonStr = JSON.stringify(copy);
  tokens = encode(jsonStr).length;
  if (tokens <= maxTokens) {
    return copy;
  }

  // If still over budget, retain only top critical failures
  while (copy.fail.length > 2 && tokens > maxTokens) {
    copy.fail.pop();
    jsonStr = JSON.stringify(copy);
    tokens = encode(jsonStr).length;
  }

  // If still over budget, shorten val, want, fix fields
  if (tokens > maxTokens) {
    copy.fail = copy.fail.map((f) => ({
      r: f.r,
      sel: f.sel.slice(0, 20),
      val: f.val.slice(0, 30),
      want: f.want.slice(0, 25),
      fix: f.fix.slice(0, 35),
    }));
  }

  return copy;
}
