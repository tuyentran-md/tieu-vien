// ===== Dưới Núi Có Một Tiểu Viện — core logic (pure, no DOM) =====
// Browser: <script> sau data/*.js → window.createCore(...)
// Node:    const createCore = require("../core.js"); createCore(data)
// MỌI logic game nằm ở đây. UI (Phaser) và test/sim.js đều gọi qua core — không mirror.

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory;
  else root.createCore = factory;
})(typeof self !== "undefined" ? self : this, function createCore(D) {
  // D = { ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE }

  const TOTAL_DAYS = 48;
  const DAYS_PER_SEASON = 12;
  const SEASONS = ["xuan", "ha", "thu", "dong"];
  const SEASON_NAMES = { xuan: "Mùa xuân", ha: "Mùa hạ", thu: "Mùa thu", dong: "Mùa đông" };
  const EMPTY_WEATHER = { xuan: "rain", ha: "clear", thu: "clear", dong: "snow" };

  function newState() {
    return {
      day: 1,
      stats: { tam: 0, duyen: 0, danh: 0, tinh: 0 },
      flags: {},
      scheduled: D.ARC_STARTS.map(a => ({ day: a.day, node: a.node })),
      usedEvents: [],
      journal: [],   // quote ids, in unlock order
      items: [],     // item ids
      current: null, // {kind,id} — node đã rút cho hôm nay (chống reroll khi reload)
      chosen: null,  // {result,quote,item} — đã chọn xong, đợi "Qua ngày"/"tiếp"
      beat: 0,       // nhịp hiện tại trong ngày (node nhiều nhịp)
      phase: "day",  // day | beat | result | end
    };
  }

  function seasonOf(day) {
    return SEASONS[Math.min(3, Math.floor((day - 1) / DAYS_PER_SEASON))];
  }

  function hasFlag(S, f) {
    if (f.startsWith("___")) {
      // stat check flag: ___duyen2 => stats.duyen >= 2
      const m = f.match(/^___([a-z]+)(\d+)$/);
      if (m) return S.stats[m[1]] >= parseInt(m[2], 10);
      return false;
    }
    return !!S.flags[f];
  }

  function condOk(S, o) {
    if (o.if && !hasFlag(S, o.if)) return false;
    if (o.ifNot && hasFlag(S, o.ifNot)) return false;
    if (o.req) {
      const v = S.stats[o.req.stat] || 0;
      if (o.req.min !== undefined && v < o.req.min) return false;
      if (o.req.max !== undefined && v > o.req.max) return false;
    }
    if (o.once && S.flags[o.once]) return false;
    return true;
  }

  // deterministic rand theo ngày — unsigned, luôn trong [0,1)
  function seededRand(day) {
    let x = (day * 2654435761) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 1103515245) >>> 0;
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  // thời tiết trong ngày — deterministic; ngày vắng ép theo mùa cho khớp văn (EMPTY_WEATHER)
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

  function dominantStat(S) {
    const entries = ["tam", "duyen", "danh", "tinh"].map(k => [k, S.stats[k]]);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][1] >= 2 ? entries[0][0] : "none";
  }

  // ---- pick / resolve today's content ----
  // rng: override cho sim (mặc định seededRand theo ngày — giống browser thật)
  function pickToday(S, rng) {
    const rand = rng || (() => seededRand(S.day));
    // 1. scheduled arc node due today (or overdue)
    const due = S.scheduled.filter(s => s.day <= S.day).sort((a, b) => a.day - b.day);
    if (due.length) {
      const pick = due[0];
      S.scheduled = S.scheduled.filter(s => s !== pick);
      return { kind: "arc", id: pick.node };
    }
    // 2. seasonal one-shot
    const season = seasonOf(S.day);
    const pool = (D.SEASON_EVENTS[season] || []).filter(e => {
      if (S.usedEvents.includes(e.id)) return false;
      if (e.reqStat && (S.stats[e.reqStat.stat] || 0) < e.reqStat.min) return false;
      if (e.reqFlag && !hasFlag(S, e.reqFlag)) return false;
      return true;
    });
    if (pool.length) {
      const e = pool[Math.floor(rand() * pool.length)];
      S.usedEvents.push(e.id);
      return { kind: "event", id: e.id };
    }
    // 3. ngày vắng
    return { kind: "empty", id: "empty" };
  }

  function resolveNode(S, cur) {
    if (cur.kind === "arc") return { ...cur, node: D.ARCS[cur.id] };
    if (cur.kind === "event") {
      for (const s of SEASONS) {
        const e = (D.SEASON_EVENTS[s] || []).find(x => x.id === cur.id);
        if (e) return { ...cur, node: e };
      }
    }
    const season = seasonOf(S.day);
    return { kind: "empty", id: "empty", node: { title: D.EMPTY_DAY.title_by_season[season], paras: D.EMPTY_DAY.paras, choices: D.EMPTY_DAY.choices } };
  }

  // ---- multi-beat: một node có thể là chuỗi nhịp {paras,choices} ----
  // node.beats vắng => node tự nó là một nhịp (tương thích ngược).
  function beatOf(node, S) {
    if (!node.beats) return node;
    const i = Math.min(S.beat || 0, node.beats.length - 1);
    return node.beats[i];
  }
  function beatCount(node) { return node.beats ? node.beats.length : 1; }
  function isFinalBeat(node, S) { return !node.beats || (S.beat || 0) >= node.beats.length - 1; }

  function visibleParas(S, node)   { return beatOf(node, S).paras.filter(p => condOk(S, p)); }
  function visibleChoices(S, node) { return beatOf(node, S).choices.filter(c => condOk(S, c)); }

  // ---- apply a choice ----
  function applyChoice(S, choice) {
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

  // ---- epilogue: lắp thành mảng đoạn văn (UI chỉ việc in) ----
  function epilogueParas(S) {
    const out = [D.EPILOGUE.opening];
    D.EPILOGUE.arcs.filter(b => condOk(S, b)).forEach(b => out.push(b.text));
    const dom = dominantStat(S);
    out.push(D.EPILOGUE.by_stat[dom === "none" ? "tinh" : dom]);
    D.EPILOGUE.closing.split("\n\n").forEach(t => out.push(t));
    return out;
  }

  function yardLine(S)  { return D.YARD_LINES[seasonOf(S.day)][dominantStat(S)]; }
  function hudLine(S)   { return SEASON_NAMES[seasonOf(S.day)] + " · Ngày " + S.day; }
  function statsLine(S) { return "Sổ Nhỏ: " + S.journal.length + " câu · Vật trong sân: " + S.items.length; }

  return {
    TOTAL_DAYS, DAYS_PER_SEASON, SEASONS, SEASON_NAMES, EMPTY_WEATHER,
    newState, seasonOf, hasFlag, condOk, seededRand, weatherOf, dominantStat,
    pickToday, resolveNode, visibleParas, visibleChoices, applyChoice,
    beatOf, beatCount, isFinalBeat,
    epilogueParas, yardLine, hudLine, statsLine,
    data: D,
  };
});
