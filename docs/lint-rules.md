# auteur-ui Numerical Taste & Anti-Pattern Lint Rules

This reference is **automatically generated** from the executable check files in `packages/lint/rules/` and distilled rules in `rules.json`.

Every rule executes deterministically against rendered DOM/CSS styles in Playwright or static HTML. No LLM evaluates taste at runtime — only hard numbers, geometry, contrast calculations, and strict anti-slop pattern matches.

---

## Scoring Architecture

- **Starting Score**: 100 points
- **Passing Threshold**: >= 80 points
- **Evaluation**:
  - **Category Deductions**: Subtract points for scale entropy, off-grid spacing, low contrast, or missing motion transitions.
  - **Slop Tells**: Each AI-slop anti-pattern carries an aggressive -8 pt penalty.
  - **Hard Accessibility Fails**: Violations of `:focus-visible`, tap targets < 44×44px, or missing accessibility labels immediately cap the score at 49 (Fail).
  - **Token Output**: The JSON diagnostic report is strictly budget-constrained to <= 250 tokens so the agent never wastes context.

---

## Executable Rule Catalog

| Rule ID | Category | Penalty | Title | Why It Matters |
| :--- | :--- | :--- | :--- | :--- |
| `type/distinct-sizes` | **TYPE** | `-3 pts` | Typographic Scale Entropy | Using more than 7 distinct font sizes destroys typographic rhythm and hierarchy. |
| `type/off-scale` | **TYPE** | `-2 pts` | Off-Scale Font Size | Arbitrary font sizes disrupt mathematical visual cadence. |
| `type/line-height` | **TYPE** | `-3 pts` | Body Text Line-Height Out of Bounds | Line-height below 1.2 chokes text legibility; above 1.7 makes sentences drift apart. |
| `type/measure` | **TYPE** | `-3 pts` | Unconstrained Reading Measure | Paragraphs wider than 75ch cause eye fatigue when scanning to the next line. |
| `type/text-wrap-balance` | **TYPE** | `-2 pts` | Missing Heading Text-Wrap Balance | Unbalanced headlines leave orphan words on trailing lines. |
| `color/contrast-ratio` | **COLOR** | `-4 pts` | WCAG AA Insufficient Contrast | Low contrast impairs legibility and fails international accessibility standards. |
| `color/entropy` | **COLOR** | `-3 pts` | Palette Color Entropy | Too many one-off hex colors dilute visual identity and consistency. |
| `color/pure-black-surface` | **COLOR** | `-2 pts` | Pure #000000 on Large Surfaces | Stark pure black (#000) causes OLED halation and feels artificial compared to warm darks. |
| `color/saturation-variance` | **COLOR** | `-3 pts` | Excessive High-Saturation Colors | Competing neon colors fight for attention and fatigue the human eye. |
| `space/off-grid` | **SPACE** | `-3 pts` | Off-Grid Margins or Paddings | Spacing not aligned to a 4px/8px base grid creates subconscious misalignment. |
| `rhythm/uniform-section-padding` | **RHYTHM** | `-4 pts` | Uniform Section Padding Slop Tell | Applying identical 100px padding to every section makes sites feel like cookie-cutter templates. |
| `hierarchy/h1-not-largest` | **HIERARCHY** | `-3 pts` | h1 Heading Not Largest | The main page title must possess the highest visual prominence. |
| `motion/no-transition` | **MOTION** | `-3 pts` | Interactive Elements Without Transition | Instant state jumps feel harsh and unpolished compared to natural easing. |
| `motion/missing-prefers-reduced-motion` | **MOTION** | `-3 pts` | Missing prefers-reduced-motion Media Query | Failing to honor vestibular motion reduction preferences causes physical discomfort. |
| `a11y/focus-visible` | **A11Y** | `HARD FAIL` | Stripped Outline Without :focus-visible | Removing focus outlines traps keyboard and assistive technology users. |
| `a11y/tap-target-size` | **A11Y** | `HARD FAIL` | Interactive Tap Target < 44×44px | Small buttons cause mis-taps on touch devices. |
| `a11y/missing-alt-text` | **A11Y** | `HARD FAIL` | Missing Image Alt Attribute | Images without alt attributes prevent screen readers from conveying content. |
| `a11y/icon-button-missing-aria` | **A11Y** | `HARD FAIL` | Icon-Only Button Missing Aria Label | Buttons containing only icons are completely silent to screen readers without aria-label. |
| `responsive/horizontal-overflow` | **RESPONSIVE** | `-6 pts` | Mobile Horizontal Scroll Overflow at 390px | Horizontal scrollbars break mobile viewport usability. |
| `slop/inter-roboto-default` | **SLOP** | `-8 pts` | Inter/Roboto Default Without Display Face | Using Inter or Roboto everywhere without a distinctive display face is the #1 tell of generic AI slop. |
| `slop/purple-blue-gradient` | **SLOP** | `-8 pts` | Purple-to-Blue Gradient Hero | The generic purple/indigo/pink gradient hero is an overused cliché from 2021 SaaS mockups. |
| `slop/centered-hero-3-cards` | **SLOP** | `-8 pts` | Centered Hero + Exactly 3 Equal Feature Cards | The centered hero leading into 3 equal cards is the defining layout trope of template slop. |
| `slop/emoji-icons` | **SLOP** | `-8 pts` | Raw Emoji Used as Feature Icons | Using 🚀, ⚡️, 🔒 as feature icons looks like a hasty hackathon prototype, not production UI. |
| `slop/uniform-radius` | **SLOP** | `-8 pts` | Uniform Border-Radius Everywhere | Putting 8px border-radius on every badge, button, card, and modal destroys spatial hierarchy. |
| `slop/drop-shadow-everywhere` | **SLOP** | `-8 pts` | Diffuse Drop Shadows on Every Surface | Slapping box-shadow on every element creates muddy, ungrounded surfaces. |
| `slop/generic-cta-pair` | **SLOP** | `-8 pts` | Generic "Get Started" / "Learn More" CTA | Generic CTAs fail to communicate domain value. |
| `slop/gray-on-gray` | **SLOP** | `-8 pts` | Muted Gray-on-Gray Text | Tailwind slate-500 (#64748b) text on white or dark surfaces produces washed-out, lifeless UI. |

---

## Detailed Rule Specifications

### `type/distinct-sizes` — Typographic Scale Entropy

- **Category**: `TYPE`
- **Penalty**: `-3 pts`
- **Why It Matters**: Using more than 7 distinct font sizes destroys typographic rhythm and hierarchy.

#### Anti-Pattern (Fails Check)
```css
font-size: 13px, 14px, 15px, 17px, 19px, 22px, 28px, 34px, 42px, 52px;
```

#### Compliant Fix (Passes Check)
```css
Constrain sizes to a 5-step modular scale: 12px, 14px, 18px, 24px, 36px, 48px.
```

---

### `type/off-scale` — Off-Scale Font Size

- **Category**: `TYPE`
- **Penalty**: `-2 pts`
- **Why It Matters**: Arbitrary font sizes disrupt mathematical visual cadence.

#### Anti-Pattern (Fails Check)
```css
font-size: 17px; /* arbitrary non-scale size */
```

#### Compliant Fix (Passes Check)
```css
font-size: 16px; or font-size: 18px;
```

---

### `type/line-height` — Body Text Line-Height Out of Bounds

- **Category**: `TYPE`
- **Penalty**: `-3 pts`
- **Why It Matters**: Line-height below 1.2 chokes text legibility; above 1.7 makes sentences drift apart.

#### Anti-Pattern (Fails Check)
```css
line-height: 1.0; or line-height: 2.2;
```

#### Compliant Fix (Passes Check)
```css
line-height: 1.5; to 1.65; for reading paragraphs.
```

---

### `type/measure` — Unconstrained Reading Measure

- **Category**: `TYPE`
- **Penalty**: `-3 pts`
- **Why It Matters**: Paragraphs wider than 75ch cause eye fatigue when scanning to the next line.

#### Anti-Pattern (Fails Check)
```css
p { width: 100%; /* stretches across 1400px screen */ }
```

#### Compliant Fix (Passes Check)
```css
p { max-width: 65ch; }
```

---

### `type/text-wrap-balance` — Missing Heading Text-Wrap Balance

- **Category**: `TYPE`
- **Penalty**: `-2 pts`
- **Why It Matters**: Unbalanced headlines leave orphan words on trailing lines.

#### Anti-Pattern (Fails Check)
```css
h1 { font-size: 48px; } /* leaves single word on second line */
```

#### Compliant Fix (Passes Check)
```css
h1 { font-size: 48px; text-wrap: balance; }
```

---

### `color/contrast-ratio` — WCAG AA Insufficient Contrast

- **Category**: `COLOR`
- **Penalty**: `-4 pts`
- **Why It Matters**: Low contrast impairs legibility and fails international accessibility standards.

#### Anti-Pattern (Fails Check)
```css
color: #94a3b8; background: #ffffff; /* contrast ratio 2.4:1 */
```

#### Compliant Fix (Passes Check)
```css
color: #1e293b; background: #ffffff; /* contrast ratio 12.6:1 */
```

---

### `color/entropy` — Palette Color Entropy

- **Category**: `COLOR`
- **Penalty**: `-3 pts`
- **Why It Matters**: Too many one-off hex colors dilute visual identity and consistency.

#### Anti-Pattern (Fails Check)
```css
Scattering 25 different hex codes across random components.
```

#### Compliant Fix (Passes Check)
```css
Consolidate into 6-10 semantic tokens defined in contract.json.
```

---

### `color/pure-black-surface` — Pure #000000 on Large Surfaces

- **Category**: `COLOR`
- **Penalty**: `-2 pts`
- **Why It Matters**: Stark pure black (#000) causes OLED halation and feels artificial compared to warm darks.

#### Anti-Pattern (Fails Check)
```css
body { background: #000000; }
```

#### Compliant Fix (Passes Check)
```css
body { background: #09090b; } or oklch(0.18 0.02 240);
```

---

### `color/saturation-variance` — Excessive High-Saturation Colors

- **Category**: `COLOR`
- **Penalty**: `-3 pts`
- **Why It Matters**: Competing neon colors fight for attention and fatigue the human eye.

#### Anti-Pattern (Fails Check)
```css
Hot pink buttons + neon green pills + electric blue cards all in one viewport.
```

#### Compliant Fix (Passes Check)
```css
Neutral surfaces with a single, calibrated high-chroma accent token.
```

---

### `space/off-grid` — Off-Grid Margins or Paddings

- **Category**: `SPACE`
- **Penalty**: `-3 pts`
- **Why It Matters**: Spacing not aligned to a 4px/8px base grid creates subconscious misalignment.

#### Anti-Pattern (Fails Check)
```css
padding: 13px 27px; margin-top: 15px;
```

#### Compliant Fix (Passes Check)
```css
padding: 16px 24px; margin-top: 16px;
```

---

### `rhythm/uniform-section-padding` — Uniform Section Padding Slop Tell

- **Category**: `RHYTHM`
- **Penalty**: `-4 pts`
- **Why It Matters**: Applying identical 100px padding to every section makes sites feel like cookie-cutter templates.

#### Anti-Pattern (Fails Check)
```css
section { padding: 100px 20px; } everywhere.
```

#### Compliant Fix (Passes Check)
```css
Vary padding by section importance: hero 96px, features 64px, CTA 48px.
```

---

### `hierarchy/h1-not-largest` — h1 Heading Not Largest

- **Category**: `HIERARCHY`
- **Penalty**: `-3 pts`
- **Why It Matters**: The main page title must possess the highest visual prominence.

#### Anti-Pattern (Fails Check)
```css
h1 { font-size: 24px; } h2 { font-size: 32px; }
```

#### Compliant Fix (Passes Check)
```css
h1 { font-size: 48px; } h2 { font-size: 28px; }
```

---

### `motion/no-transition` — Interactive Elements Without Transition

- **Category**: `MOTION`
- **Penalty**: `-3 pts`
- **Why It Matters**: Instant state jumps feel harsh and unpolished compared to natural easing.

#### Anti-Pattern (Fails Check)
```css
button:hover { background: #4338ca; } /* instant jump */
```

#### Compliant Fix (Passes Check)
```css
button { transition: background-color 0.18s ease; }
```

---

### `motion/missing-prefers-reduced-motion` — Missing prefers-reduced-motion Media Query

- **Category**: `MOTION`
- **Penalty**: `-3 pts`
- **Why It Matters**: Failing to honor vestibular motion reduction preferences causes physical discomfort.

#### Anti-Pattern (Fails Check)
```css
CSS animations declared without any @media (prefers-reduced-motion).
```

#### Compliant Fix (Passes Check)
```css
@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
```

---

### `a11y/focus-visible` — Stripped Outline Without :focus-visible

- **Category**: `A11Y`
- **Penalty**: `HARD FAIL`
- **Why It Matters**: Removing focus outlines traps keyboard and assistive technology users.

#### Anti-Pattern (Fails Check)
```css
* { outline: none; }
```

#### Compliant Fix (Passes Check)
```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

---

### `a11y/tap-target-size` — Interactive Tap Target < 44×44px

- **Category**: `A11Y`
- **Penalty**: `HARD FAIL`
- **Why It Matters**: Small buttons cause mis-taps on touch devices.

#### Anti-Pattern (Fails Check)
```css
button { padding: 4px 8px; font-size: 11px; height: 24px; }
```

#### Compliant Fix (Passes Check)
```css
button { min-height: 44px; min-width: 44px; padding: 10px 18px; }
```

---

### `a11y/missing-alt-text` — Missing Image Alt Attribute

- **Category**: `A11Y`
- **Penalty**: `HARD FAIL`
- **Why It Matters**: Images without alt attributes prevent screen readers from conveying content.

#### Anti-Pattern (Fails Check)
```css
<img src="hero.png">
```

#### Compliant Fix (Passes Check)
```css
<img src="hero.png" alt="Aomori mountain ridges at dawn">
```

---

### `a11y/icon-button-missing-aria` — Icon-Only Button Missing Aria Label

- **Category**: `A11Y`
- **Penalty**: `HARD FAIL`
- **Why It Matters**: Buttons containing only icons are completely silent to screen readers without aria-label.

#### Anti-Pattern (Fails Check)
```css
<button><svg ...></button>
```

#### Compliant Fix (Passes Check)
```css
<button aria-label="Toggle playback"><svg ...></button>
```

---

### `responsive/horizontal-overflow` — Mobile Horizontal Scroll Overflow at 390px

- **Category**: `RESPONSIVE`
- **Penalty**: `-6 pts`
- **Why It Matters**: Horizontal scrollbars break mobile viewport usability.

#### Anti-Pattern (Fails Check)
```css
.grid { width: 600px; } on mobile screens.
```

#### Compliant Fix (Passes Check)
```css
.grid { width: 100%; max-width: 100%; grid-template-columns: 1fr; }
```

---

### `slop/inter-roboto-default` — Inter/Roboto Default Without Display Face

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Using Inter or Roboto everywhere without a distinctive display face is the #1 tell of generic AI slop.

#### Anti-Pattern (Fails Check)
```css
* { font-family: "Inter", sans-serif; }
```

#### Compliant Fix (Passes Check)
```css
Pair body Inter with a striking serif (Newsreader, Charter) or mono (Space Mono).
```

---

### `slop/purple-blue-gradient` — Purple-to-Blue Gradient Hero

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: The generic purple/indigo/pink gradient hero is an overused cliché from 2021 SaaS mockups.

#### Anti-Pattern (Fails Check)
```css
background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
```

#### Compliant Fix (Passes Check)
```css
Use deep warm neutrals, photographic plates, or monochromatic editorial surfaces.
```

---

### `slop/centered-hero-3-cards` — Centered Hero + Exactly 3 Equal Feature Cards

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: The centered hero leading into 3 equal cards is the defining layout trope of template slop.

#### Anti-Pattern (Fails Check)
```css
text-align: center; hero followed by grid-template-columns: repeat(3, 1fr);
```

#### Compliant Fix (Passes Check)
```css
Asymmetric 7fr/5fr hero, staggered editorial spread, or dense telemetry grid.
```

---

### `slop/emoji-icons` — Raw Emoji Used as Feature Icons

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Using 🚀, ⚡️, 🔒 as feature icons looks like a hasty hackathon prototype, not production UI.

#### Anti-Pattern (Fails Check)
```css
<div class="card-icon">⚡️</div><h3>Lightning Fast</h3>
```

#### Compliant Fix (Passes Check)
```css
Use clean inline SVGs, geometric marks, or typographic numeral indicators.
```

---

### `slop/uniform-radius` — Uniform Border-Radius Everywhere

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Putting 8px border-radius on every badge, button, card, and modal destroys spatial hierarchy.

#### Anti-Pattern (Fails Check)
```css
border-radius: 8px; on every single component.
```

#### Compliant Fix (Passes Check)
```css
Strict 0px Swiss borders or mathematically nested radii (e.g. outer 12px, inner 8px).
```

---

### `slop/drop-shadow-everywhere` — Diffuse Drop Shadows on Every Surface

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Slapping box-shadow on every element creates muddy, ungrounded surfaces.

#### Anti-Pattern (Fails Check)
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); on all cards and buttons.
```

#### Compliant Fix (Passes Check)
```css
Define surface boundaries with crisp 1px borders or subtle contrast shifts.
```

---

### `slop/generic-cta-pair` — Generic "Get Started" / "Learn More" CTA

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Generic CTAs fail to communicate domain value.

#### Anti-Pattern (Fails Check)
```css
<button>Get Started Free</button> <button>Learn More</button>
```

#### Compliant Fix (Passes Check)
```css
<button>Deploy Cluster</button> <button>Explore Telemetry</button>
```

---

### `slop/gray-on-gray` — Muted Gray-on-Gray Text

- **Category**: `SLOP`
- **Penalty**: `-8 pts`
- **Why It Matters**: Tailwind slate-500 (#64748b) text on white or dark surfaces produces washed-out, lifeless UI.

#### Anti-Pattern (Fails Check)
```css
color: #64748b; background: white;
```

#### Compliant Fix (Passes Check)
```css
color: #1e293b; or high-contrast ink neutrals.
```

---

## Build-Time Distilled Rules (from `rules.json`)

These rules are distilled from permissive upstream design repositories and evaluated during linting and contract generation:

| Rule ID | Category | Weight | Source(s) | Imperative Statement |
| :--- | :--- | :--- | :--- | :--- |
| `color/avoid-pure-black` | COLOR | 3 | pbakaus/impeccable, nextlevelbuilder/ui-ux-pro-max-skill | Avoid pure #000000 background surfaces in dark mode; use warm dark neutrals instead. |
| `a11y/focus-visible-required` | A11Y | 5 | pbakaus/impeccable | Never remove focus outlines without providing a high-contrast 2px focus-visible indicator. |
| `a11y/tap-target-min-size` | A11Y | 5 | pbakaus/impeccable | Ensure interactive touch targets measure at least 44 by 44 pixels. |
| `color/wcag-aa-contrast` | COLOR | 5 | nextlevelbuilder/ui-ux-pro-max-skill | Maintain at least 4.5 to 1 contrast ratio for normal text against background. |
| `motion/honor-reduced-motion` | MOTION | 5 | Leonxlnx/taste-skill | Include prefers-reduced-motion media query zeroing transitions for users with vestibular sensitivity. |
| `color/monochromatic-neutral-surfaces` | COLOR | 4 | Leonxlnx/taste-skill | Avoid vibrant multi-color gradients; use monochromatic ink surfaces with single subtle accent. |
| `layout/asymmetric-hero-grid` | LAYOUT | 4 | Leonxlnx/taste-skill | Use asymmetric two-column layouts like 7fr to 5fr rather than centered heroes. |
| `layout/no-centered-hero-3-cards` | LAYOUT | 4 | pbakaus/impeccable | Avoid centered heroes followed by exactly three identical width feature cards. |
| `slop/inter-roboto-default` | SLOP | 4 | pbakaus/impeccable | Pair default sans-serif body fonts with a distinctive editorial serif or monospace display face. |
| `slop/purple-blue-gradient` | SLOP | 4 | pbakaus/impeccable | Avoid purple-to-blue linear gradients on hero background surfaces. |
| `space/base-grid-alignment` | SPACE | 4 | nextlevelbuilder/ui-ux-pro-max-skill | Align all margins, paddings, and gap distances to multiples of four pixels. |
| `surface/zero-radius-authority` | SURFACE | 4 | Leonxlnx/taste-skill | Enforce strict zero pixel border-radius on buttons and cards for precise architectural authority. |
| `type/body-line-height` | TYPE | 4 | Leonxlnx/taste-skill | Keep body paragraph line-height between 1.4 and 1.65 to ensure comfortable reading cadence. |
| `type/max-reading-measure` | TYPE | 4 | Leonxlnx/taste-skill | Constrain text paragraph widths to a maximum of 65 characters to prevent eye fatigue. |
| `type/modular-scale` | TYPE | 4 | nextlevelbuilder/ui-ux-pro-max-skill | Limit typography to at most seven distinct sizes on a 1.25 or 1.333 scale. |
| `color/mesh-gradient-accents` | COLOR | 3 | nextlevelbuilder/ui-ux-pro-max-skill | Use multi-stop mesh gradients on hero cards to create high-energy modern visual atmosphere. |
| `surface/no-diffuse-shadows` | SURFACE | 3 | pbakaus/impeccable | Replace diffuse box-shadows on all surfaces with crisp 1px borders or subtle contrast shifts. |
| `surface/rounded-card-radius` | SURFACE | 3 | nextlevelbuilder/ui-ux-pro-max-skill | Apply 12px to 16px soft border-radius on all interactive cards. |
| `type/heading-wrap-balance` | TYPE | 3 | pbakaus/impeccable | Apply text-wrap: balance to all headings to eliminate trailing orphan words. |
| `type/tabular-numbers` | TYPE | 3 | nextlevelbuilder/ui-ux-pro-max-skill | Use font-variant-numeric: tabular-nums on all numerical data tables and metrics. |

---
*Auto-generated by `scripts/generate-lint-docs.mjs` from check files.*
