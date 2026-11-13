import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { exec } from 'node:child_process';
import { encode } from 'gpt-tokenizer';
import { renderDirections } from '../preview/render.js';
import { generateContactSheet } from '../preview/contact-sheet.js';
import { TaskBrief, Direction } from '../preview/types.js';
import { appendTrace } from './trace.js';

function parseTaskInput(taskInput?: string): TaskBrief {
  if (!taskInput) {
    // Check if brief.json exists
    const briefPath = resolve(process.cwd(), '.auteur-ui/brief.json');
    if (existsSync(briefPath)) {
      try {
        const raw = readFileSync(briefPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          id: parsed.id || 'task',
          type: parsed.type || 'dashboard',
          prompt: parsed.prompt || 'Custom prompt',
          title: parsed.title || parsed.type || 'Custom task',
        };
      } catch {
        // Fall back
      }
    }
    return { type: 'dashboard', title: 'Dashboard', prompt: 'Build analytics dashboard' };
  }

  const fullPath = resolve(process.cwd(), taskInput);
  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath, 'utf-8');
      if (fullPath.endsWith('.json')) {
        return JSON.parse(content);
      }
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

export async function runPreview(args: string[]): Promise<void> {
  let directionsPath = '.auteur-ui/directions.json';
  let outPath = '.auteur-ui/preview.html';
  let taskInput: string | undefined;
  let contactSheet = false;
  let contactSheetPath = '.auteur-ui/contact-sheet.png';
  let open = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--directions') {
      directionsPath = args[++i];
    } else if (arg === '--task') {
      taskInput = args[++i];
    } else if (arg === '--out') {
      outPath = args[++i];
    } else if (arg === '--open') {
      open = true;
    } else if (arg === '--contact-sheet') {
      contactSheet = true;
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        contactSheetPath = args[++i];
      }
    }
  }

  const fullDirectionsPath = resolve(process.cwd(), directionsPath);
  if (!existsSync(fullDirectionsPath)) {
    console.error(`Error: Directions file not found at: ${fullDirectionsPath}`);
    console.error('Create a directions file or pass --directions <path>');
    process.exit(1);
  }

  let directions: Direction[];
  let raw: string;
  try {
    raw = readFileSync(fullDirectionsPath, 'utf-8');
    directions = JSON.parse(raw);
    if (!Array.isArray(directions) || directions.length === 0) {
      throw new Error('Directions must be a non-empty array of Direction objects.');
    }
  } catch (err: any) {
    console.error(`Error reading directions JSON: ${err.message}`);
    process.exit(1);
  }

  const taskBrief = parseTaskInput(taskInput);
  const html = renderDirections(directions, taskBrief);

  const fullOut = resolve(process.cwd(), outPath);
  const outDir = dirname(fullOut);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(fullOut, html, 'utf-8');
  const tokens = encode(raw).length;

  appendTrace({
    phase: 'preview',
    args,
    tokens_estimate: tokens,
    result: 'ok',
  });

  console.log(`✓ Wrote preview HTML: ${outPath} (${directions.length} directions)`);

  if (contactSheet) {
    const fullContactSheetPath = resolve(process.cwd(), contactSheetPath);
    console.log(`Capturing 1200px contact sheet via Playwright...`);
    await generateContactSheet(html, fullContactSheetPath, { width: 1200 });
    console.log(`✓ Saved 1200px contact sheet: ${fullContactSheetPath}`);
  }

  if (open) {
    console.log(`Opening preview in default browser...`);
    const platform = process.platform;
    const cmd =
      platform === 'darwin'
        ? `open "${fullOut}"`
        : platform === 'win32'
        ? `start "" "${fullOut}"`
        : `xdg-open "${fullOut}"`;
    exec(cmd, (err) => {
      if (err) {
        console.warn(`Could not open browser automatically: ${err.message}`);
      }
    });
  }
}

