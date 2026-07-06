# Dưới Núi Có Một Tiểu Viện
*The Courtyard Below the Mountain*

> Một mái hiên, một gốc cây, một ấm trà cũ. Người ghé qua, rồi đi tiếp.
> Bạn không cứu cả thiên hạ — bạn chỉ chọn hôm nay nên nói gì, giữ gì, buông gì.

A cozy Vietnamese narrative game about running a small courtyard at the foot of a mountain. Serve tea, listen to travelers, teach when needed, stay silent when words would do harm — and watch how small choices return across four seasons.

## Play
**▶ Chơi ngay: https://tuyentran-md.github.io/tieu-vien/**

Static site, no build step, no backend. Local: open `index.html` or serve the folder:

```
python3 -m http.server 8000
```

One year = 48 days across four seasons. Progress autosaves to localStorage.

## Structure
- `core.js` — pure game logic (day picker, hidden stats, delayed-consequence scheduler)
- `boot.js` — DOM shell, save/resume, day loop, dialog, epilogue, autoplay audit
- `ink/scene.js` / `ink/scene.css` — living ink-wash courtyard scene
- `data/arcs.js` — three hand-written character arcs
- `data/events.js` — seasonal one-shot events + quiet days
- `data/quotes.js` — the unlockable notebook, courtyard items, yard descriptions
- `data/epilogue.js` — year-end epilogue blocks
- `test/sim.js` — headless playtest (`node test/sim.js`): validates every reference and runs 300+ full random playthroughs

## Design
See `DESIGN.md`. Core idea: dopamine from **people coming back**, not numbers going up. Four hidden stats (Tâm, Duyên, Danh, Tĩnh) surface only through the world — and none of them is purely good.
