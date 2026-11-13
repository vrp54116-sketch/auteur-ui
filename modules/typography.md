# modules/typography.md

Type decisions distilled from contract. Apply exact ratios and optical rules.

## Scale Ratios
- Minor Third: 1.200 (dense dashboards, compact tools)
- Major Third: 1.250 (standard apps, balanced SaaS)
- Perfect Fourth: 1.333 (editorial articles, spacious reading)
- Augmented Fourth: 1.414 (marketing landing pages, bold display)

## Rules
1. Never mix more than two typeface families per view (one display, one body).
2. Monospace is strictly for tabular numerals, timestamps, codes, and metrics.
3. Optical sizing (`opsz`): set `font-optical-sizing: auto` or clamp `opsz` to computed font-size in pixels.
4. Line-height: headings `1.05-1.15`, body copy `1.45-1.60`, UI labels `1.20-1.30`.
5. Letter-spacing: uppercase tracking `+0.04em` to `+0.08em`, large headlines `-0.02em` to `-0.04em`.

