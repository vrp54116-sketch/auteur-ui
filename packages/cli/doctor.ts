import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { appendTrace } from './trace.js';

interface CheckItem {
  name: string;
  detail: string;
  pass: boolean;
}

export function runDoctor(args: string[] = []): boolean {
  const root = process.cwd();
  const checks: CheckItem[] = [];

  // 1. Node.js Environment
  const nodeVer = process.version;
  const major = parseInt(nodeVer.replace(/^v/, '').split('.')[0], 10);
  checks.push({
    name: 'Node.js Environment',
    detail: `${nodeVer} (>= 18 required)`,
    pass: major >= 18,
  });

  // 2. Looks Manifest
  const manifestPath = resolve(root, 'looks', 'index.json');
  let looksCount = 0;
  let manifestOk = false;
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      if (Array.isArray(manifest)) {
        looksCount = manifest.length;
        manifestOk = looksCount > 0;
      }
    } catch {
      manifestOk = false;
    }
  }
  checks.push({
    name: 'Looks Manifest',
    detail: `looks/index.json (${looksCount} looks defined)`,
    pass: manifestOk,
  });

  // 3. Curated Looks
  const looksDir = resolve(root, 'looks');
  let validLooks = 0;
  const expectedLooks = [
    'kinetic-pop',
    'nocturne-editorial',
    'paper-editorial',
    'swiss-utility',
    'terminal-luxe',
  ];
  if (existsSync(looksDir)) {
    for (const id of expectedLooks) {
      const p = join(looksDir, id, 'look.json');
      if (existsSync(p)) {
        try {
          JSON.parse(readFileSync(p, 'utf-8'));
          validLooks++;
        } catch {
          // invalid json
        }
      }
    }
  }
  checks.push({
    name: 'Curated Looks',
    detail: `${validLooks}/${expectedLooks.length} curated looks verified`,
    pass: validLooks === expectedLooks.length,
  });

  // 4. Skill Router
  const routerPath = resolve(root, 'skill', 'SKILL.md');
  let routerTokens = 0;
  let routerOk = false;
  if (existsSync(routerPath)) {
    const raw = readFileSync(routerPath, 'utf-8');
    routerTokens = encode(raw).length;
    routerOk = routerTokens <= 500 && raw.includes('name: auteur-ui');
  }
  checks.push({
    name: 'Skill Router',
    detail: `skill/SKILL.md (${routerTokens} tokens <= 500 limit)`,
    pass: routerOk,
  });

  // 5. Slash Command
  const cmdPath = resolve(root, 'skill', 'commands', 'auteur-ui.md');
  let cmdTokens = 0;
  let cmdOk = false;
  if (existsSync(cmdPath)) {
    const raw = readFileSync(cmdPath, 'utf-8');
    cmdTokens = encode(raw).length;
    cmdOk = cmdTokens <= 120;
  }
  checks.push({
    name: 'Slash Command',
    detail: `skill/commands/auteur-ui.md (${cmdTokens} tokens <= 120 limit)`,
    pass: cmdOk,
  });

  // 6. Design Modules
  const modulesDir = resolve(root, 'modules');
  const expectedModules = [
    'typography.md',
    'color.md',
    'layout.md',
    'motion.md',
    'sound.md',
    'components.md',
  ];
  let foundModules = 0;
  if (existsSync(modulesDir)) {
    for (const m of expectedModules) {
      if (existsSync(join(modulesDir, m))) foundModules++;
    }
  }
  checks.push({
    name: 'Design Modules',
    detail: `${foundModules}/${expectedModules.length} modules present in modules/`,
    pass: foundModules === expectedModules.length,
  });

  // 7. Code Assets Directory
  const codeDir = resolve(root, 'code');
  checks.push({
    name: 'Code Assets',
    detail: 'code/ directory ready for asset extraction',
    pass: existsSync(codeDir),
  });

  // 8. Workspace Output Directory
  const outDir = resolve(root, '.auteur-ui');
  checks.push({
    name: 'Workspace Directory',
    detail: '.auteur-ui/ directory ready for runtime artifacts',
    pass: existsSync(outDir),
  });

  const allPassed = checks.every((c) => c.pass);

  appendTrace({
    phase: 'doctor',
    args,
    tokens_estimate: 0,
    result: allPassed ? 'pass' : 'fail',
  });

  console.log('\n======================================================');
  console.log('         auteur-ui System Doctor Checklist');
  console.log('======================================================\n');

  for (const c of checks) {
    const icon = c.pass ? '[✓]' : '[✗]';
    console.log(` ${icon} ${c.name.padEnd(24)}: ${c.detail}`);
  }

  console.log('\n' + '-'.repeat(54));
  if (allPassed) {
    console.log(`Status: All diagnostic checks passed (${checks.length}/${checks.length}).\n`);
  } else {
    console.error(`Status: Some diagnostic checks failed.\n`);
    process.exit(1);
  }

  return allPassed;
}

