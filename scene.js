// ===== SCENE — sân tiểu viện vẽ SVG, sống theo mùa =====

const Scene = (() => {
  const W = 800, H = 340;

  const PAL = {
    xuan: { sky0:"#dfe8d8", sky1:"#f2f3ea", far:"#b9c6ae", mid:"#9db08d", ground:"#cfd8c0", foliage:["#a8c686","#8fb573","#c6dba4"], accent:"#e8b4c8", roof:"#8a7460", wall:"#efe9da", mist:.5 },
    ha:   { sky0:"#cfe0e8", sky1:"#f6f1e0", far:"#a8bfae", mid:"#7fa06f", ground:"#c9d2ae", foliage:["#5f8f4f","#4f7f43","#729e5e"], accent:"#e6d47a", roof:"#7d6a58", wall:"#f2ecd9", mist:.25 },
    thu:  { sky0:"#e8dcc8", sky1:"#f5eee3", far:"#c0ab90", mid:"#a98e6c", ground:"#d8c7a8", foliage:["#c88b4a","#b56d3a","#d9a75e"], accent:"#a5683a", roof:"#82705c", wall:"#f0e8d4", mist:.45 },
    dong: { sky0:"#d5dbe0", sky1:"#f0f1f2", far:"#aeb8c0", mid:"#93a0aa", ground:"#e6e9ec", foliage:[], accent:"#c9d2da", roof:"#6e6a66", wall:"#eceef0", mist:.6 },
  };

  let svg, pxLayer, ctx, rafId = null, particles = [], mode = { season:"xuan", weather:"clear", items:[] };

  function el(name, attrs) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function build(container) {
    container.innerHTML = "";
    svg = el("svg", { viewBox:`0 0 ${W} ${H}`, preserveAspectRatio:"xMidYMax slice", class:"scene-svg" });
    container.appendChild(svg);
    // canvas hạt (mưa/tuyết/lá) đè lên
    pxLayer = document.createElement("canvas");
    pxLayer.className = "scene-px";
    container.appendChild(pxLayer);
    ctx = pxLayer.getContext("2d");
    draw();
    resize();
    window.addEventListener("resize", resize);
    loop();
  }

  function resize() {
    if (!pxLayer) return;
    const r = pxLayer.parentElement.getBoundingClientRect();
    pxLayer.width = r.width; pxLayer.height = r.height;
  }

  // ---------- vẽ tĩnh ----------
  function draw() {
    const p = PAL[mode.season];
    svg.innerHTML = "";

    const defs = el("defs", {});
    defs.innerHTML = `
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sky0}"/><stop offset="1" stop-color="${p.sky1}"/>
      </linearGradient>`;
    svg.appendChild(defs);

    svg.appendChild(el("rect", { x:0, y:0, width:W, height:H, fill:"url(#sky)" }));

    // núi xa — hai lớp, mờ sương
    svg.appendChild(el("path", { d:"M-20 200 Q 120 70 260 190 T 560 175 T 830 195 L 830 345 L -20 345 Z", fill:p.far, opacity:.45 }));
    svg.appendChild(el("path", { d:"M-20 235 Q 180 120 360 225 T 830 220 L 830 345 L -20 345 Z", fill:p.mid, opacity:.55 }));
    // dải sương
    svg.appendChild(el("ellipse", { cx:400, cy:225, rx:430, ry:26, fill:p.sky1, opacity:p.mist }));

    // mây trôi
    for (let i=0;i<3;i++) {
      const c = el("ellipse", { cx:120+i*260, cy:60+i*22, rx:70+i*18, ry:10+i*3, fill:"#ffffff", opacity:.35, class:"cloud c"+i });
      svg.appendChild(c);
    }

    // nền sân
    svg.appendChild(el("rect", { x:0, y:290, width:W, height:H-290, fill:p.ground }));
    svg.appendChild(el("ellipse", { cx:400, cy:295, rx:460, ry:14, fill:p.ground }));

    drawHouse(p);
    drawTree(p);
    drawItems(p);

    if (mode.season==="dong") { // tuyết đọng trên thềm + mặt sân
      svg.appendChild(el("ellipse", { cx:175, cy:281, rx:118, ry:4, fill:"#fff", opacity:.85 }));
      svg.appendChild(el("rect", { x:0, y:288, width:W, height:6, fill:"#fff", opacity:.7, rx:3 }));
    }
  }

  function drawHouse(p) {
    const g = el("g", {});
    // thềm
    g.appendChild(el("rect", { x:60, y:282, width:230, height:10, fill:p.roof, opacity:.35, rx:2 }));
    g.appendChild(el("rect", { x:70, y:274, width:210, height:9, fill:p.roof, opacity:.45, rx:2 }));
    // tường sau + cửa
    g.appendChild(el("rect", { x:88, y:196, width:174, height:80, fill:p.wall }));
    g.appendChild(el("rect", { x:152, y:210, width:46, height:66, fill:p.roof, opacity:.55, rx:1 }));
    g.appendChild(el("line", { x1:175, y1:210, x2:175, y2:276, stroke:p.wall, "stroke-width":2 }));
    // cột hiên
    g.appendChild(el("rect", { x:92, y:196, width:8, height:82, fill:p.roof }));
    g.appendChild(el("rect", { x:250, y:196, width:8, height:82, fill:p.roof }));
    // mái cong
    g.appendChild(el("path", { d:"M 52 200 Q 175 128 298 200 Q 288 190 275 186 L 175 158 L 75 186 Q 62 190 52 200 Z", fill:p.roof }));
    g.appendChild(el("path", { d:"M 52 200 Q 175 132 298 200 L 298 206 Q 175 142 52 206 Z", fill:p.roof, opacity:.5 }));
    if (mode.season==="dong") g.appendChild(el("path", { d:"M 60 196 Q 175 130 290 196 L 290 200 Q 175 136 60 200 Z", fill:"#fff", opacity:.9 }));
    // khói bếp
    const smoke = el("g", { class:"smoke" });
    for (let i=0;i<3;i++) smoke.appendChild(el("circle", { cx:240, cy:150-i*16, r:5+i*3, fill:"#fff", opacity:.28-(i*.07), class:"puff p"+i }));
    g.appendChild(smoke);
    // chum nước
    g.appendChild(el("path", { d:"M 306 258 Q 300 282 316 288 Q 332 282 326 258 Q 316 252 306 258 Z", fill:p.roof, opacity:.8 }));
    svg.appendChild(g);
  }

  function drawTree(p) {
    const g = el("g", {});
    // thân + cành
    g.appendChild(el("path", { d:"M 610 292 Q 606 240 596 210 Q 590 190 600 168 M 596 210 Q 620 190 648 180 M 600 230 Q 570 208 552 212", stroke:"#5f5346", "stroke-width":10, fill:"none", "stroke-linecap":"round" }));
    if (mode.season !== "dong") {
      const f = PAL[mode.season].foliage;
      g.appendChild(el("ellipse", { cx:598, cy:150, rx:78, ry:44, fill:f[0], opacity:.9 }));
      g.appendChild(el("ellipse", { cx:652, cy:172, rx:58, ry:34, fill:f[1], opacity:.85 }));
      g.appendChild(el("ellipse", { cx:545, cy:180, rx:52, ry:30, fill:f[2], opacity:.85 }));
      if (mode.season==="xuan") for (let i=0;i<8;i++)
        g.appendChild(el("circle", { cx:520+Math.random()*170, cy:135+Math.random()*60, r:2.4, fill:PAL.xuan.accent, opacity:.85 }));
    } else {
      g.appendChild(el("path", { d:"M 600 168 Q 596 150 604 138 M 648 180 Q 662 168 666 154 M 552 212 Q 538 204 532 192", stroke:"#5f5346", "stroke-width":5, fill:"none", "stroke-linecap":"round" }));
      g.appendChild(el("ellipse", { cx:600, cy:136, rx:16, ry:4, fill:"#fff", opacity:.9 }));
      g.appendChild(el("ellipse", { cx:664, cy:152, rx:12, ry:3.4, fill:"#fff", opacity:.9 }));
    }
    svg.appendChild(g);
  }

  function drawItems(p) {
    const has = id => mode.items.includes(id);
    // bàn cờ đá dưới gốc cây
    if (has("ban_co")) {
      svg.appendChild(el("rect", { x:520, y:268, width:44, height:8, rx:2, fill:"#9a948c" }));
      svg.appendChild(el("rect", { x:526, y:260, width:32, height:9, rx:1.5, fill:"#b5afa5" }));
      svg.appendChild(el("circle", { cx:534, cy:258, r:2.2, fill:"#3a3631" }));
      svg.appendChild(el("circle", { cx:548, cy:257, r:2.2, fill:"#f5f2ea" }));
    }
    // kiếm gỗ treo bên hiên
    if (has("kiem_go_hien")) {
      svg.appendChild(el("line", { x1:254, y1:206, x2:254, y2:216, stroke:"#4a4038", "stroke-width":1.4 }));
      svg.appendChild(el("rect", { x:246, y:216, width:5, height:40, rx:2.5, fill:"#8a6f4d", transform:"rotate(12 248 216)" }));
      svg.appendChild(el("rect", { x:240, y:222, width:18, height:3.6, rx:1.8, fill:"#6d5335", transform:"rotate(12 249 224)" }));
    }
    // cây mai góc sân
    if (has("cay_mai")) {
      svg.appendChild(el("path", { d:"M 728 292 Q 726 272 732 260 M 732 268 Q 740 262 744 254", stroke:"#6d5b48", "stroke-width":3.4, fill:"none", "stroke-linecap":"round" }));
      if (mode.season!=="dong") for (let i=0;i<5;i++)
        svg.appendChild(el("circle", { cx:724+Math.random()*24, cy:250+Math.random()*16, r:1.8, fill:"#e8c44a", opacity:.9 }));
    }
    // con mèo trên thềm
    if (has("con_meo")) {
      const cat = el("g", { class:"cat" });
      cat.appendChild(el("ellipse", { cx:120, cy:268, rx:17, ry:8.5, fill:"#4a4340" }));
      cat.appendChild(el("circle", { cx:105, cy:262, r:6.4, fill:"#4a4340" }));
      cat.appendChild(el("path", { d:"M 101 257 L 99 251 L 104 255 Z M 108 256 L 111 250 L 112 256 Z", fill:"#4a4340" }));
      cat.appendChild(el("path", { d:"M 136 268 Q 146 264 143 256", stroke:"#4a4340", "stroke-width":3, fill:"none", "stroke-linecap":"round" }));
      cat.appendChild(el("ellipse", { cx:112, cy:266, rx:5, ry:3, fill:"#c47a4a", opacity:.6 }));
      svg.appendChild(cat);
    }
  }

  // ---------- hạt: mưa / tuyết / lá / cánh hoa ----------
  function seedParticles() {
    particles = [];
    const w = pxLayer ? pxLayer.width : 600, h = pxLayer ? pxLayer.height : 260;
    const mk = n => Array.from({length:n}, () => ({ x:Math.random()*w, y:Math.random()*h, r:Math.random(), v:.5+Math.random() }));
    if (mode.weather==="rain") particles = mk(70).map(p=>({...p,type:"rain"}));
    else if (mode.weather==="snow") particles = mk(50).map(p=>({...p,type:"snow"}));
    if (mode.season==="thu") particles = particles.concat(mk(14).map(p=>({...p,type:"leaf"})));
    if (mode.season==="xuan" && mode.weather!=="rain") particles = particles.concat(mk(8).map(p=>({...p,type:"petal"})));
  }

  function loop() {
    if (rafId) cancelAnimationFrame(rafId);
    const step = () => {
      if (!ctx) return;
      const w = pxLayer.width, h = pxLayer.height;
      ctx.clearRect(0,0,w,h);
      for (const p of particles) {
        if (p.type==="rain") {
          ctx.strokeStyle = "rgba(140,150,160,.35)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-2,p.y+10); ctx.stroke();
          p.y += 7*p.v; p.x -= 1.2;
        } else if (p.type==="snow") {
          ctx.fillStyle = "rgba(255,255,255,.85)";
          ctx.beginPath(); ctx.arc(p.x + Math.sin(p.y/28)*8, p.y, 1.2+p.r*1.6, 0, 7); ctx.fill();
          p.y += .5*p.v;
        } else if (p.type==="leaf") {
          ctx.fillStyle = "rgba(190,120,60,.7)";
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.y/40);
          ctx.beginPath(); ctx.ellipse(0,0,3.4,1.6,0,0,7); ctx.fill(); ctx.restore();
          p.y += .8*p.v; p.x += Math.sin(p.y/34)*1.1 - .3;
        } else if (p.type==="petal") {
          ctx.fillStyle = "rgba(232,180,200,.75)";
          ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,7); ctx.fill();
          p.y += .35*p.v; p.x += Math.sin(p.y/30)*.8;
        }
        if (p.y > h+12) { p.y = -10; p.x = Math.random()*w; }
        if (p.x < -12) p.x = w+10;
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  function update(next) {
    const redraw = !svg || next.season!==mode.season || String(next.items)!==String(mode.items);
    mode = { ...mode, ...next };
    if (redraw && svg) draw();
    seedParticles();
  }

  return { build, update };
})();
