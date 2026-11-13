import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { LookSchema, toContract } from '../packages/schema/look.js';
import { toMarkdown } from '../packages/schema/contract.js';

interface BudgetResult {
  target: string;
  tokens: number;
  limit: number;
  passed: boolean;
}

function runBudget(): void {
  const results: BudgetResult[] = [];
  const root = process.cwd();
  const looksDir = join(root, 'looks');
  const manifestPath = join(looksDir, 'index.json');

  console.log('\n======================================================');
  console.log('   auteur-ui Token Budget Audit');
  console.log('======================================================\n');

  // 1. Audit looks/index.json
  const manifestRaw = readFileSync(manifestPath, 'utf-8');
  const manifestTokens = encode(manifestRaw).length;
  results.push({
    target: 'looks/index.json manifest',
    tokens: manifestTokens,
    limit: 600,
    passed: manifestTokens <= 600,
  });

  // 2. Audit each curated look's contract markdown summary
  const lookDirs = readdirSync(looksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const id of lookDirs) {
    const lookPath = join(looksDir, id, 'look.json');
    const raw = readFileSync(lookPath, 'utf-8');
    const look = LookSchema.parse(JSON.parse(raw));
    const contract = toContract(look);
    const md = toMarkdown(contract);
    const tokens = encode(md).length;

    results.push({
      target: `contract summary: ${id}`,
      tokens,
      limit: 300,
      passed: tokens <= 300,
    });
  }

  // 3. Audit directions output budget (5 directions)
  const directionsPath = join(root, 'tests', 'fixtures', 'directions.json');
  if (existsSync(directionsPath)) {
    const directionsRaw = readFileSync(directionsPath, 'utf-8');
    const directionsTokens = encode(directionsRaw).length;

    results.push({
      target: 'directions output (5 directions)',
      tokens: directionsTokens,
      limit: 400,
      passed: directionsTokens <= 400,
    });
  }

  // Print results table
  console.log(
    'Target'.padEnd(36) +
      'Tokens'.padStart(8) +
      'Limit'.padStart(8) +
      'Status'.padStart(10)
  );
  console.log('-'.repeat(62));

  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '✓ PASS' : '✗ OVER';
    if (!r.passed) allPassed = false;
    console.log(
      r.target.padEnd(36) +
        String(r.tokens).padStart(8) +
        String(r.limit).padStart(8) +
        status.padStart(10)
    );
  }

  console.log('-'.repeat(62));
  if (allPassed) {
    console.log('All token budget invariants satisfied.\n');
  } else {
    console.error('One or more token budgets were exceeded!\n');
    process.exit(1);
  }
}

runBudget();
