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
import { createHash } from 'node:crypto';
import {
  getPackageRoot,
  getAgentsBlockContent,
  getCursorRuleContent,
  MANAGED_AGENTS_BLOCK_START,
  MANAGED_AGENTS_BLOCK_END,
} from './init.js';

export interface UpdateOptions {
  cwd?: string;
}

function copyDirRecursive(srcDir: string, destDir: string): string[] {
  const updated: string[] = [];
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    const st = statSync(srcPath);

    if (st.isDirectory()) {
      updated.push(...copyDirRecursive(srcPath, destPath));
    } else {
      const parent = dirname(destPath);
      if (!existsSync(parent)) mkdirSync(parent, { recursive: true });
      copyFileSync(srcPath, destPath);
      updated.push(destPath);
    }
  }

  return updated;
}

function sha256File(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * Run the update command.
 */
export function runUpdate(argv: string[] = []): void {
  let targetDir = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cwd' && argv[i + 1]) {
      targetDir = resolve(argv[++i]);
    }
  }

  const pkgRoot = getPackageRoot();
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

  console.log('\n======================================================');
  console.log('             auteur-ui Artifact Updater');
  console.log('======================================================');
  console.log(`Target Directory : ${targetDir}`);
  console.log(`Package Version  : ${pkgVersion}`);
  console.log('Mode             : Offline artifact re-copy (no network)');
  console.log('------------------------------------------------------\n');

  const updatedItems: string[] = [];

  // 1. Re-copy Assets
  const assetsSrc = join(pkgRoot, 'code');
  const assetsDest = join(targetDir, '.auteur-ui', 'assets');
  if (existsSync(assetsSrc)) {
    copyDirRecursive(assetsSrc, assetsDest);
    updatedItems.push('.auteur-ui/assets/ (motion, sound, css, type)');
  }

  // 2. Refresh Adapters if installed
  const cursorRule = join(targetDir, '.cursor', 'rules', 'auteur-ui.mdc');
  if (existsSync(cursorRule)) {
    writeFileSync(cursorRule, getCursorRuleContent(), 'utf-8');
    updatedItems.push('.cursor/rules/auteur-ui.mdc');
  }

  const agentsPath = join(targetDir, 'AGENTS.md');
  if (existsSync(agentsPath)) {
    const raw = readFileSync(agentsPath, 'utf-8');
    const regex = new RegExp(
      `${MANAGED_AGENTS_BLOCK_START}[\\s\\S]*?${MANAGED_AGENTS_BLOCK_END}`,
      'g'
    );
    if (regex.test(raw)) {
      writeFileSync(agentsPath, raw.replace(regex, getAgentsBlockContent()), 'utf-8');
      updatedItems.push('AGENTS.md (fenced router block)');
    }
  }

  const claudeSkill = join(targetDir, '.claude', 'skills', 'auteur-ui', 'SKILL.md');
  if (existsSync(claudeSkill)) {
    copyFileSync(join(pkgRoot, 'skill', 'SKILL.md'), claudeSkill);
    updatedItems.push('.claude/skills/auteur-ui/SKILL.md');
  }
  const claudeCmd = join(targetDir, '.claude', 'commands', 'auteur-ui.md');
  if (existsSync(claudeCmd)) {
    copyFileSync(join(pkgRoot, 'skill', 'commands', 'auteur-ui.md'), claudeCmd);
    updatedItems.push('.claude/commands/auteur-ui.md');
  }

  const opencodeSkill = join(targetDir, '.opencode', 'skills', 'auteur-ui', 'SKILL.md');
  if (existsSync(opencodeSkill)) {
    copyFileSync(join(pkgRoot, 'skill', 'SKILL.md'), opencodeSkill);
    updatedItems.push('.opencode/skills/auteur-ui/SKILL.md');
  }
  const opencodeCmd = join(targetDir, '.opencode', 'commands', 'auteur-ui.md');
  if (existsSync(opencodeCmd)) {
    copyFileSync(join(pkgRoot, 'skill', 'commands', 'auteur-ui.md'), opencodeCmd);
    updatedItems.push('.opencode/commands/auteur-ui.md');
  }

  // 3. Update .auteur-ui/version
  const versionFile = join(targetDir, '.auteur-ui', 'version');
  mkdirSync(dirname(versionFile), { recursive: true });
  writeFileSync(versionFile, `${pkgVersion}\n`, 'utf-8');
  updatedItems.push('.auteur-ui/version');

  // 4. Update .auteur-ui/lockfile.json
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

  let existingLockfile: Record<string, any> = {};
  if (existsSync(lockfilePath)) {
    try {
      existingLockfile = JSON.parse(readFileSync(lockfilePath, 'utf-8'));
    } catch {
      // ignore
    }
  }

  const lockfileData = {
    ...existingLockfile,
    version: pkgVersion,
    updatedAt: new Date().toISOString(),
    artifacts: artifactHashes,
  };

  writeFileSync(lockfilePath, JSON.stringify(lockfileData, null, 2) + '\n', 'utf-8');
  updatedItems.push('.auteur-ui/lockfile.json');

  console.log('Artifacts successfully updated from pinned release:');
  for (const item of updatedItems) {
    console.log(`  ✓ ${item}`);
  }
  console.log('\nAll assets and lockfiles synchronized.');
  console.log('======================================================\n');
}

