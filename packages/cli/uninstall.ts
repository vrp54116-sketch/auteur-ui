import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  rmdirSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import {
  MANAGED_AGENTS_BLOCK_START,
  MANAGED_AGENTS_BLOCK_END,
} from './init.js';

export interface UninstallOptions {
  cwd?: string;
}

/**
 * Recursively remove empty directories up to stopDir.
 */
function cleanEmptyDirs(dir: string, stopDir: string): void {
  if (dir === stopDir || !dir.startsWith(stopDir)) return;
  if (existsSync(dir)) {
    try {
      const files = readdirSync(dir);
      if (files.length === 0) {
        rmdirSync(dir);
        cleanEmptyDirs(resolve(dir, '..'), stopDir);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Run the uninstall command.
 */
export function runUninstall(argv: string[] = []): void {
  let targetDir = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cwd' && argv[i + 1]) {
      targetDir = resolve(argv[++i]);
    }
  }

  console.log('\n======================================================');
  console.log('             auteur-ui System Uninstaller');
  console.log('======================================================');
  console.log(`Target Directory : ${targetDir}`);
  console.log('------------------------------------------------------\n');

  const removedItems: string[] = [];

  // 1. Read install-manifest if present
  const manifestPath = join(targetDir, '.auteur-ui', 'install-manifest.json');
  let manifest: { addedToGitignore?: boolean } | null = null;
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch {
      // ignore
    }
  }

  // 2. Clean AGENTS.md managed block
  const agentsPath = join(targetDir, 'AGENTS.md');
  if (existsSync(agentsPath)) {
    const raw = readFileSync(agentsPath, 'utf-8');
    const regex = new RegExp(
      `\\n*${MANAGED_AGENTS_BLOCK_START}[\\s\\S]*?${MANAGED_AGENTS_BLOCK_END}\\n*`,
      'g'
    );
    if (regex.test(raw)) {
      const cleaned = raw.replace(regex, '').trim();
      if (cleaned.length === 0) {
        unlinkSync(agentsPath);
        removedItems.push('AGENTS.md');
      } else {
        writeFileSync(agentsPath, cleaned + '\n', 'utf-8');
        removedItems.push('AGENTS.md (fenced block removed)');
      }
    }
  }

  // 3. Clean Cursor rule
  const cursorRule = join(targetDir, '.cursor', 'rules', 'auteur-ui.mdc');
  if (existsSync(cursorRule)) {
    unlinkSync(cursorRule);
    removedItems.push('.cursor/rules/auteur-ui.mdc');
    cleanEmptyDirs(join(targetDir, '.cursor', 'rules'), targetDir);
    cleanEmptyDirs(join(targetDir, '.cursor'), targetDir);
  }

  // 4. Clean Claude skill and command
  const claudeSkill = join(targetDir, '.claude', 'skills', 'auteur-ui', 'SKILL.md');
  if (existsSync(claudeSkill)) {
    unlinkSync(claudeSkill);
    removedItems.push('.claude/skills/auteur-ui/SKILL.md');
    cleanEmptyDirs(join(targetDir, '.claude', 'skills', 'auteur-ui'), targetDir);
    cleanEmptyDirs(join(targetDir, '.claude', 'skills'), targetDir);
  }
  const claudeCmd = join(targetDir, '.claude', 'commands', 'auteur-ui.md');
  if (existsSync(claudeCmd)) {
    unlinkSync(claudeCmd);
    removedItems.push('.claude/commands/auteur-ui.md');
    cleanEmptyDirs(join(targetDir, '.claude', 'commands'), targetDir);
    cleanEmptyDirs(join(targetDir, '.claude'), targetDir);
  }

  // 5. Clean OpenCode skill, command, and opencode.json
  const opencodeSkill = join(targetDir, '.opencode', 'skills', 'auteur-ui', 'SKILL.md');
  if (existsSync(opencodeSkill)) {
    unlinkSync(opencodeSkill);
    removedItems.push('.opencode/skills/auteur-ui/SKILL.md');
    cleanEmptyDirs(join(targetDir, '.opencode', 'skills', 'auteur-ui'), targetDir);
    cleanEmptyDirs(join(targetDir, '.opencode', 'skills'), targetDir);
    cleanEmptyDirs(join(targetDir, '.opencode'), targetDir);
  }
  const opencodeCmd = join(targetDir, '.opencode', 'commands', 'auteur-ui.md');
  if (existsSync(opencodeCmd)) {
    unlinkSync(opencodeCmd);
    removedItems.push('.opencode/commands/auteur-ui.md');
    cleanEmptyDirs(join(targetDir, '.opencode', 'commands'), targetDir);
    cleanEmptyDirs(join(targetDir, '.opencode'), targetDir);
  }

  const opencodeConfigPath = join(targetDir, 'opencode.json');
  if (existsSync(opencodeConfigPath)) {
    try {
      const cfg = JSON.parse(readFileSync(opencodeConfigPath, 'utf-8'));
      let modified = false;

      if (cfg.commands && cfg.commands['auteur-ui']) {
        delete cfg.commands['auteur-ui'];
        if (Object.keys(cfg.commands).length === 0) delete cfg.commands;
        modified = true;
      }
      if (cfg.permission?.skill && cfg.permission.skill['auteur-ui']) {
        delete cfg.permission.skill['auteur-ui'];
        if (Object.keys(cfg.permission.skill).length === 0) delete cfg.permission.skill;
        if (Object.keys(cfg.permission).length === 0) delete cfg.permission;
        modified = true;
      }

      const remainingKeys = Object.keys(cfg).filter((k) => k !== '$schema');
      if (remainingKeys.length === 0) {
        unlinkSync(opencodeConfigPath);
        removedItems.push('opencode.json');
      } else if (modified) {
        writeFileSync(opencodeConfigPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
        removedItems.push('opencode.json (auteur-ui entries removed)');
      }
    } catch {
      // ignore
    }
  }

  // 6. Clean .gitignore
  const gitignorePath = join(targetDir, '.gitignore');
  if (existsSync(gitignorePath)) {
    const raw = readFileSync(gitignorePath, 'utf-8');
    const cleaned = raw
      .replace(/# auteur-ui assets \(use --vendor to commit\)\n?/g, '')
      .replace(/\.auteur-ui\/assets\/\n?/g, '')
      .trim();
    if (cleaned.length === 0) {
      unlinkSync(gitignorePath);
      removedItems.push('.gitignore');
    } else if (cleaned !== raw.trim()) {
      writeFileSync(gitignorePath, cleaned + '\n', 'utf-8');
      removedItems.push('.gitignore (auteur-ui entries removed)');
    }
  }

  // 7. Clean .auteur-ui assets, version, lockfile, manifest
  const assetsDir = join(targetDir, '.auteur-ui', 'assets');
  if (existsSync(assetsDir)) {
    rmSync(assetsDir, { recursive: true, force: true });
    removedItems.push('.auteur-ui/assets/');
  }

  const vFile = join(targetDir, '.auteur-ui', 'version');
  if (existsSync(vFile)) {
    unlinkSync(vFile);
    removedItems.push('.auteur-ui/version');
  }

  const lFile = join(targetDir, '.auteur-ui', 'lockfile.json');
  if (existsSync(lFile)) {
    unlinkSync(lFile);
    removedItems.push('.auteur-ui/lockfile.json');
  }

  if (existsSync(manifestPath)) {
    unlinkSync(manifestPath);
    removedItems.push('.auteur-ui/install-manifest.json');
  }

  // 8. If .auteur-ui has no remaining files, delete .auteur-ui directory
  const auteurDir = join(targetDir, '.auteur-ui');
  if (existsSync(auteurDir)) {
    try {
      const remaining = readdirSync(auteurDir);
      if (remaining.length === 0) {
        rmdirSync(auteurDir);
        removedItems.push('.auteur-ui/');
      } else {
        console.log(`Preserved user files in .auteur-ui/: ${remaining.join(', ')}`);
      }
    } catch {
      // ignore
    }
  }

  console.log('Uninstallation complete. Cleaned items:');
  for (const item of removedItems) {
    console.log(`  - ${item}`);
  }
  console.log('\nUser files and git history remain untouched.');
  console.log('======================================================\n');
}
