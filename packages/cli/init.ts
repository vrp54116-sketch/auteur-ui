import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';

export interface InitOptions {
  yes?: boolean;
  agent?: string;
  global?: boolean;
  vendor?: boolean;
  cwd?: string;
}

export type SupportedAgent = 'claude' | 'opencode' | 'cursor' | 'codex' | 'antigravity' | 'generic';

export interface AgentDetectionResult {
  agent: SupportedAgent;
  matchedBy: 'config_dir' | 'binary' | 'default' | 'explicit';
  matchedPath: string;
}

/**
 * Locate auteur-ui package root by walking up from this file.
 */
export function getPackageRoot(): string {
  let curr = dirname(fileURLToPath(import.meta.url));
  while (curr !== dirname(curr)) {
    const pkgPath = join(curr, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'auteur-ui') return curr;
      } catch {
        // continue
      }
    }
    curr = dirname(curr);
  }
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
}

/**
 * Test whether a binary exists in the current system PATH or candidate locations.
 */
export function probeBinary(name: string): string | null {
  try {
    const cmd = process.platform === 'win32' ? `where ${name}` : `which ${name}`;
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
    if (out) {
      const firstLine = out.split('\n')[0].trim();
      if (firstLine && existsSync(firstLine)) return firstLine;
    }
  } catch {
    // ignore
  }

  const explicitFallbacks = [
    join('/usr/local/bin', name),
    join('/usr/bin', name),
    join(os.homedir(), '.local/bin', name),
    join(os.homedir(), '.npm-global/bin', name),
  ];

  if (process.platform === 'darwin' && name === 'cursor') {
    explicitFallbacks.push('/Applications/Cursor.app/Contents/MacOS/Cursor');
  }

  for (const fb of explicitFallbacks) {
    if (existsSync(fb)) return fb;
  }

  return null;
}

/**
 * Probe candidate directories and binaries to detect active agent.
 */
export function detectAgent(
  targetDir: string,
  isGlobal = false,
  skipBinaries = false
): AgentDetectionResult {
  const home = os.homedir();

  const candidates: Array<{
    agent: SupportedAgent;
    projectDirs: string[];
    globalDirs: string[];
    binaries: string[];
  }> = [
    {
      agent: 'claude',
      projectDirs: ['.claude', '.claude.json'],
      globalDirs: [join(home, '.claude'), join(home, '.config/claude'), join(home, '.claude.json')],
      binaries: ['claude'],
    },
    {
      agent: 'opencode',
      projectDirs: ['.opencode', 'opencode.json', '.agents'],
      globalDirs: [join(home, '.config/opencode'), join(home, '.opencode')],
      binaries: ['opencode'],
    },
    {
      agent: 'cursor',
      projectDirs: ['.cursor', '.cursorrules'],
      globalDirs: [join(home, '.cursor'), join(home, '.config/Cursor')],
      binaries: ['cursor'],
    },
    {
      agent: 'antigravity',
      projectDirs: ['.gemini'],
      globalDirs: [join(home, '.gemini/antigravity'), join(home, '.gemini')],
      binaries: ['antigravity', 'agy'],
    },
    {
      agent: 'codex',
      projectDirs: ['.codex'],
      globalDirs: [join(home, '.codex')],
      binaries: ['codex'],
    },
  ];

  // 1. Check project configuration directories first
  for (const cand of candidates) {
    for (const dirName of cand.projectDirs) {
      const p = join(targetDir, dirName);
      if (existsSync(p)) {
        return {
          agent: cand.agent,
          matchedBy: 'config_dir',
          matchedPath: p,
        };
      }
    }
  }

  // 2. Check binary in PATH
  if (!skipBinaries) {
    for (const cand of candidates) {
      for (const bin of cand.binaries) {
        const binPath = probeBinary(bin);
        if (binPath) {
          return {
            agent: cand.agent,
            matchedBy: 'binary',
            matchedPath: binPath,
          };
        }
      }
    }
  }

  // 3. If global install requested, check global directories
  if (isGlobal) {
    for (const cand of candidates) {
      for (const gDir of cand.globalDirs) {
        if (existsSync(gDir)) {
          return {
            agent: cand.agent,
            matchedBy: 'config_dir',
            matchedPath: gDir,
          };
        }
      }
    }
  }

  // 4. Fallback to generic AGENTS.md
  return {
    agent: 'generic',
    matchedBy: 'default',
    matchedPath: join(targetDir, 'AGENTS.md'),
  };
}

/**
 * Recursively copy a directory and return list of copied file relative paths.
 */
function copyDirRecursive(srcDir: string, destDir: string, baseDir: string = srcDir): string[] {
  const createdFiles: string[] = [];
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    const st = statSync(srcPath);

    if (st.isDirectory()) {
      createdFiles.push(...copyDirRecursive(srcPath, destPath, baseDir));
    } else {
      const parent = dirname(destPath);
      if (!existsSync(parent)) mkdirSync(parent, { recursive: true });
      copyFileSync(srcPath, destPath);
      createdFiles.push(relative(baseDir, srcPath));
    }
  }

  return createdFiles;
}

/**
 * Generate SHA-256 for a given file.
 */
function sha256File(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * Router Markdown template for AGENTS.md managed block.
 */
export const MANAGED_AGENTS_BLOCK_START = '<!-- auteur-ui:start -->';
export const MANAGED_AGENTS_BLOCK_END = '<!-- auteur-ui:end -->';

export function getAgentsBlockContent(): string {
  return `${MANAGED_AGENTS_BLOCK_START}
## auteur-ui (Design System Protocol)
1. If \`.auteur-ui/contract.json\` exists -> read it, skip to BUILD.
2. Classify task: app | dashboard | marketing | editorial | tool.
3. Run \`npx auteur-ui brief\` to write \`.auteur-ui/brief.json\`.
4. Emit \`.auteur-ui/directions.json\` (<=400 tokens, 3-5 directions, use \`looks/index.json\` ids). Then run \`npx auteur-ui preview --open\`.
5. STOP. Ask the human to reply with a number. Do not build yet.
6. On reply: \`npx auteur-ui lock <id>\` writes \`.auteur-ui/contract.json\`.
7. Load ONLY modules named by contract. If reading > 3 module files, MUST run \`npx auteur-ui ask\` with \`--scope modules\`.
8. Enforce budget: run \`npx auteur-ui budget\`. If STOP directive triggered, halt.
9. BUILD from contract + \`.auteur-ui/assets/\` assets. Copy assets, do not reinvent.
10. GATE: \`npx auteur-ui lint --json\`. Fix violations. Max 2 iterations. Only then one cropped screenshot if a visual issue remains.
11. Run \`npx auteur-ui report\`. Refuse to declare done below 80.
${MANAGED_AGENTS_BLOCK_END}`;
}

/**
 * Router Markdown template for Cursor (.cursor/rules/auteur-ui.mdc).
 */
export function getCursorRuleContent(): string {
  return `---
description: Designs and redesigns any app, dashboard, landing page, or UI to make it look authentic and avoid generic styling
globs: ""
alwaysApply: false
---

### PROTOCOL

1. If \`.auteur-ui/contract.json\` exists -> read it, skip to BUILD.
2. Classify task: app | dashboard | marketing | editorial | tool.
3. Run \`npx auteur-ui brief\` to write \`.auteur-ui/brief.json\`.
4. Emit \`.auteur-ui/directions.json\` (<=400 tokens, 3-5 directions, use \`looks/index.json\` ids). Then run \`npx auteur-ui preview --open\`.
5. STOP. Ask the human to reply with a number. Do not build yet.
6. On reply: \`npx auteur-ui lock <id>\` writes \`.auteur-ui/contract.json\`.
7. Load ONLY modules named by contract. If reading > 3 module files, MUST run \`npx auteur-ui ask\` with \`--scope modules\`.
8. Enforce budget: run \`npx auteur-ui budget\`. If STOP directive triggered, halt.
9. BUILD from contract + \`.auteur-ui/assets/\` assets. Copy assets, do not reinvent.
10. GATE: \`npx auteur-ui lint --json\`. Fix violations. Max 2 iterations. Only then one cropped screenshot if a visual issue remains.
11. Run \`npx auteur-ui report\`. Refuse to declare done below 80.
`;
}

/**
 * Install the adapter into Claude Code.
 */
function installClaude(targetBase: string, pkgRoot: string): string[] {
  const written: string[] = [];
  const skillDest = join(targetBase, '.claude', 'skills', 'auteur-ui', 'SKILL.md');
  const cmdDest = join(targetBase, '.claude', 'commands', 'auteur-ui.md');

  mkdirSync(dirname(skillDest), { recursive: true });
  mkdirSync(dirname(cmdDest), { recursive: true });

  const srcSkill = join(pkgRoot, 'skill', 'SKILL.md');
  const srcCmd = join(pkgRoot, 'skill', 'commands', 'auteur-ui.md');

  copyFileSync(srcSkill, skillDest);
  copyFileSync(srcCmd, cmdDest);

  written.push(skillDest, cmdDest);
  return written;
}

/**
 * Install the adapter into OpenCode.
 */
function installOpenCode(targetBase: string, pkgRoot: string): string[] {
  const written: string[] = [];
  const skillDest = join(targetBase, '.opencode', 'skills', 'auteur-ui', 'SKILL.md');
  const cmdDest = join(targetBase, '.opencode', 'commands', 'auteur-ui.md');

  mkdirSync(dirname(skillDest), { recursive: true });
  mkdirSync(dirname(cmdDest), { recursive: true });

  const srcSkill = join(pkgRoot, 'skill', 'SKILL.md');
  const srcCmd = join(pkgRoot, 'skill', 'commands', 'auteur-ui.md');

  copyFileSync(srcSkill, skillDest);
  copyFileSync(srcCmd, cmdDest);
  written.push(skillDest, cmdDest);

  // Configure opencode.json
  const configPath = join(targetBase, 'opencode.json');
  let config: Record<string, any> = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      config = {};
    }
  }

  if (!config.$schema) {
    config.$schema = 'https://opencode.ai/config.json';
  }
  if (!config.commands) {
    config.commands = {};
  }
  config.commands['auteur-ui'] = {
    description: 'Run auteur-ui to build distinctive, non-generic UI designs',
    template: 'Execute the auteur-ui skill workflow: inspect .auteur-ui/contract.json or run npx auteur-ui brief, preview directions, lock look, and lint output.',
  };

  if (!config.permission) {
    config.permission = {};
  }
  if (!config.permission.skill) {
    config.permission.skill = {};
  }
  config.permission.skill['auteur-ui'] = 'allow';

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  written.push(configPath);

  return written;
}

/**
 * Install the adapter into Cursor.
 */
function installCursor(targetBase: string): string[] {
  const ruleDest = join(targetBase, '.cursor', 'rules', 'auteur-ui.mdc');
  mkdirSync(dirname(ruleDest), { recursive: true });
  writeFileSync(ruleDest, getCursorRuleContent(), 'utf-8');
  return [ruleDest];
}

/**
 * Install the adapter into Codex / Antigravity / Generic (AGENTS.md).
 */
function installAgentsBlock(targetBase: string): string[] {
  const agentsPath = join(targetBase, 'AGENTS.md');
  const block = getAgentsBlockContent();

  if (existsSync(agentsPath)) {
    const existing = readFileSync(agentsPath, 'utf-8');
    const regex = new RegExp(
      `${MANAGED_AGENTS_BLOCK_START}[\\s\\S]*?${MANAGED_AGENTS_BLOCK_END}`,
      'g'
    );
    if (regex.test(existing)) {
      writeFileSync(agentsPath, existing.replace(regex, block), 'utf-8');
    } else {
      const sep = existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n';
      writeFileSync(agentsPath, existing + sep + block + '\n', 'utf-8');
    }
  } else {
    writeFileSync(agentsPath, block + '\n', 'utf-8');
  }

  return [agentsPath];
}

/**
 * Run the init command.
 */
export async function runInit(argv: string[] = []): Promise<void> {
  const opts: InitOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--yes' || arg === '-y') opts.yes = true;
    else if (arg === '--agent' && argv[i + 1]) {
      opts.agent = argv[++i];
    } else if (arg === '--global' || arg === '-g') opts.global = true;
    else if (arg === '--vendor') opts.vendor = true;
    else if (arg === '--cwd' && argv[i + 1]) {
      opts.cwd = argv[++i];
    }
  }

  const targetDir = opts.cwd ? resolve(opts.cwd) : process.cwd();
  const pkgRoot = getPackageRoot();

  // Read package.json version
  let pkgVersion = '1.0.0';
  const pkgJsonPath = join(pkgRoot, 'package.json');
  if (existsSync(pkgJsonPath)) {
    try {
      const p = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      if (p.version) pkgVersion = p.version;
    } catch {
      // ignore
    }
  }

  // 1. Agent Detection or Validation
  let detection: AgentDetectionResult;
  if (opts.agent) {
    const validAgents: SupportedAgent[] = [
      'claude',
      'opencode',
      'cursor',
      'codex',
      'antigravity',
      'generic',
    ];
    const requested = opts.agent.toLowerCase() as SupportedAgent;
    if (!validAgents.includes(requested)) {
      console.error(
        `Invalid agent: "${opts.agent}". Valid options are: ${validAgents.join(', ')}`
      );
      process.exit(1);
    }
    detection = {
      agent: requested,
      matchedBy: 'explicit',
      matchedPath: '--agent CLI argument',
    };
  } else {
    detection = detectAgent(targetDir, opts.global);
  }

  console.log('\n======================================================');
  console.log('             auteur-ui System Installer');
  console.log('======================================================');
  console.log(`Target Directory : ${targetDir}`);
  console.log(`Target Agent     : ${detection.agent}`);
  console.log(`Detection Method : ${detection.matchedBy} (${detection.matchedPath})`);
  console.log(`Scope            : ${opts.global ? 'Global' : 'Project-local'}`);
  console.log(`Vendor Assets    : ${opts.vendor ? 'Yes (committed to git)' : 'No (.gitignore)'}`);
  console.log('------------------------------------------------------\n');

  const writtenFiles: string[] = [];

  // 2. Install Agent Adapter
  const installTargetBase = opts.global ? os.homedir() : targetDir;
  switch (detection.agent) {
    case 'claude':
      writtenFiles.push(...installClaude(installTargetBase, pkgRoot));
      break;
    case 'opencode':
      writtenFiles.push(...installOpenCode(installTargetBase, pkgRoot));
      break;
    case 'cursor':
      writtenFiles.push(...installCursor(installTargetBase));
      break;
    case 'codex':
    case 'antigravity':
    case 'generic':
    default:
      writtenFiles.push(...installAgentsBlock(installTargetBase));
      break;
  }

  // 3. Copy Assets to .auteur-ui/assets/
  const assetsSrc = join(pkgRoot, 'code');
  const assetsDest = join(targetDir, '.auteur-ui', 'assets');
  if (existsSync(assetsSrc)) {
    const relativeAssetFiles = copyDirRecursive(assetsSrc, assetsDest);
    for (const rel of relativeAssetFiles) {
      writtenFiles.push(join(assetsDest, rel));
    }
  }

  // 4. Configure .gitignore if not --vendor
  const gitignorePath = join(targetDir, '.gitignore');
  let addedToGitignore = false;
  if (!opts.vendor) {
    const ignoreEntry = '.auteur-ui/assets/';
    if (existsSync(gitignorePath)) {
      const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes(ignoreEntry)) {
        const sep = gitignoreContent.endsWith('\n') ? '' : '\n';
        writeFileSync(
          gitignorePath,
          gitignoreContent + `${sep}# auteur-ui assets (use --vendor to commit)\n${ignoreEntry}\n`,
          'utf-8'
        );
        addedToGitignore = true;
      }
    } else {
      writeFileSync(
        gitignorePath,
        `# auteur-ui assets (use --vendor to commit)\n${ignoreEntry}\n`,
        'utf-8'
      );
      addedToGitignore = true;
    }
    if (addedToGitignore) {
      writtenFiles.push(gitignorePath);
    }
  }

  // 5. Write .auteur-ui/version
  const versionFile = join(targetDir, '.auteur-ui', 'version');
  writeFileSync(versionFile, `${pkgVersion}\n`, 'utf-8');
  writtenFiles.push(versionFile);

  // 6. Write .auteur-ui/lockfile.json
  const lockfilePath = join(targetDir, '.auteur-ui', 'lockfile.json');
  const artifactHashes: Record<string, { sha256: string }> = {};

  if (existsSync(assetsDest)) {
    const walkAssets = (dir: string) => {
      const entries = readdirSync(dir);
      for (const e of entries) {
        const p = join(dir, e);
        if (statSync(p).isDirectory()) {
          walkAssets(p);
        } else {
          const rel = relative(join(targetDir, '.auteur-ui'), p);
          artifactHashes[rel] = { sha256: sha256File(p) };
        }
      }
    };
    walkAssets(assetsDest);
  }

  const lockfileData = {
    version: pkgVersion,
    generatedAt: new Date().toISOString(),
    agent: detection.agent,
    detection: {
      matchedBy: detection.matchedBy,
      matchedPath: detection.matchedPath,
    },
    vendor: !!opts.vendor,
    artifacts: artifactHashes,
  };

  writeFileSync(lockfilePath, JSON.stringify(lockfileData, null, 2) + '\n', 'utf-8');
  writtenFiles.push(lockfilePath);

  // 7. Write .auteur-ui/install-manifest.json
  const manifestPath = join(targetDir, '.auteur-ui', 'install-manifest.json');
  const manifestData = {
    agent: detection.agent,
    installedAt: new Date().toISOString(),
    global: !!opts.global,
    vendor: !!opts.vendor,
    managedFiles: writtenFiles.map((f) => relative(targetDir, f)),
    addedToGitignore,
  };
  writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + '\n', 'utf-8');
  writtenFiles.push(manifestPath);

  // 8. Print Installation Summary
  console.log('Installation Complete. Files created / managed:');
  for (const f of writtenFiles) {
    const rel = relative(targetDir, f);
    console.log(`  + ${rel.startsWith('..') ? f : rel}`);
  }

  console.log('\n------------------------------------------------------');
  console.log('To uninstall and clean up all managed files, run:');
  console.log('  npx auteur-ui uninstall');
  console.log('======================================================\n');
}
