# modules/sound.md

Synthesizer sound profile and audio feedback rules from contract.

## Sound Kits
- `minimal-click`: 1200Hz sine ping, 18ms decay, volume 0.08
- `bubble-pop`: 450Hz to 850Hz pitch ramp, 40ms decay, volume 0.12
- `mechanical-switch`: 220Hz square pulse + filtered noise click, 24ms decay, volume 0.10
- `warm-thud`: 95Hz low sine thump, 80ms decay, volume 0.15
- `paper-rustle`: Bandpassed brown noise swell, 60ms decay, volume 0.06

## Invariants
1. Default to muted; require explicit user interaction or preference toggle before playing.
2. Limit playback rate: debounce rapid triggers to $\ge 60$ms intervals.
3. Master volume must not exceed `contract.sound.volume` (maximum 0.25).

