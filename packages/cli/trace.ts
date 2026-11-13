import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TraceRecord } from './types.js';

export const REQUIRED_PHASES = [
  'brief',
  'directions',
  'preview',
  'human_pick',
  'lock',
  'build',
  'lint',
  'pass',
] as const;

export const DEFAULT_TRACE_PATH = '.auteur-ui/trace.jsonl';

export function appendTrace(
  record: {
    phase: string;
    args?: string[];
    tokens_estimate?: number;
    result?: string;
    ts?: string;
  },
  tracePath: string = DEFAULT_TRACE_PATH
): void {
  try {
    const fullPath = resolve(process.cwd(), tracePath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const entry: TraceRecord = {
      ts: record.ts || new Date().toISOString(),
      phase: record.phase,
      args: record.args || [],
      tokens_estimate: record.tokens_estimate ?? 0,
      result: record.result || 'ok',
    };

    appendFileSync(fullPath, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err: any) {
    console.warn(`[trace] Warning: Could not append trace: ${err?.message || err}`);
  }
}

export function readTrace(tracePath: string = DEFAULT_TRACE_PATH): TraceRecord[] {
  const fullPath = resolve(process.cwd(), tracePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Trace file not found at: ${fullPath}`);
  }

  const raw = readFileSync(fullPath, 'utf-8');
  const lines = raw.trim().split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line) => JSON.parse(line) as TraceRecord);
}

export function verifyTrace(tracePath: string = DEFAULT_TRACE_PATH): {
  success: boolean;
  missingPhase?: string;
  completedPhases: string[];
} {
  const fullPath = resolve(process.cwd(), tracePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Trace file not found at: ${tracePath}`);
  }

  const records = readTrace(tracePath);
  let reqIdx = 0;
  const completedPhases: string[] = [];

  for (const record of records) {
    if (reqIdx < REQUIRED_PHASES.length && record.phase === REQUIRED_PHASES[reqIdx]) {
      completedPhases.push(record.phase);
      reqIdx++;
    }
  }

  if (reqIdx < REQUIRED_PHASES.length) {
    return {
      success: false,
      missingPhase: REQUIRED_PHASES[reqIdx],
      completedPhases,
    };
  }

  return {
    success: true,
    completedPhases,
  };
}

export function runTraceCli(args: string[]): void {
  let file = DEFAULT_TRACE_PATH;
  let isVerify = false;
  let recordPhase: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--verify') {
      isVerify = true;
    } else if (arg === '--file') {
      file = args[++i];
    } else if (arg === '--record') {
      recordPhase = args[++i];
    } else if (arg === 'record' && args[i + 1]) {
      recordPhase = args[++i];
    }
  }

  if (recordPhase) {
    appendTrace({ phase: recordPhase, args }, file);
    console.log(`✓ Recorded trace phase "${recordPhase}" to ${file}`);
    return;
  }

  if (isVerify) {
    try {
      const res = verifyTrace(file);
      if (!res.success) {
        console.error(
          `Error: Trace verification failed: missing phase "${res.missingPhase}".\nRequired sequence: ${REQUIRED_PHASES.join(
            ' -> '
          )}`
        );
        process.exit(1);
      }
      console.log(
        `✓ Trace verified: all 8 phases completed in required order (${REQUIRED_PHASES.join(
          ' -> '
        )})`
      );
      process.exit(0);
    } catch (err: any) {
      console.error(`Error: ${err?.message || err}`);
      process.exit(1);
    }
  }

  // If no flags, print trace summary
  try {
    const records = readTrace(file);
    console.log(`Trace entries (${records.length}) in ${file}:`);
    for (const r of records) {
      console.log(`  [${r.ts}] ${r.phase.padEnd(12)} tokens: ${String(r.tokens_estimate).padStart(5)}  result: ${r.result}`);
    }
  } catch (err: any) {
    console.error(`Error: ${err?.message || err}`);
    process.exit(1);
  }
}

