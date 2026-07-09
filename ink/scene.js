// ===== Sơn thủy sống — scene module (SPEC v3 §2) =====
// Painted background + DOM bitmap overlays; SVG is now only legacy/fallback scenery.
// API: InkScene.boot(el) → { setDay, npcArrive, npcLeave, setPhase, onTap, setHotspotsGlow, tipAt }

(function (root) {

  // ---- NPC ink figures (feet at local 0,0, drawn upward; adult ~78 units) ----
  // Dáng người thủy mặc: áo chữ A, cổ giao lĩnh, tay chắp trong tay áo,
  // màu lấy từ bảng màu tranh nền. Mỗi vai một phụ kiện nhận diện.
  const SKIN = "#c9a582", SKIN_D = "#b6906d", HAIR = "#3a352c";
  const INK = "rgba(46,40,30,.42)", FOLD = "rgba(40,34,24,.18)";

  function pShadow(w) {
    return '<ellipse cx="0" cy="1.6" rx="' + w + '" ry="3" fill="rgba(50,44,32,.26)"/>';
  }
  // thân áo: hem half-width hw, vai sw, vai ở độ cao H
  function pRobe(c, hw, sw, H, dark) {
    return '<path d="M' + -hw + ',0 Q' + -(hw + 1.5) + ',' + (-H * .5) + ' ' + -sw + ',' + -H
      + ' Q0,' + -(H + 4.5) + ' ' + sw + ',' + -H
      + ' Q' + (hw + 1.5) + ',' + (-H * .5) + ' ' + hw + ',0 Q0,3 ' + -hw + ',0 Z"'
      + ' fill="' + c + '" stroke="' + INK + '" stroke-width=".7"/>'
      + '<path d="M' + -hw + ',0 Q0,3 ' + hw + ',0 Q' + (hw - 3) + ',-6.5 0,-7.5 Q' + -(hw - 3) + ',-6.5 ' + -hw + ',0 Z" fill="'
      + (dark || "rgba(40,34,24,.14)") + '"/>'
      + '<path d="M' + (-hw * .42) + ',' + (-H * .42) + ' Q' + (-hw * .5) + ',' + (-H * .2) + ' ' + (-hw * .6) + ',-2" stroke="' + FOLD + '" stroke-width=".8" fill="none"/>'
      + '<path d="M' + (hw * .42) + ',' + (-H * .42) + ' Q' + (hw * .5) + ',' + (-H * .2) + ' ' + (hw * .6) + ',-2" stroke="' + FOLD + '" stroke-width=".8" fill="none"/>';
  }
  // tay chắp trước ngực, bàn tay giấu trong tay áo
  function pSleeves(c, H) {
    const y1 = -H * .76, y2 = -H * .58;
    return '<path d="M-9,' + y1 + ' Q0,' + (y1 + 6) + ' 9,' + y1 + ' L7,' + y2 + ' Q0,' + (y2 + 5) + ' -7,' + y2 + ' Z"'
      + ' fill="' + c + '" stroke="' + INK + '" stroke-width=".7"/>'
      + '<path d="M-8.4,' + (y1 + 2.2) + ' Q0,' + (y1 + 8) + ' 8.4,' + (y1 + 2.2) + '" stroke="rgba(40,34,24,.22)" stroke-width=".7" fill="none"/>';
  }
  // cổ áo giao lĩnh
  function pCollar(inner, H) {
    return '<path d="M-4.4,' + -(H - 1) + ' L0,' + -(H - 12) + ' L4.4,' + -(H - 1) + ' L0,' + -(H + 2) + ' Z" fill="' + inner + '"/>'
      + '<path d="M-4.4,' + -(H - 1) + ' L0,' + -(H - 12) + ' M4.4,' + -(H - 1) + ' L0,' + -(H - 12) + '" stroke="' + INK + '" stroke-width=".7" fill="none"/>';
  }
  // thắt lưng + dải rủ
  function pBelt(c, H) {
    const y = -H * .565;
    return '<path d="M-7.6,' + y + ' L7.6,' + y + ' L7,' + (y + 4.2) + ' L-7,' + (y + 4.2) + ' Z" fill="' + c + '"/>'
      + '<path d="M-.7,' + (y + 4) + ' q-1.6,6 -3.2,9.5 M.7,' + (y + 4) + ' q1.8,6 3.4,9" stroke="rgba(30,26,18,.4)" stroke-width=".9" fill="none"/>';
  }
  // cổ + đầu; style: bun | white | bald | scarf | buns | boy | band | hat | lowbun
  function pHead(H, style, skin, hairC) {
    const hy = -(H + 9.2), r = 5.2, sk = skin || SKIN, hc = hairC || HAIR;
    let s = '<path d="M-2.1,' + -(H - 1.5) + ' L2.1,' + -(H - 1.5) + ' L1.9,' + -(H + 3.5) + ' L-1.9,' + -(H + 3.5) + ' Z" fill="' + SKIN_D + '"/>'
      + '<circle cx="0" cy="' + hy + '" r="' + r + '" fill="' + sk + '" stroke="rgba(110,82,55,.3)" stroke-width=".5"/>';
    if (style !== "bald") {
      // tóc ôm đầu, rẽ đường ngôi thấp trên trán
      s += '<path d="M-' + (r + .3) + ',' + (hy + 1) + ' Q' + -(r + .1) + ',' + (hy - r - 1.4) + ' 0,' + (hy - r - 1.7)
        + ' Q' + (r + .1) + ',' + (hy - r - 1.4) + ' ' + (r + .3) + ',' + (hy + 1)
        + ' Q' + (r * .78) + ',' + (hy - r * .1) + ' ' + (r * .66) + ',' + (hy - r * .48)
        + ' Q' + (r * .3) + ',' + (hy - r * .28) + ' 0,' + (hy - r * .3)
        + ' Q' + -(r * .3) + ',' + (hy - r * .28) + ' -' + (r * .66) + ',' + (hy - r * .48)
        + ' Q' + -(r * .78) + ',' + (hy - r * .1) + ' -' + (r + .3) + ',' + (hy + 1) + ' Z" fill="' + hc + '"/>';
    }
    if (style === "bun" || style === "white") {
      s += '<ellipse cx="0" cy="' + (hy - r - 3) + '" rx="2.5" ry="2.1" fill="' + hc + '"/>'
        + '<path d="M-4,' + (hy - r - 3.4) + ' L4.4,' + (hy - r - 2.4) + '" stroke="#8a7355" stroke-width=".9"/>';
    }
    if (style === "boy") {
      s += '<path d="M-1.6,' + (hy - r - 1) + ' q1.6,-3.4 3.4,-1.6 q-1.4,2 -3.4,1.6 Z" fill="' + hc + '"/>';
    }
    if (style === "buns") {
      s += '<circle cx="-4.6" cy="' + (hy - r + .4) + '" r="2" fill="' + hc + '"/>'
        + '<circle cx="4.6" cy="' + (hy - r + .4) + '" r="2" fill="' + hc + '"/>';
    }
    if (style === "lowbun") {
      s += '<ellipse cx="-4.2" cy="' + (hy + 2.6) + '" rx="2.2" ry="1.8" fill="' + hc + '"/>'
        + '<path d="M-6.4,' + (hy + 1.2) + ' L-1.6,' + (hy + 3.6) + '" stroke="#a08a5e" stroke-width=".8"/>';
    }
    if (style === "band") {
      s += '<ellipse cx="0" cy="' + (hy - r - 2.6) + '" rx="2.3" ry="2" fill="' + hc + '"/>'
        + '<path d="M2,' + (hy - r - 2.4) + ' q4.2,1.6 4.6,7.6" stroke="' + hc + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
        + '<path d="M-' + (r - .4) + ',' + (hy - 1.8) + ' Q0,' + (hy - 3.6) + ' ' + (r - .4) + ',' + (hy - 1.8) + '" stroke="#5a4a36" stroke-width="1" fill="none"/>';
    }
    if (style === "scarf") {
      s += '<path d="M-' + (r + .6) + ',' + (hy + 1) + ' Q' + -(r - .2) + ',' + (hy - r - 2.4) + ' 0,' + (hy - r - 2.6)
        + ' Q' + (r - .2) + ',' + (hy - r - 2.4) + ' ' + (r + .6) + ',' + (hy + 1)
        + ' L' + (r * .7) + ',' + (hy + r) + ' Q0,' + (hy + r + 1.6) + ' -' + (r * .7) + ',' + (hy + r) + ' Z"'
        + ' fill="#a29a8a" stroke="' + INK + '" stroke-width=".6"/>'
        + '<circle cx="0" cy="' + (hy + r + 1.2) + '" r="1.1" fill="#8a8274"/>';
    }
    if (style === "hat") {
      s += '<path d="M-10,' + (hy - .4) + ' Q-4,' + (hy - 9.6) + ' 0,' + (hy - 9.8) + ' Q4,' + (hy - 9.6) + ' 10,' + (hy - .4)
        + ' Q0,' + (hy - 3.2) + ' -10,' + (hy - .4) + ' Z" fill="#8a7a58" stroke="' + INK + '" stroke-width=".7"/>'
        + '<path d="M-7.8,' + (hy - 1.6) + ' Q0,' + (hy - 4.6) + ' 7.8,' + (hy - 1.6) + '" stroke="rgba(60,50,36,.35)" stroke-width=".6" fill="none"/>';
    }
    return s;
  }
  function pBeard(H, c) {
    const hy = -(H + 9.2);
    return '<path d="M-2.8,' + (hy + 4) + ' Q0,' + (hy + 12) + ' 2.8,' + (hy + 4) + ' Q0,' + (hy + 5.8) + ' -2.8,' + (hy + 4) + ' Z" fill="' + (c || "#cfc8b8") + '"/>';
  }
  function pStaff(x1, x2, c) {
    return '<path d="M' + x1 + ',1.5 L' + x2 + ',-58" stroke="' + (c || "#6b5c44") + '" stroke-width="1.7" stroke-linecap="round"/>';
  }
  function assemble(parts) { return "<g>" + parts.join("") + "</g>"; }

  const FIGS = {
    // Mộc — thiếu niên áo vá, cầm nhánh trúc
    boy: assemble([
      pShadow(10),
      '<path d="M6.5,2 L11.5,-42" stroke="#7d8a5e" stroke-width="1.4" stroke-linecap="round"/>',
      '<path d="M11.5,-42 q3,-2.6 5.6,-2 M11,-38.5 q-3.2,-1.6 -5.4,-.4" stroke="#7d8a5e" stroke-width="1" fill="none"/>',
      pRobe("#7c6a4e", 10.5, 5, 48),
      '<path d="M2.6,-44.5 l4.6,1.6 l-1.2,4.6 l-4.6,-1.6 Z" fill="#94815f" stroke="rgba(40,34,24,.3)" stroke-width=".5"/>',
      pCollar("#c9bfa6", 48),
      pBelt("#57503f", 48),
      pSleeves("#7c6a4e", 48),
      pHead(48, "boy"),
    ]),
    // Trần Thức — thư sinh áo xám lam, tráp sách sau lưng
    scholar: assemble([
      pShadow(12),
      '<rect x="-13" y="-53" width="7.5" height="19" rx="1.6" fill="#7a6a50" stroke="rgba(40,34,24,.35)" stroke-width=".6"/>',
      '<path d="M-13,-48 l7.5,0 M-13,-40 l7.5,0" stroke="rgba(40,34,24,.3)" stroke-width=".6"/>',
      pRobe("#5d6572", 12.5, 5.8, 62),
      '<path d="M-6,-61 L4,-38" stroke="#4a4438" stroke-width="1.1"/>',
      pCollar("#d8d2c0", 62),
      pBelt("#454c58", 62),
      pSleeves("#5d6572", 62),
      pHead(62, "bun"),
    ]),
    // ông lão đánh cờ — áo trắng, râu bạc, gậy trúc
    oldman: assemble([
      pShadow(12),
      pStaff(10, 12.5),
      pRobe("#d8d4c6", 13, 6, 58, "rgba(90,84,70,.2)"),
      pCollar("#b8b2a2", 58),
      pBelt("#a39c8a", 58),
      pSleeves("#d8d4c6", 58),
      pHead(58, "white", SKIN, "#cfc9bb"),
      pBeard(58, "#d5cfc1"),
    ]),
    // khách cờ trung niên
    oldman2: assemble([
      pShadow(12),
      pStaff(-10, -12.5),
      pRobe("#625c50", 12.5, 5.8, 58),
      pCollar("#c2b9a4", 58),
      pBelt("#4a4438", 58),
      pSleeves("#625c50", 58),
      pHead(58, "bun", SKIN, "#6b655a"),
      pBeard(58, "#8a8274"),
    ]),
    // kiếm khách — áo sẫm, kiếm bên hông trái
    swordsman: assemble([
      pShadow(12),
      pRobe("#474c55", 12, 5.8, 62),
      '<path d="M-7.5,-30 L-13,-8" stroke="#33363c" stroke-width="2.4" stroke-linecap="round"/>',
      '<path d="M-7.5,-30 L-5,-38" stroke="#8a7a58" stroke-width="1.6" stroke-linecap="round"/>',
      '<circle cx="-6.8" cy="-32.5" r="1.7" fill="#a4531f"/>',
      pCollar("#b8b2a2", 62),
      pBelt("#8f4a22", 62),
      pSleeves("#474c55", 62),
      pHead(62, "band"),
    ]),
    // tăng nhân — đầu trần, cà sa vắt chéo
    monk: assemble([
      pShadow(12),
      pStaff(10, 11.5, "#5a4a36"),
      pRobe("#6b6150", 12.5, 5.8, 60),
      '<path d="M-5.4,-59 Q6,-54 6.8,-38 Q7.4,-20 6,-4 L-1.5,-3 Q-6.5,-30 -5.4,-59 Z" fill="#8a7355" stroke="' + INK + '" stroke-width=".6"/>',
      pSleeves("#6b6150", 60),
      '<path d="M-5,-42 Q0,-38.5 5,-42" stroke="#4a4438" stroke-width="1" fill="none" stroke-dasharray="1.4 1.6"/>',
      pHead(60, "bald"),
    ]),
    // cô gái hái thuốc — gùi thuốc sau lưng
    woman: assemble([
      pShadow(11.5),
      '<path d="M5.5,-52 L14,-49.5 L11.8,-27 L5,-29.5 Z" fill="#a08a5e" stroke="rgba(40,34,24,.35)" stroke-width=".6"/>',
      '<path d="M6.2,-46 l6.8,2 M5.9,-40 l6.4,1.8 M5.6,-34 l6.2,1.8" stroke="rgba(40,34,24,.28)" stroke-width=".5"/>',
      '<path d="M8,-52.5 q1.4,-3 3.8,-2.4 M10.6,-51.6 q2.4,-2.2 4.2,-1" stroke="#6c7a62" stroke-width="1" fill="none"/>',
      pRobe("#7b636b", 12, 5.5, 60),
      pCollar("#cfc4ae", 60),
      pBelt("#a3927c", 60),
      pSleeves("#7b636b", 60),
      pHead(60, "lowbun"),
    ]),
    // con bé dưới chân núi
    child: assemble([
      pShadow(9),
      pRobe("#8a6f52", 9.5, 4.6, 40),
      pCollar("#cfc4ae", 40),
      pBelt("#6b5c44", 40),
      pSleeves("#8a6f52", 40),
      pHead(40, "buns"),
    ]),
    // người mẹ tìm con — khăn vấn, dáng nâu bạc
    oldwoman: assemble([
      pShadow(11.5),
      pStaff(-9.5, -11.5),
      pRobe("#6b6154", 12, 5.6, 56),
      pCollar("#b8ab92", 56),
      pBelt("#57503f", 56),
      pSleeves("#6b6154", 56),
      pHead(56, "scarf"),
    ]),
    // người buôn — đòn gánh, hai bọc hàng
    trader: assemble([
      pShadow(12),
      '<path d="M-23,-55 Q0,-60 23,-55.5" stroke="#6b5c44" stroke-width="1.6" fill="none"/>',
      '<path d="M-21.5,-55.5 l0,7 M21.5,-55.8 l0,7.5" stroke="rgba(40,34,24,.5)" stroke-width=".7"/>',
      '<path d="M-25.5,-48.5 q4,-2.6 8,0 q.4,5 -4,6.5 q-4.4,-1.5 -4,-6.5 Z" fill="#8a7a5e" stroke="rgba(40,34,24,.35)" stroke-width=".6"/>',
      '<path d="M17.5,-48.2 q4,-2.6 8,0 q.4,5 -4,6.5 q-4.4,-1.5 -4,-6.5 Z" fill="#8a7a5e" stroke="rgba(40,34,24,.35)" stroke-width=".6"/>',
      pRobe("#665e4c", 12, 5.8, 60),
      pCollar("#c2b59a", 60),
      pBelt("#4c463a", 60),
      pSleeves("#665e4c", 60),
      pHead(60, "bun"),
    ]),
    // người làng
    villager: assemble([
      pShadow(11.5),
      pRobe("#57503f", 12, 5.6, 58),
      '<path d="M-5.6,-57 Q-8,-44 -6.8,-34 L-3.4,-35 Q-4.4,-46 -2.8,-56 Z" fill="#8a7a5e" opacity=".85"/>',
      pCollar("#b8ab92", 58),
      pBelt("#3f3a30", 58),
      pSleeves("#57503f", 58),
      pHead(58, "bun"),
    ]),
    // người đưa thư / khách lỡ đường — nón lá, áo sẫm
    master: assemble([
      pShadow(12),
      pRobe("#45484e", 12.5, 5.8, 60),
      pCollar("#9a9284", 60),
      pBelt("#33363c", 60),
      pSleeves("#45484e", 60),
      pHead(60, "hat"),
    ]),
  };

  // khách lỡ đường đội nón như người đưa thư — cùng một dáng
  FIGS.traveler = FIGS.master;

  const POS = { gate: [150, 438], yard: [525, 416], talk: [560, 406], mountain: [58, 310] };

  const SVG = ''
  + '<svg class="ink-svg" viewBox="0 0 800 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'

  // far mountains
  + '<path class="mtn1" opacity=".5" d="M-10,238 L60,150 Q80,124 108,142 L170,86 Q186,72 204,90 L268,170 L330,120 Q348,102 366,124 L430,224 L800,238 L800,260 L-10,260 Z"/>'
  + '<path class="mtn2" opacity=".6" d="M300,242 L390,140 Q412,112 438,138 L500,96 Q518,82 538,102 L610,196 L668,148 Q684,132 700,152 L780,250 L810,258 L810,280 L300,280 Z"/>'
  + '<path class="mtn3" opacity=".72" d="M-10,268 L90,196 Q112,178 136,198 L210,258 L282,214 Q302,198 322,218 L400,286 L-10,290 Z"/>'

  // mid ridge + pines
  + '<path class="ridge" opacity=".8" d="M-10,306 L120,268 Q240,236 360,262 L520,296 L680,272 L810,300 L810,340 L-10,340 Z"/>'
  + '<g class="pine" opacity=".9">'
  + '<path d="M96,262 l7,-26 l7,26 l-5,0 l0,10 l-4,0 l0,-10 Z"/>'
  + '<path d="M118,255 l8,-30 l8,30 l-6,0 l0,12 l-4,0 l0,-12 Z"/>'
  + '<path d="M142,260 l6,-22 l6,22 l-4,0 l0,9 l-4,0 l0,-9 Z"/>'
  + '<path d="M636,270 l7,-26 l7,26 l-5,0 l0,10 l-4,0 l0,-10 Z"/>'
  + '<path d="M660,264 l8,-30 l8,30 l-6,0 l0,12 l-4,0 l0,-12 Z"/></g>'

  // ground + stone path
  + '<rect class="ground-far" x="0" y="336" width="800" height="184"/>'
  + '<ellipse class="ground-near" cx="400" cy="430" rx="420" ry="120"/>'
  + '<g class="snowpatch" fill="#f4f4ef"><ellipse cx="180" cy="440" rx="60" ry="14"/>'
  + '<ellipse cx="430" cy="470" rx="80" ry="16"/><ellipse cx="620" cy="430" rx="50" ry="11"/></g>'
  + '<g class="stone" stroke-width="1">'
  + '<ellipse cx="212" cy="470" rx="17" ry="7"/><ellipse cx="252" cy="452" rx="15" ry="6"/>'
  + '<ellipse cx="294" cy="438" rx="16" ry="6.5"/><ellipse cx="340" cy="426" rx="14" ry="6"/>'
  + '<ellipse cx="388" cy="418" rx="16" ry="6.5"/><ellipse cx="438" cy="412" rx="14" ry="6"/>'
  + '<ellipse cx="488" cy="408" rx="15" ry="6"/></g>'

  // bamboo grove
  + '<g class="bamboo-stalk" stroke-width="5" opacity=".85" fill="none">'
  + '<line x1="40" y1="520" x2="52" y2="240"/><line x1="74" y1="520" x2="80" y2="215"/>'
  + '<line x1="108" y1="520" x2="104" y2="248"/></g>'
  + '<g class="bamboo-twig" stroke-width="1.6" opacity=".8" fill="none">'
  + '<path d="M52,290 q-30,-16 -46,-8"/><path d="M50,330 q26,-20 44,-14"/>'
  + '<path d="M79,255 q-26,-18 -44,-10"/><path d="M78,300 q28,-16 46,-8"/>'
  + '<path d="M105,285 q-24,-14 -40,-8"/><path d="M104,330 q24,-18 42,-12"/></g>'
  + '<g class="bamboo-clump" opacity=".75">'
  + '<path d="M6,282 q22,-10 34,2 q-20,8 -34,-2 Z"/><path d="M92,320 q22,-12 36,0 q-20,10 -36,0 Z"/>'
  + '<path d="M34,246 q20,-12 34,-2 q-18,10 -34,2 Z"/><path d="M118,276 q20,-10 34,0 q-18,9 -34,0 Z"/></g>'

  // big tree (trunk + foliage + winter bare branches)
  + '<path d="M258,420 Q252,360 240,332 Q236,318 248,306" stroke="#4c4a40" stroke-width="11" fill="none" stroke-linecap="round"/>'
  + '<path d="M250,340 Q276,320 300,318" stroke="#4c4a40" stroke-width="6" fill="none" stroke-linecap="round"/>'
  + '<g class="bare" stroke="#55524a" stroke-width="3" fill="none" stroke-linecap="round">'
  + '<path d="M248,306 Q236,276 214,262"/><path d="M248,306 Q260,268 288,254"/>'
  + '<path d="M244,318 Q206,296 178,296"/><path d="M300,318 Q330,300 344,286"/>'
  + '<path d="M252,296 Q252,262 246,244"/></g>'
  + '<g class="fol-a"><ellipse cx="242" cy="272" rx="92" ry="44" opacity=".9"/>'
  + '<ellipse cx="168" cy="292" rx="56" ry="30" opacity=".8"/>'
  + '<ellipse cx="318" cy="294" rx="62" ry="30" opacity=".85"/>'
  + '<ellipse cx="252" cy="238" rx="60" ry="28" opacity=".75"/></g>'
  + '<g class="fol-b" opacity=".7"><ellipse cx="212" cy="258" rx="40" ry="18"/>'
  + '<ellipse cx="296" cy="270" rx="42" ry="17"/></g>'

  // house: porch, pillars, wall, window+lamp, door, roof
  + '<g><rect x="500" y="392" width="268" height="16" rx="3" fill="#8a7a62"/>'
  + '<rect x="508" y="408" width="10" height="18" fill="#6f6350"/>'
  + '<rect x="742" y="408" width="10" height="18" fill="#6f6350"/>'
  + '<rect x="500" y="386" width="268" height="8" rx="3" fill="#9c8c72"/>'
  + '<rect x="516" y="286" width="11" height="104" fill="#5d5648"/>'
  + '<rect x="742" y="286" width="11" height="104" fill="#554e41"/>'
  + '<rect x="628" y="286" width="10" height="104" fill="#5d5648"/>'
  + '<rect x="527" y="292" width="215" height="98" fill="#cfc4a6"/>'
  + '<rect x="547" y="308" width="58" height="52" fill="#3f3a30"/>'
  + '<rect class="lamp" x="551" y="312" width="50" height="44"/>'
  + '<g stroke="#3f3a30" stroke-width="3"><line x1="568" y1="312" x2="568" y2="356"/>'
  + '<line x1="585" y1="312" x2="585" y2="356"/><line x1="551" y1="327" x2="601" y2="327"/>'
  + '<line x1="551" y1="342" x2="601" y2="342"/></g>'
  + '<rect x="660" y="304" width="64" height="86" fill="#42413a"/>'
  + '<rect x="663" y="307" width="28" height="80" fill="#efe7d2"/>'
  + '<rect x="694" y="307" width="27" height="80" fill="#e6dcc4"/>'
  + '<g stroke="#8a8270" stroke-width="2"><line x1="677" y1="307" x2="677" y2="387"/>'
  + '<line x1="707" y1="307" x2="707" y2="387"/><line x1="663" y1="334" x2="721" y2="334"/>'
  + '<line x1="663" y1="361" x2="721" y2="361"/></g>'
  + '<path d="M462,306 Q520,294 544,252 Q570,218 634,216 Q698,218 724,252 Q748,294 806,306 Z" fill="#3e4440"/>'
  + '<path d="M474,300 Q560,272 634,270 Q708,272 794,300 L794,306 L474,306 Z" fill="#333833"/>'
  + '<path d="M462,306 q-16,-2 -24,-14 q18,0 30,5 Z" fill="#3e4440"/>'
  + '<path d="M806,306 q16,-2 24,-14 q-18,0 -30,5 Z" fill="#3e4440"/>'
  + '<ellipse cx="634" cy="218" rx="10" ry="4" fill="#333833"/>'
  // tea set + player figure on porch
  + '<ellipse cx="618" cy="368" rx="17" ry="5" fill="#7d7057"/>'
  + '<path d="M606,360 q4,-10 12,-10 q10,0 12,10 Z" fill="#a4531f" opacity=".85"/>'
  + '<circle cx="600" cy="364" r="4" fill="#e8e2cf"/>'
  + '<g transform="translate(576,382)"><g class="breathe">' + FIGS.villager.split('#57503f').join('#7a6248') + '</g></g></g>'

  // quiet-day traces (flags, not inventory items)
  + '<g id="fx-va_maihien" class="yf"><path d="M556,278 q38,-12 84,-9 l-8,18 q-42,-5 -78,8 Z" fill="#6d6655" opacity=".9"/>'
  + '<path d="M564,282 q30,-8 62,-7 M558,290 q34,-9 70,-6" stroke="#a99061" stroke-width="1.4" opacity=".75"/></g>'
  // mai tree (item cay_mai; blooms in đông)
  + '<g id="it-cay_mai" class="yi">'
  + '<path d="M120,470 Q124,432 112,412 Q108,398 120,390 M118,428 Q136,416 150,416" stroke="#4f4a40" stroke-width="6" fill="none" stroke-linecap="round"/>'
  + '<g class="mai-bloom" fill="#d8aeb4"><circle cx="112" cy="388" r="5"/><circle cx="128" cy="378" r="6"/>'
  + '<circle cx="146" cy="386" r="5"/><circle cx="156" cy="412" r="5"/><circle cx="98" cy="402" r="4.6"/>'
  + '<circle cx="134" cy="398" r="7"/><circle cx="152" cy="398" r="4.4"/><circle cx="118" cy="372" r="4.4"/></g></g>'

  // water jar near porch
  + '<g><path d="M466,398 q-8,-4 -8,-13 q0,-11 13,-11 q13,0 13,11 q0,9 -8,13 Z" fill="#6e6252"/>'
  + '<ellipse cx="471" cy="375" rx="9" ry="3" fill="#4e4437"/><ellipse cx="471" cy="376" rx="6.5" ry="2" fill="#8fa4a2"/></g>'

  // fence + gate
  + '<g stroke="#6b6353" stroke-width="5" opacity=".95">'
  + '<line x1="0" y1="488" x2="200" y2="488"/><line x1="272" y1="488" x2="800" y2="488"/></g>'
  + '<g fill="#6b6353"><rect x="14" y="474" width="7" height="28"/><rect x="76" y="474" width="7" height="28"/>'
  + '<rect x="138" y="474" width="7" height="28"/><rect x="330" y="474" width="7" height="28"/>'
  + '<rect x="470" y="474" width="7" height="28"/><rect x="610" y="474" width="7" height="28"/>'
  + '<rect x="750" y="474" width="7" height="28"/></g>'
  + '<g><rect x="198" y="414" width="13" height="90" fill="#3f3b30"/>'
  + '<rect x="262" y="414" width="13" height="90" fill="#3f3b30"/>'
  + '<rect x="190" y="414" width="93" height="10" rx="2" fill="#35322a"/>'
  + '<path d="M182,416 Q236,398 291,416 Q287,404 280,400 Q236,386 193,400 Q186,404 182,416 Z" fill="#3e4440"/>'
  + '<path d="M182,416 q-10,-1 -15,-9 q12,0 19,4 Z" fill="#3e4440"/>'
  + '<path d="M291,416 q10,-1 15,-9 q-12,0 -19,4 Z" fill="#3e4440"/></g>'

  + '</svg>';

  // hotspots: [id, left%, top%, width%, height%]
  const HOTS = [
    ["tree", 0, 5, 25, 76],
    ["gate", 6, 38, 24, 51],
    ["jar", 52, 58, 12, 22],
    ["porch", 66, 38, 32, 48],
  ];

  const ITEM_IDS = ["kiem_go_hien", "ban_co", "quan_co_khuyet", "buc_thu", "cay_mai", "la_de", "con_meo"];
  const FLAG_IDS = ["va_maihien", "doc_sach", "danh_co_mot_minh"];
  const IMG_ITEMS = [
    ["it-ban_co", "assets/art/items/item-ban_co.png", 79.8, 69.6, 14.5, 16.0],
    ["it-quan_co_khuyet", "assets/art/items/item-quan_co_khuyet.png", 87.0, 73.6, 2.5, 3.8],
    ["it-kiem_go_hien", "assets/art/items/item-kiem_go_hien.png", 63.8, 56.0, 7.2, 17.2],
    ["it-buc_thu", "assets/art/items/item-buc_thu.png", 77.6, 66.2, 7.2, 10.8],
    ["it-la_de", "assets/art/items/item-la_de.png", 84.4, 67.4, 7.6, 7.6],
    ["it-con_meo", "assets/art/items/item-con_meo.png", 88.3, 66.2, 8.0, 10.6],
  ];
  const IMG_FLAGS = [
    ["fx-doc_sach", "assets/art/items/fx-doc_sach.png", 82.2, 66.2, 7.6, 10.6],
    ["fx-danh_co_mot_minh", "assets/art/items/item-ban_co.png", 79.8, 69.6, 14.5, 16.0],
  ];

  function imageLayerMarkup() {
    return IMG_ITEMS.concat(IMG_FLAGS).map(function (it) {
      return '<button type="button" id="' + it[0] + '" aria-label="Vật trong sân" class="' + (it[0].indexOf("fx-") === 0 ? "yf" : "yi")
        + ' ink-item" style="left:' + it[2] + '%;top:' + it[3] + '%;width:' + it[4] + '%;height:' + it[5] + '%">'
        + '<img src="' + it[1] + '" alt="" aria-hidden="true"></button>';
    }).join("");
  }

  function boot(el) {
    el.innerHTML = '<div id="ink-root" class="painted-mode" data-season="xuan" data-phase="day" data-focus="center">'
      + '<div class="painted-bg" aria-hidden="true"></div>'
      + SVG
      + '<div class="ink-items">' + imageLayerMarkup() + '</div>'
      + '<div id="ink-npc"><svg viewBox="-28 -84 56 90" aria-hidden="true"><g class="walker"></g></svg><img class="npc-img" alt="" aria-hidden="true"></div>'
      + '<div class="ink-mist m1"></div><div class="ink-mist m2"></div><div class="ink-mist m3"></div>'
      + '<div class="ink-fx"></div><div class="ink-memory"></div><div class="ink-steam"></div>'
      + '<div class="ink-dusk"></div>'
      + '<div class="ink-hots">' + HOTS.map(function (h) {
          return '<button class="ink-hot" data-hot="' + h[0] + '" style="left:' + h[1] + '%;top:' + h[2]
            + '%;width:' + h[3] + '%;height:' + h[4] + '%"><span class="dot"></span></button>';
        }).join("")
      + '<button class="ink-hot ink-npc-hot" data-hot="npc" aria-label="Mở lời với khách" '
      + 'style="left:59%;top:46%;width:26%;height:44%"><span class="dot"></span></button>'
      + '</div>'
      + '<div class="ink-grain"></div><div class="ink-vignette"></div>'
      + '<div class="ink-tip"></div>'
      + '<div class="ink-night"></div>'
      + '</div>';

    const rootEl = el.querySelector("#ink-root");
    const fx = el.querySelector(".ink-fx");
    const npcG = el.querySelector("#ink-npc");
    const walker = npcG.querySelector(".walker");
    const npcImg = npcG.querySelector(".npc-img");

    // vai đã có ảnh painted (grow dần khi Codex xuất thêm); còn lại fallback SVG
    const FIG_BASE = "assets/art/fig/";
    const FIG_IMG = { boy: 1, scholar: 1, oldman2: 1, child: 1, monk: 1,
      swordsman: 1, woman: 1, oldwoman: 1, trader: 1, villager: 1, master: 1 };
    function setFigure(role) {
      const imgRole = role === "traveler" ? "master" : role;
      npcG.dataset.role = imgRole;
      if (FIG_IMG[imgRole]) {
        npcImg.src = FIG_BASE + imgRole + ".png";
        npcG.classList.add("has-img");
      } else {
        walker.innerHTML = '<g class="stride">' + (FIGS[role] || FIGS.villager) + '</g>';
        npcG.classList.remove("has-img");
      }
    }
    const tip = el.querySelector(".ink-tip");
    let tapCb = null, tipTimer = null;
    let dayItems = [];
    let curSeason = "xuan", curWeather = "";
    let npcRun = 0, arriveTimer = null, leaveTimer = null, walkTimer = null;
    let pendingArrive = null; // {run, role, cb} — để tap "giục" khách vào sân

    function emit(id) { if (tapCb) tapCb(id); }
    function itemDomId(id) { return id === "buc_thu_vodanh" ? "buc_thu" : id; }
    function emittedItemId(id) {
      if (id === "buc_thu" && dayItems.indexOf("buc_thu_vodanh") >= 0 && dayItems.indexOf("buc_thu") < 0) {
        return "buc_thu_vodanh";
      }
      return id;
    }
    function syncItems(items) {
      dayItems = (items || []).slice();
      ITEM_IDS.forEach(function (id) {
        const g = el.querySelector("#it-" + id);
        if (g) g.classList.toggle("on", dayItems.indexOf(id) >= 0
          || (id === "buc_thu" && dayItems.indexOf("buc_thu_vodanh") >= 0));
      });
    }
    function syncFlags(flags) {
      const f = flags || {};
      FLAG_IDS.forEach(function (id) {
        const g = el.querySelector("#fx-" + id);
        const duplicateBoard = id === "danh_co_mot_minh" && dayItems.indexOf("ban_co") >= 0;
        if (g) g.classList.toggle("on", !!f[id] && !duplicateBoard);
      });
    }
    function pulseItem(id) {
      const g = el.querySelector("#it-" + itemDomId(id));
      if (!g) return;
      g.classList.remove("pop");
      void g.getBoundingClientRect();
      g.classList.add("pop");
      setTimeout(function () { g.classList.remove("pop"); }, 1900);
    }
    function pulseFocus(focus) {
      rootEl.dataset.memoryFocus = focus || "center";
      rootEl.classList.remove("memory-on");
      void rootEl.getBoundingClientRect();
      rootEl.classList.add("memory-on");
      setTimeout(function () { rootEl.classList.remove("memory-on"); }, 2400);
    }

    el.querySelectorAll(".ink-hot").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); emit(b.dataset.hot); });
    });
    ITEM_IDS.forEach(function (id) {
      const g = el.querySelector("#it-" + itemDomId(id));
      if (g) g.addEventListener("click", function (e) { e.stopPropagation(); emit(emittedItemId(id)); });
    });
    npcG.addEventListener("click", function (e) { e.stopPropagation(); emit("npc"); });
    rootEl.addEventListener("click", function () { hideTip(); });

    function place(pos, scale) {
      npcG.style.left = (pos[0] / 800 * 100) + "%";
      npcG.style.top = (pos[1] / 520 * 100) + "%";
      npcG.style.transform = "translate(-50%,-100%) scale(" + (scale || 1) + ")";
    }

    // ---- particles ----
    function spawn(cls, n, minDur, maxDur) {
      for (let i = 0; i < n; i++) {
        const d = document.createElement("div");
        d.className = "fx-p " + cls;
        d.style.left = (3 + (i * 89) % 94) + "%";
        d.style.animationDuration = (minDur + ((i * 37) % 100) / 100 * (maxDur - minDur)) + "s";
        d.style.animationDelay = "-" + ((i * 53) % 140) / 10 + "s";
        fx.appendChild(d);
      }
    }
    function weatherFx(season, weather, phase) {
      fx.innerHTML = "";
      const w = weather || "";
      if (w === "rain" || /mưa/.test(w)) { spawn("fx-rain", 14, 1.1, 1.9); return; }
      if (w === "snow" || /tuyết/.test(w) || season === "dong") { spawn("fx-snow", 14, 9, 16); return; }
      if (season === "ha" && phase === "result") { spawn("fx-firefly", 10, 5, 8); return; }
      if (season === "xuan") spawn("fx-petal", 8, 10, 15);
      if (season === "thu") spawn("fx-leaf", 9, 8, 14);
    }

    // ---- tooltip ----
    function hideTip() { tip.classList.remove("on"); }
    function tipAt(hotOrItemId, text) {
      const target = el.querySelector('[data-hot="' + hotOrItemId + '"]')
        || el.querySelector("#it-" + itemDomId(hotOrItemId));
      tip.textContent = text;
      let x = 50, y = 50;
      if (target) {
        const r = target.getBoundingClientRect(), pr = rootEl.getBoundingClientRect();
        x = ((r.left + r.width / 2 - pr.left) / pr.width) * 100;
        y = ((r.top - pr.top) / pr.height) * 100;
      }
      tip.style.left = Math.min(72, Math.max(4, x - 12)) + "%";
      tip.style.top = Math.max(6, y - 14) + "%";
      tip.classList.add("on");
      clearTimeout(tipTimer);
      tipTimer = setTimeout(hideTip, 4200);
    }

    const api = {
      setDay: function (o) {
        npcRun += 1;
        clearTimeout(arriveTimer);
        clearTimeout(leaveTimer);
        clearTimeout(walkTimer);
        pendingArrive = null;
        curSeason = o.season || "xuan";
        curWeather = o.weather || "";
        rootEl.dataset.season = o.season || "xuan";
        rootEl.dataset.phase = o.phase || "day";
        rootEl.dataset.focus = o.focus || "center";
        rootEl.dataset.weather = o.weather || "clear";
        weatherFx(curSeason, curWeather, o.phase || "day");
        syncItems(o.items || []);
        syncFlags(o.flags || {});
        npcG.classList.remove("on", "glow");
        rootEl.classList.remove("glowing", "npc-ready", "memory-on");
        hideTip();
      },
      npcArrive: function (role, cb) {
        npcRun += 1;
        clearTimeout(arriveTimer);
        clearTimeout(leaveTimer);
        clearTimeout(walkTimer);
        rootEl.classList.remove("npc-ready");
        const run = npcRun;
        function settle() {
          if (run !== npcRun) return;
          pendingArrive = null;
          npcG.classList.remove("walking");
          npcG.classList.add("glow");
          if (role !== "master") rootEl.classList.add("npc-ready");
          if (cb) cb();
        }
        pendingArrive = { run: run, settle: settle };
        setFigure(role);
        npcG.style.transition = "none";
        place(POS.gate, 1);
        void npcG.getBoundingClientRect();
        npcG.style.transition = "";
        npcG.classList.add("on", "walking");
        // setTimeout thay vì rAF: tab ẩn vẫn đi tiếp, không kẹt ngoài cổng
        walkTimer = setTimeout(function () {
          if (run !== npcRun) return;
          place(POS.yard, .95);
          arriveTimer = setTimeout(settle, 6400);
        }, 60);
      },
      // tap vào bóng người đang đi: khách vào sân ngay, khỏi đợi
      npcHurry: function () {
        if (!pendingArrive || pendingArrive.run !== npcRun) return false;
        clearTimeout(arriveTimer);
        clearTimeout(walkTimer);
        npcG.style.transition = "left .5s ease-out, top .5s ease-out, transform .5s ease-out, opacity .9s";
        place(POS.yard, .95);
        setTimeout(function () { npcG.style.transition = ""; }, 550);
        pendingArrive.settle();
        return true;
      },
      npcLeave: function (toMountain) {
        const run = npcRun;
        clearTimeout(leaveTimer);
        rootEl.classList.remove("npc-ready");
        npcG.classList.remove("glow");
        npcG.classList.add("walking");
        if (toMountain) { place(POS.mountain, .5); }
        else { place(POS.gate, 1); }
        leaveTimer = setTimeout(function () {
          if (run === npcRun) npcG.classList.remove("on", "walking");
        }, 5400);
      },
      setPhase: function (p) {
        rootEl.dataset.phase = p;
        weatherFx(curSeason, curWeather, p);
      },
      onTap: function (cb) { tapCb = cb; },
      // n\u00e2ng kh\u00e1ch l\u00ean ti\u00eau \u0111i\u1ec3m khi m\u1edf tho\u1ea1i, \u0111\u1ec3 \u0111\u1ea7u/th\u00e2n v\u01b0\u1ee3t kh\u1ecfi khung tho\u1ea1i
      npcFocus: function (on) {
        if (!npcG.classList.contains("on")) return;
        clearTimeout(arriveTimer); clearTimeout(walkTimer);
        npcG.classList.remove("walking");
        npcG.style.transition = "left .45s ease, top .45s ease, transform .45s ease, opacity .9s";
        if (on) { place(POS.talk, 1.0); npcG.classList.add("glow"); }
        else { place(POS.yard, .95); }
        setTimeout(function () { npcG.style.transition = ""; }, 1150);
      },
      setFocus: function (focus) { rootEl.dataset.focus = focus || "center"; },
      setHotspotsGlow: function (on) { rootEl.classList.toggle("glowing", !!on); },
      setItems: syncItems,
      setFlags: syncFlags,
      pulseItem: pulseItem,
      pulseFocus: pulseFocus,
      tipAt: tipAt,
      destroy: function () { el.innerHTML = ""; },
    };
    return api;
  }

  root.InkScene = { boot: boot, FIGS: Object.keys(FIGS) };
})(window);
