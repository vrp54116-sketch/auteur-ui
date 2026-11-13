# modules/layout.md

Layout and spatial rhythm rules compiled from contract space and layout settings.

## Spacing Grid
- Base unit: `4px` or `8px` defined by `contract.space.base`.
- Steps: `space-1 (4px)`, `space-2 (8px)`, `space-3 (12px)`, `space-4 (16px)`, `space-6 (24px)`, `space-8 (32px)`, `space-12 (48px)`, `space-16 (64px)`.

## Grid Architecture
1. Dashboards: 12-column grid or CSS subgrid with strict `16px` or `24px` gutters.
2. Editorial: Single asymmetrical column (`65ch` max readable measure) offset by wide margin.
3. Marketing: Hero asymmetry score between `0.15` and `0.40`. Never center all elements symmetrically.
4. Density: Compact tools use `4px` cell padding; editorial uses `24-32px` section padding.

