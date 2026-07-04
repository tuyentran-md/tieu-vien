// Headless playtest — chạy: node test/sim.js
// Dùng core.js THẬT (không mirror engine — hết sim-drift).
// Kiểm: refs tồn tại, mọi ngày có >=1 đoạn văn + >=1 choice, arc hoàn tất trước ngày 48, epilogue lắp được.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = ["data/arcs.js", "data/events.js", "data/quotes.js", "data/epilogue.js"]
  .map(f => fs.readFileSync(path.join(__dirname, "..", f), "utf8")).join("\n")
  + "\n;({ ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE });";
const D = vm.runInNewContext(src, {}, { filename: "data-bundle" });
const { ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE } = D;

const createCore = require("../core.js");
const C = createCore(D);
const SEASONS = C.SEASONS;

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
// core sanity: seededRand/weatherOf luôn hợp lệ cả 48 ngày
for (let d = 1; d <= C.TOTAL_DAYS; d++) {
  const r = C.seededRand(d);
  if (!(r >= 0 && r < 1)) fail(`seededRand(${d}) = ${r} ngoài [0,1)`);
  const w = C.weatherOf(d);
  if (!["rain", "snow", "clear"].includes(w)) fail(`weatherOf(${d}) = '${w}' không hợp lệ`);
}

// ---------- playthrough qua core thật ----------
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function playthrough(pickFn, seed, label) {
  const S = C.newState();
  const rng = seed === null ? undefined : mulberry(seed); // undefined → core dùng seededRand(day) như browser thật
  for (; S.day <= C.TOTAL_DAYS; S.day++) {
    const cur = C.pickToday(S, rng);
    const t = C.resolveNode(S, cur);
    if (!t.node) { fail(`[${label}] ngày ${S.day}: resolveNode('${cur.id}') không có node`); continue; }
    const paras = C.visibleParas(S, t.node);
    if (!paras.length) fail(`[${label}] ngày ${S.day} node '${t.id}': 0 đoạn văn hiển thị (flags=${Object.keys(S.flags)})`);
    const vis = C.visibleChoices(S, t.node);
    if (!vis.length) { fail(`[${label}] ngày ${S.day} node '${t.id}': 0 choice hiển thị (flags=${Object.keys(S.flags).join(",")})`); continue; }
    C.applyChoice(S, pickFn(vis, rng || (() => C.seededRand(S.day))));
  }
  if (S.scheduled.length) fail(`[${label}] hết năm còn node chưa nổ: ${S.scheduled.map(s => s.node + "@" + s.day).join(", ")}`);
  const arcBlocks = EPILOGUE.arcs.filter(b => C.condOk(S, b));
  const mocDone = arcBlocks.some(b => (b.if || "").startsWith("moc"));
  const thuDone = arcBlocks.some(b => (b.if || "").startsWith("thu_end") || b.if === "thu_dead");
  const coDone = arcBlocks.some(b => (b.if || "").startsWith("co_end") || b.if === "co_dead");
  if (!mocDone) fail(`[${label}] epilogue: không có block nào cho arc Mộc (flags=${Object.keys(S.flags).filter(f => f.startsWith("moc")).join(",")})`);
  if (!thuDone) fail(`[${label}] epilogue: không có block nào cho arc Trần Thức (flags=${Object.keys(S.flags).filter(f => f.startsWith("thu")).join(",")})`);
  if (!coDone) fail(`[${label}] epilogue: không có block nào cho arc ông lão cờ (flags=${Object.keys(S.flags).filter(f => f.startsWith("co")).join(",")})`);
  const ep = C.epilogueParas(S);
  if (ep.length < 4) fail(`[${label}] epilogue quá ngắn: ${ep.length} đoạn`);
  return S;
}

// ---------- run ----------
playthrough(v => v[0], null, "first-choice-browserRNG"); // đúng RNG browser sẽ dùng
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
console.log("✓ Tất cả playthrough sạch (3 deterministic + 300 random) — chạy qua core.js thật.");
