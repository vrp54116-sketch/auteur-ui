import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { encode } from 'gpt-tokenizer';
import { appendTrace, verifyTrace } from './trace.js';
import { MANAGED_AGENTS_BLOCK_START } from './init.js';

interface CheckItem {
  name: string;
  detail: string;
  pass: boolean;
  fix?: string;
}

export function runDoctor(args: string[] = []): boolean {
  let root = process.cwd();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cwd' && args[i + 1]) {
      root = resolve(args[++i]);
    }
  }

  const checks: CheckItem[] = [];

  // =========================================================================
  // 1. Skill Discoverability across agent candidates
  // =========================================================================
  const skillCandidates = [
    { type: 'Claude Code', path: join(root, '.claude', 'skills', 'auteur-ui', 'SKILL.md') },
    { type: 'OpenCode', path: join(root, '.opencode', 'skills', 'auteur-ui', 'SKILL.md') },
    { type: 'Cursor', path: join(root, '.cursor', 'rules', 'auteur-ui.mdc') },
    { type: 'AGENTS.md', path: join(root, 'AGENTS.md') },
    { type: 'Dev Repo', path: join(root, 'skill', 'SKILL.md') },
  ];

  let foundSkillPath: string | null = null;
  let foundSkillType: string | null = null;
  let routerContent: string | null = null;

  for (const cand of skillCandidates) {
    if (existsSync(cand.path)) {
      if (cand.type === 'AGENTS.md') {
        const raw = readFileSync(cand.path, 'utf-8');
        if (raw.includes(MANAGED_AGENTS_BLOCK_START)) {
          foundSkillPath = cand.path;
          foundSkillType = cand.type;
          routerContent = raw;
          break;
        }
      } else {
        foundSkillPath = cand.path;
        foundSkillType = cand.type;
        routerContent = readFileSync(cand.path, 'utf-8');
        break;
      }
    }
  }

  checks.push({
    name: 'Skill Discoverability',
    detail: foundSkillPath
      ? `Discovered ${foundSkillType} skill at ${foundSkillPath}`
      : 'No auteur-ui skill router found in agent configuration paths',
    pass: foundSkillPath !== null,
    fix: "Run 'npx auteur-ui init' to install the skill for your coding agent.",
  });

  // =========================================================================
  // 2. Router Token Count (Budget Invariant <= 500 tokens)
  // =========================================================================
  let routerTokens = 0;
  let routerPass = false;
  if (routerContent) {
    routerTokens = encode(routerContent).length;
    routerPass = routerTokens <= 500;
  }

  checks.push({
    name: 'Router Token Budget',
    detail: routerContent
      ? `${routerTokens} tokens (limit: <= 500 tokens)`
      : 'Router not available to measure token count',
    pass: routerPass,
    fix: 'Edit the skill router to reduce token footprint below 500 tokens.',
  });

  // =========================================================================
  // 3. Assets Present (.auteur-ui/assets/ or code/)
  // =========================================================================
  const requiredCategories = ['css', 'motion', 'sound', 'type'];
  const userAssetsDir = join(root, '.auteur-ui', 'assets');
  const devAssetsDir = join(root, 'code');

  const checkDir = existsSync(userAssetsDir)
    ? userAssetsDir
    : existsSync(devAssetsDir)
      ? devAssetsDir
      : null;

  let foundCategories = 0;
  if (checkDir) {
    for (const cat of requiredCategories) {
      if (existsSync(join(checkDir, cat))) foundCategories++;
    }
  }

  const assetsPass = checkDir !== null && foundCategories === requiredCategories.length;
  checks.push({
    name: 'Assets Present',
    detail: assetsPass
      ? `Assets verified in ${checkDir === userAssetsDir ? '.auteur-ui/assets/' : 'code/'} (${foundCategories}/${requiredCategories.length} categories)`
      : `Missing required asset bundles (${foundCategories}/${requiredCategories.length} categories found)`,
    pass: assetsPass,
    fix: "Run 'npx auteur-ui update' to populate missing assets from release.",
  });

  // =========================================================================
  // 4. Playwright Installed
  // =========================================================================
  let playwrightInstalled = false;
  try {
    const require = createRequire(import.meta.url);
    require.resolve('playwright');
    playwrightInstalled = true;
  } catch {
    playwrightInstalled = false;
  }

  checks.push({
    name: 'Playwright Engine',
    detail: playwrightInstalled
      ? 'Playwright installed for headless rendering'
      : 'Playwright package not found in node_modules',
    pass: playwrightInstalled,
    fix: "Run 'pnpm add -D playwright' (or 'npm i -D playwright') to enable visual rendering.",
  });

  // =========================================================================
  // 5. Node.js Environment (>= 18)
  // =========================================================================
  const nodeVer = process.version;
  const major = parseInt(nodeVer.replace(/^v/, '').split('.')[0], 10);
  const nodePass = major >= 18;

  checks.push({
    name: 'Node.js Version',
    detail: `${nodeVer} (>= 18.0.0 required)`,
    pass: nodePass,
    fix: `Upgrade Node.js to >= 18.0.0 (current: ${nodeVer}).`,
  });

  // =========================================================================
  // 6. Contract Validity (.auteur-ui/contract.json)
  // =========================================================================
  const contractPath = join(root, '.auteur-ui', 'contract.json');
  let contractPass = true;
  let contractDetail = '.auteur-ui/contract.json (not generated yet — ready for lock)';

  if (existsSync(contractPath)) {
    try {
      const parsed = JSON.parse(readFileSync(contractPath, 'utf-8'));
      if (
        (parsed.look || parsed.id) &&
        parsed.type &&
        (parsed.palette || parsed.color) &&
        parsed.motion
      ) {
        const lookName = parsed.look || parsed.id;
        contractPass = true;
        contractDetail = `Valid design contract loaded (look: "${lookName}")`;
      } else {
        contractPass = false;
        contractDetail = 'contract.json missing required contract schema properties';
      }
    } catch {
      contractPass = false;
      contractDetail = 'contract.json is malformed or invalid JSON';
    }
  }

  checks.push({
    name: 'Contract Validity',
    detail: contractDetail,
    pass: contractPass,
    fix: "Run 'npx auteur-ui lock <look-id>' to regenerate a valid contract.",
  });

  // =========================================================================
  // 7. Trace Health (.auteur-ui/trace.jsonl)
  // =========================================================================
  const tracePath = join(root, '.auteur-ui', 'trace.jsonl');
  let tracePass = true;
  let traceDetail = '.auteur-ui/trace.jsonl (no execution steps yet)';

  if (existsSync(tracePath)) {
    try {
      const v = verifyTrace(tracePath);
      tracePass = v.success;
      traceDetail = v.success
        ? `Trace sequence verified (${v.completedPhases.length} phases intact)`
        : `Trace verification: missing phase "${v.missingPhase}" (${v.completedPhases.length} phases recorded)`;
    } catch (err: any) {
      tracePass = false;
      traceDetail = `Trace read error: ${err.message}`;
    }
  }

  checks.push({
    name: 'Trace Health',
    detail: traceDetail,
    pass: tracePass,
    fix: 'Workflow trace sequence corrupted. Clear .auteur-ui/trace.jsonl or run steps in order.',
  });

  const allPassed = checks.every((c) => c.pass);

  appendTrace(
    {
      phase: 'doctor',
      args,
      tokens_estimate: 0,
      result: allPassed ? 'pass' : 'fail',
    },
    join(root, '.auteur-ui', 'trace.jsonl')
  );

  console.log('\n======================================================');
  console.log('         auteur-ui System Doctor Checklist');
  console.log('======================================================\n');

  for (const c of checks) {
    const icon = c.pass ? '[✓]' : '[✗]';
    console.log(` ${icon} ${c.name.padEnd(24)}: ${c.detail}`);
    if (!c.pass && c.fix) {
      console.log(`     ⤷ Fix: ${c.fix}`);
    }
  }

  console.log('\n' + '-'.repeat(54));
  if (allPassed) {
    console.log(`Status: All diagnostic checks passed (${checks.length}/${checks.length}).\n`);
  } else {
    const failedCount = checks.filter((c) => !c.pass).length;
    console.error(`Status: ${failedCount} diagnostic check(s) failed.\n`);
    if (!args.includes('--no-exit')) {
      process.exit(1);
    }
  }

  return allPassed;
}
