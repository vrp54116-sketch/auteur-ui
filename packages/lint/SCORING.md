# SCORING.md — auteur-ui Deterministic Lint Scoring Rubric

## 1. Overview & Core Invariants
The `auteur-ui` linter replaces subjective aesthetic guesswork with deterministic, computed CSS and DOM geometry checks. 

- **Baseline Score**: 100 points
- **Passing Threshold**: `score >= 80` **AND** `zero hard fails`
- **Token Budget**: Emitted JSON output is strictly capped at $\le 250$ tokens for runtime agent consumption.
- **Attribution & Upstream Lineage**: Rules derived from Bringhurst typography, WCAG 2.1 accessibility standards, and modern layout/motion principles.

---

## 2. Hard Fails (A11Y)
Accessibility violations represent immediate usability barriers. Any single hard fail results in `pass: false` regardless of numerical score.

| Rule ID | Name | Trigger Condition | Consequence |
| :--- | :--- | :--- | :--- |
| `a11y/focus-visible` | Focus Indicators | Stripping focus outlines (`outline: none`) without `:focus-visible` replacement | **HARD FAIL** (-10 pts) |
| `a11y/tap-target-size` | Touch Target Area | Interactive buttons or controls with bounding box `< 44×44px` | **HARD FAIL** (-10 pts) |
| `a11y/missing-alt-text` | Image Alt Text | `<img>` elements missing an `alt` attribute | **HARD FAIL** (-10 pts) |
| `a11y/icon-button-missing-aria` | Icon Button Aria | Icon-only buttons lacking `aria-label`, `aria-labelledby`, or `title` | **HARD FAIL** (-10 pts) |

---

## 3. Slop Tells (-8 Points Each)
The 10 cardinal aesthetic sins of generic AI-generated interfaces. These represent the strongest indicators of prompt-engineered cliché and lack of taste discipline.

| Rule ID | Slop Tell | Deduction | Description & Upstream Cliché |
| :--- | :--- | :--- | :--- |
| `slop/inter-roboto-default` | Inter/Roboto Default | **-8 pts** | Inter or Roboto applied everywhere with no distinctive display face or serif/mono pairing. |
| `slop/purple-blue-gradient` | Purple/Blue Gradient Hero | **-8 pts** | Cliché linear or radial gradient hero using `#6366f1` / `#8b5cf6` / `#ec4899`. |
| `slop/centered-hero-3-cards` | Centered Hero + 3 Cards | **-8 pts** | Centered text hero immediately followed by a `repeat(3, 1fr)` 3-card grid. |
| `slop/emoji-icons` | Emoji Iconography | **-8 pts** | Raw Unicode emoji characters (`🚀`, `⚡️`, `🔒`, `📈`) used as interface icons. |
| `slop/uniform-radius` | Uniform Border-Radius | **-8 pts** | Uniform non-zero radius (e.g. `8px`) applied indiscriminately to all badges, buttons, cards. |
| `slop/drop-shadow-everywhere` | Pervasive Drop Shadows | **-8 pts** | Ambient diffuse box-shadows on every surface instead of crisp 1px borders. |
| `slop/generic-cta-pair` | Cliché CTA Pairing | **-8 pts** | "Get Started" / "Learn More" pairing instead of domain-specific action verbs. |
| `slop/pricing-highlight` | Middle-Tier Pricing Slop | **-8 pts** | 3-column pricing table with highlighted middle card. |
| `slop/gray-on-gray` | Muted Gray-on-Gray | **-8 pts** | Washed out slate-500 (`#64748b` / `#94a3b8`) body text lacking contrast and character. |
| `slop/stock-avatars` | Stock Avatar Circles | **-8 pts** | Generic 50% circular stock avatar placeholders in testimonial bars. |

---

## 4. Deterministic Design Rules

### Typography (TYPE)
- `type/distinct-sizes` (**-3 pts**): More than 7 distinct font-size values across the document.
- `type/off-scale` (**-2 pts**): Font sizes not conforming to modular type scale increments.
- `type/line-height` (**-3 pts**): Body paragraph line-height outside 1.2–1.7 ratio.
- `type/measure` (**-3 pts**): Reading paragraphs with line lengths exceeding 75ch (~680px).
- `type/text-wrap-balance` (**-2 pts**): Multi-word headlines lacking `text-wrap: balance`.

### Color & Contrast (COLOR)
- `color/contrast-ratio` (**-4 pts**): Text nodes failing WCAG AA 4.5:1 (3.0:1 for large text).
- `color/entropy` (**-3 pts**): High color entropy (> 12 distinct hex/rgb values).
- `color/pure-black-surface` (**-2 pts**): Stark `#000000` on large surfaces (> 700×250px) instead of warm/tinted darks.
- `color/saturation-variance` (**-3 pts**): More than 3 disparate high-saturation colors fighting for attention.

### Spatial Grid (SPACE)
- `space/off-grid` (**-3 pts**): Margins and paddings not aligned with contract base grid (4px or 8px).
- `space/sibling-gaps` (**-2 pts**): Arbitrary variance among sibling container elements.

### Rhythm (RHYTHM)
- `rhythm/uniform-section-padding` (**-4 pts**): Multiple sections with identical uniform padding (e.g. `100px 20px`).
- `rhythm/vertical-variance` (**-2 pts**): Uncalibrated vertical rhythm between major section blocks.

### Visual Hierarchy (HIERARCHY)
- `hierarchy/missing-h1` (**-4 pts**): Missing primary `<h1>` element.
- `hierarchy/h1-not-largest` (**-3 pts**): Any secondary heading larger than the `<h1>`.
- `hierarchy/heading-order` (**-2 pts**): Skipped heading levels (e.g. `h1` followed directly by `h4`).

### Motion & Choreography (MOTION)
- `motion/no-transition` (**-3 pts**): Interactive buttons lacking state transitions.
- `motion/layout-shift` (**-3 pts**): Transitions animating geometry (`width`, `height`, `top`, `margin`) instead of `transform`/`opacity`.
- `motion/sluggish-duration` (**-2 pts**): Animations exceeding contract maximum duration (> 500ms).
- `motion/missing-prefers-reduced-motion` (**-3 pts**): Animations present without `@media (prefers-reduced-motion: reduce)`.

### Responsiveness (RESPONSIVE)
- `responsive/horizontal-overflow` (**-6 pts**): Viewport horizontal scroll at 390px mobile width.
- `responsive/cls-image-ratio` (**-2 pts**): Images lacking explicit dimensions or aspect-ratio causing CLS.
- `responsive/text-clipping` (**-3 pts**): Text clipped by `overflow: hidden`.

---

## 5. Pass/Fail Decision Matrix
$$\text{Score} = \max\left(0, 100 - \sum \text{Deductions}\right)$$
$$\text{Pass} = (\text{Score} \ge 80) \land (\text{Hard Fails} = 0)$$

Output report format:
```json
{
  "score": 88,
  "pass": true,
  "fail": [],
  "warnings": []
}
```
If violations are present:
```json
{
  "score": 36,
  "pass": false,
  "fail": [
    {
      "r": "slop/purple-blue-gradient",
      "sel": ".hero",
      "val": "Purple/violet/indigo gradient hero background",
      "want": "Solid neutral surface, photographic plate, or intentional brand palette token",
      "fix": "Replace AI-cliché purple gradient with high-contrast neutral or authentic palette tone"
    }
  ],
  "warnings": []
}
```

