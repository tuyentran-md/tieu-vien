# SPEC v3 — "Dưới Núi Có Một Tiểu Viện" (sơn thủy sống / living ink-wash scene)

Contract for implementation. English for precision; in-game text is Vietnamese. Supersedes SPEC v2 (pixel courtyard, parked at commit 7deb920). *Updated 2026-07: content voice pass đã mở khóa và hoàn tất; scene chuyển sang painted plate + overlay; audio thuần WebAudio.*

## 0. Non-negotiables

1. **`data/*.js` voice pass done (2026-07).** Mọi chỉnh sửa văn sau này phải giữ chuẩn giọng: hình ảnh trước, không đóng bài học trong result, choice là cử chỉ/câu nói; aphorism chỉ nằm trong Sổ Nhỏ hoặc lời thoại. Structure (flags/effects/schedule) không đổi tùy tiện.
2. **`core.js` is the only game logic.** UI consumes `createCore(...)`; never reimplement pickToday/condOk/applyChoice. `node test/sim.js` must stay green (303 playthroughs).
3. **Static site, no build step, no Phaser.** Plain `<script>` tags, runs from `python3 -m http.server`. (Legacy `vendor/`, `px/`, `game.js`, `assets/ninja/` đã xóa.)
4. **The scene = painted bitmap plate + DOM/SVG/CSS overlays.** Nền: `assets/art/courtyard-master-clean-xuan.png` (season/weather = CSS tone + particles). NPC + yard items = SVG overlays trong `ink/scene.js`. All text = DOM, serif stack, full diacritics.
5. **Save compatibility:** localStorage key `tieuvien_save_v1`, shape from `core.newState()`. Persist after every mutation. Reload mid-day must NOT reroll the day.
6. No new dependencies, no runtime network requests (Google Fonts allowed).

## 1. Art direction — thủy mặc / cổ phong

Mood: chill, contemplative, ink-wash mountain painting that breathes. Reference implementation: the approved mockup (basis of `ink/scene.js`).

- Palette per season via CSS custom properties on `#scene-root[data-season]`; muted, paper-toned. Spring sage/mist, summer deeper greens + warm light, autumn ochre/rust, winter pale gray-blue + snow.
- Layers back→front: sky gradient → 3 far mountain silhouettes → drifting mist bands (CSS keyframes, 40–60s loops) → mid ridge with pines → courtyard ground + stone path → bamboo grove (L) / big tree (C-L) / house with curved roof + porch (R) / mai tree + gate + low fence (front).
- Living details, always on: mist drift, warm window lattice light breathing (7s), tea steam wisp on porch, foliage sway ≤1px feel (subtle transform), particles by season/weather.
- Particles (DOM divs, ≤14 concurrent): spring petals / summer none (fireflies at result-phase dusk) / autumn leaves / winter snow. Rain = thin streak divs + porch drip when weather=rain ("mưa", "mưa phùn", "mưa đá nhỏ"...). Respect `prefers-reduced-motion`.
- Day mood ramp: dawn (slightly cool, mist heavier) → day (clear) → after choice resolved: dusk (warm tint, window light stronger) → "Qua ngày" fades to ink night, then next dawn. One overlay div with CSS transitions, ≥600ms.

## 2. Scene module API (`ink/scene.js`)

```js
const scene = InkScene.boot(rootEl);
scene.setDay({ day, season, weather, phase, items, kind });
  // kind: "arc" | "event" | "empty" — repaints palette, weather, items; resets NPC
scene.npcArrive(role, cb);   // silhouette walks gate→yard center; cb when in place
scene.npcLeave(toMountain);  // bows, exits via gate (or mountain path if true)
scene.setPhase(phase);       // "day" | "result" (dusk tint) | "night" (fade for Qua ngày)
scene.onTap(cb);             // cb(hotspotId) — "porch"|"tree"|"gate"|"jar"|"npc"|item ids
scene.setHotspotsGlow(on);   // empty days: 3-4 soft glowing dots
```

### NPC ink figures (SVG groups, one visible at a time)
Role → figure variant (ink-wash people, tỉ lệ thật ~5.5 đầu, áo giao lĩnh nhiều lớp + phụ kiện nhận diện):
`boy` thiếu niên vác kiếm gỗ · `scholar` thư sinh cầm sách/ô · `oldman` ông lão chống gậy (arc cờ: thêm bàn cờ dưới cây khi `ban_co`) · `swordsman` kiếm khách (bầu rượu) · `monk` tăng nhân (nón lá, tràng hạt) · `woman` cô hái thuốc (gùi) · `child` con bé (thấp, tay vẫy) · `oldwoman` bà lão (khăn) · `trader` người buôn (đòn gánh) · `villager` dân làng · `master` người đưa thư (đến, đặt thư, đi ngay).
Event→role map lives in ONE lookup table in boot (default `villager`):
`moc_*`→boy · `thu_*`→scholar · `co_*`→oldman · `t_covu`→oldman2 · `h_kiemkhach`,`d_ruou`→swordsman · `t_tangnhan`→monk · `x_haithuoc`→woman · `x_mang`,`d_khoai`→child · `t_timcon`→oldwoman · `x_hatgiong`,`h_xinchu`→trader · `h_trau`,`h_gieng`,`x_ganh_nuoc`→villager · `t_lathu`→master (LETTER_DROP: đến, đặt thư trên hiên, rời sau ~2s) · `d_baotuyet`→traveler (cùng dáng nón lá, flow đợi bình thường).
`co_4`: npcLeave(true) — rời về phía núi. Mộc rời qua cổng.
Walk = CSS transform transition 4–6s ease-in-out (timer, không rAF — tab ẩn không kẹt), gate → giữa sân; tap bóng người đang đi = giục vào sân, mở lời ngay.

### Yard items (`S.items`) — SVG elements toggled visible
`kiem_go_hien` thanh kiếm gỗ dựng cột hiên · `ban_co` bàn đá + quân cờ dưới cây (`quan_co_khuyet` thêm 1 chấm trắng) · `buc_thu`/`buc_thu_vodanh` phong thư trên hiên · `cay_mai` mai gần cổng (nở khi đông) · `la_de` chiếc lá trên chồng sách hiên · `con_meo` mèo nằm cuộn trên hiên (đuôi ve vẩy CSS). `kiem_go_trao` no visual (given away).
Tap item → tooltip box (DOM, paper style) with `ITEMS[id].memory`.

## 3. Flow (boot.js owns it; port day-loop rendering from v1 `game.js`)

- **Title** (DOM, as today): Bắt đầu / Tiếp tục · mùa, ngày N / Xem lại đêm cuối năm. Click = audio unlock + enter scene.
- **Day sequence:** `startDay()` → ensure `S.current` (pickToday once, persist) → `scene.setDay(...)` + HUD `C.hudLine(S)` + yard line `C.yardLine(S)`.
  - arc/event day: `scene.npcArrive(role)` → tap NPC (or auto after arrive on desktop hover glow) opens dialog panel.
  - empty day: `scene.setHotspotsGlow(true)`; tapping any hotspot opens the empty-day node.
- **Dialog panel** (DOM below/over scene, paper look, as v1): paras from `C.visibleParas` (typewriter ~28 c/s, tap = reveal), then choices `C.visibleChoices`, on choice → `C.applyChoice`, persist chosen/phase, show result + toasts (✎ Sổ Nhỏ / ◦ item, sfx) → `scene.setPhase("result")`, NPC leaves. Reload during any phase resumes exactly (v1 behavior).
- **Qua ngày** → `scene.setPhase("night")` fade 600ms → `S.day++`, reset, dawn.
- **Epilogue** (DOM fullscreen): `C.epilogueParas(S)` + stats, snow drift behind, epilogue.ogg, "Qua thêm một năm nữa" clears save.
- **Modals** Sổ Nhỏ / Trong sân / ♪ / ↺: keep current boot.js implementations.
- Keep `?autoplay=N` (auto-first-choice N days, no audio) for audit scripts.

## 4. Audio — thuần WebAudio, không file

Toàn bộ âm thanh sinh trong `audio.js`: ambient gió (brown noise + LFO) / mưa (bandpass noise theo thời tiết) / chuông gió ngũ cung thưa / chim mùa xuân. SFX: mõ gỗ (chọn), tick giấy (mở/gấp), hai nốt chuông penta (mở khóa Sổ Nhỏ / vật). Epilogue: gió nhẹ + chuông rất thưa (~14s, p=.35). Unlock sau first gesture; `tieuvien_sound` toggle persists.

## 5. Milestones & gates

- **N1 (scene, Zi tự vẽ):** InkScene module renders 4 seasons × weathers, mood ramp, hotspots, NPC arrive/leave, yard items. Gate: screenshot audit 4 mùa (800×900, 390×844), no console errors.
- **N2 (wiring, codex):** boot day loop + dialog + epilogue + autoplay chạy full 48 ngày. Gate: sim green; headless autoplay day 1–5 shows Mộc dialog with 4 choices; full run reaches epilogue.
- **N3 (polish):** music/sfx, mobile tap targets ≥40px, perf (no listener/DOM leak across 48 days), reduced-motion. Gate: full autoplay to epilogue + manual feel pass.

## 6. Tone guard

UI copy: ngắn, mộc, không emoji trong game text (toast dùng ✎ ◦), tiếng Việt đủ dấu. Khi phân vân, copy đúng chữ của v1.
