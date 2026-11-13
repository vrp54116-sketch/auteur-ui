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
