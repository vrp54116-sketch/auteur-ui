export interface TraceRecord {
  ts: string;
  phase: string;
  args: string[];
  tokens_estimate: number;
  result: string;
}

export interface BriefData {
  id: string;
  type: 'app' | 'dashboard' | 'marketing' | 'editorial' | 'tool' | string;
  title: string;
  prompt: string;
  createdAt: string;
}

export type { LintResult, LintFailure, LintWarning } from '../lint/index.js';
