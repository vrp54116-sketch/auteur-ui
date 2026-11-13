# Frequently Asked Questions (FAQ)

### Why not just give my coding agent a markdown prompt with design tips?
Prompt-based design guidance suffers from three fatal problems:
1. **Context Window Exhaustion**: Essays on design theory consume 3,000–8,000 tokens per turn. Multi-turn sessions quickly degrade in reasoning quality and blow through rate limits.
2. **Regression to Slop**: Under high context load, LLMs ignore subjective adjectives (*"make it clean, breathing, and modern"*) and fall back to their training priors: centered heroes, purple linear gradients, 8px border-radius, and Inter.
3. **Zero Verification**: An LLM cannot objectively evaluate whether its own output looks good without a benchmark.

`auteur-ui` replaces essays with a compile-time taste contract (`contract.json`, <= 300 tokens) and an automated numerical linter that fails slop before you even see it.

---

### Does `auteur-ui` make any runtime network requests?
**Never.** Strict Invariant #3 forbids all runtime network calls:
- No Google Fonts fetching.
- No external CDN stylesheets or JS bundles.
- No cloud screenshot or vision API calls.
All motion routines (WAAPI), procedural sound synthesizers (Web Audio API), fluid type curves, and color tokens are pre-bundled offline in `.auteur-ui/assets/`.

---

### Why is Playwright required?
`auteur-ui` uses Playwright exclusively for **local headless rendering**:
1. **Contact Sheet Previews**: Rendering 3 candidate looks side-by-side onto a composite canvas in under 4 seconds.
2. **Computed Style Inspection**: The numerical linter spins up a headless browser to measure true computed CSS styles, geometry, touch target dimensions, and WCAG contrast directly from the DOM.

No images are uploaded to external clouds, and no images are fed into the LLM's context window.

---

### Why does the agent ask me to pick a number instead of choosing itself?
**Invariant #5: The Human is the Vision Model.**
Feeding high-resolution screenshots into multimodal LLMs burns thousands of vision tokens and produces unreliable aesthetic judgements. Instead, `auteur-ui` opens the rendered contact sheet in your local browser, and you respond with a single number (`1`, `2`, or `3`). The agent ingests that 1-token reply and immediately locks the taste contract.

---

### Can I author my own custom looks?
Yes. Follow the guide in [Authoring Custom Looks](authoring-looks.md). You define your type stacks, OKLCH palette, spatial rhythm, and motion personality in a `look.json` file. The test suite automatically validates the schema.

---

### How do I know the agent didn't cheat or generate slop?
Two mechanisms guarantee authenticity:
1. **The Numerical Linter** (`npx auteur-ui lint`): Scores the page out of 100 against strict mathematical rules. If the score is below 80 or triggers any of the 8 major AI slop tells, the build fails.
2. **The Execution Trace** (`.auteur-ui/trace.jsonl`): Records every tool invocation, phase transition, and token estimate.

---

### What frontend stacks and frameworks are supported?
`auteur-ui` works out of the box with:
- **Plain HTML / Modern CSS** (native OKLCH, WAAPI, CSS Grid)
- **Tailwind CSS** (via bundled `.auteur-ui/assets/css/tailwind-theme.css`)
- **React / Vite** (using the provided React motion and sound hooks)
- **Next.js** (App Router and Pages Router, with offline font definitions)
