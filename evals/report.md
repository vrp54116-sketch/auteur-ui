# Evaluation Report

Generated: 2026-11-13T15:28:48.537Z

## Summary Metrics

| Metric | Value |
|---|---|
| Total Runs | 2 |
| Avg Wall Time | 3.56s |
| Avg Tokens / Run | 4325 |
| Total Cost | $0.0876 |

### Metrics by Arm

| Arm | Runs | Avg Time (s) | Avg Input | Avg Output | Avg Total Tokens | Avg Lint Score | Pass Rate | Total Cost ($) |
|---|---|---|---|---|---|---|---|---|
| **auteur-ui** | 1 | 3.20 | 1120 | 1830 | 2950 | 82 | 100% | $0.0315 |
| **baseline** | 1 | 3.93 | 2450 | 3250 | 5700 | 42 | 0% | $0.0561 |

## Individual Runs

| Run ID | Arm | Task | Seed | Wall Time (s) | In Tokens | Out Tokens | Cache Read | Total Tokens | Lint Score | Pass | Cost ($) | Exit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `auteur-ui-spotify-listening-seed1` | auteur-ui | spotify-listening | 1 | 3.20s | 1120 | 1830 | 450 | 2950 | 82/100 | ✓ PASS | $0.0315 | 0 |
| `baseline-spotify-listening-seed1` | baseline | spotify-listening | 1 | 3.93s | 2450 | 3250 | 0 | 5700 | 42/100 | ✗ FAIL | $0.0561 | 0 |

---
*Human Grading Gallery generated at [gallery.html](gallery.html) with blind randomized pairs.*
