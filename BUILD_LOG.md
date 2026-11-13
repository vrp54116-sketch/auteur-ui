# BUILD_LOG.md

## Phase 1: Evaluation Harness

### Date
2026-11-13

### What shipped
1. **`evals/tasks/*.yml`** — 5 fixed benchmark tasks with plain prompts, stack specifications, target viewports, success criteria, and forbidden anti-patterns:
   - `evals/tasks/spotify-listening.yml` (Prompt: *"Build a music listening app like Spotify."*)
   - `evals/tasks/analytics-dashboard.yml` (Prompt: *"Build an analytics dashboard for a dev tool."*)
   - `evals/tasks/oss-landing.yml` (Prompt: *"Build a landing page for an open-source library."*)
   - `evals/tasks/editorial-journal.yml` (Prompt: *"Build a photo journal and editorial reading app."*)
   - `evals/tasks/settings-billing.yml` (Prompt: *"Build a settings and billing page for a SaaS."*)
2. **`evals/run.mjs`** — Pluggable evaluation CLI runner:
   - CLI flags: `--arm baseline|auteur-ui`, `--task all|<id>`, `--seeds <n>`, `--agent <bin>`, `--dry-run`, `--clean`.
   - Pluggable agent adapters (`ClaudeAdapter` for `claude -p --output-format json`, `OpenCodeAdapter` for `opencode run`, and `DryRunAdapter`).
   - Zero-dependency task YAML parser.
   - Throwaway temporary execution directory per run.
   - Metrics captured in `meta.json`: wall time, token counts (input, output, cache read, cache creation, total), cost, exit code, and stdout/stderr logs.
   - Automated Playwright screenshot capture at desktop (1440×900) and mobile (390×844) viewports, capturing both above-fold and full-page PNGs.
3. **`evals/fixtures/`** — 6 self-contained HTML specimens for future linter tests and dry evaluation:
   - Deliberate slop: `slop-1.html` (centered purple SaaS hero, 3 equal cards, 8px radius, emojis), `slop-2.html` (slop music streaming), `slop-3.html` (slop dev metrics).
   - Genuinely good: `good-1.html` (asymmetric editorial grid with serif/mono typography), `good-2.html` (dense dark Spotify audio player with tabular nums), `good-3.html` (high-density dev tool telemetry dashboard).
4. **`evals/report.mjs`** — Report generator:
   - Emits `evals/report.md` summarizing aggregate metrics and detailed per-run telemetry.
   - Emits `evals/gallery.html` featuring interactive viewport toggles (1440px vs 390px) and fold toggles (above-fold vs full-page) for blind human grading.
   - Emits secret `evals/blind-key.json` mapping blind "Option A" / "Option B" identifiers back to true arms without exposing identities in the gallery.
5. **`package.json`** — Added `"eval:dry"` command: `node evals/run.mjs --clean --arm baseline --task all --seeds 3 --dry-run && node evals/report.mjs`.

### Acceptance Command Run
```bash
pnpm eval:dry
```

### Actual Output
```
$ node evals/run.mjs --clean --arm baseline --task all --seeds 3 --dry-run && node evals/report.mjs

======================================================
auteur-ui evaluation harness
Arm:     baseline
Task:    all
Seeds:   3
Dry-run: true
======================================================

Loaded 5 task(s): analytics-dashboard, editorial-journal, oss-landing, settings-billing, spotify-listening
Using adapter: mock-dry-run

[1/15] Running baseline-analytics-dashboard-seed1...
  ✓ Done: 2249ms, 4852 tokens, screenshots captured.
[2/15] Running baseline-analytics-dashboard-seed2...
  ✓ Done: 1798ms, 5504 tokens, screenshots captured.
[3/15] Running baseline-analytics-dashboard-seed3...
  ✓ Done: 2547ms, 4356 tokens, screenshots captured.
[4/15] Running baseline-editorial-journal-seed1...
  ✓ Done: 2065ms, 5120 tokens, screenshots captured.
[5/15] Running baseline-editorial-journal-seed2...
  ✓ Done: 2630ms, 4240 tokens, screenshots captured.
[6/15] Running baseline-editorial-journal-seed3...
  ✓ Done: 1995ms, 3360 tokens, screenshots captured.
[7/15] Running baseline-oss-landing-seed1...
  ✓ Done: 2619ms, 4712 tokens, screenshots captured.
[8/15] Running baseline-oss-landing-seed2...
  ✓ Done: 2538ms, 3424 tokens, screenshots captured.
[9/15] Running baseline-oss-landing-seed3...
  ✓ Done: 2457ms, 5036 tokens, screenshots captured.
[10/15] Running baseline-settings-billing-seed1...
  ✓ Done: 1963ms, 5324 tokens, screenshots captured.
[11/15] Running baseline-settings-billing-seed2...
  ✓ Done: 2426ms, 4648 tokens, screenshots captured.
[12/15] Running baseline-settings-billing-seed3...
  ✓ Done: 1689ms, 3972 tokens, screenshots captured.
[13/15] Running baseline-spotify-listening-seed1...
  ✓ Done: 2100ms, 3900 tokens, screenshots captured.
[14/15] Running baseline-spotify-listening-seed2...
  ✓ Done: 1500ms, 3600 tokens, screenshots captured.
[15/15] Running baseline-spotify-listening-seed3...
  ✓ Done: 2100ms, 3300 tokens, screenshots captured.

Evaluation complete. Generated run artifacts in: /Users/vanshpatel/Desktop/auteur-ui/evals/runs

Generating evaluation reports from evals/runs/ ...
Loaded 15 run(s).
Wrote markdown report to: /Users/vanshpatel/Desktop/auteur-ui/evals/report.md
Wrote blind gallery HTML to: /Users/vanshpatel/Desktop/auteur-ui/evals/gallery.html
Wrote private blind grading key to: /Users/vanshpatel/Desktop/auteur-ui/evals/blind-key.json
```

### Token & Cost Measurements
- **Total Runs**: 15
- **Average Wall Time**: 2.18s
- **Average Tokens / Run**: 4,357
- **Total Simulated Cost**: $0.4739
- **LLM Calls**: 0 (Pure deterministic infrastructure)



## Phase 2: The Data Model

### Date
2026-11-13

### What shipped
1. **`packages/schema/contract.ts`** — Zod schema for runtime design contract (`.auteur-ui/contract.json`):
   - Schema fields: `look` (id), `type` (display, text, optional mono, scale, opticalSizing), `palette` (id, mode, tokens in OKLCH), `space` (base: 4|8, rhythm), `radius` (strategy: 'sharp'|'soft'|'mixed', values), `motion` (personality: 'restrained'|'editorial'|'kinetic'|'playful', ease, dur [3 numbers], stagger), `sound` (kit, events, volume, enabled), `layout` (grid, asymmetry: 0-1), `forbid` (string[]), and `version`.
   - `toMarkdown()` function: deterministic serializer generating human/agent-readable design contract summaries guaranteed <= 300 tokens.
2. **`packages/schema/color.ts`** — Zero-dependency mathematical OKLCH to linear sRGB parser and WCAG 2.1 relative luminance / contrast calculator.
3. **`packages/schema/look.ts`** — Schema for curated looks and manifest entries, plus `toContract(look, version)` conversion.
4. **`packages/schema/index.ts`** — Barrel export for the schema package.
5. **`looks/`** — 5 curated looks with distinct design personalities, authentic Google Fonts / OFL typography, and 6-line READMEs with 3 real-world reference sites:
   - `nocturne-editorial`: warm dark, serif display (Newsreader / Source Serif 4 / JetBrains Mono), restrained motion, print rhythm.
   - `swiss-utility`: light, grotesk (Inter / Space Mono), sharp 0px corners, zero decoration, high density.
   - `kinetic-pop`: high chroma, oversized type (Syne / Plus Jakarta Sans), spring physics, playful.
   - `terminal-luxe`: mono-forward (JetBrains Mono), near-black, phosphor accent, minimal motion.
   - `paper-editorial`: cream, high contrast serif (Cormorant Garamond / EB Garamond), generous whitespace, gentle fades.
6. **`looks/index.json`** — Manifest listing id, description, tags, best-for (404 tokens, strictly <= 600 tokens).
7. **`SOURCES.md`** — Upstream attribution and font registry verifying SIL Open Font License 1.1 status on Google Fonts and design lineages.
8. **`tests/contract.test.ts` & `tests/looks.test.ts`** — 20 comprehensive unit tests validating schemas, manifest budgets, 6-line README structure, and WCAG AA contrast (>= 4.5:1) for all color pairs.
9. **`scripts/budget.ts`** & **`package.json`** — Added `pnpm test` and `pnpm budget` commands enforcing token budget invariants.

### Acceptance Command Run: `pnpm test`
```bash
pnpm test
```

### Actual Output: `pnpm test`
```
$ vitest run

 RUN  v5.1.0 /Users/vanshpatel/Desktop/auteur-ui

 ✓ tests/contract.test.ts (3 tests) 7ms
 ✓ tests/looks.test.ts (17 tests) 10ms

 Test Files  2 passed (2)
      Tests  20 passed (20)
   Start at  15:18:10
   Duration  170ms (import 76%, transform 15%, tests 8%, worker 1%)
```

### Acceptance Command Run: `pnpm budget`
```bash
pnpm budget
```

### Actual Output: `pnpm budget`
```
$ tsc && node dist/scripts/budget.js

======================================================
   auteur-ui Token Budget Audit
======================================================

Target                                Tokens   Limit    Status
--------------------------------------------------------------
looks/index.json manifest                404     600    ✓ PASS
contract summary: kinetic-pop            278     300    ✓ PASS
contract summary: nocturne-editorial     281     300    ✓ PASS
contract summary: paper-editorial        287     300    ✓ PASS
contract summary: swiss-utility          246     300    ✓ PASS
contract summary: terminal-luxe          263     300    ✓ PASS
--------------------------------------------------------------
All token budget invariants satisfied.
```

### Token Measurements & Invariant Verification
- **Contract Budget**: Limit 300 tokens | Max measured: 287 tokens (`paper-editorial`) | All 5 looks PASS
- **Manifest Budget**: Limit 600 tokens | Measured: 404 tokens (`looks/index.json`) | PASS
- **WCAG AA Contrast**: Minimum required: 4.5:1 | Measured range: 6.68:1 to 19.44:1 across all 5 looks | All PASS
- **Network Calls at Runtime**: 0


## Phase 3: The Preview Renderer

### Date
2026-11-13

### What shipped
1. **`packages/preview/types.ts`** — Types defining `Direction` (`id`, `look`, `headline`, `sub`, `cta`, `mood`), `TaskBrief` (`id`, `type`, `prompt`, `title`), and `PreviewRenderOptions`.
2. **`packages/preview/templates.ts`** — 4 semantic subject templates implemented as pure HTML/CSS strings, providing IDENTICAL component DOM structures per task type across all direction panels:
   - `music`: Player bar (artwork, controls, scrub seekbar, timestamps) + 4-track queue list + 3-album grid.
   - `dashboard`: 4 KPI stat cards + SVG telemetry line/area chart with gradient + endpoints data table.
   - `landing`: Hero section (kicker pill, headline, sub, CTA row) + 3 feature cards + quickstart terminal block.
   - `editorial`: Publication article header + dropcap lead text + pull quote + two-column body + framed architectural plate.
3. **`packages/preview/render.ts`** — Pure function `renderDirections(directions: Direction[], task: TaskBrief): string` returning a self-contained preview HTML document with ZERO LLM calls:
   - CSS custom property injection from each `look.json` (`--color-*`, `--font-*`, `--radius-*`, `--space-*`, `--motion-*`).
   - Dev-time Google Fonts link for authentic OFL fonts with documented local system font fallback stacks and graceful offline resilience (`onerror` handling, zero render blocking).
   - Personality-based hover and entrance CSS motion per look (`restrained`, `editorial`, `kinetic`, `playful`).
   - Real sound: WebAudio synthesizer in code (muted by default, toggle button) synthesizing custom sound blips (`minimal-click`, `bubble-pop`, `warm-thud`, `mechanical-switch`, `paper-rustle`).
   - Big number badge (1–N) on each panel + sticky "reply with 1–N" footer.
   - Keyboard 1–5 hotkeys and panel click handlers that highlight the panel and copy the direction ID to the clipboard.
   - Embedded fallbacks for all 5 curated looks to guarantee graceful degradation without crashing.
4. **`packages/preview/contact-sheet.ts`** — Playwright contact sheet generator saving a single 1200px-wide PNG of all panels for human review in the repository (never fed to a model).
5. **`packages/preview/index.ts`** — Barrel export for the preview package.
6. **`bin/auteur-ui.mjs`** — CLI executable supporting `npx auteur-ui preview`:
   - `--directions <path>` (default: `.auteur-ui/directions.json`).
   - `--task <path|type>` (default: autodetect).
   - `--out <path>` (default: `.auteur-ui/preview.html`).
   - `--contact-sheet [path]` (captures 1200px PNG contact sheet).
   - `--open` (opens preview HTML in default browser).
7. **`tests/fixtures/directions.json`** & **`.auteur-ui/directions.json`** — 5 curated directions across all 5 looks measuring 365 tokens formatted / 256 tokens compact (strictly <= 400 token hard constraint).
8. **`tests/fixtures/preview.golden.html`** — Golden HTML snapshot fixture for regression tests.
9. **`tests/preview.spec.ts`** — Vitest test suite validating:
   - Direction token budget constraint (<= 400 tokens).
   - Golden-file HTML snapshot exact equality.
   - Multi-template coverage across all 4 subject templates.
   - Playwright 1200px viewport rendering with pixel-diff <= 1% tolerance (measured 0.0000%).
10. **`scripts/budget.ts`** & **`package.json`** — Wired `"bin"` configuration and added 5-direction output token budget to `pnpm budget`.

### Acceptance Command Run: `pnpm test`
```bash
pnpm test
```

### Actual Output: `pnpm test`
```
$ vitest run

 RUN  v5.1.0 /Users/vanshpatel/Desktop/auteur-ui

 ✓ tests/contract.test.ts (3 tests) 7ms
 ✓ tests/looks.test.ts (17 tests) 11ms
stdout | tests/preview.spec.ts > Preview Renderer (Phase 3) > HARD CONSTRAINT: 5 directions must consume <= 400 output tokens

======================================================
   Direction Output Token Budget Verification
======================================================
Formatted directions.json tokens : 365 / 400 limit
Compact JSON tokens              : 256 / 400 limit
Status                           : ✓ PASS
======================================================

stdout | tests/preview.spec.ts > Preview Renderer (Phase 3) > Playwright 1200px Rendering & Pixel-Diff Test > renders at 1200px viewport and achieves pixel-diff < 1% tolerance across renders
Playwright Pixel-Diff Measured: 0.0000% (Tolerance <= 1.0%)

 ✓ tests/preview.spec.ts (4 tests) 1533ms
   ✓ Preview Renderer (Phase 3) (4)
     ✓ Playwright 1200px Rendering & Pixel-Diff Test (1)
       ✓ renders at 1200px viewport and achieves pixel-diff < 1% tolerance across renders 1427ms

 Test Files  3 passed (3)
      Tests  24 passed (24)
   Start at  15:32:15
   Duration  1.81s (tests 79%, import 19%, transform 2%)
```

### Acceptance Command Run: `node -e` Demo
```bash
node -e "
const fs = require('fs');
const { encode } = require('gpt-tokenizer');

import('./dist/packages/preview/index.js').then(({ renderDirections }) => {
  const directionsRaw = fs.readFileSync('tests/fixtures/directions.json', 'utf8');
  const directions = JSON.parse(directionsRaw);
  const task = {
    id: 'spotify-listening',
    title: 'Music Listening App',
    prompt: 'Build a music listening app like Spotify',
    type: 'music'
  };

  const html = renderDirections(directions, task);
  fs.writeFileSync('.auteur-ui/preview.html', html, 'utf8');

  const formattedTokens = encode(directionsRaw).length;
  const compactTokens = encode(JSON.stringify(directions)).length;

  console.log('--- auteur-ui Phase 3 Demo ---');
  console.log('Directions loaded:', directions.length);
  console.log('Task type:', task.type);
  console.log('Output preview HTML written to: .auteur-ui/preview.html (' + html.length + ' bytes)');
  console.log('Directions token count (formatted):', formattedTokens, 'tokens (limit: 400)');
  console.log('Directions token count (compact):  ', compactTokens, 'tokens (limit: 400)');
  console.log('Demo finished successfully with ZERO LLM calls.');
});
"
```

### Actual Output: `node -e` Demo
```
--- auteur-ui Phase 3 Demo ---
Directions loaded: 5
Task type: music
Output preview HTML written to: .auteur-ui/preview.html (75061 bytes)
Directions token count (formatted): 365 tokens (limit: 400)
Directions token count (compact):   256 tokens (limit: 400)
Demo finished successfully with ZERO LLM calls.
```

### Token Measurements & Invariant Verification
- **Hard Constraint: 5 Directions Token Budget**: Limit 400 tokens | Measured: 365 tokens (formatted), 256 tokens (compact) | PASS
- **Deterministic Heavy Lifting**: 100% deterministic code generation; zero LLM calls.
- **Playwright Pixel-Diff Stability**: Limit <= 1.0% tolerance | Measured: 0.0000% | PASS
- **Runtime Network**: Zero network dependencies during build or execution. External fonts link includes complete offline fallback stacks.


## Phase 4: The Skill Itself

### Date
2026-11-13

### What shipped
1. **`skill/SKILL.md`** — The router entry point:
   - YAML frontmatter: `name: auteur-ui`, single-sentence 3rd-person description packed with trigger words (`ui`, `design`, `landing page`, `dashboard`, `app`, `redesign`, `make it look`, `avoid generic`, `animations`, `typography`, `polish`).
   - Body: 10-step imperative protocol without prose.
   - `MODULES` table: path, when to load, approximate tokens.
   - Hard budget: limit 500 tokens, measured 422 tokens.
2. **`skill/commands/auteur-ui.md`** — Slash command wrapper:
   - Hard budget: limit 120 tokens, measured 111 tokens.
3. **`packages/cli/`** — Complete CLI implementation suite:
   - `types.ts`: TypeScript contracts for task briefs, trace records, and linter results.
   - `trace.ts`: Trace logger appending JSONL records `{ts, phase, args, tokens_estimate, result}` and `verifyTrace()` enforcing strict workflow sequence `brief -> directions -> preview -> human_pick -> lock -> build -> lint -> pass`.
   - `brief.ts`: Task brief generator emitting `.auteur-ui/brief.json`.
   - `preview.ts`: Full preview contact sheet and browser preview runner.
   - `lock.ts`: Validates curated look ID, compiles contract via `toContract()`, and writes `.auteur-ui/contract.json`.
   - `lint.ts`: Deterministic linter stub returning `{ score: 100, pass: true, violations: [] }`.
   - `score.ts`: Quality and compliance scorer.
   - `doctor.ts`: Diagnostic engine checking Node runtime, looks manifest, 5 curated looks, skill router, slash command, modules, and workspace directories.
   - `index.ts`: Unified CLI dispatcher.
4. **`bin/auteur-ui.mjs`** — Executable delegating to `runCli()` in `dist/packages/cli/index.js`.
5. **`modules/*.md` & `code/`** — Distilled modular design guidelines and code asset directory:
   - `modules/typography.md`, `modules/color.md`, `modules/layout.md`, `modules/motion.md`, `modules/sound.md`, `modules/components.md`, `code/README.md`.
6. **`tests/router.spec.ts` & `tests/fixtures/trace-*.jsonl`** — Test suite verifying:
   - Router token budget constraint (<= 500 tokens).
   - Slash command token budget constraint (<= 120 tokens).
   - YAML frontmatter validity and all 11 trigger words.
   - Static assertion that every file and directory path referenced in `SKILL.md` exists on disk.
   - Trace verification asserting valid 8-phase passes and truncated fails with exact missing phase.
7. **`scripts/budget.ts`** — Updated CI budget audit checking router and slash command limits.

### Acceptance Command Run: `pnpm test`
```bash
pnpm test
```

### Actual Output: `pnpm test`
```
$ vitest run

 RUN  v5.1.0 /Users/vanshpatel/Desktop/auteur-ui

stdout | tests/router.spec.ts > Router & Skill Invariants (Phase 4) > HARD CONSTRAINT: skill/SKILL.md must consume <= 500 tokens

======================================================
   Skill Router Token Budget Audit
======================================================
Measured tokens : 422 / 500 limit
Status          : ✓ PASS
======================================================

stdout | tests/router.spec.ts > Router & Skill Invariants (Phase 4) > HARD CONSTRAINT: skill/commands/auteur-ui.md must consume <= 120 tokens
Command tokens  : 111 / 120 limit

stdout | tests/router.spec.ts > Router & Skill Invariants (Phase 4) > asserts every path referenced in SKILL.md exists on disk
Verified 12 referenced paths in SKILL.md:
  ✓ .auteur-ui/contract.json
  ✓ .auteur-ui/brief.json
  ✓ .auteur-ui/directions.json
  ✓ looks/index.json
  ✓ .auteur-ui/contract.json
  ✓ code/
  ✓ modules/typography.md
  ✓ modules/color.md
  ✓ modules/layout.md
  ✓ modules/motion.md
  ✓ modules/sound.md
  ✓ modules/components.md

 ✓ tests/router.spec.ts (5 tests) 5ms
 ✓ tests/contract.test.ts (3 tests) 7ms
 ✓ tests/looks.test.ts (17 tests) 10ms
 ✓ tests/preview.spec.ts (4 tests) 1766ms

 Test Files  4 passed (4)
      Tests  29 passed (29)
   Start at  18:51:13
   Duration  2.04s (tests 78%, import 21%, transform 2%)
```

### Acceptance Command Run: `npx auteur-ui doctor`
```bash
npx auteur-ui doctor
```

### Actual Output: `npx auteur-ui doctor`
```
======================================================
         auteur-ui System Doctor Checklist
======================================================

 [✓] Node.js Environment     : v24.22.1 (>= 18 required)
 [✓] Looks Manifest          : looks/index.json (5 looks defined)
 [✓] Curated Looks           : 5/5 curated looks verified
 [✓] Skill Router            : skill/SKILL.md (422 tokens <= 500 limit)
 [✓] Slash Command           : skill/commands/auteur-ui.md (111 tokens <= 120 limit)
 [✓] Design Modules          : 6/6 modules present in modules/
 [✓] Code Assets             : code/ directory ready for asset extraction
 [✓] Workspace Directory     : .auteur-ui/ directory ready for runtime artifacts

------------------------------------------------------
Status: All diagnostic checks passed (8/8).
```

### Acceptance Command Run: `npx auteur-ui trace --verify` (Valid & Truncated)
```bash
# Valid hand-written 8-phase trace:
npx auteur-ui trace --verify --file tests/fixtures/trace-valid.jsonl

# Truncated trace (missing human_pick):
npx auteur-ui trace --verify --file tests/fixtures/trace-truncated.jsonl
```

### Actual Output: `npx auteur-ui trace --verify`
```
# 1. Valid trace:
✓ Trace verified: all 8 phases completed in required order (brief -> directions -> preview -> human_pick -> lock -> build -> lint -> pass)

# 2. Truncated trace (exits 1):
Error: Trace verification failed: missing phase "human_pick".
Required sequence: brief -> directions -> preview -> human_pick -> lock -> build -> lint -> pass
```

### Token Measurements & Invariant Verification
- **Router Budget**: Limit 500 tokens | Measured: 422 tokens (`skill/SKILL.md`) | PASS
- **Command Wrapper Budget**: Limit 120 tokens | Measured: 111 tokens (`skill/commands/auteur-ui.md`) | PASS
- **Contract Budget**: Limit 300 tokens | Measured range: 246 - 287 tokens | PASS
- **Manifest Budget**: Limit 600 tokens | Measured: 404 tokens (`looks/index.json`) | PASS
- **Direction Output Budget**: Limit 400 tokens | Measured: 365 tokens | PASS
- **Trace Verification Order**: Exits 0 on valid 8-phase sequence, exits 1 on missing/truncated phase naming the missing phase | PASS
- **Zero Runtime Network**: Zero network dependencies during CLI or skill execution.
