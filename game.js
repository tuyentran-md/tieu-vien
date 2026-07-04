// ===== Dưới Núi Có Một Tiểu Viện — UI v1 (text) trên core.js =====
// Toàn bộ logic nằm trong core.js — file này chỉ còn DOM + save/load.

const SAVE_KEY = "tieuvien_save_v1";

let C = null;       // core instance
let S = null;       // state (persisted)
let current = null; // resolved node for today (derived from S.current)

// ===== UI =====

const $ = sel => document.querySelector(sel);

function startDay() {
  if (S.day > C.TOTAL_DAYS) return showEpilogue();
  if (!S.current) {
    S.current = C.pickToday(S);
    S.phase = "day";
    S.chosen = null;
  }
  current = C.resolveNode(S, S.current);
  save();
  render();
}

function render() {
  const season = C.seasonOf(S.day);
  document.body.dataset.season = season;
  const weather = current.kind === "empty" ? C.EMPTY_WEATHER[season] : C.weatherOf(S.day);
  Scene.update({ season, weather, items: S.items.slice() });
  Ambient.setScene(season, weather);
  $("#hud-day").textContent = C.hudLine(S);
  $("#yard-line").textContent = C.yardLine(S);

  const n = current.node;
  $("#event-title").textContent = n.title;
  const parasEl = $("#event-text");
  parasEl.innerHTML = "";
  C.visibleParas(S, n).forEach(p => {
    const el = document.createElement("p");
    el.textContent = p.text;
    parasEl.appendChild(el);
  });

  $("#choices").innerHTML = "";
  $("#result").classList.add("hidden");
  $("#notes").textContent = "";
  $("#next-day").classList.add("hidden");

  if (S.phase === "result" && S.chosen) {
    showResult(S.chosen);
  } else {
    C.visibleChoices(S, n).forEach(c => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = c.label;
      btn.onclick = () => choose(c);
      $("#choices").appendChild(btn);
    });
  }
  fadeIn($("#scene"));
}

function choose(c) {
  C.applyChoice(S, c);
  S.chosen = { result: c.result, quote: c.quote || null, item: c.item || null };
  S.phase = "result";
  save();
  $("#choices").innerHTML = "";
  showResult(S.chosen);
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
  startDay();
}

// ---- epilogue ----

function showEpilogue() {
  S.phase = "end";
  save();
  $("#title-screen").classList.add("hidden");
  $("#game").classList.add("hidden");
  const el = $("#epilogue");
  el.classList.remove("hidden");
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

// ---- journal & courtyard ----

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
      const name = document.createElement("div"); name.className = "item-name"; name.textContent = it.name;
      const mem = document.createElement("div"); mem.className = "item-mem"; mem.textContent = it.memory;
      d.appendChild(name); d.appendChild(mem);
      list.appendChild(d);
    });
  }
  $("#modal").classList.remove("hidden");
}

// ---- save/load ----

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
function resetGame() {
  if (!confirm("Bắt đầu lại một năm mới? Năm cũ sẽ không giữ lại.")) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

function fadeIn(el) {
  el.classList.remove("fade-in");
  void el.offsetWidth;
  el.classList.add("fade-in");
}

// ---- boot ----

window.addEventListener("DOMContentLoaded", () => {
  C = createCore({ ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE });

  $("#btn-journal").onclick = openJournal;
  $("#btn-courtyard").onclick = openCourtyard;
  $("#btn-reset").onclick = resetGame;
  $("#modal-close").onclick = () => $("#modal").classList.add("hidden");
  $("#modal").onclick = e => { if (e.target.id === "modal") $("#modal").classList.add("hidden"); };
  $("#next-day").onclick = nextDay;
  $("#btn-again").onclick = () => { localStorage.removeItem(SAVE_KEY); location.reload(); };

  const sndBtn = $("#btn-sound");
  const syncSnd = () => { sndBtn.classList.toggle("muted", !Ambient.isOn()); };
  sndBtn.onclick = () => { Ambient.toggle(); if (Ambient.isOn()) Ambient.setScene(C.seasonOf(S.day), C.weatherOf(S.day)); syncSnd(); };

  const enterGame = () => {
    $("#title-screen").classList.add("hidden");
    $("#game").classList.remove("hidden");
    Scene.build($("#stage"));
    Ambient.boot(C.seasonOf(S.day), C.weatherOf(S.day)); // sau user gesture
    syncSnd();
    startDay();
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
    begin.onclick = enterGame;
  } else {
    S = C.newState();
    begin.onclick = enterGame;
  }
});
