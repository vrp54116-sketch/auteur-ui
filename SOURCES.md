# SOURCES.md

## Upstream Sources & Attributions

Every font and design system rule distilled into `auteur-ui` is recorded here with its upstream author, license, and provenance. Only permissive open-source licenses (SIL OFL 1.1, MIT, Apache 2.0) are utilized.

---

## Font Registry

All fonts specified in `looks/` are authentic, open-source typography released under the SIL Open Font License 1.1 (OFL-1.1). They are freely available via Google Fonts and can be self-hosted without runtime network dependencies.

| Font Name | Style / Category | Designers / Foundry | License | Upstream Specimen | Used in Look(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Newsreader** | Variable Serif (opsz 6–72) | Production Type (Jean-Baptiste Levée) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Newsreader) | `nocturne-editorial` |
| **Source Serif 4** | Variable Serif (opsz 8–60) | Adobe (Frank Grießhammer) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Source+Serif+4) | `nocturne-editorial` |
| **JetBrains Mono** | Monospace | JetBrains (Philipp Nurullin, Konstantin Bulenkov) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | `nocturne-editorial`, `terminal-luxe` |
| **Inter** | Variable Neo-Grotesk | Rasmus Andersson | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Inter) | `swiss-utility` |
| **Space Mono** | Fixed-width Grotesk Mono | Colophon Foundry | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Space+Mono) | `swiss-utility`, `kinetic-pop`, `paper-editorial` |
| **Syne** | Geometric Display | Lucas Descroix, Arman Mohtadji (Bonjour Monde) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Syne) | `kinetic-pop` |
| **Plus Jakarta Sans** | Geometric Sans | Tokotype (Gumpita Rahayu) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | `kinetic-pop` |
| **Cormorant Garamond** | Classical High-Contrast Serif | Christian Thalmann (Catharsis Fonts) | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond) | `paper-editorial` |
| **EB Garamond** | Renaissance Humanist Serif | Georg Duffner, Octavio Pardo | SIL OFL 1.1 | [Google Fonts](https://fonts.google.com/specimen/EB+Garamond) | `paper-editorial` |

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

## Modular Design Upstream Lineages (`modules/*.md`)

- **`typography.md`**: Typographic modular scale derived from Robert Bringhurst's *The Elements of Typographic Style* (1992) and variable font optical sizing specifications.
- **`color.md`**: Perceptually uniform lightness and chroma rules derived from Björn Ottosson's OKLCH color model (2020) and W3C WCAG 2.1 relative luminance standards.
- **`layout.md`**: Spatial grid systems based on Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1961) and modern CSS subgrid specifications.
- **`motion.md`**: Natural easing transitions derived from Disney's 12 basic principles of animation and Robert Penner's easing equations.
- **`sound.md`**: Synthesized audio blips compiled with WebAudio oscillators and noise buffers; zero external audio samples or proprietary binaries.
- **`components.md`**: Surface tokens distilled from open design tokens and component specifications under MIT licenses.

