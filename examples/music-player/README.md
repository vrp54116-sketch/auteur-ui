# Example: Terminal Luxe Music Streaming Player

A complete, working audio streamer and synthesizer player built with the `terminal-luxe` look from `auteur-ui`.

---

## Receipts & Taste Contract

- **Locked Contract**: [`.auteur-ui/contract.json`](.auteur-ui/contract.json) (264 tokens)
- **Execution Trace**: [`.auteur-ui/trace.jsonl`](.auteur-ui/trace.jsonl) (Full tool & token history)
- **Linter Score**: 94/100 (Passes all WCAG AA contrast, 0px Swiss borders, zero AI-slop tells)

---

## Key Features

1. **Monospace Terminal Aesthetic**: Built with `ui-monospace` and CRT phosphor green accent (`oklch(0.85 0.22 142)`).
2. **Procedural Web Audio Synth**: Zero remote audio files. Button clicks synthesize real audio pulses via Web Audio API.
3. **Tabular Telemetry**: Audio latency, sample rate, and duration indicators rendered with `font-variant-numeric: tabular-nums`.
4. **Accessible Controls**: Meets min touch target constraints (`>= 44×44px`), `:focus-visible` indicators, and full ARIA slider labeling.

---

## How to Run

Simply open `index.html` in any modern web browser:

```bash
open index.html
# or serve via local python/npx http server
npx serve .
```

