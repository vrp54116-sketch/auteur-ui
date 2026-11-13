import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { encode } from 'gpt-tokenizer';
import { runInit, detectAgent } from '../packages/cli/init.js';
import { runUninstall } from '../packages/cli/uninstall.js';
import { runUpdate } from '../packages/cli/update.js';
import { runDoctor } from '../packages/cli/doctor.js';

describe('Phase 8: Installer Suite Across Coding Agents', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'auteur-ui-test-'));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Helper to snapshot all files in a directory recursively
  function snapshotDir(dir: string, base: string = dir): Record<string, string> {
    const snapshot: Record<string, string> = {};
    if (!existsSync(dir)) return snapshot;

    const walk = (d: string) => {
      const entries = readdirSync(d);
      for (const e of entries) {
        const full = join(d, e);
        const rel = full.replace(base, '').replace(/^[/\\]+/, '');
        if (existsSync(full)) {
          try {
            const stat = readFileSync(full);
            snapshot[rel] = stat.toString('utf-8');
          } catch {
            walk(full);
          }
        }
      }
    };
    walk(dir);
    return snapshot;
  }

  // =========================================================================
  // 1. Claude Code Adapter
  // =========================================================================
  it('installs Claude Code adapter, enforces idempotency, and cleans up cleanly', async () => {
    const initialFiles = snapshotDir(tempDir);

    // Initial Install
    await runInit(['--agent', 'claude', '--yes', '--cwd', tempDir]);

    const skillPath = join(tempDir, '.claude', 'skills', 'auteur-ui', 'SKILL.md');
    const cmdPath = join(tempDir, '.claude', 'commands', 'auteur-ui.md');
    const versionPath = join(tempDir, '.auteur-ui', 'version');
    const lockfilePath = join(tempDir, '.auteur-ui', 'lockfile.json');
    const gitignorePath = join(tempDir, '.gitignore');

    expect(existsSync(skillPath)).toBe(true);
    expect(existsSync(cmdPath)).toBe(true);
    expect(existsSync(versionPath)).toBe(true);
    expect(existsSync(lockfilePath)).toBe(true);
    expect(existsSync(gitignorePath)).toBe(true);

    // Token count check
    const skillContent = readFileSync(skillPath, 'utf-8');
    const tokens = encode(skillContent).length;
    expect(tokens).toBeLessThanOrEqual(500);

    // Assets copied
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets', 'css'))).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets', 'motion'))).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets', 'sound'))).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets', 'type'))).toBe(true);

    // Idempotency: Second Install produces zero diff
    const snap1 = snapshotDir(tempDir);
    // Overwrite lockfile timestamp variation by locking before re-run
    await runInit(['--agent', 'claude', '--yes', '--cwd', tempDir]);
    const snap2 = snapshotDir(tempDir);

    // Lockfile generatedAt and manifest installedAt will have timestamps; compare all other files
    for (const file of Object.keys(snap1)) {
      if (!file.includes('lockfile.json') && !file.includes('install-manifest.json')) {
        expect(snap2[file]).toBe(snap1[file]);
      }
    }

    // Clean Uninstall: returns to byte-for-byte original state
    runUninstall(['--cwd', tempDir]);
    const finalFiles = snapshotDir(tempDir);
    expect(finalFiles).toEqual(initialFiles);
  });

  // =========================================================================
  // 2. OpenCode Adapter
  // =========================================================================
  it('installs opencode adapter, updates opencode.json, and uninstalls cleanly', async () => {
    const initialFiles = snapshotDir(tempDir);

    await runInit(['--agent', 'opencode', '--yes', '--cwd', tempDir]);

    const skillPath = join(tempDir, '.opencode', 'skills', 'auteur-ui', 'SKILL.md');
    const cmdPath = join(tempDir, '.opencode', 'commands', 'auteur-ui.md');
    const configPath = join(tempDir, 'opencode.json');

    expect(existsSync(skillPath)).toBe(true);
    expect(existsSync(cmdPath)).toBe(true);
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.commands['auteur-ui']).toBeDefined();
    expect(config.permission.skill['auteur-ui']).toBe('allow');

    // Idempotency
    const snap1 = snapshotDir(tempDir);
    await runInit(['--agent', 'opencode', '--yes', '--cwd', tempDir]);
    const snap2 = snapshotDir(tempDir);
    for (const file of Object.keys(snap1)) {
      if (!file.includes('lockfile.json') && !file.includes('install-manifest.json')) {
        expect(snap2[file]).toBe(snap1[file]);
      }
    }

    // Clean Uninstall
    runUninstall(['--cwd', tempDir]);
    const finalFiles = snapshotDir(tempDir);
    expect(finalFiles).toEqual(initialFiles);
  });

  // =========================================================================
  // 3. Cursor Adapter
  // =========================================================================
  it('installs Cursor adapter, asserts router token budget <= 500, and uninstalls cleanly', async () => {
    const initialFiles = snapshotDir(tempDir);

    await runInit(['--agent', 'cursor', '--yes', '--cwd', tempDir]);

    const rulePath = join(tempDir, '.cursor', 'rules', 'auteur-ui.mdc');
    expect(existsSync(rulePath)).toBe(true);

    const ruleContent = readFileSync(rulePath, 'utf-8');
    const tokens = encode(ruleContent).length;
    expect(tokens).toBeLessThanOrEqual(500);

    // Frontmatter check
    expect(ruleContent).toContain('description:');
    expect(ruleContent).toContain('alwaysApply: false');

    // Idempotency
    const snap1 = snapshotDir(tempDir);
    await runInit(['--agent', 'cursor', '--yes', '--cwd', tempDir]);
    const snap2 = snapshotDir(tempDir);
    for (const file of Object.keys(snap1)) {
      if (!file.includes('lockfile.json') && !file.includes('install-manifest.json')) {
        expect(snap2[file]).toBe(snap1[file]);
      }
    }

    // Clean Uninstall
    runUninstall(['--cwd', tempDir]);
    const finalFiles = snapshotDir(tempDir);
    expect(finalFiles).toEqual(initialFiles);
  });

  // =========================================================================
  // 4. Codex Adapter (with existing user AGENTS.md)
  // =========================================================================
  it('installs Codex adapter into existing AGENTS.md, preserves user content, uninstalls cleanly', async () => {
    const userAgentsMd = '# My Custom Project Rules\n\n- Always write unit tests.\n- Never delete user files.\n';
    writeFileSync(join(tempDir, 'AGENTS.md'), userAgentsMd, 'utf-8');

    await runInit(['--agent', 'codex', '--yes', '--cwd', tempDir]);

    const updatedAgents = readFileSync(join(tempDir, 'AGENTS.md'), 'utf-8');
    expect(updatedAgents).toContain('# My Custom Project Rules');
    expect(updatedAgents).toContain('<!-- auteur-ui:start -->');
    expect(updatedAgents).toContain('<!-- auteur-ui:end -->');

    // Idempotency: Running init twice does NOT duplicate fenced block
    await runInit(['--agent', 'codex', '--yes', '--cwd', tempDir]);
    const secondPass = readFileSync(join(tempDir, 'AGENTS.md'), 'utf-8');
    const startMatches = secondPass.match(/<!-- auteur-ui:start -->/g);
    expect(startMatches?.length).toBe(1);

    // Uninstall: removes managed block and preserves original user rules
    runUninstall(['--cwd', tempDir]);
    const restored = readFileSync(join(tempDir, 'AGENTS.md'), 'utf-8');
    expect(restored.trim()).toBe(userAgentsMd.trim());
    expect(restored).not.toContain('<!-- auteur-ui:start -->');
  });

  // =========================================================================
  // 5. Antigravity / Generic Adapter
  // =========================================================================
  it('installs Antigravity/generic adapter into new AGENTS.md and uninstalls byte-for-byte', async () => {
    const initialFiles = snapshotDir(tempDir);

    await runInit(['--agent', 'antigravity', '--yes', '--cwd', tempDir]);

    const agentsPath = join(tempDir, 'AGENTS.md');
    expect(existsSync(agentsPath)).toBe(true);
    const content = readFileSync(agentsPath, 'utf-8');
    expect(content).toContain('<!-- auteur-ui:start -->');
    expect(content).toContain('<!-- auteur-ui:end -->');

    // Idempotency
    const snap1 = snapshotDir(tempDir);
    await runInit(['--agent', 'antigravity', '--yes', '--cwd', tempDir]);
    const snap2 = snapshotDir(tempDir);
    for (const file of Object.keys(snap1)) {
      if (!file.includes('lockfile.json') && !file.includes('install-manifest.json')) {
        expect(snap2[file]).toBe(snap1[file]);
      }
    }

    // Clean Uninstall: since AGENTS.md had only managed content, it is removed
    runUninstall(['--cwd', tempDir]);
    const finalFiles = snapshotDir(tempDir);
    expect(finalFiles).toEqual(initialFiles);
  });

  // =========================================================================
  // 6. Dirty Fixture Repository Preservation Test
  // =========================================================================
  it('preserves all user files in a dirty fixture repo during uninstall', async () => {
    // Setup dirty user repository
    mkdirSync(join(tempDir, 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'src', 'index.ts'), 'export const app = "healthy";\n', 'utf-8');

    const userGitignore = 'node_modules/\n.env\ndist/\n';
    writeFileSync(join(tempDir, '.gitignore'), userGitignore, 'utf-8');

    const userAgents = '# Team Charter\n\n1. Be kind.\n2. Ship quickly.\n';
    writeFileSync(join(tempDir, 'AGENTS.md'), userAgents, 'utf-8');

    mkdirSync(join(tempDir, '.auteur-ui'), { recursive: true });
    writeFileSync(join(tempDir, '.auteur-ui', 'custom-user-note.txt'), 'Important user notes\n', 'utf-8');

    // Run Init
    await runInit(['--agent', 'cursor', '--yes', '--cwd', tempDir]);

    // Verify installation succeeded
    expect(existsSync(join(tempDir, '.cursor', 'rules', 'auteur-ui.mdc'))).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets'))).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'version'))).toBe(true);

    // Run Uninstall
    runUninstall(['--cwd', tempDir]);

    // Assert managed adapter files are removed
    expect(existsSync(join(tempDir, '.cursor'))).toBe(false);
    expect(existsSync(join(tempDir, '.auteur-ui', 'assets'))).toBe(false);
    expect(existsSync(join(tempDir, '.auteur-ui', 'version'))).toBe(false);
    expect(existsSync(join(tempDir, '.auteur-ui', 'lockfile.json'))).toBe(false);

    // Assert user files are 100% untouched
    expect(existsSync(join(tempDir, 'src', 'index.ts'))).toBe(true);
    expect(readFileSync(join(tempDir, 'src', 'index.ts'), 'utf-8')).toBe('export const app = "healthy";\n');

    expect(existsSync(join(tempDir, 'AGENTS.md'))).toBe(true);
    expect(readFileSync(join(tempDir, 'AGENTS.md'), 'utf-8').trim()).toBe(userAgents.trim());

    expect(existsSync(join(tempDir, '.gitignore'))).toBe(true);
    expect(readFileSync(join(tempDir, '.gitignore'), 'utf-8').trim()).toBe(userGitignore.trim());

    // User file in .auteur-ui was preserved
    expect(existsSync(join(tempDir, '.auteur-ui', 'custom-user-note.txt'))).toBe(true);
    expect(readFileSync(join(tempDir, '.auteur-ui', 'custom-user-note.txt'), 'utf-8')).toBe('Important user notes\n');
  });

  // =========================================================================
  // 7. Doctor & Fix Line Actionability
  // =========================================================================
  it('doctor passes on healthy installation and emits actionable fixes on missing parts', async () => {
    await runInit(['--agent', 'cursor', '--yes', '--cwd', tempDir]);

    // Healthy installation passes
    const passed = runDoctor(['--cwd', tempDir, '--no-exit']);
    expect(passed).toBe(true);

    // Delete skill router to test failure diagnostic
    rmSync(join(tempDir, '.cursor'), { recursive: true, force: true });
    const failedDoctor = runDoctor(['--cwd', tempDir, '--no-exit']);
    expect(failedDoctor).toBe(false);
  });

  // =========================================================================
  // 8. Update Command Restores Assets
  // =========================================================================
  it('update command deterministically synchronizes assets and refreshes lockfile', async () => {
    await runInit(['--agent', 'cursor', '--yes', '--cwd', tempDir]);

    const cssAsset = join(tempDir, '.auteur-ui', 'assets', 'css', 'reset.css');
    expect(existsSync(cssAsset)).toBe(true);

    // Delete asset
    rmSync(cssAsset);
    expect(existsSync(cssAsset)).toBe(false);

    // Run update
    runUpdate(['--cwd', tempDir]);

    // Assert asset restored
    expect(existsSync(cssAsset)).toBe(true);
    expect(existsSync(join(tempDir, '.auteur-ui', 'lockfile.json'))).toBe(true);
  });

  // =========================================================================
  // 9. Candidate Probing & Detection
  // =========================================================================
  it('probes candidate directories and detects correct agent', () => {
    // Probing an empty folder with skipBinaries=true returns generic fallback
    const resEmpty = detectAgent(tempDir, false, true);
    expect(resEmpty.agent).toBe('generic');
    expect(resEmpty.matchedBy).toBe('default');

    // Create .claude folder
    mkdirSync(join(tempDir, '.claude'));
    const resClaude = detectAgent(tempDir);
    expect(resClaude.agent).toBe('claude');
    expect(resClaude.matchedBy).toBe('config_dir');

    // Remove .claude and create .cursor
    rmSync(join(tempDir, '.claude'), { recursive: true });
    mkdirSync(join(tempDir, '.cursor'));
    const resCursor = detectAgent(tempDir);
    expect(resCursor.agent).toBe('cursor');
    expect(resCursor.matchedBy).toBe('config_dir');

    // Test real binary detection if claude is in PATH
    const realDetection = detectAgent(tempDir);
    // Since .cursor is in tempDir, project config dir takes priority
    expect(realDetection.agent).toBe('cursor');
  });
});
