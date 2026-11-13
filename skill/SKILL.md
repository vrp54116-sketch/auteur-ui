---
name: auteur-ui
description: Designs and redesigns any app, dashboard, landing page, or UI to make it look authentic and avoid generic styling using curated typography, animations, and aesthetic polish.
---

### PROTOCOL

1. If `.auteur-ui/contract.json` exists -> read it, skip to BUILD.
2. Classify task: app | dashboard | marketing | editorial | tool.
3. Run `npx auteur-ui brief` to write `.auteur-ui/brief.json`.
4. Emit `.auteur-ui/directions.json` (<=400 tokens, 3-5 directions, use `looks/index.json` ids). Then run `npx auteur-ui preview --open`.
5. STOP. Ask the human to reply with a number. Do not build yet.
6. On reply: `npx auteur-ui lock <id>` writes `.auteur-ui/contract.json`.
7. Load ONLY the modules named by the contract. Never load all.
8. BUILD from contract + `code/` assets. Copy assets, do not reinvent.
9. GATE: `npx auteur-ui lint --json`. Fix violations. Max 2 iterations. Only then one cropped screenshot if a visual issue remains.
10. Report score + tokens. Refuse to declare done below 80.

### MODULES

| Path | When to load | Approx tokens |
| :--- | :--- | :--- |
| `modules/typography.md` | Display or text font hierarchy, scales, or optical sizing | 250 |
| `modules/color.md` | Palette tokens, OKLCH roles, light/dark contrast | 250 |
| `modules/layout.md` | Spatial rhythm, grid structures, asymmetry | 250 |
| `modules/motion.md` | Easing curves, duration triplets, stagger physics | 250 |
| `modules/sound.md` | Audio cues, synthesizer blips, volume levels | 200 |
| `modules/components.md` | Buttons, cards, surfaces, inputs, status tags | 300 |

