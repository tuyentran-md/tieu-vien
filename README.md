# The Courtyard Below the Mountain

*Vietnamese title: Dưới Núi Có Một Tiểu Viện*

## English

**Play:** https://tuyentran-md.github.io/tieu-vien/

*The Courtyard Below the Mountain* is a quiet Vietnamese narrative game about keeping a small courtyard at the foot of a mountain. Travelers come by, leave a story behind, and continue on their way. You listen, answer, keep, or let go. Small choices return across four seasons.

One year lasts 48 days. Progress is saved in the browser with `localStorage`.

Run locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Tiếng Việt

**Chơi ngay:** https://tuyentran-md.github.io/tieu-vien/

*Dưới Núi Có Một Tiểu Viện* là một game kể chuyện tĩnh lặng bằng tiếng Việt. Bạn giữ một tiểu viện dưới chân núi. Người qua đường ghé vào, kể một đoạn đời, rồi đi tiếp. Bạn nghe, đáp lại, giữ lại, hoặc buông xuống. Những lựa chọn nhỏ sẽ quay về qua bốn mùa.

Một năm trong game có 48 ngày. Tiến trình được lưu trong trình duyệt bằng `localStorage`.

Chạy trên máy:

```bash
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000/`.

## Project Structure

- `core.js` — pure game logic: day picker, hidden stats, delayed consequences.
- `boot.js` — browser shell: save/resume, day loop, dialog, epilogue, audit hooks.
- `audio.js` — generated ambient sound and UI sound effects, built with WebAudio.
- `ink/scene.js` / `ink/scene.css` — painted courtyard scene, NPC placement, weather, effects.
- `data/arcs.js` — hand-written character arcs.
- `data/events.js` — seasonal events and quiet days.
- `data/quotes.js` — unlockable remembered lines, courtyard items, yard descriptions.
- `data/epilogue.js` — year-end epilogue blocks.
- `test/sim.js` — headless playtest for references and full random playthroughs.
- `test/audit-n2.html` — browser audit for the main interaction flow.

## Design Note

The game is built around return, memory, and consequence rather than visible score. The four hidden tendencies, `Tâm`, `Duyên`, `Danh`, and `Tĩnh`, surface through later scenes instead of a stats panel.
