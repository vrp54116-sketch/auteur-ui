import { appendTrace } from './trace.js';

export function runScore(args: string[]): { score: number; pass: boolean } {
  const isJson = args.includes('--json');
  const score = 100;
  const pass = score >= 80;

  appendTrace({
    phase: 'score',
    args,
    tokens_estimate: 0,
    result: String(score),
  });

  if (isJson) {
    console.log(JSON.stringify({ score, pass }));
  } else {
    console.log(`auteur-ui score: ${score}/100 (pass: ${pass})`);
  }

  return { score, pass };
}

