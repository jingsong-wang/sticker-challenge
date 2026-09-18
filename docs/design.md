# Sticker Challenge — approved direction

User approved a browser-local level-based game on 2026-09-18 after reviewing the proposed CLIP typographic-attack concept. Continue the established GitHub Pages publishing workflow.

Use a separate project directory, not the existing fruit-fly or ai-flip-photo source. An independent project does not need a worktree of fruit-fly.

## Experience
MISREAD LAB 002, Chinese-first polished arcade/editorial design. Three curated photo levels, unlocked sequentially. One editable rectangular text sticker, adjustable position, size and angle. A player wins only when a real local model ranks the target label first after ranking the correct source label first on the unmodified image. Frozen candidate labels and prompt template per level. No synthetic inference, no replay presented as live. Failure is a normal result, not an error. Best stars stored locally. No remote leaderboard.

Stars: success at sticker area <= 10% earns 3 stars, <= 20% earns 2, otherwise 1. Level area budget 35%. Entire sticker must stay within image; reject out-of-bounds submission, do not undercount clipped area. Blank sticker control uses identical geometry and cannot earn progress. Model results become stale after any edit; exports and scoring refer to the submitted snapshot. Baseline, result and control all use the same processor and model. Win requires target unique top rank (no ties).

## Architecture
Static ES modules and CSS. Canvas 512x512 composition; three local image assets. Worker loads pinned Transformers.js 3.8.1 and Xenova/clip-vit-base-patch32 revision d15189d7028b43f1d3e65039190477f6af591c2a, quantized WASM baseline for consistent device support. Explicit user start downloads weights; progress and retry/cancel. Images stay local. No promises of all-phone support or zero first-load network.

Model feasibility precedes final level selection. Measure original, typed sticker and blank control scores; retain recipes for reproducibility. If a level does not reproduce, choose another photo/target, never invent a passing result. Model is CLIP classification, not an instruction-following MLLM jailbreak. Display relative candidate scores, not calibrated confidence.

Export share card with before/after, level, geometry, model and clear score semantics; JSON contains frozen labels, revision, preprocessing, baseline/result/control and sticker parameters. Keyboard accessible controls, reduced motion, narrow responsive layout. Credits and link to https://openai.com/index/multimodal-neurons/ .
