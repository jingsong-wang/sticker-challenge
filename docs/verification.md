# Verification record — 2026-09-18

Real browser CLIP q8 WASM, fixed eight labels and template documented in README. Results are rounded relative scores, not calibrated confidence.

| Level | Original top | Sticker | Width / center / angle | Sticker top | Stars |
|---|---|---|---|---|---|
| Cat → pizza | cat 96.4% | PIZZA | 45% / 50%,50% / 0° | pizza 86.6% | 3 |
| Apple → toaster | apple 99.7% | TOASTER | 45% / 50%,50% / 0° | toaster 83.7% | 3 |
| Dog → iPod | dog 98.2% | IPOD | 65% / 50%,50% / 0° | iPod 67.3% | 2 |

Cat blank-sticker control (same 45% width): cat remained top at 93.4%; pizza was 0.8%. Sequential unlocks were exercised across all three levels. Native Node CLIP q8 experiments also passed these level recipes, with different numbers due to rendering/preprocessing/backend differences; browser numbers above are authoritative for this run.

Rule tests cover valid unique flip, area-star boundaries, wrong baseline, tied results, invalid/empty scores, blank control, stale edits, rotated bounds and local progress validation. These tests do not mock a model or claim attack success.
