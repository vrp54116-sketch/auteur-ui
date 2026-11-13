# Architecture & Design Invariants

## The Thesis

> **Compile taste at BUILD time, not RUNTIME.**
> The coding agent must read code, numbers, and IDs — never subjective essays. Intelligence lives in this repository's pre-compiled artifacts; the runtime agent only composes them.

Traditional AI coding prompts and design skills flood the model's context window with thousands of words of design philosophy (*"ensure whitespace is breathing", "craft an intuitive, harmonious vibe"*). This produces three severe failures:
1. **Context Bloat**: Consumes thousands of expensive tokens per turn.
2. **Nondeterminism**: Models interpret subjective advice differently across seeds, almost always reverting to generic Tailwind UI clichés.
3. **No Verification**: Without mathematical tests, the agent has no objective proof of whether it followed the guidance.

`auteur-ui` solves this by pre-compiling design systems into deterministic code, mathematical taste contracts, and numerical linting rules.

---

## The Contract Lifecycle

The aesthetic state of any project using `auteur-ui` is governed entirely by `.auteur-ui/contract.json` (strictly enforced at `<= 300 tokens`).

```
                    ┌─────────────────────────┐
                    │ 1. User Design Request  │
                    │   (/auteur-ui build...) │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ 2. Direction Synthesis  │
                    │   (Emits 3 directions)  │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ 3. Headless Contact     │
                    │    Sheet Rendering      │
                    │   (Playwright < 4s)     │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ 4. Human Taste Decision │
                    │   (Replies "1", "2",    │
                    │    or "3" in browser)   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ 5. Lock Contract        │
                    │   (.auteur-ui/          │
                    │    contract.json)       │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ 6. Deterministic Build  │
                    │    & Numeric Lint Pass  │
                    │   (Score >= 80, no slop)│
                    └─────────────────────────┘
```

### Invariants of the Contract
1. **Immutable Decision Record**: Once `.auteur-ui/contract.json` is generated, the agent reads only this JSON object every turn. It never re-reads module documentation.
2. **Strict Schema**: Validated with Zod against `ContractSchema` (Type scales, OKLCH palette, 4px/8px grid, radius strategy, WAAPI motion profile, and sound kit).
3. **Budget Envelope**: Validated by CI to never exceed 300 GPT tokens.

---

## Token Budget Hierarchy

To prevent runaway context consumption in multi-turn agent workflows, `auteur-ui` asserts strict token budgets in CI:

| Boundary | Token Limit | Measured | Enforcement |
| :--- | :--- | :--- | :--- |
| **Skill Router (`SKILL.md`)** | `<= 500 tokens` | **463** | `tests/router.spec.ts` |
| **Taste Contract (`contract.json`)** | `<= 300 tokens` | **264** | `tests/budget.spec.ts` |
| **Module Reference** | `<= 1,500 tokens` | **~800** | `tests/budget.spec.ts` |
| **Directions Output** | `<= 400 tokens` | **~365** | `packages/cli/brief.ts` |
| **Lint Diagnostic Report** | `<= 250 tokens` | **~155** | `tests/lint/fixtures.spec.ts` |
| **Full Session Envelope** | `<= 20,000 tokens` | **< 6,000** | Evals Harness |

---

## The Human is the Vision Model

**Invariant #5**: *The agent must not load preview images into context.*

Multimodal vision models are expensive, nondeterministic, and susceptible to hallucinating design quality. Instead:
- Playwright renders a composite HTML contact sheet displaying 3 aesthetic directions.
- The browser opens locally for the human user.
- The human looks at the high-resolution rendering and types a single character (`1`, `2`, or `3`).
- The agent ingests only that integer and immediately locks the corresponding aesthetic contract.

---

## Numerical Taste & Anti-Pattern Linter

Before any screenshot or visual inspection can occur, code must pass the **Numerical Taste Linter**:
- **Zero-LLM Execution**: Evaluates computed styles, DOM hierarchy, and color space math directly in Playwright.
- **100-Point Scoring**:
  - Baseline score starts at 100.
  - Off-scale font sizes, unconstrained line lengths, and off-grid margins deduct points.
  - Universal AI-slop tells (purple-blue linear gradient heroes, Inter-only typography, centered hero + 3 equal cards, emoji icons, uniform 8px radii) deduct 8 points each.
  - Hard accessibility violations (stripped `:focus-visible`, tap targets < 44×44px, missing aria labels) cap the score below 50.
- **Pass Threshold**: Scores >= 80 pass.

---

## Zero Runtime Network

**Invariant #3**: *Never fetch GitHub, fonts, or APIs during a user's build.*

Everything needed to render world-class UI is vendored directly into `.auteur-ui/assets/`:
- **WAAPI Motion Primitives**: Self-contained Web Animations API scripts (`flip.mjs`, `stagger-list.mjs`, `spring-sheet.mjs`, `magnetic-hover.mjs`).
- **Web Audio Sound Synthesizers**: Algorithmic, byte-sized Web Audio oscillators (`minimal-click.mjs`, `glass.mjs`, `analog-tape.mjs`, `soft-mechanical.mjs`). No external audio files.
- **Curated Typography Scales**: Pre-configured fluid clamp scales and system font stacks for instant zero-CDN offline builds.
