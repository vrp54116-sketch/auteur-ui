# SOURCES.md

## Upstream Sources & Attributions

Every font and design system rule distilled into `auteur-ui` is recorded here with its upstream author, license, and provenance. Only permissive open-source licenses (SIL OFL 1.1, MIT, Apache 2.0) are utilized.

---

## Font Registry

All fonts specified in `looks/` and `code/type/pairings.json` are authentic, open-source typography released under the SIL Open Font License 1.1 (OFL-1.1). They are freely available via Google Fonts and can be self-hosted without runtime network dependencies.

| Font Name | Style / Category | Designers / Foundry | License | Upstream Specimen | Used in Look(s) / Pairings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Newsreader** | Variable Serif (opsz 6–72) | Production Type (Jean-Baptiste Levée) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Newsreader) | `nocturne-editorial` |
| **Source Serif 4** | Variable Serif (opsz 8–60) | Adobe (Frank Grießhammer) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Source+Serif+4) | `nocturne-editorial` |
| **JetBrains Mono** | Monospace | JetBrains (Philipp Nurullin, Konstantin Bulenkov) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | `nocturne-editorial`, `terminal-luxe`, `epilogue-jetbrains` |
| **Inter** | Variable Neo-Grotesk | Rasmus Andersson | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Inter) | `swiss-utility`, `fraunces-inter`, `bricolage-inter` |
| **Space Mono** | Fixed-width Grotesk Mono | Colophon Foundry | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Space+Mono) | `swiss-utility`, `kinetic-pop`, `paper-editorial`, `space-grotesk-mono` |
| **Syne** | Geometric Display | Lucas Descroix, Arman Mohtadji (Bonjour Monde) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Syne) | `kinetic-pop`, `syne-jakarta` |
| **Plus Jakarta Sans** | Geometric Sans | Tokotype (Gumpita Rahayu) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | `kinetic-pop`, `syne-jakarta`, `outfit-jakarta` |
| **Cormorant Garamond** | Classical High-Contrast Serif | Christian Thalmann (Catharsis Fonts) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond) | `paper-editorial`, `cormorant-proza` |
| **EB Garamond** | Renaissance Humanist Serif | Georg Duffner, Octavio Pardo | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/EB+Garamond) | `paper-editorial`, `cinzel-garamond` |
| **Fraunces** | Variable Display Serif (opsz 9–144, SOFT, WONK) | Undercase Type (Phaedra Charles, Flavia Zimbardi) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Fraunces) | `fraunces-inter` |
| **Proza Libre** | Humanist Sans | Bureau Roffa (Jasper de Waard) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Proza+Libre) | `cormorant-proza` |
| **Space Grotesk** | Proportional Technical Display | Florian Karsten | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk) | `space-grotesk-mono` |
| **DM Serif Display** | Editorial Display Serif | Colophon Foundry | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/DM+Serif+Display) | `dm-serif-sans` |
| **DM Sans** | Variable Sans (opsz 9–40) | Colophon Foundry, Jonny Pinhorn | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/DM+Sans) | `dm-serif-sans` |
| **Playfair Display** | High-Contrast Editorial Display | Claus Eggers Sørensen | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Playfair+Display) | `playfair-source-sans` |
| **Source Sans 3** | Clean UI Sans | Adobe (Paul D. Hunt) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Source+Sans+3) | `playfair-source-sans` |
| **Outfit** | Geometric Sans | Rodrigo Fuenzalida | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Outfit) | `outfit-jakarta` |
| **Bricolage Grotesque** | Variable Grotesque (opsz 12–96, wdth 75–100) | Mathieu Triay | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Bricolage+Grotesque) | `bricolage-inter` |
| **Instrument Serif** | Elegant Editorial Display | Rodrigo Fuenzalida, Jordan Bell (Instrument) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Instrument+Serif) | `instrument-serif-sans` |
| **Instrument Sans** | Modern Grotesk (wdth 75–100) | Rodrigo Fuenzalida, Jordan Bell (Instrument) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Instrument+Sans) | `instrument-serif-sans` |
| **Cinzel** | Classical Inscriptional Serif | Natanael Gama | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Cinzel) | `cinzel-garamond` |
| **Epilogue** | Modern Variable Sans | Tyler Finck (Etcetera Type Co) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Epilogue) | `epilogue-jetbrains` |

---

## Design Lineage & Aesthetic References

No proprietary code or copyrighted web assets are bundled at runtime. Aesthetic decisions are compiled from established design philosophies:

1. **`nocturne-editorial`**:
   - Lineage: Classical print publication design, warm-temperature dark modes, optical text scaling.
   - Reference anchors: *The Paris Review*, *Emergence Magazine*, *Aeon*.
2. **`swiss-utility`**:
   - Lineage: International Typographic Style (Max Bill, Josef Müller-Brockmann, Dieter Rams). 0px border radii, visible grid lines, stark mathematical hierarchy.
   - Reference anchors: *Standards Manual*, *Braun Archives*, *Vignelli Center*.
3. **`kinetic-pop`**:
   - Lineage: Neo-brutalism, tactile spring physics, playful consumer interactions, maximalist color blocking.
   - Reference anchors: *Pitch*, *Poolsuite*, *Teenage Engineering*.
4. **`terminal-luxe`**:
   - Lineage: Cathode-Ray Tube (CRT) terminal phosphor palettes (P1 green, amber amber), monospaced grid alignment, discrete frame stepping.
   - Reference anchors: *Warp*, *Raycast*, *Linear*.
5. **`paper-editorial`**:
   - Lineage: Book spread composition, unbleached cotton paper stock, generous editorial margins, terracotta wax seal accents.
   - Reference anchors: *The New Yorker*, *Kinfolk*, *Cereal Magazine*.

---

## Modular Design Upstream Lineages (`modules/*.md` and `code/`)

- **`typography.md` & `code/type/`**: Typographic modular scale derived from Robert Bringhurst's *The Elements of Typographic Style* (1992) and variable font optical sizing specifications. 12 authentic OFL pairings verified on Google Fonts.
- **`color.md` & `code/css/tokens.css`**: Perceptually uniform lightness and chroma rules derived from Björn Ottosson's OKLCH color model (2020) and W3C WCAG 2.1 relative luminance standards.
- **`layout.md` & `code/css/rhythm.css`**: Spatial grid systems based on Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1961) and modern CSS subgrid specifications.
- **`motion.md` & `code/motion/`**: Disney's 12 basic principles of animation and Robert Penner's easing equations compiled into 8 Web Animations API (WAAPI) zero-dependency primitives.
- **`sound.md` & `code/sound/`**: Synthesized procedural audio blips compiled with WebAudio oscillators and noise buffers (zero external audio samples or proprietary binaries).
- **`components.md` & `code/css/`**: Surface tokens distilled from open design tokens and component specifications under MIT and SIL OFL 1.1 licenses.

---

## Agent Adapters & Discovery Specifications

- **Claude Code**: Tool and skill discovery standards (`.claude/skills/<name>/SKILL.md` and `.claude/commands/<command>.md`).
- **OpenCode**: Skill directory (`.opencode/skills/`), commands (`.opencode/commands/`), and `opencode.json` configuration schema.
- **Cursor**: Rule specification (`.cursor/rules/<name>.mdc`) with YAML frontmatter schema (`description`, `globs`, `alwaysApply`).
- **AGENTS.md**: Open cross-agent context instruction standard supported by Codex, Antigravity, and generic AI coding assistants with idempotent delimiter fences (`<!-- auteur-ui:start -->` ... `<!-- auteur-ui:end -->`).

## Distilled Upstream Design Intelligence Skills (Phase 9 Pipeline)

The following open-source design skills are distilled at build time in CI into deterministic executable rules (`rules.json`) and subjective guidance (`advisory.md`). Verified with permissive licenses (MIT / Apache-2.0).

| Upstream Repository | Pinned Commit | License | Extracted Facets | Attribution |
| :--- | :--- | :--- | :--- | :--- |
| **[pbakaus/impeccable](https://github.com/pbakaus/impeccable)** | `9f32b6e` | Apache-2.0 | rules, tokens | Paul Bakaus (pbakaus/impeccable) - Apache-2.0. Anti-slop and visual system linter rules. |
| **[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** | `4b7a1e0` | MIT | rules, tokens | NextLevelBuilder (nextlevelbuilder/ui-ux-pro-max-skill) - MIT. Color systems, typography ramps, and chart patterns. |
| **[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)** | `62e15bc` | MIT | rules, ideas | Leonxlnx (Leonxlnx/taste-skill) - MIT. Design taste direction, zero-radius authority, and layout hierarchy. |

### Active Distilled Rule Attribution

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

