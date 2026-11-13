# modules/motion.md

Motion personality and transition rules distilled from contract motion values.

## Duration Triplets `[quick, deliberate, grand]`
- Restrained: `[120ms, 200ms, 320ms]`, cubic-bezier(0.16, 1, 0.3, 1)
- Editorial: `[180ms, 280ms, 450ms]`, cubic-bezier(0.25, 1, 0.5, 1)
- Kinetic: `[100ms, 180ms, 260ms]`, cubic-bezier(0.34, 1.56, 0.64, 1)
- Playful: `[140ms, 240ms, 380ms]`, cubic-bezier(0.68, -0.6, 0.32, 1.6)

## Invariants
1. Honor `prefers-reduced-motion`: clamp all durations to `0ms` or opacity-only fades.
2. Micro-interactions (hover, active, toggle) strictly use `dur[0]` (quick).
3. Layout disclosures (modals, drawers, dropdowns) strictly use `dur[1]` (deliberate).
4. Stagger delay: `contract.motion.stagger` ms per sibling (maximum 5 items cascaded).

