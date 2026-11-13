# Example: Paper Editorial Photo Journal

A literary monograph and photo journal reading interface built with the `paper-editorial` look from `auteur-ui`.

---

## Receipts & Taste Contract

- **Locked Contract**: [`.auteur-ui/contract.json`](.auteur-ui/contract.json) (265 tokens)
- **Execution Trace**: [`.auteur-ui/trace.jsonl`](.auteur-ui/trace.jsonl)
- **Linter Score**: 95/100 (Passes 65ch reading measure check, WCAG contrast on warm cream background, and typography hierarchy)

---

## Key Features

1. **Tactile Editorial Proportion**: Warm cream background (`oklch(0.965 0.015 85)`) paired with high-contrast serif headlines and body typography.
2. **Strict Reading Measure**: Paragraph width constrained to `max-width: 65ch` with `hyphens: auto` to prevent eye scanning fatigue.
3. **Asymmetric 7fr/5fr Editorial Spread**: Places longform prose in dialog with photo plates and index sidebars.
4. **Accessible Semantics**: Proper `<article>`, `<figure>`, `<figcaption>`, and keyboard `:focus-visible` styling.

---

## How to Run

```bash
open index.html
```

