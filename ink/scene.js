// ===== Sơn thủy sống — scene module (SPEC v3 §2) =====
// Vẽ tay toàn bộ bằng SVG/CSS. Không bitmap, không Phaser.
// API: InkScene.boot(el) → { setDay, npcArrive, npcLeave, setPhase, onTap, setHotspotsGlow, tipAt }

(function (root) {

  // ---- NPC silhouettes (feet at local 0,0, drawn upward) ----
  const SKIN = "#caa27e", HAIR = "#454036";
  function fig(robe, extra, headDy, scale) {
    return '<g transform="scale(' + (scale || 1) + ')">'
      + '<ellipse cx="0" cy="1" rx="11" ry="3.4" fill="rgba(60,56,44,.25)"/>'
      + '<path d="M-9,0 q-2,-24 9,-24 q11,0 9,24 Z" fill="' + robe + '"/>'
      + '<circle cx="0" cy="' + (-30 - (headDy || 0)) + '" r="6.5" fill="' + SKIN + '"/>'
      + '<path d="M-7,' + (-32 - (headDy || 0)) + ' a7,7 0 0 1 14,0 q-3.5,-4.5 -7,-4.5 q-3.5,0 -7,4.5 Z" fill="' + HAIR + '"/>'
      + (extra || "") + "</g>";
  }
  const FIGS = {
    boy:       fig("#6a5a40", '<line x1="-11" y1="-18" x2="9" y2="-33" stroke="#7a6248" stroke-width="3" stroke-linecap="round"/>', 0, .92),
    scholar:   fig("#5b6270", '<rect x="7" y="-21" width="8" height="6" rx="1" fill="#e8e2cf"/>'),
    oldman:    fig("#57534a", '<line x1="11" y1="0" x2="15" y2="-21" stroke="#4a463a" stroke-width="2.6" stroke-linecap="round"/>', -3),
    oldman2:   fig("#4e4a42", '<line x1="-11" y1="0" x2="-15" y2="-21" stroke="#4a463a" stroke-width="2.6" stroke-linecap="round"/>', -3),
    swordsman: fig("#464a52", '<line x1="-13" y1="-15" x2="-3" y2="-8" stroke="#3a3f45" stroke-width="2.6" stroke-linecap="round"/><circle cx="9" cy="-11" r="3.4" fill="#a4531f"/>'),
    monk:      fig("#6d5f4a", '<path d="M-10,-31 Q0,-42 10,-31 Q0,-35 -10,-31 Z" fill="#c9b989"/>'),
    woman:     fig("#6b5a5e", '<rect x="6" y="-27" width="9" height="13" rx="2.5" fill="#8a7a5a"/>'),
    child:     fig("#7a6248", "", 0, .68),
    oldwoman:  fig("#5a5450", '<path d="M-7,-35 a7,7 0 0 1 14,0 l0,4 l-14,0 Z" fill="#8a8274"/>', -2),
    trader:    fig("#5f584a", '<line x1="-17" y1="-31" x2="17" y2="-31" stroke="#6b6353" stroke-width="2.4"/><rect x="-20" y="-31" width="6" height="7" rx="1.5" fill="#8a7a5a"/><rect x="14" y="-31" width="6" height="7" rx="1.5" fill="#8a7a5a"/>'),
    villager:  fig("#4a4438", ""),
    master:    fig("#3f4147", '<path d="M-11,-33 Q0,-39 11,-33 L11,-31 L-11,-31 Z" fill="#35322a"/>'),
  };

  const POS = { gate: [236, 468], yard: [356, 432], mountain: [56, 322] };

  const SVG = ''
  + '<svg class="ink-svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">'

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

  // go table under tree (item ban_co) + missing stone
  + '<g id="it-ban_co" class="yi"><rect x="282" y="374" width="54" height="10" rx="5" fill="#b5b0a0"/>'
  + '<rect x="286" y="384" width="46" height="8" rx="3" fill="#a8a292"/>'
  + '<rect x="298" y="392" width="22" height="12" rx="3" fill="#94907f"/>'
  + '<g stroke="#7f7a6a" stroke-width="1"><line x1="290" y1="377" x2="328" y2="377"/><line x1="290" y1="380" x2="328" y2="380"/></g></g>'
  + '<circle id="it-quan_co_khuyet" class="yi" cx="312" cy="378" r="2.4" fill="#f2efe4"/>'

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
  + '<g transform="translate(576,382)">' + FIGS.villager.replace('#4a4438', '#7a6248') + '</g></g>'

  // porch items: sword / letter / leaf-book / cat
  + '<g id="it-kiem_go_hien" class="yi"><line x1="533" y1="388" x2="524" y2="330" stroke="#7a6248" stroke-width="4" stroke-linecap="round"/>'
  + '<line x1="522" y1="342" x2="533" y2="346" stroke="#5d4a34" stroke-width="3" stroke-linecap="round"/></g>'
  + '<g id="it-buc_thu" class="yi"><rect x="644" y="370" width="17" height="10" rx="1" fill="#f0ead6" stroke="#b8ae92" stroke-width="1" transform="rotate(-6 652 375)"/></g>'
  + '<g id="it-la_de" class="yi"><rect x="700" y="372" width="20" height="7" rx="1" fill="#d9d0b6"/>'
  + '<rect x="702" y="368" width="16" height="5" rx="1" fill="#cabf9f"/>'
  + '<path d="M706,364 q6,-6 12,-2 q-5,6 -12,2 Z" fill="#7d8a5e"/></g>'
  + '<g id="it-con_meo" class="yi"><ellipse cx="726" cy="381" rx="11" ry="6" fill="#8a7f6a"/>'
  + '<circle cx="717" cy="377" r="4.6" fill="#8a7f6a"/>'
  + '<path d="M714,374 l-2,-4 l4,1 Z" fill="#8a7f6a"/><path d="M719,373 l0,-4 l3,3 Z" fill="#8a7f6a"/>'
  + '<path class="cat-tail" d="M736,382 q8,-2 8,-8" stroke="#8a7f6a" stroke-width="3" fill="none" stroke-linecap="round"/></g>'

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

  // NPC layer
  + '<g id="ink-npc"><g class="walker"></g></g>'
  + '</svg>';

  // hotspots: [id, left%, top%, width%, height%]
  const HOTS = [
    ["tree", 21, 44, 25, 36],
    ["gate", 22, 76, 15, 21],
    ["jar", 56.5, 70, 6, 12],
    ["porch", 63, 66, 34, 16],
  ];

  const ITEM_IDS = ["kiem_go_hien", "ban_co", "quan_co_khuyet", "buc_thu", "cay_mai", "la_de", "con_meo"];

  function boot(el) {
    el.innerHTML = '<div id="ink-root" data-season="xuan" data-phase="day">'
      + SVG
      + '<div class="ink-mist m1"></div><div class="ink-mist m2"></div><div class="ink-mist m3"></div>'
      + '<div class="ink-fx"></div><div class="ink-steam"></div>'
      + '<div class="ink-dusk"></div>'
      + '<div class="ink-hots">' + HOTS.map(function (h) {
          return '<button class="ink-hot" data-hot="' + h[0] + '" style="left:' + h[1] + '%;top:' + h[2]
            + '%;width:' + h[3] + '%;height:' + h[4] + '%"><span class="dot"></span></button>';
        }).join("")
      + '</div>'
      + '<div class="ink-grain"></div><div class="ink-vignette"></div>'
      + '<div class="ink-tip"></div>'
      + '<div class="ink-night"></div>'
      + '</div>';

    const rootEl = el.querySelector("#ink-root");
    const fx = el.querySelector(".ink-fx");
    const npcG = el.querySelector("#ink-npc");
    const walker = npcG.querySelector(".walker");
    const tip = el.querySelector(".ink-tip");
    let tapCb = null, tipTimer = null;

    function emit(id) { if (tapCb) tapCb(id); }

    el.querySelectorAll(".ink-hot").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); emit(b.dataset.hot); });
    });
    ITEM_IDS.forEach(function (id) {
      const g = el.querySelector("#it-" + (id === "buc_thu_vodanh" ? "buc_thu" : id));
      if (g) g.addEventListener("click", function (e) { e.stopPropagation(); emit(id); });
    });
    npcG.addEventListener("click", function (e) { e.stopPropagation(); emit("npc"); });
    rootEl.addEventListener("click", function () { hideTip(); });

    function place(pos, scale) {
      walker.style.transform = "translate(" + pos[0] + "px," + pos[1] + "px) scale(" + (scale || 1) + ")";
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
    function weatherFx(season, weather) {
      fx.innerHTML = "";
      const w = weather || "";
      if (/mưa/.test(w)) { spawn("fx-rain", 18, 1.1, 1.9); return; }
      if (/tuyết/.test(w) || season === "dong") { spawn("fx-snow", 14, 9, 16); return; }
      if (season === "xuan") spawn("fx-petal", 8, 10, 15);
      if (season === "thu") spawn("fx-leaf", 9, 8, 14);
    }

    // ---- tooltip ----
    function hideTip() { tip.classList.remove("on"); }
    function tipAt(hotOrItemId, text) {
      const target = el.querySelector('[data-hot="' + hotOrItemId + '"]')
        || el.querySelector("#it-" + hotOrItemId);
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
        rootEl.dataset.season = o.season || "xuan";
        rootEl.dataset.phase = o.phase || "day";
        weatherFx(o.season, o.weather);
        const items = o.items || [];
        ITEM_IDS.forEach(function (id) {
          const g = el.querySelector("#it-" + id);
          if (g) g.classList.toggle("on", items.indexOf(id) >= 0
            || (id === "buc_thu" && items.indexOf("buc_thu_vodanh") >= 0));
        });
        npcG.classList.remove("on", "glow");
        rootEl.classList.remove("glowing");
        hideTip();
      },
      npcArrive: function (role, cb) {
        walker.innerHTML = FIGS[role] || FIGS.villager;
        walker.style.transition = "none";
        place(POS.gate, 1);
        void walker.getBoundingClientRect();
        walker.style.transition = "";
        npcG.classList.add("on");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            place(POS.yard, .95);
            setTimeout(function () { npcG.classList.add("glow"); if (cb) cb(); }, 4700);
          });
        });
      },
      npcLeave: function (toMountain) {
        npcG.classList.remove("glow");
        if (toMountain) { place(POS.mountain, .5); }
        else { place(POS.gate, 1); }
        setTimeout(function () { npcG.classList.remove("on"); }, 3800);
      },
      setPhase: function (p) { rootEl.dataset.phase = p; },
      onTap: function (cb) { tapCb = cb; },
      setHotspotsGlow: function (on) { rootEl.classList.toggle("glowing", !!on); },
      tipAt: tipAt,
      destroy: function () { el.innerHTML = ""; },
    };
    return api;
  }

  root.InkScene = { boot: boot, FIGS: Object.keys(FIGS) };
})(window);
