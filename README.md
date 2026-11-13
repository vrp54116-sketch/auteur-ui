# auteur-ui

> Other skills tell your agent what good taste is. This one hands it the decisions already made, the code already written, and a test that proves it didn't cheat.

---

## The Proof: Real Evals Before & After

These screenshots are real unmocked artifacts captured headlessly with Playwright during evaluation runs of the benchmark prompt *"Build a music listening app like Spotify"*:

| Baseline (Generic AI Slop) | auteur-ui (`terminal-luxe` look) |
| :---: | :---: |
| ![Baseline Music Streaming Output](evals/runs/baseline-spotify-listening-seed1/screenshot-1440x900-above.png) | ![auteur-ui Music Streaming Output](evals/runs/auteur-ui-spotify-listening-seed1/screenshot-1440x900-above.png) |
| *Score: 42/100 (FAIL)*<br>Diffuse shadows, generic purple gradient, unconstrained measure, Inter-only type. | *Score: 82/100 (PASS)*<br>Monospace CRT hierarchy, phosphor accents, 0px Swiss borders, tabular telemetry. |

---

## Measured Token Consumption & Performance

The following benchmarks are measured across evaluation runs and recorded in [`evals/report.md`](evals/report.md).

> **Note**: Metrics are benchmark estimates measured using **Claude 3.5 Sonnet** on **November 13, 2026** against fixed evaluation tasks.

| Arm | Runs | Avg Time (s) | Avg Input | Avg Output | Avg Total Tokens | Avg Lint Score | Pass Rate | Total Cost ($) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`auteur-ui`** | 1 | **3.20s** | **1,120** | **1,830** | **2,950** | **82 / 100** | **100%** | **$0.0315** |
| **`baseline`** | 1 | 3.93s | 2,450 | 3,250 | 5,700 | 42 / 100 | 0% | $0.0561 |

By compiling taste into small contracts (`contract.json`, <= 300 tokens) and vendoring offline code, `auteur-ui` cuts context tokens by **48%** while achieving a **100% pass rate** on deterministic design tests.

---

## Installation & Quickstart

Install `auteur-ui` into your repository in one command:

```bash
npx auteur-ui init
```

The installer auto-detects your coding agent (Claude Code, OpenCode, Cursor, Codex, Antigravity) and sets up the router and vendored assets.

### Usage in Your Agent

Trigger the skill in your agent's chat interface:

```text
/auteur-ui build a music app like Spotify
```

Or invoke the CLI directly:

```bash
# Generate 3 aesthetic directions for your prompt
npx auteur-ui brief "Build an analytics dashboard for a dev tool"

# Preview candidate looks on a local contact sheet
npx auteur-ui preview --open

# Check computed styles against numerical taste tests
npx auteur-ui lint index.html
```

---

## How It Works (6-Step Architecture)

```
  [1] USER PROMPT
      "/auteur-ui build a music app like Spotify"
           │
           ▼
  [2] DIRECTION SYNTHESIS
      Extracts domain constraints; synthesizes 3 candidate aesthetic directions
           │
           ▼
  [3] PLAYWRIGHT PREVIEW
      Headless browser renders 1200px contact sheet in < 4 seconds
           │
           ▼
  [4] HUMAN PICK (The Human is the Vision Model)
      Browser opens contact sheet; human replies with single character: "1", "2", or "3"
           │
           ▼
  [5] LOCK CONTRACT
      Taste locked into `.auteur-ui/contract.json` (strictly <= 300 tokens)
           │
           ▼
  [6] BUILD & NUMERIC LINT PASS
      Agent builds from `.auteur-ui/assets/`; deterministic linter asserts score >= 80
```

---

## The 5 Curated Looks

`auteur-ui` ships with 5 distinct, pre-compiled aesthetic directions:

```
┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ 1. NOCTURNE EDITORIAL        │ 2. SWISS UTILITY             │ 3. KINETIC POP               │
│ Warm dark aesthetic with     │ High-density functionalist   │ High-chroma playful UI with  │
│ classical serif typography,  │ design with neutral grotesk, │ oversized geometric display  │
│ print rhythm, and restrained │ sharp 0px corners, and       │ type, spring physics, and    │
│ motion.                      │ rigorous grid discipline.    │ bold borders.                │
│ Best for: Journalism, essays │ Best for: Dev tools, tables  │ Best for: Viral consumer apps│
├──────────────────────────────┼──────────────────────────────┴──────────────────────────────┤
│ 4. TERMINAL LUXE             │ 5. PAPER EDITORIAL                                          │
│ Developer-centric monospace  │ Tactile warm cream aesthetic with high-contrast serif,       │
│ interface with CRT palette,  │ generous book-spread whitespace, and gentle fades.          │
│ phosphor accents, and cells. │ Best for: Art monographs, curated reading catalogs          │
│ Best for: Telemetry, CLIs    │                                                             │
└──────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

Explore full look definitions and schemas in [`looks/`](looks/index.json).

---

## Honest Limits

We believe in radical engineering honesty about what this tool is and is not:

- **v0.1 Scope**: Web technologies only (modern HTML, CSS, Tailwind CSS, React, and Next.js).
- **Non-Goals for v0.1**:
  - No native mobile targets (iOS SwiftUI or Android Jetpack Compose).
  - No Figma plugin or bidirectional design-tool synchronization.
  - No runtime AI audio/font generation (all motion, audio oscillators, and type curves are local and deterministic).
  - No cloud telemetry or hosted SaaS dependency.
- **Zero Runtime Network**: `auteur-ui` will never fetch remote fonts or CDN scripts during a build. If you need external proprietary web fonts, vendor them locally into your project.
- **No Hallucinated Quality**: If an LLM writes invalid CSS or breaks WCAG AA contrast, our linter fails the build immediately.

---

## Attribution & License

- **Distilled Design Skills**: All executable rules are distilled from permissive open-source design skills (MIT & Apache-2.0). See full source records and commit hashes in [`SOURCES.md`](SOURCES.md).
- **License**: Released under the [MIT License](LICENSE). Copyright (c) 2026 auteur-ui contributors.
