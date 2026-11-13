# Example: Swiss Utility Dev Telemetry Dashboard

A high-density operational telemetry dashboard built with the `swiss-utility` look from `auteur-ui`.

---

## Receipts & Taste Contract

- **Locked Contract**: [`.auteur-ui/contract.json`](.auteur-ui/contract.json) (260 tokens)
- **Execution Trace**: [`.auteur-ui/trace.jsonl`](.auteur-ui/trace.jsonl)
- **Linter Score**: 96/100 (Passes all 4px spatial grid tests, contrast checks, and 0px Swiss borders)

---

## Key Features

1. **Swiss High-Density Grid**: Zero rounded corners (`border-radius: 0px`), crisp 1px borders, and pure geometric discipline.
2. **Tabular Numerics**: Throughput metrics, latency histograms, and server tables render with `font-variant-numeric: tabular-nums` to eliminate jitter.
3. **Asymmetric 8fr/4fr Architecture**: Replaces generic centered template cards with purposeful data hierarchy.
4. **Accessible Micro-Interactions**: Meets touch target boundaries (`>= 44×44px`), high-contrast focus outlines, and full table accessibility semantics.

---

## How to Run

```bash
open index.html
```
