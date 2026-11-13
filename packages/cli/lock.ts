import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { LookSchema, toContract } from '../schema/index.js';
import { appendTrace } from './trace.js';

export function runLock(args: string[]): void {
  let lookId: string | undefined;
  let outPath = '.auteur-ui/contract.json';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--out') {
      outPath = args[++i];
    } else if (arg === '--look' || arg === '--id') {
      lookId = args[++i];
    } else if (!arg.startsWith('-') && !lookId) {
      lookId = arg;
    }
  }

  const looksDir = resolve(process.cwd(), 'looks');
  const availableLooks = existsSync(looksDir)
    ? readdirSync(looksDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  if (!lookId) {
    console.error(
      `Error: Missing look id for lock command. Available looks: ${availableLooks.join(', ')}`
    );
    console.error(`Usage: npx auteur-ui lock <look-id>`);
    process.exit(1);
  }

  const lookPath = resolve(looksDir, lookId, 'look.json');
  if (!existsSync(lookPath)) {
    console.error(
      `Error: Look "${lookId}" not found at ${lookPath}.\nAvailable looks: ${availableLooks.join(
        ', '
      )}`
    );
    process.exit(1);
  }

  let lookJson: any;
  try {
    const raw = readFileSync(lookPath, 'utf-8');
    lookJson = JSON.parse(raw);
  } catch (err: any) {
    console.error(`Error reading look JSON for "${lookId}": ${err?.message || err}`);
    process.exit(1);
  }

  const parsedLook = LookSchema.parse(lookJson);
  const contract = toContract(parsedLook);

  const fullOut = resolve(process.cwd(), outPath);
  const outDir = dirname(fullOut);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const jsonStr = JSON.stringify(contract, null, 2);
  writeFileSync(fullOut, jsonStr, 'utf-8');
  const tokens = encode(jsonStr).length;

  appendTrace({
    phase: 'lock',
    args,
    tokens_estimate: tokens,
    result: 'ok',
  });

  console.log(`✓ Locked look "${lookId}" into contract: ${outPath} (~${tokens} tokens)`);
}

