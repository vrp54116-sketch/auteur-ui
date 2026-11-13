# Contributing to auteur-ui

Thank you for contributing to `auteur-ui`! We are building an installable skill for AI coding agents that compiles design intelligence into deterministic code and tests.

---

## The Core Thesis & Invariants

Before writing any code or proposing changes, you must agree to uphold our core invariants:

1. **COMPILE TASTE AT BUILD TIME, NOT RUNTIME**: The agent must read code, numbers, and IDs — never subjective essays.
2. **TOKEN BUDGETS ARE HARD BOUNDARIES**:
   - Skill Router (`SKILL.md`): `<= 500 tokens` (enforced by `tests/router.spec.ts`).
   - Contract (`contract.json`): `<= 300 tokens` (enforced by `tests/budget.spec.ts`).
   - Module reference docs: `<= 1,500 tokens`.
   - Directions output: `<= 400 tokens`.
   - Lint diagnostic report: `<= 250 tokens`.
   - Full agent run: `<= 20,000 tokens`.
3. **ZERO RUNTIME NETWORK**: Never add code that fetches Google Fonts, remote CDNs, or external APIs during a user build.
4. **THE HUMAN IS THE VISION MODEL**: Never pipe preview images into the LLM's context.
5. **ATTRIBUTION REQUIRED**: Every distilled rule or asset must record its permissive upstream source (MIT or Apache-2.0) in `SOURCES.md`. Unclear licenses must be rejected or rewritten.

---

## Local Development Workflow

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Playwright browser binaries

### Setup
```bash
git clone https://github.com/auteur-ui/auteur-ui.git
cd auteur-ui
pnpm install
npx playwright install chromium
```

### Running Tests
Tests are not optional. Every PR must pass 100% of the test suite:
```bash
# Run all unit and integration tests
pnpm test

# Verify strict token budgets
pnpm budget

# Run evaluation benchmark harness
pnpm eval:dry

# Build distribution bundles
pnpm build
```

---

## Adding or Modifying Distilled Rules

1. Add the upstream repository to `pipeline/sources.yml` with its pinned commit, license, and attribution.
2. Add rule definitions into `pipeline/distill.mjs`. Statements must be **<= 20 words** and strictly avoid vague words (`clean`, `good`, `intuitive`, `beautiful`).
3. Run the distillation pipeline:
   ```bash
   node pipeline/merge.mjs
   ```
4. Verify attribution updates in `SOURCES.md` and rule checks in `tests/pipeline.spec.ts`.
5. Re-generate lint documentation:
   ```bash
   node scripts/generate-lint-docs.mjs
   ```

---

## Submitting Pull Requests

- Keep PRs focused on a single feature, look, or rule.
- Do not add new runtime dependencies without prior discussion.
- Run `pnpm test` and `pnpm build` before pushing.

