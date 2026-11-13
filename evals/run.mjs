#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const TASKS_DIR = path.resolve(__dirname, 'tasks');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');
const RUNS_DIR = path.resolve(__dirname, 'runs');

// ---------------------------------------------------------------------------
// Minimal zero-dependency YAML parser for task files
// ---------------------------------------------------------------------------
export function parseTaskYaml(content) {
  const lines = content.split('\n');
  const result = {
    id: '',
    prompt: '',
    stack: '',
    viewport: { width: 1440, height: 900 },
    success_criteria: [],
    forbidden_patterns: [],
  };

  let currentKey = null;

  for (let rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) continue;

    const listMatch = line.match(/^\s*-\s+"?(.*?)"?\s*$/);
    if (listMatch && currentKey && Array.isArray(result[currentKey])) {
      result[currentKey].push(listMatch[1].replace(/^["']|["']$/g, ''));
      continue;
    }

    const keyValMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (keyValMatch) {
      const key = keyValMatch[1];
      const val = keyValMatch[2].trim().replace(/^["']|["']$/g, '');

      if (key === 'viewport') {
        currentKey = 'viewport';
        continue;
      }

      if (key === 'success_criteria' || key === 'forbidden_patterns') {
        currentKey = key;
        result[key] = [];
        continue;
      }

      currentKey = key;
      result[key] = val;
      continue;
    }

    const subKeyMatch = line.match(/^\s+([a-zA-Z0-9_]+):\s*(\d+)/);
    if (subKeyMatch && currentKey === 'viewport') {
      result.viewport[subKeyMatch[1]] = parseInt(subKeyMatch[2], 10);
    }
  }

  return result;
}

export function loadTasks(taskId = 'all') {
  if (!fs.existsSync(TASKS_DIR)) {
    throw new Error(`Tasks directory not found at ${TASKS_DIR}`);
  }

  const files = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  const tasks = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8');
    const task = parseTaskYaml(content);
    if (taskId === 'all' || task.id === taskId) {
      tasks.push(task);
    }
  }

  if (taskId !== 'all' && tasks.length === 0) {
    throw new Error(`Task with id "${taskId}" not found in ${TASKS_DIR}`);
  }

  return tasks;
}

// ---------------------------------------------------------------------------
// Agent Adapters
// ---------------------------------------------------------------------------
class ClaudeAdapter {
  constructor(binary = 'claude') {
    this.binary = binary;
    this.name = 'claude';
  }

  async run({ prompt, workingDir }) {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const args = ['-p', '--output-format', 'json', prompt];
      const child = spawn(this.binary, args, {
        cwd: workingDir,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));

      child.on('close', (exitCode) => {
        const wallTimeMs = Date.now() - startTime;
        let tokens = { input: 0, output: 0, cacheRead: 0, cacheCreation: 0, total: 0 };
        let costUsd = 0;

        try {
          const json = JSON.parse(stdout);
          if (json.usage) {
            tokens.input = json.usage.input_tokens || 0;
            tokens.output = json.usage.output_tokens || 0;
            tokens.cacheRead = json.usage.cache_read_input_tokens || 0;
            tokens.cacheCreation = json.usage.cache_creation_input_tokens || 0;
            tokens.total = tokens.input + tokens.output + tokens.cacheRead + tokens.cacheCreation;
          }
          if (typeof json.total_cost_usd === 'number') {
            costUsd = json.total_cost_usd;
          }
        } catch {
          // stdout might not be JSON if process errored
        }

        resolve({
          wallTimeMs,
          exitCode: exitCode ?? 0,
          tokens,
          costUsd,
          stdout,
          stderr,
        });
      });
    });
  }
}

class OpenCodeAdapter {
  constructor(binary = 'opencode') {
    this.binary = binary;
    this.name = 'opencode';
  }

  async run({ prompt, workingDir }) {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const args = ['run', prompt];
      const child = spawn(this.binary, args, {
        cwd: workingDir,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));

      child.on('close', (exitCode) => {
        const wallTimeMs = Date.now() - startTime;
        resolve({
          wallTimeMs,
          exitCode: exitCode ?? 0,
          tokens: { input: 0, output: 0, cacheRead: 0, cacheCreation: 0, total: 0 },
          costUsd: 0,
          stdout,
          stderr,
        });
      });
    });
  }
}

class DryRunAdapter {
  constructor() {
    this.name = 'mock-dry-run';
  }

  async run({ arm, task, seed, workingDir }) {
    const startTime = Date.now();
    // Deterministic synthetic metrics based on task id, arm, and seed
    const seedNum = parseInt(seed, 10) || 1;
    const taskHash = task.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const inputTokens = 2200 + ((taskHash * seedNum * 17) % 1800);
    const outputTokens = 900 + ((taskHash * seedNum * 31) % 1100);
    const cacheReadTokens = arm === 'auteur-ui' ? 650 : 0;
    const cacheCreationTokens = 0;
    const totalTokens = inputTokens + outputTokens + cacheReadTokens;
    const costUsd = Number(((inputTokens * 0.000003) + (outputTokens * 0.000015)).toFixed(4));
    const wallTimeMs = 1500 + ((taskHash * seedNum) % 1200);

    // Pick appropriate fixture to copy as index.html
    let fixtureName = 'slop-1.html';
    if (arm === 'auteur-ui') {
      const goodFixtures = ['good-1.html', 'good-2.html', 'good-3.html'];
      const index = (taskHash + seedNum) % goodFixtures.length;
      fixtureName = goodFixtures[index];
    } else {
      const slopFixtures = ['slop-1.html', 'slop-2.html', 'slop-3.html'];
      const index = (taskHash + seedNum) % slopFixtures.length;
      fixtureName = slopFixtures[index];
    }

    const fixturePath = path.join(FIXTURES_DIR, fixtureName);
    const htmlContent = fs.existsSync(fixturePath)
      ? fs.readFileSync(fixturePath, 'utf-8')
      : `<!DOCTYPE html><html><body><h1>Dry run: ${task.id}</h1></body></html>`;

    fs.writeFileSync(path.join(workingDir, 'index.html'), htmlContent, 'utf-8');

    const stdout = `[dry-run] Initializing agent for task "${task.id}" (arm: ${arm}, seed: ${seed})\n` +
      `[dry-run] Emitted static bundle using template: ${fixtureName}\n` +
      `[dry-run] Completed in ${wallTimeMs}ms with ${totalTokens} tokens ($${costUsd})\n`;
    const stderr = '';

    return {
      wallTimeMs,
      exitCode: 0,
      tokens: {
        input: inputTokens,
        output: outputTokens,
        cacheRead: cacheReadTokens,
        cacheCreation: cacheCreationTokens,
        total: totalTokens,
      },
      costUsd,
      stdout,
      stderr,
    };
  }
}

export function detectAgent(preferredAgent) {
  if (preferredAgent) {
    if (preferredAgent.includes('claude')) return new ClaudeAdapter(preferredAgent);
    if (preferredAgent.includes('opencode')) return new OpenCodeAdapter(preferredAgent);
    return new ClaudeAdapter(preferredAgent);
  }

  try {
    execSync('which claude', { stdio: 'ignore' });
    return new ClaudeAdapter('claude');
  } catch {}

  try {
    execSync('which opencode', { stdio: 'ignore' });
    return new OpenCodeAdapter('opencode');
  } catch {}

  return null;
}

// ---------------------------------------------------------------------------
// Playwright Screenshotting
// ---------------------------------------------------------------------------
export async function captureScreenshots(browser, htmlPath, targetDir) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const fileUrl = `file://${path.resolve(htmlPath)}`;

  // 1. Desktop: 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(targetDir, 'screenshot-1440x900-above.png'),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(targetDir, 'screenshot-1440x900-full.png'),
    fullPage: true,
  });

  // 2. Mobile: 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(targetDir, 'screenshot-390x844-above.png'),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(targetDir, 'screenshot-390x844-full.png'),
    fullPage: true,
  });

  await page.close();
  await context.close();
}

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------
function parseArgs(args) {
  const options = {
    arm: 'baseline',
    task: 'all',
    seeds: 1,
    dryRun: false,
    clean: false,
    agent: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--arm' && args[i + 1]) {
      options.arm = args[++i];
    } else if (arg === '--task' && args[i + 1]) {
      options.task = args[++i];
    } else if (arg === '--seeds' && args[i + 1]) {
      options.seeds = parseInt(args[++i], 10);
    } else if (arg === '--agent' && args[i + 1]) {
      options.agent = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--clean') {
      options.clean = true;
    }
  }

  return options;
}

// ---------------------------------------------------------------------------
// Main Runner Routine
// ---------------------------------------------------------------------------
export async function runHarness() {
  const options = parseArgs(process.argv.slice(2));
  console.log(`\n======================================================`);
  console.log(`auteur-ui evaluation harness`);
  console.log(`Arm:     ${options.arm}`);
  console.log(`Task:    ${options.task}`);
  console.log(`Seeds:   ${options.seeds}`);
  console.log(`Dry-run: ${options.dryRun}`);
  console.log(`======================================================\n`);

  const tasks = loadTasks(options.task);
  console.log(`Loaded ${tasks.length} task(s): ${tasks.map((t) => t.id).join(', ')}`);

  let adapter;
  if (options.dryRun) {
    adapter = new DryRunAdapter();
  } else {
    adapter = detectAgent(options.agent);
    if (!adapter) {
      console.error(
        `Error: No coding agent binary (claude or opencode) found in PATH.\n` +
        `Pass --agent <binary> or run with --dry-run for mock evaluation.`
      );
      process.exit(1);
    }
  }

  console.log(`Using adapter: ${adapter.name}\n`);

  if (options.clean && fs.existsSync(RUNS_DIR)) {
    fs.rmSync(RUNS_DIR, { recursive: true, force: true });
  }

  fs.mkdirSync(RUNS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const totalRuns = tasks.length * options.seeds;
  let currentRun = 0;

  try {
    for (const task of tasks) {
      for (let s = 1; s <= options.seeds; s++) {
        currentRun++;
        const runId = `${options.arm}-${task.id}-seed${s}`;
        const runDir = path.join(RUNS_DIR, runId);
        fs.mkdirSync(runDir, { recursive: true });

        // Throwaway temp directory for agent execution
        const tempPrefix = path.join(os.tmpdir(), `auteur-eval-${runId}-`);
        const tempDir = fs.mkdtempSync(tempPrefix);

        console.log(`[${currentRun}/${totalRuns}] Running ${runId}...`);

        let result;
        try {
          if (options.dryRun) {
            result = await adapter.run({
              arm: options.arm,
              task,
              seed: s,
              workingDir: tempDir,
            });
          } else {
            result = await adapter.run({
              prompt: task.prompt,
              task,
              seed: s,
              workingDir: tempDir,
            });
          }

          // Save stdout / stderr
          fs.writeFileSync(path.join(runDir, 'stdout.log'), result.stdout || '');
          fs.writeFileSync(path.join(runDir, 'stderr.log'), result.stderr || '');

          // Copy generated index.html or find output html
          const generatedHtml = path.join(tempDir, 'index.html');
          const destHtml = path.join(runDir, 'index.html');
          if (fs.existsSync(generatedHtml)) {
            fs.copyFileSync(generatedHtml, destHtml);
          } else {
            fs.writeFileSync(
              destHtml,
              `<!DOCTYPE html><html><body><h1>No index.html generated for ${runId}</h1></body></html>`
            );
          }

          // Capture Playwright screenshots
          await captureScreenshots(browser, destHtml, runDir);

          // Save metadata JSON
          const meta = {
            id: runId,
            arm: options.arm,
            taskId: task.id,
            seed: s,
            timestamp: new Date().toISOString(),
            wallTimeMs: result.wallTimeMs,
            exitCode: result.exitCode,
            tokens: result.tokens,
            costUsd: result.costUsd,
            agent: adapter.name,
            dryRun: options.dryRun,
          };

          fs.writeFileSync(
            path.join(runDir, 'meta.json'),
            JSON.stringify(meta, null, 2),
            'utf-8'
          );

          console.log(
            `  ✓ Done: ${result.wallTimeMs}ms, ${result.tokens.total} tokens, screenshots captured.`
          );
        } catch (err) {
          console.error(`  ✗ Run failed: ${err.message}`);
          fs.writeFileSync(path.join(runDir, 'stderr.log'), err.stack || err.message);
        } finally {
          // Clean up throwaway temp dir
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch {}
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nEvaluation complete. Generated run artifacts in: ${RUNS_DIR}\n`);
}

// Only invoke when called directly via CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHarness().catch((err) => {
    console.error('Fatal harness error:', err);
    process.exit(1);
  });
}
