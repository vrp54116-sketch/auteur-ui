# AGENTS.md

## What we are building
`auteur-ui` — an installable skill for AI coding agents (Claude Code, opencode, Cursor,
Codex, Antigravity) that produces non-generic UI. It aggregates the *decisions* from
~25 open-source design skills, not their prose.

## The thesis (never violate)
Compile taste at BUILD time, not RUNTIME. The agent must read code, numbers, and IDs —
never essays. Intelligence lives in this repo's artifacts; the runtime agent only
composes them.

## Non-negotiable invariants
1. ROUTER BUDGET: root SKILL.md <= 500 tokens. Enforced by a test.
2. CONTRACT: all taste decisions live in `.auteur-ui/contract.json`, <= 300 tokens.
   Read the contract every turn. Never re-read module prose after the contract exists.
3. NO RUNTIME NETWORK. Never fetch GitHub, fonts, or APIs during a user's build.
4. DETERMINISTIC HEAVY LIFTING. Previews, linting, scoring, asset copying are plain
   code. The LLM emits small JSON configs; code does the rendering.
5. HUMAN IS THE VISION MODEL. The agent must not load preview images into context.
   The human looks at the browser and replies with a number.
6. NUMERIC LINT BEFORE VISION. Screenshots only after the linter passes, max 2, max
   768px wide, cropped to the failing region.
7. BOUNDED LOOPS. Max 2 self-critique iterations, then escalate to the human.
8. GRACEFUL DEGRADATION. Missing asset -> warn + fall back, never crash the build.
9. ATTRIBUTION. Every distilled rule records its upstream source in SOURCES.md.
   Only permissive licenses. Unclear license -> rewrite the idea, never copy text.

## Token budgets (assert these in CI)
router 500 | contract 300 | module load 1500 | directions output 400
lint report 250 | full run 20000

## Working agreement
- Plan before code. Show a file list and wait for approval on any task > 5 files.
- One phase per session. Commit at the end with `feat(phase-N): ...`.
- Every phase ends by writing a receipt to BUILD_LOG.md: what shipped, acceptance
  command run, actual output, token measurements.
- Never mark a phase done without running its acceptance command and pasting output.
- If a requirement conflicts with an invariant, STOP and ask. Do not silently choose.
- No new dependencies without asking.
- Tests are not optional. No "TODO: add tests".

## Non-goals for v0.1
Native/mobile, Figma plugin, audio generation at runtime, auto-updating upstream
skills at runtime, a hosted service, telemetry.

