// ===== Dưới Núi Có Một Tiểu Viện — engine =====

const TOTAL_DAYS = 48;
const DAYS_PER_SEASON = 12;
const SEASONS = ["xuan", "ha", "thu", "dong"];
const SEASON_NAMES = { xuan: "Mùa xuân", ha: "Mùa hạ", thu: "Mùa thu", dong: "Mùa đông" };
const SAVE_KEY = "tieuvien_save_v1";

let S = null;       // state (persisted)
let current = null; // resolved node for today (derived from S.current)

function newState() {
  return {
    day: 1,
    stats: { tam: 0, duyen: 0, danh: 0, tinh: 0 },
    flags: {},
    scheduled: ARC_STARTS.map(a => ({ day: a.day, node: a.node })),
    usedEvents: [],
    journal: [],        // quote ids, in unlock order
    items: [],          // item ids
    current: null,      // {kind,id} — node đã rút cho hôm nay (chống reroll khi reload)
    chosen: null,       // {result,quote,item} — đã chọn xong, đợi "Qua ngày"
    phase: "day",       // day | result | end
  };
}

function seasonOf(day) {
  return SEASONS[Math.min(3, Math.floor((day - 1) / DAYS_PER_SEASON))];
}

function hasFlag(f) {
  if (f.startsWith("___")) {
    // stat check flag: ___duyen2 => stats.duyen >= 2
    const m = f.match(/^___([a-z]+)(\d+)$/);
    if (m) return S.stats[m[1]] >= parseInt(m[2], 10);
    return false;
  }
  return !!S.flags[f];
}

function condOk(o) {
  if (o.if && !hasFlag(o.if)) return false;
  if (o.ifNot && hasFlag(o.ifNot)) return false;
  if (o.req) {
    const v = S.stats[o.req.stat] || 0;
    if (o.req.min !== undefined && v < o.req.min) return false;
    if (o.req.max !== undefined && v > o.req.max) return false;
  }
  if (o.once && S.flags[o.once]) return false;
  return true;
}

// ---- pick / resolve today's content ----

function pickToday() {
  // 1. scheduled arc node due today (or overdue)
  const due = S.scheduled.filter(s => s.day <= S.day).sort((a, b) => a.day - b.day);
  if (due.length) {
    const pick = due[0];
    S.scheduled = S.scheduled.filter(s => s !== pick);
    return { kind: "arc", id: pick.node };
  }
  // 2. seasonal one-shot
  const season = seasonOf(S.day);
  const pool = (SEASON_EVENTS[season] || []).filter(e => {
    if (S.usedEvents.includes(e.id)) return false;
    if (e.reqStat && (S.stats[e.reqStat.stat] || 0) < e.reqStat.min) return false;
    if (e.reqFlag && !hasFlag(e.reqFlag)) return false;
    return true;
  });
  if (pool.length) {
    const e = pool[Math.floor(seededRand() * pool.length)];
    S.usedEvents.push(e.id);
    return { kind: "event", id: e.id };
  }
  // 3. ngày vắng
  return { kind: "empty", id: "empty" };
}

function resolveNode(cur) {
  if (cur.kind === "arc") return { ...cur, node: ARCS[cur.id] };
  if (cur.kind === "event") {
    for (const s of SEASONS) {
      const e = (SEASON_EVENTS[s] || []).find(x => x.id === cur.id);
      if (e) return { ...cur, node: e };
    }
  }
  const season = seasonOf(S.day);
  return { kind: "empty", id: "empty", node: { title: EMPTY_DAY.title_by_season[season], paras: EMPTY_DAY.paras, choices: EMPTY_DAY.choices } };
}

// deterministic rand per day — unsigned, always in [0,1)
function seededRand() {
  let x = (S.day * 2654435761) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 1103515245) >>> 0;
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

// thời tiết trong ngày — deterministic theo ngày; ngày vắng ép theo mùa cho khớp văn
function weatherOf(day) {
  const season = seasonOf(day);
  let x = ((day + 137) * 2246822519) >>> 0;
  x ^= x >>> 15; x = Math.imul(x, 2654435761) >>> 0; x ^= x >>> 13;
  const r = (x >>> 0) / 4294967296;
  if (season === "xuan") return r < .35 ? "rain" : "clear";
  if (season === "ha")   return r < .12 ? "rain" : "clear";
  if (season === "thu")  return r < .25 ? "rain" : "clear";
  return r < .5 ? "snow" : "clear";
}
const EMPTY_WEATHER = { xuan: "rain", ha: "clear", thu: "clear", dong: "snow" };

function dominantStat() {
  const entries = ["tam", "duyen", "danh", "tinh"].map(k => [k, S.stats[k]]);
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] >= 2 ? entries[0][0] : "none";
}

// ---- apply a choice ----

function applyChoice(choice) {
  if (choice.effects) for (const k in choice.effects) S.stats[k] = (S.stats[k] || 0) + choice.effects[k];
  if (choice.flags) choice.flags.forEach(f => (S.flags[f] = true));
  if (choice.once) S.flags[choice.once] = true;
  if (choice.schedule) S.scheduled.push({ day: S.day + choice.schedule.delay, node: choice.schedule.node });
  if (choice.quote && !S.journal.includes(choice.quote)) S.journal.push(choice.quote);
  if (choice.item && !S.items.includes(choice.item)) {
    S.items.push(choice.item);
    S.flags["item_" + choice.item] = true;
  }
  if (choice.kill) {
    S.flags[choice.kill + "_dead"] = true;
    S.scheduled = S.scheduled.filter(s => !s.node.startsWith(choice.kill + "_"));
  }
}

// ===== UI =====

const $ = sel => document.querySelector(sel);

function startDay() {
  if (S.day > TOTAL_DAYS) return showEpilogue();
  if (!S.current) {
    S.current = pickToday();
    S.phase = "day";
    S.chosen = null;
  }
  current = resolveNode(S.current);
  save();
  render();
}

function render() {
  const season = seasonOf(S.day);
  document.body.dataset.season = season;
  const weather = current.kind === "empty" ? EMPTY_WEATHER[season] : weatherOf(S.day);
  Scene.update({ season, weather, items: S.items.slice() });
  Ambient.setScene(season, weather);
  $("#hud-day").textContent = `${SEASON_NAMES[season]} · Ngày ${S.day}`;
  $("#yard-line").textContent = YARD_LINES[season][dominantStat()];

  const n = current.node;
  $("#event-title").textContent = n.title;
  const parasEl = $("#event-text");
  parasEl.innerHTML = "";
  n.paras.filter(condOk).forEach(p => {
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
    const visible = n.choices.filter(condOk);
    visible.forEach(c => {
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
  applyChoice(c);
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
  const add = t => { const p = document.createElement("p"); p.textContent = t; box.appendChild(p); };
  add(EPILOGUE.opening);
  EPILOGUE.arcs.filter(condOk).forEach(b => add(b.text));
  add(EPILOGUE.by_stat[dominantStat() === "none" ? "tinh" : dominantStat()]);
  EPILOGUE.closing.split("\n\n").forEach(add);
  $("#epilogue-stats").textContent = `Sổ Nhỏ: ${S.journal.length} câu · Vật trong sân: ${S.items.length}`;
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
  $("#btn-journal").onclick = openJournal;
  $("#btn-courtyard").onclick = openCourtyard;
  $("#btn-reset").onclick = resetGame;
  $("#modal-close").onclick = () => $("#modal").classList.add("hidden");
  $("#modal").onclick = e => { if (e.target.id === "modal") $("#modal").classList.add("hidden"); };
  $("#next-day").onclick = nextDay;
  $("#btn-again").onclick = () => { localStorage.removeItem(SAVE_KEY); location.reload(); };

  const sndBtn = $("#btn-sound");
  const syncSnd = () => { sndBtn.classList.toggle("muted", !Ambient.isOn()); };
  sndBtn.onclick = () => { Ambient.toggle(); if (Ambient.isOn()) Ambient.setScene(seasonOf(S.day), weatherOf(S.day)); syncSnd(); };

  const enterGame = () => {
    $("#title-screen").classList.add("hidden");
    $("#game").classList.remove("hidden");
    Scene.build($("#stage"));
    Ambient.boot(seasonOf(S.day), weatherOf(S.day)); // sau user gesture
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
    begin.textContent = "Tiếp tục · " + SEASON_NAMES[seasonOf(S.day)] + ", ngày " + S.day;
    begin.onclick = enterGame;
  } else {
    S = newState();
    begin.onclick = enterGame;
  }
});
