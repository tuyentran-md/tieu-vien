// Headless playtest — chạy: node test/sim.js
// Kiểm: node/quote/item refs tồn tại, mọi ngày có >=1 choice, arc hoàn tất trước ngày 48, epilogue lắp được.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = ["data/arcs.js", "data/events.js", "data/quotes.js", "data/epilogue.js"]
  .map(f => fs.readFileSync(path.join(__dirname, "..", f), "utf8")).join("\n")
  + "\n;({ ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE });";
const { ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE } = vm.runInNewContext(src, {}, { filename: "data-bundle" });

const TOTAL_DAYS = 48, DPS = 12, SEASONS = ["xuan", "ha", "thu", "dong"];
let failures = [];
const fail = m => failures.push(m);

// ---------- static checks ----------
function collectChoices() {
  const all = [];
  for (const [id, n] of Object.entries(ARCS)) n.choices.forEach(c => all.push([id, c]));
  for (const s of SEASONS) (SEASON_EVENTS[s] || []).forEach(e => e.choices.forEach(c => all.push([e.id, c])));
  EMPTY_DAY.choices.forEach(c => all.push(["empty", c]));
  return all;
}
for (const [src, c] of collectChoices()) {
  if (c.schedule && !ARCS[c.schedule.node]) fail(`${src}: schedule tới node không tồn tại '${c.schedule.node}'`);
  if (c.quote && !QUOTES[c.quote]) fail(`${src}: quote không tồn tại '${c.quote}'`);
  if (c.item && !ITEMS[c.item]) fail(`${src}: item không tồn tại '${c.item}'`);
  if (!c.result) fail(`${src}: choice thiếu result`);
}
for (const a of ARC_STARTS) if (!ARCS[a.node]) fail(`ARC_STARTS: node '${a.node}' không tồn tại`);
for (const s of SEASONS) {
  for (const k of ["tam", "duyen", "danh", "tinh", "none"]) if (!YARD_LINES[s][k]) fail(`YARD_LINES.${s}.${k} thiếu`);
  if (!EMPTY_DAY.title_by_season[s]) fail(`EMPTY_DAY title thiếu mùa ${s}`);
}

// ---------- sim engine (mirror game.js logic) ----------
function makeState() {
  return { day: 1, stats: { tam: 0, duyen: 0, danh: 0, tinh: 0 }, flags: {}, scheduled: ARC_STARTS.map(a => ({ ...a })), usedEvents: [], journal: [], items: [] };
}
function seasonOf(d) { return SEASONS[Math.min(3, Math.floor((d - 1) / DPS))]; }
function hasFlag(S, f) {
  if (f.startsWith("___")) { const m = f.match(/^___([a-z]+)(\d+)$/); return m ? S.stats[m[1]] >= +m[2] : false; }
  return !!S.flags[f];
}
function condOk(S, o) {
  if (o.if && !hasFlag(S, o.if)) return false;
  if (o.ifNot && hasFlag(S, o.ifNot)) return false;
  if (o.req) { const v = S.stats[o.req.stat] || 0; if (o.req.min !== undefined && v < o.req.min) return false; if (o.req.max !== undefined && v > o.req.max) return false; }
  if (o.once && S.flags[o.once]) return false;
  return true;
}
function todaysNode(S, rng) {
  const due = S.scheduled.filter(s => s.day <= S.day).sort((a, b) => a.day - b.day);
  if (due.length) { const p = due[0]; S.scheduled = S.scheduled.filter(s => s !== p); return { kind: "arc", id: p.node, node: ARCS[p.node] }; }
  const season = seasonOf(S.day);
  const pool = (SEASON_EVENTS[season] || []).filter(e => {
    if (S.usedEvents.includes(e.id)) return false;
    if (e.reqStat && (S.stats[e.reqStat.stat] || 0) < e.reqStat.min) return false;
    if (e.reqFlag && !hasFlag(S, e.reqFlag)) return false;
    return true;
  });
  if (pool.length) { const e = pool[Math.floor(rng() * pool.length)]; S.usedEvents.push(e.id); return { kind: "event", id: e.id, node: e }; }
  return { kind: "empty", id: "empty", node: { title: EMPTY_DAY.title_by_season[season], paras: EMPTY_DAY.paras, choices: EMPTY_DAY.choices } };
}
function applyChoice(S, c) {
  if (c.effects) for (const k in c.effects) S.stats[k] = (S.stats[k] || 0) + c.effects[k];
  if (c.flags) c.flags.forEach(f => S.flags[f] = true);
  if (c.once) S.flags[c.once] = true;
  if (c.schedule) S.scheduled.push({ day: S.day + c.schedule.delay, node: c.schedule.node });
  if (c.quote && !S.journal.includes(c.quote)) S.journal.push(c.quote);
  if (c.item && !S.items.includes(c.item)) { S.items.push(c.item); S.flags["item_" + c.item] = true; }
  if (c.kill) { S.flags[c.kill + "_dead"] = true; S.scheduled = S.scheduled.filter(s => !s.node.startsWith(c.kill + "_")); }
}
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function playthrough(pickFn, seed, label) {
  const S = makeState(), rng = mulberry(seed);
  const seen = [];
  for (; S.day <= TOTAL_DAYS; S.day++) {
    const t = todaysNode(S, rng);
    seen.push(t.id);
    const paras = t.node.paras.filter(p => condOk(S, p));
    if (!paras.length) fail(`[${label}] ngày ${S.day} node '${t.id}': 0 đoạn văn hiển thị (flags=${Object.keys(S.flags)})`);
    const vis = t.node.choices.filter(c => condOk(S, c));
    if (!vis.length) { fail(`[${label}] ngày ${S.day} node '${t.id}': 0 choice hiển thị (flags=${Object.keys(S.flags).join(",")})`); continue; }
    applyChoice(S, pickFn(vis, rng));
  }
  if (S.scheduled.length) fail(`[${label}] hết năm còn node chưa nổ: ${S.scheduled.map(s => s.node + "@" + s.day).join(", ")}`);
  const arcBlocks = EPILOGUE.arcs.filter(b => condOk(S, b));
  const mocDone = arcBlocks.some(b => (b.if || "").startsWith("moc"));
  const thuDone = arcBlocks.some(b => (b.if || "").startsWith("thu_end") || b.if === "thu_dead");
  const coDone = arcBlocks.some(b => (b.if || "").startsWith("co_end") || b.if === "co_dead");
  if (!mocDone) fail(`[${label}] epilogue: không có block nào cho arc Mộc (flags=${Object.keys(S.flags).filter(f => f.startsWith("moc")).join(",")})`);
  if (!thuDone) fail(`[${label}] epilogue: không có block nào cho arc Trần Thức (flags=${Object.keys(S.flags).filter(f => f.startsWith("thu")).join(",")})`);
  if (!coDone) fail(`[${label}] epilogue: không có block nào cho arc ông lão cờ (flags=${Object.keys(S.flags).filter(f => f.startsWith("co")).join(",")})`);
  return S;
}

// ---------- run ----------
playthrough(v => v[0], 1, "first-choice");
playthrough(v => v[v.length - 1], 2, "last-choice");
let totQ = 0, totI = 0, runs = 300;
for (let i = 0; i < runs; i++) {
  const S = playthrough((v, rng) => v[Math.floor(rng() * v.length)], 1000 + i, "rand" + i);
  totQ += S.journal.length; totI += S.items.length;
}
console.log(`Avg quotes/run: ${(totQ / runs).toFixed(1)} / ${Object.keys(QUOTES).length}  ·  Avg items/run: ${(totI / runs).toFixed(1)} / ${Object.keys(ITEMS).length}`);

if (failures.length) {
  console.error(`\n✗ ${failures.length} lỗi:`);
  [...new Set(failures)].slice(0, 40).forEach(f => console.error("  - " + f));
  process.exit(1);
}
console.log("✓ Tất cả playthrough sạch (2 deterministic + 300 random).");
