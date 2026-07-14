# Art Assets

Generated with the built-in Codex image generation tool.

## Current In-Game Backgrounds

- Xuân: `courtyard-season-xuan.png` — fresh young greens and clear spring light.
- Hạ: the spring plate with a restrained deeper-green CSS tone.
- Thu: `courtyard-master-clean-xuan.png` — the older muted plate, with only a light autumn tone.
- Đông: the older muted plate, cooled and desaturated gently; runtime particles add snow.

The seasons deliberately stay close in composition and painting style. Weather and day-phase
effects remain CSS overlays and particles; seasonal grading should stay restrained.

## Previous Background References

- `courtyard-master-clean-xuan.png`
  - Original muted plate, now used for Thu and Đông.

- `courtyard-master-spring-bright.png`
  - Brighter 2026-07-07 mood plate, kept as reference.
  - Do not use as the generic base scene because it includes fixed chess-board scenery.

## Concept Reference Only

- `courtyard-master-xuan.png`
  - Earlier mood frame with a boy near the gate.
  - Do not use as a generic scene background because the character is baked into the image.

## Overlay Assets

Runtime overlays live in:

- `fig/` — transparent painted NPC cutouts used by `ink/scene.js`.
- `items/` — courtyard objects and quiet-day traces used by `ink/scene.js`.

Season, weather, and phase use the restrained plate/tone mapping above.
