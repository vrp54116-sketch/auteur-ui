# modules/components.md

Component surface and primitive rules derived from contract radius and style tokens.

## Surface Strategies
- `sharp`: `0px` radius on all cards, buttons, inputs, tags (Swiss / Terminal).
- `soft`: `4px` inputs/buttons, `8px` cards, `12px` dialogs, pill tags `9999px`.
- `mixed`: `2px` crisp buttons, `6px` inner panels, `0px` outer viewport frames.

## Component Patterns
1. Buttons: padding `8px 16px` (compact) or `12px 24px` (generous). Never generic gradients.
2. Cards: 1px subtle border or elevation step, never heavy muddy box-shadows.
3. Status Badges: tabular font tracking, subtle background tint with high-contrast text.
4. Tables: tabular-nums for numeric columns, aligned headers, subtle row divider lines.

