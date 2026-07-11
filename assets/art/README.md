# Art Assets

Generated with the built-in Codex image generation tool.

## Current In-Game Background

- `courtyard-master-clean-xuan.png`
  - Current clean 21:9 spring background.
  - Used by `ink/scene.css` as the base scene plate.
  - Season/weather variants are currently CSS tone overlays and particles, not separate images.

- `courtyard-master-spring-bright.png`
  - Brighter 2026-07-07 mood plate, kept as reference.
  - Do not use as the generic base scene because it includes fixed chess-board scenery.

## Concept Reference Only

- `courtyard-master-xuan.png`
  - Earlier mood frame with a boy near the gate.
  - Do not use as a generic scene background because the character is baked into the image.

## Overlay Assets

The clean background stays stable. Runtime overlays now live in:

- `fig/` — transparent painted NPC cutouts used by `ink/scene.js`.
- `items/` — courtyard objects and quiet-day traces used by `ink/scene.js`.

Season and weather still use CSS tone/particles. Add separate clean plates only if those effects stop being sufficient.
