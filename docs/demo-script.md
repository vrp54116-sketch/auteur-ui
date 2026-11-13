# 30-Second Terminal Demo Script

This script outlines the 30-second terminal workflow demonstrated in the `auteur-ui` walkthrough.

```bash
# 00:00 — Initialize auteur-ui in an existing or new project
$ npx auteur-ui init
======================================================
             auteur-ui System Installer
======================================================
Target Directory : /workspace/my-music-app
Target Agent     : claude (auto-detected)
------------------------------------------------------
Installation Complete. Managed files:
  + .claude/skills/auteur-ui/SKILL.md (463 tokens)
  + .claude/commands/auteur-ui.md (111 tokens)
  + .auteur-ui/assets/ (motion, sound, type, css)
======================================================

# 00:08 — Trigger the skill in Claude Code or your agent
$ /auteur-ui build a music streaming player like Spotify
[auteur-ui] Analyzing domain: "audio streaming, player controls, library"
[auteur-ui] Synthesizing 3 candidate aesthetic directions:
  [1] terminal-luxe    : Monospace CRT dark mode, phosphor green accent, dense telemetry
  [2] nocturne-editorial: Warm dark editorial, serif headings, print cadence
  [3] kinetic-pop      : High-chroma punchy surfaces, oversized numerals, spring physics

# 00:15 — Local headless preview renders contact sheet in 2.8s
[auteur-ui] Rendered contact sheet in 2840ms.
[auteur-ui] Opening local preview in browser...
[auteur-ui] Enter choice (1, 2, or 3): 1

# 00:20 — Agent locks taste contract without reading essays
[auteur-ui] Locked contract to .auteur-ui/contract.json (264 tokens)
[auteur-ui] Assembling components from .auteur-ui/assets/...
  ✓ Imported tokens: oklch(0.18 0.02 240), phosphor-green oklch(0.85 0.22 142)
  ✓ Bound WAAPI ticker for timecode display
  ✓ Bound Web Audio click kit for play/pause toggles

# 00:26 — Numerical Taste Linter runs verification
$ npx auteur-ui lint index.html
======================================================
           auteur-ui Taste Linter (v0.1.0)
======================================================
Target: index.html (Headless Chromium 1200px + 390px)

 [✓] Color Contrast (WCAG AA)        : PASS (14.2:1)
 [✓] Typographic Scale Modular Ratio : PASS (1.25 scale, 5 steps)
 [✓] 4px Grid Alignment              : PASS (0 off-grid margins)
 [✓] Touch Target Bounds             : PASS (Min: 48x48px)
 [✓] AI-Slop Anti-Patterns           : ZERO DETECTED
     - No purple-blue gradient hero
     - No centered hero with 3 equal cards
     - No ungrounded diffuse drop shadows
     - Distinctive display typography

------------------------------------------------------
Result: PASS (Score: 94/100) — Ready for Production!
======================================================
```

