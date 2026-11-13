export * from './types.js';
export * from './trace.js';
export * from './brief.js';
export * from './lock.js';
export * from './lint.js';
export * from './score.js';
export * from './doctor.js';
export * from './preview.js';
export * from './budget.js';
export * from './ask.js';
export * from './report.js';

import { runBrief } from './brief.js';
import { runPreview } from './preview.js';
import { runLock } from './lock.js';
import { runLint } from './lint.js';
import { runScore } from './score.js';
import { runDoctor } from './doctor.js';
import { runTraceCli } from './trace.js';
import { runBudgetCli } from './budget.js';
import { runAskCli } from './ask.js';
import { runReportCli } from './report.js';

export function printHelp(): void {
  console.log(`
auteur-ui — taste compiled at build time

Usage:
  npx auteur-ui <command> [options]

Commands:
  brief               Generate or infer task brief (.auteur-ui/brief.json)
  preview             Render directions contact sheet (.auteur-ui/preview.html)
  lock <id>           Lock curated look into design contract (.auteur-ui/contract.json)
  lint                Run taste and anti-pattern linter
  score               Report taste compliance score and token metrics
  doctor              Diagnose system readiness and verify asset manifests
  trace               Inspect execution trace or verify workflow order (--verify)
  budget [preset]     Enforce token budget and caps (--lean, --standard, --cinema)
  ask "<q>" --scope   Firewall subagent querying files with <=20 line distilled output
  report              One-screen build receipt with tokens, score, and savings

Options:
  -h, --help  Show this help message
`);
}

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  const command = argv[0];
  const subArgs = argv.slice(1);

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  switch (command) {
    case 'brief':
      runBrief(subArgs);
      break;

    case 'preview':
      await runPreview(subArgs);
      break;

    case 'lock':
      runLock(subArgs);
      break;

    case 'lint':
      await runLint(subArgs);
      break;

    case 'score':
      runScore(subArgs);
      break;

    case 'doctor':
      runDoctor(subArgs);
      break;

    case 'trace':
      runTraceCli(subArgs);
      break;

    case 'budget':
      runBudgetCli(subArgs);
      break;

    case 'ask':
      runAskCli(subArgs);
      break;

    case 'report':
      await runReportCli(subArgs);
      break;

    default:
      console.error(`Unknown command: "${command}". Run --help for available commands.`);
      process.exit(1);
  }
}


