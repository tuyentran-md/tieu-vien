// ===== Dưới Núi Có Một Tiểu Viện — Phaser boot + DOM shell (M1) =====

(function () {
  const SAVE_KEY = "tieuvien_save_v1";

  let C = null;
  let S = null;
  let current = null;
  let world = null;

  const $ = sel => document.querySelector(sel);

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function season() {
    return C.seasonOf(S.day);
  }

  function weather() {
    if (!current) return C.weatherOf(S.day);
    return current.kind === "empty" ? C.EMPTY_WEATHER[season()] : C.weatherOf(S.day);
  }

  function ensureDay() {
    if (S.day > C.TOTAL_DAYS) {
      showEpilogue();
      return false;
    }

    if (!S.current) {
      S.current = C.pickToday(S);
      S.phase = "day";
      S.chosen = null;
    }
    current = C.resolveNode(S, S.current);
    save();
    renderShell();
    return true;
  }

  function renderShell() {
    document.body.dataset.season = season();
    $("#hud-day").textContent = C.hudLine(S);
    $("#yard-line").textContent = C.yardLine(S);
    $("#yard-line").classList.remove("hidden");

    $("#event-title").textContent = "";
    $("#event-text").innerHTML = "";
    $("#choices").innerHTML = "";
    $("#result").classList.add("hidden");
    $("#notes").textContent = "";
    $("#next-day").classList.add("hidden");

    if (S.phase === "result" && S.chosen) showResult(S.chosen);
    if (world) world.setDay({ day: S.day, season: season(), weather: weather(), phase: S.phase, items: S.items.slice(), kind: current && current.kind });
  }

  function showResult(ch) {
    const r = $("#result");
    r.textContent = ch.result;
    r.classList.remove("hidden");

    const notes = [];
    if (ch.quote) notes.push("✎ Một câu được chép vào Sổ Nhỏ.");
    if (ch.item && ITEMS[ch.item]) notes.push("◦ " + ITEMS[ch.item].name + " — giờ thuộc về tiểu viện.");
    $("#notes").textContent = notes.join("   ");
    $("#next-day").classList.remove("hidden");
  }

  function nextDay() {
    S.day += 1;
    S.current = null;
    S.chosen = null;
    S.phase = "day";
    ensureDay();
    if (Ambient && Ambient.isOn()) Ambient.setScene(season(), weather());
  }

  function showEpilogue() {
    S.phase = "end";
    save();
    $("#title-screen").classList.add("hidden");
    $("#game").classList.add("hidden");
    $("#epilogue").classList.remove("hidden");
    document.body.dataset.season = "dong";

    const box = $("#epilogue-text");
    box.innerHTML = "";
    C.epilogueParas(S).forEach(t => {
      const p = document.createElement("p");
      p.textContent = t;
      box.appendChild(p);
    });
    $("#epilogue-stats").textContent = C.statsLine(S);
  }

  function openJournal() {
    const list = $("#modal-list");
    list.innerHTML = "";
    $("#modal-title").textContent = "Sổ Nhỏ Dưới Núi";

    if (!S.journal.length) {
      list.innerHTML = "<p class='dim'>Sổ còn trắng. Chuyện chưa tới, hoặc mình chưa nhận ra.</p>";
    } else {
      S.journal.forEach(q => {
        const p = document.createElement("p");
        p.className = "quote";
        p.textContent = "“" + QUOTES[q] + "”";
        list.appendChild(p);
      });
    }
    $("#modal").classList.remove("hidden");
  }

  function openCourtyard() {
    const list = $("#modal-list");
    list.innerHTML = "";
    $("#modal-title").textContent = "Trong sân";

    if (!S.items.length) {
      list.innerHTML = "<p class='dim'>Sân còn trống. Một mái hiên, một gốc cây, một ấm trà cũ.</p>";
    } else {
      S.items.forEach(id => {
        const it = ITEMS[id];
        if (!it) return;
        const d = document.createElement("div");
        d.className = "item";

        const name = document.createElement("div");
        name.className = "item-name";
        name.textContent = it.name;

        const mem = document.createElement("div");
        mem.className = "item-mem";
        mem.textContent = it.memory;

        d.appendChild(name);
        d.appendChild(mem);
        list.appendChild(d);
      });
    }
    $("#modal").classList.remove("hidden");
  }

  function resetGame() {
    if (!confirm("Bắt đầu lại một năm mới? Năm cũ sẽ không giữ lại.")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  function runAutoplay(days) {
    for (let i = 0; i < days && S.day <= C.TOTAL_DAYS; i++) {
      if (!S.current) S.current = C.pickToday(S);
      current = C.resolveNode(S, S.current);

      if (!(S.phase === "result" && S.chosen)) {
        const choice = C.visibleChoices(S, current.node)[0];
        if (!choice) break;
        C.applyChoice(S, choice);
        S.chosen = { result: choice.result, quote: choice.quote || null, item: choice.item || null };
        S.phase = "result";
      }

      S.day += 1;
      S.current = null;
      S.chosen = null;
      S.phase = "day";
    }
    save();
  }

  function syncSoundButton() {
    const btn = $("#btn-sound");
    btn.classList.toggle("muted", !Ambient.isOn());
  }

  function enterGame(opts) {
    const unlockAudio = !opts || opts.unlockAudio !== false;

    $("#title-screen").classList.add("hidden");
    $("#epilogue").classList.add("hidden");
    $("#game").classList.remove("hidden");

    if (!ensureDay()) return;

    if (!world) {
      world = InkScene.boot($("#stage"));
    }
    world.setDay({ day: S.day, season: season(), weather: weather(), phase: S.phase, items: S.items.slice(), kind: current && current.kind });

    if (unlockAudio && Ambient) Ambient.boot(season(), weather());
    syncSoundButton();
  }

  window.addEventListener("DOMContentLoaded", () => {
    C = createCore({ ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE });

    $("#btn-journal").onclick = openJournal;
    $("#btn-courtyard").onclick = openCourtyard;
    $("#btn-reset").onclick = resetGame;
    $("#modal-close").onclick = () => $("#modal").classList.add("hidden");
    $("#modal").onclick = e => { if (e.target.id === "modal") $("#modal").classList.add("hidden"); };
    $("#next-day").onclick = nextDay;
    $("#btn-again").onclick = () => { localStorage.removeItem(SAVE_KEY); location.reload(); };
    $("#btn-sound").onclick = () => {
      Ambient.toggle();
      if (Ambient.isOn() && S) Ambient.setScene(season(), weather());
      syncSoundButton();
    };

    const saved = load();
    const begin = $("#btn-begin");
    if (saved && saved.phase === "end") {
      S = saved;
      begin.textContent = "Xem lại đêm cuối năm";
      begin.onclick = showEpilogue;
    } else if (saved && saved.day) {
      S = saved;
      begin.textContent = "Tiếp tục · " + C.SEASON_NAMES[C.seasonOf(S.day)] + ", ngày " + S.day;
      begin.onclick = () => enterGame();
    } else {
      S = C.newState();
      begin.onclick = () => enterGame();
    }

    const autoplay = parseInt(new URLSearchParams(location.search).get("autoplay") || "0", 10);
    if (autoplay > 0) {
      runAutoplay(autoplay);
      enterGame({ unlockAudio: false });
    }
  });
})();
