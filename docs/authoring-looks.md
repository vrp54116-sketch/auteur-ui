# Authoring Custom Looks

A **Look** in `auteur-ui` is a complete, pre-compiled aesthetic identity. It packages typography ramps, an OKLCH color palette, spatial rhythm, border-radius strategy, motion physics, layout asymmetry, and sound design into a single deterministic schema.

---

## Look Directory Structure

All looks live in the `looks/` directory:

```
looks/
├── index.json                  # Look registry catalog
├── nocturne-editorial/
│   ├── look.json               # Schema-validated look definition
│   └── README.md               # Design intent, pairing notes, and use cases
├── swiss-utility/
│   ├── look.json
│   └── README.md
└── ...
```

---

## The `look.json` Schema

Every `look.json` file is validated against `LookSchema` in `packages/schema/look.ts`.

### Full Example (`looks/swiss-utility/look.json`):

```json
{
  "id": "swiss-utility",
  "name": "Swiss Utility",
  "description": "High-density functionalist design with neutral grotesk, sharp 0px corners, and rigorous grid discipline.",
  "tags": ["light", "grotesk", "sharp", "dense", "minimal", "swiss"],
  "bestFor": "Technical documentation, dev tools, reference tables, data density",
  "type": {
    "display": "Geist, -apple-system, BlinkMacSystemFont, sans-serif",
    "text": "Geist, -apple-system, BlinkMacSystemFont, sans-serif",
    "mono": "Geist Mono, ui-monospace, SFMono-Regular, monospace",
    "scale": 1.25,
    "opticalSizing": "auto"
  },
  "palette": {
    "id": "swiss-mono",
    "mode": "light",
    "tokens": {
      "bg": "oklch(0.985 0 0)",
      "surface": "oklch(1 0 0)",
      "surface-raised": "oklch(0.96 0 0)",
      "border": "oklch(0.88 0 0)",
      "border-subtle": "oklch(0.93 0 0)",
      "fg": "oklch(0.18 0 0)",
      "fg-muted": "oklch(0.48 0 0)",
      "accent": "oklch(0.55 0.22 25)"
    }
  },
  "space": {
    "base": 4,
    "rhythm": "dense"
  },
  "radius": {
    "strategy": "sharp",
    "values": {
      "card": 0,
      "button": 0,
      "input": 0,
      "badge": 0
    }
  },
  "motion": {
    "personality": "restrained",
    "ease": "cubic-bezier(0.16, 1, 0.3, 1)",
    "dur": [120, 180, 240],
    "stagger": 25
  },
  "sound": {
    "kit": "minimal-click",
    "events": ["click", "toggle"],
    "volume": 0.2,
    "enabled": true
  },
  "layout": {
    "grid": "dense-12",
    "asymmetry": 0.15
  }
}
```

---

## Schema Field Breakdown

### 1. Typography (`type`)
- `display`: CSS font stack for large headings.
- `text`: CSS font stack for body paragraphs.
- `mono` *(optional)*: Font stack for code, tabular numbers, or metrics.
- `scale`: Modular scale ratio (e.g. `1.2` for compact, `1.25` for major third, `1.333` for perfect fourth).
- `opticalSizing`: `"auto"` or boolean flag.

### 2. Color Palette (`palette`)
All color tokens **must** be expressed in valid OKLCH color strings:
- Example: `"oklch(0.20 0.03 260)"` (Lightness, Chroma, Hue).
- Avoid pure `#000000` on surfaces (use warm dark neutrals like `oklch(0.18 0.02 240)`).
- Provide semantic tokens: `bg`, `surface`, `border`, `fg`, `fg-muted`, `accent`.

### 3. Space & Radius (`space`, `radius`)
- `space.base`: Strict grid base, either `4` or `8`.
- `radius.strategy`: `"sharp"` (0px everywhere), `"soft"` (curved 12px-16px), or `"mixed"` (hierarchically nested).
- `radius.values`: Number or string values mapped to `card`, `button`, `input`, and `badge`.

### 4. Motion (`motion`)
- `personality`: `"restrained"`, `"editorial"`, `"kinetic"`, or `"playful"`.
- `ease`: Valid CSS cubic-bezier or easing keyword.
- `dur`: Tuple of three duration stages in milliseconds `[fast, normal, slow]`.
- `stagger`: Milliseconds offset between consecutive list items.

### 5. Sound (`sound`)
- `kit`: One of the built-in procedural synthesizer kits: `"minimal-click"`, `"glass"`, `"analog-tape"`, `"soft-mechanical"`.
- `volume`: Gain setting between `0.0` and `1.0`.

---

## Validation & Testing

Run the automated look verification test suite:

```bash
pnpm test tests/looks.test.ts
```

This verifies:
1. Every look matches `LookSchema`.
2. All color tokens parse as valid OKLCH colors.
3. Every look listed in `looks/index.json` has a corresponding directory with `look.json` and `README.md`.
4. Typography scale and space ratios strictly observe token budgets.
