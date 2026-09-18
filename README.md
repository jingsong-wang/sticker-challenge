# Sticker Challenge · MISREAD LAB 002

A browser-local game about typographic attacks on CLIP. Place a text sticker on a photo, change the classifier's top-ranked label, and unlock the next level. Actual model inference runs in a Web Worker; there are no synthetic or pre-recorded gameplay results.

Play: https://jingsong-wang.github.io/sticker-challenge/

## Run

Node 24: `node server.mjs`, then open http://127.0.0.1:4176/ . No dependency installation is required to serve the static app. `node --test tests/*.test.mjs` runs game-rule tests. The pinned package in package.json is used for optional native model research, not a required server component.

The player explicitly starts a download of about 154 MB (decimal) of model weights plus tokenizer and WASM/library resources. Model/runtime files are fetched from Hugging Face and jsDelivr; browser caching is best-effort. Network access to those hosts and sufficient device memory are required. Images and sticker text are processed locally. This is not a promise of universal phone support or fully offline first use.

## Reproducible experiment

- Transformers.js 3.8.1; WASM single-thread backend; q8.
- Model: Xenova/clip-vit-base-patch32, revision `d15189d7028b43f1d3e65039190477f6af591c2a` (ONNX conversion of OpenAI CLIP).
- Candidate labels fixed across all levels: apple, iPod, cat, dog, banana, toaster, pizza, car.
- Prompt template: `a photo of a {}.`
- Photos are center-cropped to a 512px square by Canvas; white rectangular sticker composited on top. The official pinned CLIP processor then resizes/normalizes to 224px.
- Sticker width is a fraction of the image; height is 0.4 times width. Text uses Arial weight 900, fitted to the rectangle. Rendering and preprocessing can vary between environments.
- Scores are softmax values relative to these eight candidates, not calibrated confidence or accuracy on the open world.
- Baseline must rank the source first; target must uniquely rank first after editing. Blank controls never unlock levels. Three/two/one stars require area <=10%/20%/35%. Out-of-bounds rotated stickers cannot be submitted. Edited results are invalidated.
- Progress lives only in localStorage and is editable by the player; it is not an authenticated leaderboard. JSON/card exports refer to submitted pixels and scores.

## Research

Inspired by [OpenAI's multimodal neurons / typographic attacks](https://openai.com/index/multimodal-neurons/). This is a small independently implemented educational exhibit, not new attack research, an instruction-following MLLM jailbreak, or a full reproduction of an earlier paper. Selected positive cases do not establish a population success rate. A same-geometry blank-sticker control helps expose the difference between text and occlusion.

Photo credit and licenses: [assets/README.md](dist/assets/README.md). Model card: https://huggingface.co/Xenova/clip-vit-base-patch32 . Underlying model: https://huggingface.co/openai/clip-vit-base-patch32 . See upstream licenses for model and library reuse.

## Deployment

Static `dist/` can be hosted on GitHub Pages at any subpath. The supplied Actions workflow runs rule tests and syntax checks, then publishes `dist/`. Select Settings → Pages → GitHub Actions. Model weights are not committed to this repository.
