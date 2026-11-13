#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNS_DIR = path.resolve(__dirname, 'runs');
const REPORT_MD_PATH = path.resolve(__dirname, 'report.md');
const GALLERY_HTML_PATH = path.resolve(__dirname, 'gallery.html');
const BLIND_KEY_PATH = path.resolve(__dirname, 'blind-key.json');

export function loadAllRuns() {
  if (!fs.existsSync(RUNS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(RUNS_DIR, { withFileTypes: true });
  const runs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const runDir = path.join(RUNS_DIR, entry.name);
    const metaPath = path.join(runDir, 'meta.json');

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        meta.dir = runDir;
        meta.relativeDir = `runs/${entry.name}`;
        runs.push(meta);
      } catch (err) {
        console.warn(`Could not parse meta.json in ${entry.name}: ${err.message}`);
      }
    }
  }

  // Sort by task, arm, seed
  runs.sort((a, b) => {
    if (a.taskId !== b.taskId) return a.taskId.localeCompare(b.taskId);
    if (a.arm !== b.arm) return a.arm.localeCompare(b.arm);
    return a.seed - b.seed;
  });

  return runs;
}

export function generateMarkdownReport(runs) {
  let md = '# Evaluation Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  if (runs.length === 0) {
    md += 'No runs found in `evals/runs/`.\n';
    return md;
  }

  // Aggregate stats
  const totalRuns = runs.length;
  const totalTokens = runs.reduce((acc, r) => acc + (r.tokens?.total || 0), 0);
  const totalCost = runs.reduce((acc, r) => acc + (r.costUsd || 0), 0);
  const totalWallTime = runs.reduce((acc, r) => acc + (r.wallTimeMs || 0), 0);
  const avgWallTime = (totalWallTime / totalRuns / 1000).toFixed(2);
  const avgTokens = Math.round(totalTokens / totalRuns);

  md += '## Summary Metrics\n\n';
  md += `| Metric | Value |\n`;
  md += `|---|---|\n`;
  md += `| Total Runs | ${totalRuns} |\n`;
  md += `| Avg Wall Time | ${avgWallTime}s |\n`;
  md += `| Avg Tokens / Run | ${avgTokens} |\n`;
  md += `| Total Cost | $${totalCost.toFixed(4)} |\n\n`;

  // Group by arm
  const arms = [...new Set(runs.map((r) => r.arm))];
  if (arms.length > 1) {
    md += '### Metrics by Arm\n\n';
    md += '| Arm | Runs | Avg Time (s) | Avg Input | Avg Output | Avg Total Tokens | Avg Lint Score | Pass Rate | Total Cost ($) |\n';
    md += '|---|---|---|---|---|---|---|---|---|\n';

    for (const arm of arms) {
      const armRuns = runs.filter((r) => r.arm === arm);
      const armAvgTime = (
        armRuns.reduce((acc, r) => acc + (r.wallTimeMs || 0), 0) /
        armRuns.length /
        1000
      ).toFixed(2);
      const armAvgIn = Math.round(
        armRuns.reduce((acc, r) => acc + (r.tokens?.input || 0), 0) / armRuns.length
      );
      const armAvgOut = Math.round(
        armRuns.reduce((acc, r) => acc + (r.tokens?.output || 0), 0) / armRuns.length
      );
      const armAvgTot = Math.round(
        armRuns.reduce((acc, r) => acc + (r.tokens?.total || 0), 0) / armRuns.length
      );
      const armRunsWithLint = armRuns.filter((r) => r.lint?.score !== undefined);
      const avgLint = armRunsWithLint.length > 0
        ? Math.round(armRunsWithLint.reduce((acc, r) => acc + r.lint.score, 0) / armRunsWithLint.length)
        : '-';
      const passCount = armRunsWithLint.filter((r) => r.lint?.pass === true).length;
      const passRate = armRunsWithLint.length > 0
        ? `${Math.round((passCount / armRunsWithLint.length) * 100)}%`
        : '-';
      const armCost = armRuns
        .reduce((acc, r) => acc + (r.costUsd || 0), 0)
        .toFixed(4);

      md += `| **${arm}** | ${armRuns.length} | ${armAvgTime} | ${armAvgIn} | ${armAvgOut} | ${armAvgTot} | ${avgLint} | ${passRate} | $${armCost} |\n`;
    }
    md += '\n';
  }

  // Detailed Table
  md += '## Individual Runs\n\n';
  md += '| Run ID | Arm | Task | Seed | Wall Time (s) | In Tokens | Out Tokens | Cache Read | Total Tokens | Lint Score | Pass | Cost ($) | Exit |\n';
  md += '|---|---|---|---|---|---|---|---|---|---|---|---|---|\n';

  for (const r of runs) {
    const timeSec = ((r.wallTimeMs || 0) / 1000).toFixed(2);
    const inTokens = r.tokens?.input || 0;
    const outTokens = r.tokens?.output || 0;
    const cacheRead = r.tokens?.cacheRead || 0;
    const totTokens = r.tokens?.total || 0;
    const lintScore = r.lint?.score !== undefined ? `${r.lint.score}/100` : '-';
    const lintPass = r.lint?.pass !== undefined ? (r.lint.pass ? '✓ PASS' : '✗ FAIL') : '-';
    const cost = (r.costUsd || 0).toFixed(4);
    const exit = r.exitCode ?? 0;

    md += `| \`${r.id}\` | ${r.arm} | ${r.taskId} | ${r.seed} | ${timeSec}s | ${inTokens} | ${outTokens} | ${cacheRead} | ${totTokens} | ${lintScore} | ${lintPass} | $${cost} | ${exit} |\n`;
  }

  md += '\n---\n*Human Grading Gallery generated at [gallery.html](gallery.html) with blind randomized pairs.*\n';

  return md;
}

export function generateBlindGallery(runs) {
  // Group runs by taskId and seed
  const groupMap = new Map();
  for (const r of runs) {
    const key = `${r.taskId}-s${r.seed}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(r);
  }

  const blindKeyData = {
    generatedAt: new Date().toISOString(),
    comparisons: [],
  };

  const comparisonsHtml = [];
  let comparisonIndex = 1;

  for (const [groupKey, groupRuns] of groupMap.entries()) {
    // Determine whether this is a 2-arm pairwise matchup or single/multi-item specimen set
    const hasBaseline = groupRuns.find((r) => r.arm === 'baseline');
    const hasAuteur = groupRuns.find((r) => r.arm === 'auteur-ui');

    let itemA, itemB;
    if (hasBaseline && hasAuteur) {
      // Randomize whether baseline is A or B
      const baselineIsA = Math.random() < 0.5;
      itemA = baselineIsA ? hasBaseline : hasAuteur;
      itemB = baselineIsA ? hasAuteur : hasBaseline;
    } else if (groupRuns.length >= 2) {
      itemA = groupRuns[0];
      itemB = groupRuns[1];
    } else {
      // Single run in group
      itemA = groupRuns[0];
      itemB = null;
    }

    const blindIdA = `COMP-${comparisonIndex}-A`;
    const blindIdB = itemB ? `COMP-${comparisonIndex}-B` : null;

    blindKeyData.comparisons.push({
      comparisonId: `COMP-${comparisonIndex}`,
      group: groupKey,
      taskId: itemA.taskId,
      seed: itemA.seed,
      optionA: {
        blindId: blindIdA,
        trueRunId: itemA.id,
        trueArm: itemA.arm,
      },
      optionB: itemB
        ? {
            blindId: blindIdB,
            trueRunId: itemB.id,
            trueArm: itemB.arm,
          }
        : null,
    });

    comparisonsHtml.push(`
      <div class="comparison-card" id="comp-${comparisonIndex}">
        <div class="comp-header">
          <div class="comp-title">Comparison #${comparisonIndex}: Task &ldquo;${itemA.taskId}&rdquo; (Iteration ${itemA.seed})</div>
          <div class="comp-badge">Blind Evaluation</div>
        </div>

        <div class="matchup-container">
          <!-- Option A -->
          <div class="candidate-panel">
            <div class="candidate-header">
              <span class="candidate-tag">Option A</span>
              <span class="candidate-meta">${blindIdA}</span>
            </div>
            <div class="screenshot-display">
              <img src="${itemA.relativeDir}/screenshot-1440x900-above.png"
                   class="screenshot-img"
                   data-desktop-above="${itemA.relativeDir}/screenshot-1440x900-above.png"
                   data-desktop-full="${itemA.relativeDir}/screenshot-1440x900-full.png"
                   data-mobile-above="${itemA.relativeDir}/screenshot-390x844-above.png"
                   data-mobile-full="${itemA.relativeDir}/screenshot-390x844-full.png"
                   alt="Option A Screenshot" />
            </div>
            <div class="candidate-footer">
              <div class="score-buttons">
                <button class="vote-btn" onclick="recordVote('${comparisonIndex}', 'A')">Vote Option A</button>
              </div>
            </div>
          </div>

          ${
            itemB
              ? `
          <!-- Option B -->
          <div class="candidate-panel">
            <div class="candidate-header">
              <span class="candidate-tag">Option B</span>
              <span class="candidate-meta">${blindIdB}</span>
            </div>
            <div class="screenshot-display">
              <img src="${itemB.relativeDir}/screenshot-1440x900-above.png"
                   class="screenshot-img"
                   data-desktop-above="${itemB.relativeDir}/screenshot-1440x900-above.png"
                   data-desktop-full="${itemB.relativeDir}/screenshot-1440x900-full.png"
                   data-mobile-above="${itemB.relativeDir}/screenshot-390x844-above.png"
                   data-mobile-full="${itemB.relativeDir}/screenshot-390x844-full.png"
                   alt="Option B Screenshot" />
            </div>
            <div class="candidate-footer">
              <div class="score-buttons">
                <button class="vote-btn" onclick="recordVote('${comparisonIndex}', 'B')">Vote Option B</button>
              </div>
            </div>
          </div>
          `
              : `
          <div class="candidate-panel solitary">
            <div class="candidate-header">
              <span class="candidate-tag">Benchmark Specimen</span>
            </div>
            <div style="padding: 40px; text-align: center; color: #71717a;">
              Single-arm baseline benchmark run. Run with another arm to unlock live A/B pairwise grading.
            </div>
          </div>
          `
          }
        </div>
      </div>
    `);

    comparisonIndex++;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>auteur-ui &middot; Blind Human Evaluation Gallery</title>
  <style>
    :root {
      --bg: #09090b;
      --surface: #121215;
      --surface-elevated: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #6366f1;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: "ui-monospace", "SFMono-Regular", "Menlo", monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding-bottom: 80px;
    }

    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(9, 9, 11, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .brand h1 {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .blind-banner {
      font-family: var(--font-mono);
      font-size: 11px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .toolbar-controls {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .control-label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .btn-group {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .btn-group button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-group button.active {
      background: var(--surface-elevated);
      color: var(--text);
    }

    .container {
      max-width: 1440px;
      margin: 32px auto;
      padding: 0 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .comparison-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .comp-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .comp-title {
      font-size: 14px;
      font-weight: 600;
    }

    .comp-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .matchup-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      divide-x: 1px solid var(--border);
    }

    .candidate-panel {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .candidate-panel:first-child {
      border-right: 1px solid var(--border);
    }

    .candidate-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .candidate-tag {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
    }

    .candidate-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }

    .screenshot-display {
      background: #000;
      border: 1px solid var(--border);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 480px;
      max-height: 720px;
      overflow-y: auto;
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
      transition: all 0.2s ease;
    }

    .screenshot-img.mobile-view {
      max-width: 390px;
      margin: 0 auto;
    }

    .candidate-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .vote-btn {
      background: var(--surface-elevated);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .vote-btn:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .vote-btn.selected {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    @media (max-width: 960px) {
      .matchup-container {
        grid-template-columns: 1fr;
      }
      .candidate-panel:first-child {
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
    }
  </style>
</head>
<body>
  <div class="top-toolbar">
    <div class="brand">
      <h1>auteur-ui &middot; Blind Human Grading</h1>
      <span class="blind-banner">BLIND LABELS ACTIVE</span>
    </div>

    <div class="toolbar-controls">
      <span class="control-label">Viewport:</span>
      <div class="btn-group" id="viewport-toggle">
        <button class="active" onclick="switchViewport('desktop')">Desktop (1440px)</button>
        <button onclick="switchViewport('mobile')">Mobile (390px)</button>
      </div>

      <span class="control-label">Region:</span>
      <div class="btn-group" id="fold-toggle">
        <button class="active" onclick="switchFold('above')">Above Fold</button>
        <button onclick="switchFold('full')">Full Page</button>
      </div>
    </div>
  </div>

  <div class="container">
    ${comparisonsHtml.join('\n')}
  </div>

  <script>
    let currentViewport = 'desktop';
    let currentFold = 'above';
    const votes = {};

    function updateScreenshots() {
      const imgs = document.querySelectorAll('.screenshot-img');
      const key = currentViewport + '-' + currentFold;
      imgs.forEach((img) => {
        let src;
        if (key === 'desktop-above') src = img.dataset.desktopAbove;
        else if (key === 'desktop-full') src = img.dataset.desktopFull;
        else if (key === 'mobile-above') src = img.dataset.mobileAbove;
        else if (key === 'mobile-full') src = img.dataset.mobileFull;

        if (src) img.src = src;
        if (currentViewport === 'mobile') {
          img.classList.add('mobile-view');
        } else {
          img.classList.remove('mobile-view');
        }
      });
    }

    function switchViewport(vp) {
      currentViewport = vp;
      document.querySelectorAll('#viewport-toggle button').forEach((b, i) => {
        b.classList.toggle('active', (vp === 'desktop' && i === 0) || (vp === 'mobile' && i === 1));
      });
      updateScreenshots();
    }

    function switchFold(fold) {
      currentFold = fold;
      document.querySelectorAll('#fold-toggle button').forEach((b, i) => {
        b.classList.toggle('active', (fold === 'above' && i === 0) || (fold === 'full' && i === 1));
      });
      updateScreenshots();
    }

    function recordVote(compId, choice) {
      votes[compId] = choice;
      const card = document.getElementById('comp-' + compId);
      if (card) {
        card.querySelectorAll('.vote-btn').forEach((btn) => {
          const isThisChoice = btn.innerText.includes('Option ' + choice);
          btn.classList.toggle('selected', isThisChoice);
        });
      }
      console.log('Recorded vote for comp', compId, choice, votes);
    }
  </script>
</body>
</html>`;

  return { html, blindKeyData };
}

export function runReport() {
  console.log('Generating evaluation reports from evals/runs/ ...');
  const runs = loadAllRuns();
  console.log(`Loaded ${runs.length} run(s).`);

  const markdown = generateMarkdownReport(runs);
  fs.writeFileSync(REPORT_MD_PATH, markdown, 'utf-8');
  console.log(`Wrote markdown report to: ${REPORT_MD_PATH}`);

  const { html, blindKeyData } = generateBlindGallery(runs);
  fs.writeFileSync(GALLERY_HTML_PATH, html, 'utf-8');
  console.log(`Wrote blind gallery HTML to: ${GALLERY_HTML_PATH}`);

  fs.writeFileSync(BLIND_KEY_PATH, JSON.stringify(blindKeyData, null, 2), 'utf-8');
  console.log(`Wrote private blind grading key to: ${BLIND_KEY_PATH}`);
}

// Only invoke when called directly via CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runReport();
}
