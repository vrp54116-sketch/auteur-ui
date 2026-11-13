export interface TraceRecord {
  ts: string;
  phase: string;
  args: string[];
  tokens_estimate: number;
  child_tokens_estimate?: number;
  result: string;
}

export type BudgetPreset = 'lean' | 'standard' | 'cinema';

export interface BudgetConfig {
  preset: BudgetPreset;
  total: number;
  warning_threshold: number;
  phases: Record<string, number>;
}

export interface BriefData {
  id: string;
  type: 'app' | 'dashboard' | 'marketing' | 'editorial' | 'tool' | string;
  title: string;
  prompt: string;
  createdAt: string;
}

export type { LintResult, LintFailure, LintWarning } from '../lint/index.js';

