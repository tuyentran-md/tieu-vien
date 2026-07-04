# SPEC v2 — "Dưới Núi Có Một Tiểu Viện" (Stardew-lite pixel courtyard)

Contract for implementation. Read fully before writing code. English for precision; in-game text is Vietnamese and ALREADY WRITTEN — do not author or edit any Vietnamese prose.

## 0. Non-negotiables

1. **`data/*.js` is frozen.** Never edit arcs/events/quotes/epilogue. All narrative content is final and playtested.
2. **`core.js` is the only game logic.** UI calls `createCore(...)` API; never reimplement pickToday/condOk/applyChoice/etc. If the UI seems to need new logic, add a pure function to core.js and mirror-test via `node test/sim.js` (must stay green: 303 playthroughs).
3. **Static site, no build step.** Plain `<script>` tags. Phaser is vendored at `vendor/phaser.min.js` (v3.85.2). Must run from `python3 -m http.server`.
4. **All text rendering = DOM overlay, not canvas.** Vietnamese diacritics must render perfectly → dialog box, choices, HUD, journal/courtyard modals, epilogue are HTML elements (reuse existing `style.css` paper/ink look, Noto Serif). Phaser canvas renders ONLY the world (tiles, sprites, particles). This is a hard decision, not a suggestion.
5. **Save compatibility:** localStorage key `tieuvien_save_v1`, shape from `core.newState()`. Persist after every mutation (pick, choose, next day). Reload mid-day must NOT reroll the day (that's why `S.current`/`S.chosen`/`S.phase` exist).
6. No new dependencies, no network requests at runtime (fonts may stay on Google Fonts as today).

## 1. Assets (all vendored, CC0, at `assets/ninja/`)

Grid unit 16×16 px everywhere. `pixelArt: true`, zoom 3× (canvas shows 320×240 world units scaled).

### 1.1 Character sprites — `assets/ninja/chars/<Name>/`
- `SpriteSheet.png` 64×112: **column = facing** (0=down, 1=up, 2=left, 3=right — verify visually at M1 gate, swap if wrong), **rows 0–3 = walk frames** (row 0 doubles as idle). Frame 16×16.
- Most chars also have `SeparateAnim/Walk.png` (64×64, col=facing, row=frame) + `Idle.png` (64×16). `Child` and `OldWoman` only have SpriteSheet — use the rows 0–3 rule.
- `Faceset.png` 38×38 portrait — show in dialog box next to speaker name.
- `Shadow.png` in `chars/` — optional blob shadow under actors.

### 1.2 Cast map (do not recast)

| Role | Sprite | Appears |
|---|---|---|
| Player — chủ tiểu viện | `Villager` | always |
| Mộc (thiếu niên học kiếm) | `Boy` | arc nodes `moc_*` |
| Trần Thức (thư sinh) | `Noble` | arc nodes `thu_*` |
| Ông lão đánh cờ | `OldMan` | arc nodes `co_*`, event `t_covu` (người thua cờ = `OldMan2`) |
| Kiếm khách say | `Samurai` | `h_kiemkhach`, `d_ruou` |
| Tăng nhân | `Monk` | `t_tangnhan` |
| Cô hái thuốc | `Woman` | `x_haithuoc` |
| Con bé hàng xóm | `Child` | `x_mang`, `d_khoai` |
| Người mẹ tìm con | `OldWoman` | `t_timcon` |
| Người buôn / khách huyện | `Villager2` | `x_hatgiong`, `h_xinchu` |
| Dân làng vụ việc | `Villager3` | `h_trau`, `h_gieng`, `x_ganh_nuoc` |
| Người đưa thư / vô danh | `Master` | `t_lathu`, `d_baotuyet` |
| Mèo tam thể | `animals/Cat` (32×16 = 2 idle frames) | `d_meo` + yard sprite when `item con_meo` |
| Gà (ambience) | `animals/Chicken` | wanders yard from summer on |

Event→NPC rule: every `event` and `arc` day spawns exactly one visitor NPC (except `empty` days = nobody). `t_lathu` (thư không tên): letter lies at the gate — NPC `Master` walks in, drops it, leaves quickly before player reaches him (nice touch, cheap).

### 1.3 Tiles — `assets/ninja/tiles/`
`TilesetField.png` (grass/paths), `TilesetFloor.png` + `TilesetFloorB.png` + `TilesetFloorDetail.png` (stone/wood floors), `TilesetHouse.png` (walls/roofs — build house exterior + porch), `TilesetNature.png` (trees/rocks/bamboo), `TilesetWater.png` (pond/jar water), `TilesetElement.png` (props: fences, pots, lanterns, tables), `Interior/*` (only if needed for porch furniture).
Build the map **in code** (arrays of tile indices or `put` calls) — no Tiled dependency. Document the index map you use as comments.

### 1.4 FX — `assets/ninja/fx/`
`Rain.png` 24×8 (3 frames 8×8), `RainOnFloor.png`, `Snow.png` 56×8 (7×8 frames), `Leaf.png`, `LeafPink.png` (petals, 7px frames), `Clouds.png`, `Fog.png`, `Smoke/` (chimney).

### 1.5 Audio
Music `assets/ninja/music/`: `title.ogg`, `xuan.ogg`, `ha.ogg`, `thu.ogg`, `dong.ogg`, `epilogue.ogg`. Loop, volume ~0.35, crossfade ≥1s on season change. SFX `assets/ninja/sfx/`: `Accept.wav` (choice), `Cancel.wav` (close), `Menu1.wav` (dialog advance), `Menu6.wav` (hover ok), `quote.wav` (Sổ Nhỏ unlock — play soft, vol .3).
Audio unlock: create/resume AudioContext only after first user gesture (title button). Sound toggle button persists to localStorage `tieuvien_sound` ("1"/"0") — keep behavior.
`audio.js` (WebAudio ambient v1) stays for wind/rain layered UNDER music at low gain (0.10) — it already works; just call `Ambient.boot/setScene/toggle` as v1 did. If mixing sounds bad, drop ambient and keep music only (your call, note it in commit).

### 1.6 Items in yard (appear as sprites once unlocked; `S.items` holds ids)

| item id | yard representation |
|---|---|
| `kiem_go_hien` | `items/Weapons/Stick` (or Katana) leaning at porch post |
| `kiem_go_trao` | **no sprite** (it was given away) — listed in "Trong sân" modal only |
| `ban_co` | stone table tile from TilesetElement under the tree |
| `quan_co_khuyet` | tiny white stone on the board (2–3 px circle is fine) |
| `buc_thu`, `buc_thu_vodanh` | `items/Other/Letter.png` on porch table |
| `cay_mai` | small tree (TilesetNature) near gate; from thu/dong show pink via LeafPink petals when in bloom (dong) |
| `la_de` | `items/Food/TeaLeaf.png` on porch table (leaf-in-book) |
| `con_meo` | `animals/Cat` idle-breathing on porch step |

Clicking/tapping a yard item shows its `ITEMS[id].memory` line in a small DOM tooltip/box.

## 2. World & layout

One screen, no camera scroll. World 320×240 (20×15 tiles), letterboxed by Phaser `Scale.FIT`, `autoCenter: CENTER_BOTH`. Canvas sits in `#stage` (top of page); DOM dialog column below/overlaid, same as v1 layout skeleton.

Courtyard composition (approximate, tune visually):
- **Top band (rows 0–3):** mountain backdrop feel — dense trees/bamboo + fog sprite; path from top-left gap = the mountain path (NPC exit for "lên núi" moments).
- **House (rows 3–7, cols 12–19):** wooden house w/ tiled roof + chimney smoke, porch (hiên) on its left/front with table. Porch = key spot: letters/leaf/cat/sword live here.
- **Gate (row 13, cols 2–3):** fence along bottom, gate opening at left-bottom. Visitors walk in from gate.
- **Tree + go board (cols 5–8, rows 7–9):** big tree; stone board appears under it (`ban_co`).
- **Water jar (col 10, row 6):** near porch; pond optional top-right.
- **Mai tree (col 3, row 10):** appears with `cay_mai`.
- Paths (FloorDetail dirt tiles): gate→yard center→porch; yard center→tree.
- Collision: house body, tree trunk, fences, jar, water. Porch walkable.

Player: spawn on porch. Move = arrow keys / WASD **and** tap/click-to-move (simple straight-line steering with axis priority is enough; don't ship jitter — settle on grid-ish movement if smoother). Speed ~70 px/s, walk anim 8 fps.

## 3. Scene/flow architecture

Files: keep `index.html` + `style.css` (extend), add `px/boot.js`, `px/world.js`, `px/dialog.js`, `px/epilogue.js` (or one `px/main.js` if cleaner — your call). Remove `scene.js` usage from index.html when world replaces it (keep the file in repo).

- **Title (DOM, as today):** button = "Bắt đầu một năm" / "Tiếp tục · <mùa>, ngày N" / "Xem lại đêm cuối năm" (logic identical to v1 `game.js` boot). Button click = audio unlock + start Phaser.
- **WorldScene (Phaser):** builds courtyard, seasonal skin, weather particles, player, yard items, ambient chicken. Per-day sequence:
  1. `startDay()`: if `S.day > C.TOTAL_DAYS` → epilogue. Else ensure `S.current = C.pickToday(S)` (only if null!), `save()`. Show HUD (DOM): `C.hudLine(S)` + yard-line caption `C.yardLine(S)` fading in at dawn.
  2. If arc/event day: NPC walks gate→yard center, `!` bubble. Player walks within 20px + presses E / taps NPC → open dialog. If empty day: 3–4 hotspots glow softly (porch/tree/gate/jar) — interacting opens the empty-day node (same dialog UI; hotspot choice list = `C.visibleChoices`).
  3. Dialog resolution: on choice → `C.applyChoice(S, choice)`, `S.chosen={result, quote, item}`, `S.phase="result"`, `save()` — show result text (+ "✎ Sổ Nhỏ" toast if quote, "◦ <item name>" toast if item, sfx). Close dialog → NPC bows, walks out gate (or up mountain path when narratively leaving for the mountain: nodes `moc_4`→`moc_5` window, `co_4`).
  4. "Qua ngày": button appears (DOM, bottom-right) after result closes → fade to black 600ms, `S.day++`, reset current/chosen/phase, dawn fade-in, season/weather/music update.
- **Dialog (DOM overlay `#dialog`):** bottom sheet over canvas, paper bg, Faceset portrait left, speaker name, typewriter ~28 chars/s (tap = reveal all), paragraphs from `C.visibleParas` advanced by tap, then choices as buttons (`C.visibleChoices`), then result paragraph. ESC/backdrop does NOT skip choices (must choose). Reload during dialog: state already persisted → reopening day shows same node; if `S.phase==="result"` show result + Qua ngày directly (no re-choose — v1 behavior).
- **Epilogue (DOM full-screen like v1):** `C.epilogueParas(S)` + `C.statsLine(S)`, snow particles behind (reuse WorldScene w/ night tint or plain DOM), `epilogue.ogg`, button "Qua thêm một năm nữa" = clear save + reload.
- **Modals Sổ Nhỏ / Trong sân / ♪ / ↺:** keep v1 DOM implementations (they live in `game.js` — port the handlers; `game.js` v1 text-UI itself is replaced by the Phaser flow, keep file as `legacy/game-v1.js` if you want reference, but index.html loads only the new UI).

## 4. Seasons & weather (visual states)

Season = `C.seasonOf(S.day)`; weather = `empty day ? C.EMPTY_WEATHER[season] : C.weatherOf(S.day)`.

| Season | Ground/trees | Particles | Extra | Music |
|---|---|---|---|---|
| xuân | fresh grass tiles, green trees | `LeafPink` petals drifting when clear; `Rain`+RainOnFloor when rain | mist band top | xuan.ogg |
| hạ | deep green, denser foliage | none when clear (heat shimmer optional) | brighter ambient tint | ha.ogg |
| thu | swap grass to yellowed variant (tint `0xE8C87A` on grass layer is acceptable), `Leaf` falling | Leaf particles always light, heavier when wind | warm tint 0xFFE9C8 @ .15 | thu.ogg |
| đông | pale/desat tint on ground (0xDCE4EC), bare-ish trees (tint), snow patches (Floor white tiles) | `Snow` when snow; fog when clear | cool tint, chimney smoke denser | dong.ogg |

Day tint ramp: dawn (slightly warm) → day (none) → after result (dusk warm 0xFFD9A0 @ .12) → fade to black at Qua ngày. Cheap: one full-screen rectangle with blend.

## 5. core.js API (already exists — consume, don't fork)

```js
const C = createCore({ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE});
C.TOTAL_DAYS; C.SEASONS; C.SEASON_NAMES; C.EMPTY_WEATHER;
S = C.newState();                  // or JSON.parse(localStorage)
C.seasonOf(day); C.weatherOf(day); // deterministic
C.pickToday(S);                    // MUTATES scheduled/usedEvents — call once per day, persist result in S.current
C.resolveNode(S, S.current);       // → {kind,id,node}
C.visibleParas(S, node); C.visibleChoices(S, node);
C.applyChoice(S, choice);          // stats/flags/schedule/journal/items/kill
C.dominantStat(S); C.yardLine(S); C.hudLine(S); C.statsLine(S);
C.epilogueParas(S);                // ready-to-print array
```

## 6. Milestones & gates (implement in order; STOP at each gate)

- **M1:** Phaser boot from title, courtyard map (spring skin), player walk (keys+tap), collision, HUD DOM line. *Gate: `node test/sim.js` green; screenshots via headless Chrome (800×900 and 390×844) show coherent courtyard; no console errors.*
- **M2:** day loop + NPC visitors + DOM dialog wired to core; full 48-day playable; empty-day hotspots. *Gate: sim green; scripted browser run day 1–5; day 1 = Mộc with 4 choices visible.*
- **M3:** 4 season skins, weather particles, music+sfx, yard item sprites w/ memory tooltip, chicken/cat ambience, day tint ramp. *Gate: 4 season screenshots + items visible after unlocks.*
- **M4:** epilogue scene, save/continue/reset paths, mobile polish (portrait, tap targets ≥40px), perf (60fps idle, no leak across 48 days). *Gate: full autoplay headless run to epilogue; Lighthouse-ish sanity.*

Testing hooks you must keep working: `test/sim.js` (node), `test/_smoke.html` (browser core autoplay). Add `?autoplay=N` query param support in the new UI (auto-picks first choice for N days) — used by audit scripts.

## 7. Tone guard (for any incidental UI copy)

UI strings you may add (buttons, toasts) must match existing register: ngắn, mộc, không emoji trong game text (toast dùng ✎ ◦ như v1), không "!" trừ bubble sprite. Vietnamese with full diacritics. When unsure, copy v1's exact strings.
