#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { exec } from 'node:child_process';
import { renderDirections } from '../dist/packages/preview/render.js';
import { generateContactSheet } from '../dist/packages/preview/contact-sheet.js';

function printHelp() {
  console.log(`
auteur-ui — taste compiled at build time

Usage:
  npx auteur-ui preview [options]

Options:
  --directions <path>       Path to directions.json (default: .auteur-ui/directions.json)
  --task <path|type>        Task type (music|dashboard|landing|editorial) or task file (default: autodetect)
  --out <path>              Output preview HTML path (default: .auteur-ui/preview.html)
  --contact-sheet [path]    Capture 1200px PNG contact sheet with Playwright (default: .auteur-ui/contact-sheet.png)
  --open                    Open preview HTML in default browser
  -h, --help                Show this help message
`);
}

function parseCliArgs(args) {
  const options = {
    command: 'preview',
    directions: '.auteur-ui/directions.json',
    task: undefined,
    out: '.auteur-ui/preview.html',
    contactSheet: false,
    contactSheetPath: '.auteur-ui/contact-sheet.png',
    open: false,
  };

  let i = 0;
  if (args[0] && !args[0].startsWith('-')) {
    options.command = args[0];
    i = 1;
  }

  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--directions') {
      options.directions = args[++i];
    } else if (arg === '--task') {
      options.task = args[++i];
    } else if (arg === '--out') {
      options.out = args[++i];
    } else if (arg === '--open') {
      options.open = true;
    } else if (arg === '--contact-sheet') {
      options.contactSheet = true;
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.contactSheetPath = args[++i];
      }
    }
  }

  return options;
}

function parseTaskInput(taskInput) {
  if (!taskInput) {
    return { type: 'music', title: 'Music Listening App', prompt: 'Build a music listening app' };
  }

  // Check if it's a file on disk (YAML or JSON)
  const fullPath = resolve(process.cwd(), taskInput);
  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath, 'utf-8');
      if (fullPath.endsWith('.json')) {
        return JSON.parse(content);
      }
      // Simple zero-dependency YAML field extractor
      const idMatch = content.match(/^id:\s*(.+)$/m);
      const promptMatch = content.match(/^prompt:\s*["']?([^"'\n]+)["']?$/m);
      const id = idMatch ? idMatch[1].trim() : 'custom-task';
      const prompt = promptMatch ? promptMatch[1].trim() : id;
      return { id, prompt, type: id };
    } catch {
      // Fall through to treating as type string
    }
  }

  return { type: taskInput, title: taskInput, prompt: `Previewing ${taskInput} task` };
}

async function run() {
  const args = process.argv.slice(2);
  const options = parseCliArgs(args);

  if (options.command !== 'preview') {
    console.error(`Unknown command: "${options.command}". Run --help for available commands.`);
    process.exit(1);
  }

  const directionsPath = resolve(process.cwd(), options.directions);
  if (!existsSync(directionsPath)) {
    console.error(`Error: Directions file not found at: ${directionsPath}`);
    console.error('Create a directions file or pass --directions <path>');
    process.exit(1);
  }

  let directions;
  try {
    const raw = readFileSync(directionsPath, 'utf-8');
    directions = JSON.parse(raw);
    if (!Array.isArray(directions) || directions.length === 0) {
      throw new Error('Directions must be a non-empty array of Direction objects.');
    }
  } catch (err) {
    console.error(`Error reading directions JSON: ${err.message}`);
    process.exit(1);
  }

  const taskBrief = parseTaskInput(options.task);
  const html = renderDirections(directions, taskBrief);

  const outPath = resolve(process.cwd(), options.out);
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(outPath, html, 'utf-8');
  console.log(`✓ Wrote preview HTML: ${outPath} (${directions.length} directions)`);

  if (options.contactSheet) {
    const contactSheetPath = resolve(process.cwd(), options.contactSheetPath);
    console.log(`Capturing 1200px contact sheet via Playwright...`);
    await generateContactSheet(html, contactSheetPath, { width: 1200 });
    console.log(`✓ Saved 1200px contact sheet: ${contactSheetPath}`);
  }

  if (options.open) {
    console.log(`Opening preview in default browser...`);
    const platform = process.platform;
    const cmd = platform === 'darwin' ? `open "${outPath}"`
              : platform === 'win32' ? `start "" "${outPath}"`
              : `xdg-open "${outPath}"`;
    exec(cmd, (err) => {
      if (err) {
        console.warn(`Could not open browser automatically: ${err.message}`);
      }
    });
  }
}

run().catch((err) => {
  console.error('Fatal preview error:', err);
  process.exit(1);
});
