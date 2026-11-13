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

export interface LintResult {
  score: number;
  pass: boolean;
  violations: Array<{ rule: string; message: string }>;
}

