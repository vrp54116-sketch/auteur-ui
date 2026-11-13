import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { lint, explainRule, LintResult } from '../lint/index.js';
import { appendTrace } from './trace.js';

export async function runLint(args: string[] = []): Promise<LintResult> {
  const isJson = args.includes('--json');

  // Handle --explain <rule>
  const explainIdx = args.indexOf('--explain');
  if (explainIdx !== -1) {
    const ruleKey = args[explainIdx + 1];
    if (!ruleKey || ruleKey.startsWith('-')) {
      console.error('Error: --explain requires a rule identifier (e.g. slop/purple-blue-gradient or TYPE)');
      process.exit(1);
    }
    console.log(explainRule(ruleKey));
    process.exit(0);
  }

  // Parse target: --url or --html
  let url: string | undefined;
  let html: string | undefined;

  const urlIdx = args.indexOf('--url');
  if (urlIdx !== -1 && args[urlIdx + 1]) {
    url = args[urlIdx + 1];
  }

  const htmlIdx = args.indexOf('--html');
  if (htmlIdx !== -1 && args[htmlIdx + 1]) {
    html = args[htmlIdx + 1];
  }

  // Fallback defaults if not explicitly passed
  if (!url && !html) {
    if (existsSync(resolve(process.cwd(), '.auteur-ui', 'preview.html'))) {
      html = '.auteur-ui/preview.html';
    } else if (existsSync(resolve(process.cwd(), 'index.html'))) {
      html = 'index.html';
    } else {
      console.error('Error: must provide either --url <url> or --html <file>');
      console.log('Usage: npx auteur-ui lint [--json] [--url <url> | --html <path>] [--explain <rule>]');
      process.exit(1);
    }
  }

  const result = await lint({
    url,
    html,
  });

  const tokenCost = isJson ? encode(JSON.stringify(result)).length : 0;

  appendTrace({
    phase: 'lint',
    args,
    tokens_estimate: tokenCost,
    result: result.pass ? 'pass' : 'fail',
  });

  if (isJson) {
    console.log(JSON.stringify(result));
  } else {
    console.log('\n======================================================');
    console.log(` auteur-ui Deterministic Taste Linter: Score ${result.score}/100`);
    console.log(` Status: ${result.pass ? '✓ PASS' : '✗ FAIL'}`);
    console.log('======================================================');

    if (result.fail.length > 0) {
      console.log(`\nFailures (${result.fail.length}):`);
      for (const f of result.fail) {
        console.log(`  ✗ [${f.r}] on ${f.sel}`);
        console.log(`    Val : ${f.val}`);
        console.log(`    Want: ${f.want}`);
        console.log(`    Fix : ${f.fix}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log(`\nWarnings (${result.warnings.length}):`);
      for (const w of result.warnings) {
        console.log(`  ! [${w.r}] on ${w.sel}: ${w.val}`);
      }
    }

    if (result.fail.length === 0 && result.warnings.length === 0) {
      console.log('\n✓ Zero aesthetic violations detected. Pure taste.');
    }
    console.log('======================================================\n');
  }

  return result;
}
