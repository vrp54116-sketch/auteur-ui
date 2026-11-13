# modules/color.md

Color decisions compiled from contract palette tokens in OKLCH.

## Semantic Token Map
- `bg`: Canvas background. Light mode $L \ge 0.95$, Dark mode $L \le 0.15$.
- `surface`: Elevated cards and panels. $\Delta L = 0.04-0.08$ step from `bg`.
- `text`: Primary body text. Must achieve WCAG AA contrast $\ge 4.5:1$ against surface/bg.
- `text-muted`: Secondary metadata, captions. Contrast $\ge 3.0:1$.
- `accent`: Primary intent, interactive focal point, key highlights.
- `border`: Subtle frame dividers. Low chroma $C \le 0.02$, alpha $0.10-0.20$.

## Invariants
1. Never use pure `#000000` or `#ffffff` for backgrounds; preserve organic hue temperature.
2. Maintain mathematical contrast $\ge 4.5:1$ for all functional text.
3. Keep chroma $C \le 0.03$ for neutral surfaces to prevent color vibration.

