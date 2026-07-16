// ===== Dưới Núi Có Một Tiểu Viện — DOM boot + day loop (SPEC v3) =====

(function () {
  const SAVE_KEY = "tieuvien_save_v1";

  let C = null;
  let S = null;
  let current = null;
  let world = null;
  let dayToken = 0;
  let dayCtx = null;
  let dialogOpen = false;
  let typing = false;
  let typeTimer = null;
  let revealAllText = null;
  let advancing = false;
  let autoplayOn = false;

  const $ = sel => document.querySelector(sel);
  const HOTSPOTS = ["tree", "gate", "jar", "porch"];
  const ROLE_BY_PREFIX = { moc: "boy", thu: "scholar", co: "oldman" };
  const ROLE_BY_ID = {
    t_covu: "oldman2",
    h_kiemkhach: "swordsman",
    d_ruou: "swordsman",
    t_tangnhan: "monk",
    x_haithuoc: "woman",
    x_mang: "child",
    d_khoai: "child",
    t_timcon: "oldwoman",
    x_hatgiong: "trader",
    h_xinchu: "trader",
    h_trau: "villager",
    h_gieng: "villager",
    x_ganh_nuoc: "villager",
    t_lathu: "master",
    d_baotuyet: "traveler",
  };
  // node có "thư đặt lại ngoài hiên": khách ghé, để thư, đi luôn
  const LETTER_DROP = { t_lathu: true };
  const MOUNTAIN_LEAVE = { co_4: true };

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

  function dayKindLabel() {
    if (!current) return "";
    if (current.kind === "empty") return "Ngày vắng";
    if (current.kind === "event") return "Chuyện mùa";
    if (/^moc_/.test(current.id)) return "Chuyện của Mộc";
    if (/^thu_/.test(current.id)) return "Chuyện Trần Thức";
    if (/^co_/.test(current.id)) return "Ván cờ dưới cây";
    return "Chuyện đang mở";
  }

  function traceLine() {
    return "Câu đã ghi: " + S.journal.length + " · Vật đã giữ: " + S.items.length;
  }

  function renderHud() {
    $("#hud-day").textContent = C.hudLine(S);
    $("#hud-kind").textContent = dayKindLabel();
    const pct = Math.max(2, Math.min(100, (S.day / C.TOTAL_DAYS) * 100));
    const bar = $("#hud-progress span");
    if (bar) bar.style.width = pct + "%";
    const left = Math.max(0, C.TOTAL_DAYS - S.day);
    const seasonDay = ((S.day - 1) % C.DAYS_PER_SEASON) + 1;
    $("#hud-meta").textContent = "Ngày " + S.day + "/" + C.TOTAL_DAYS + " · Mùa " + seasonDay + "/" + C.DAYS_PER_SEASON + " · Còn " + left + " ngày";
    $("#event-kind").textContent = dayKindLabel();
    $("#trace-line").textContent = traceLine();
    const journalCount = $("#nav-journal-count");
    const courtyardCount = $("#nav-courtyard-count");
    const notebookCount = $("#nav-notebook-count");
    if (journalCount) journalCount.textContent = S.journal.length + " câu";
    if (courtyardCount) courtyardCount.textContent = S.items.length + " vật";
    if (notebookCount) notebookCount.textContent = (S.notebook ? S.notebook.length : 0) + " ghi";
  }

  function hideKeepRow() {
    const kr = $("#keep-row");
    if (kr) { kr.innerHTML = ""; kr.classList.add("hidden"); }
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
      S.beat = 0;
    }
    current = C.resolveNode(S, S.current);
    save();
    renderShell();
    startSceneFlow();
    return true;
  }

  function renderShell() {
    cancelTypewriter();
    dialogOpen = false;
    advancing = false;
    document.body.dataset.season = season();
    const showingStory = S.phase === "result" || S.phase === "beat";
    $("#scene").classList.toggle("story-open", showingStory);
    renderHud();
    $("#yard-line").textContent = C.yardLine(S);
    $("#yard-line").classList.remove("hidden");
    setHint("");

    $("#event-title").textContent = current && current.node ? current.node.title : "";
    $("#event-text").innerHTML = "";
    $("#choices").innerHTML = "";
    $("#result").classList.add("hidden");
    $("#notes").textContent = "";
    hideKeepRow();
    $("#next-day").classList.add("hidden");
    $("#next-day").disabled = false;

    if ((S.phase === "result" || S.phase === "beat") && S.chosen) {
      renderCurrentText();
      showResult(S.chosen);
    }
    if (world) {
      world.setDay({
        day: S.day,
        season: season(),
        weather: weather(),
        phase: S.phase,
        items: S.items.slice(),
        flags: S.flags,
        kind: current && current.kind,
        focus: focusFor(current && current.id, current && current.kind),
      });
    }
  }

  function renderCurrentText() {
    if (!current || !current.node) return;
    setHint("");
    $("#event-title").textContent = current.node.title;
    const text = $("#event-text");
    text.innerHTML = "";
    C.visibleParas(S, current.node).forEach(p => {
      const el = document.createElement("p");
      el.textContent = p.text;
      text.appendChild(el);
    });
  }

  function roleFor(id) {
    if (!id) return "villager";
    if (ROLE_BY_ID[id]) return ROLE_BY_ID[id];
    const prefix = id.split("_")[0];
    return ROLE_BY_PREFIX[prefix] || "villager";
  }

  function focusFor(id, kind) {
    if (kind === "empty") return "center";
    if (!id) return "center";
    if (/^moc_|^x_mang|^x_hatgiong|^h_kiemkhach|^d_ruou|^d_baotuyet/.test(id)) return "gate";
    if (/^co_|^t_covu/.test(id)) return "tree";
    if (/^thu_|^t_lathu|^t_tangnhan|^x_haithuoc|^h_xinchu/.test(id)) return "porch";
    return "center";
  }

  function activeToken(token) {
    return token === dayToken && dayCtx && dayCtx.token === token;
  }

  function cancelTypewriter() {
    if (typeTimer) clearTimeout(typeTimer);
    typeTimer = null;
    typing = false;
    revealAllText = null;
  }

  function revealTypewriter() {
    if (typing && revealAllText) {
      if (typeof Ambient !== "undefined") Ambient.play("menu");
      revealAllText();
    }
  }

  function setHint(text) {
    const hint = $("#action-hint");
    if (hint) hint.textContent = text || "";
  }

  function startSceneFlow() {
    dayToken += 1;
    cancelTypewriter();
    dialogOpen = false;
    dayCtx = null;

    if (!world || !current) return;

    const token = dayToken;
    const role = roleFor(current.id);
    const ctx = {
      token,
      role,
      letterDrop: !!LETTER_DROP[current.id],
      npcReady: false,
      masterReady: false,
      dialogStarted: false,
    };
    dayCtx = ctx;
    world.onTap(id => handleSceneTap(id, token));

    if ((S.phase === "result" || S.phase === "beat") && S.chosen) {
      setHint("");
      world.setHotspotsGlow(false);
      if (S.phase === "beat" && current.kind !== "empty" && !ctx.letterDrop) {
        // đang giữa ngày — người khách vẫn còn trong sân
        ctx.npcReady = true;
        ctx.dialogStarted = true;
        world.npcArrive(role, () => {});
        world.setPhase("day");
      } else {
        world.setPhase("result");
      }
      return;
    }

    world.setPhase("day");
    if (current.kind === "empty") {
      setHint("Sân vắng. Chạm vào một điểm sáng trong sân để bắt đầu ngày.");
      $("#event-title").textContent = current.node.title;
      world.setHotspotsGlow(true);
      return;
    }

    setHint("Có người đang bước lên lối cổng. Đợi họ vào sân.");
    world.setHotspotsGlow(false);
    world.npcArrive(ctx.letterDrop ? "master" : role, () => {
      if (!activeToken(token) || S.phase !== "day" || ctx.dialogStarted) return;
      ctx.npcReady = true;
      if (ctx.letterDrop) {
        ctx.masterReady = true;
        $("#event-title").textContent = current.node.title;
        setHint("Người ấy đặt lại một phong thư ngoài hiên, rồi đi. Chạm vào bậc hiên để đọc.");
        setTimeout(() => {
          if (activeToken(token) && S.phase === "day") world.npcLeave(false);
        }, 2000);
      } else {
        $("#event-title").textContent = current.node.title;
        setHint("Ngoài sân có người đợi. Chạm để mở lời.");
      }
    });
  }

  function handleTextTap() {
    if (dialogOpen) {
      revealTypewriter();
      return;
    }
    if (!dayCtx || !activeToken(dayCtx.token) || S.phase !== "day") return;
    if (current.kind === "empty") {
      openDialog(dayCtx.token);
      return;
    }
    if (current.kind !== "empty" && dayCtx.letterDrop && dayCtx.masterReady) {
      openDialog(dayCtx.token);
      return;
    }
    if (current.kind !== "empty" && dayCtx.npcReady && !dayCtx.letterDrop) {
      openDialog(dayCtx.token);
    }
  }

  function handleSceneTap(id, token) {
    if (!activeToken(token)) return;

    if (dialogOpen) {
      revealTypewriter();
      return;
    }

    if (S.phase === "result") {
      showItemTip(id);
      return;
    }

    if (current.kind === "empty" && HOTSPOTS.includes(id)) {
      openDialog(token);
      return;
    }

    if (current.kind !== "empty") {
      if (dayCtx.letterDrop && (id === "porch" || id === "buc_thu" || id === "buc_thu_vodanh")) {
        if (dayCtx.masterReady) openDialog(token);
        return;
      }
      if (id === "npc") {
        if (dayCtx.npcReady) {
          openDialog(token);
        } else if (world.npcHurry && world.npcHurry()) {
          // khách vào sân ngay — callback arrive đã set npcReady
          if (dayCtx.npcReady && !dayCtx.letterDrop) openDialog(token);
        } else {
          setHint("Đợi người ấy bước hẳn vào sân.");
        }
        return;
      }
    }

    showItemTip(id);
  }

  function showItemTip(id) {
    let itemId = id;
    if (id === "buc_thu" && S.items.includes("buc_thu_vodanh") && !S.items.includes("buc_thu")) {
      itemId = "buc_thu_vodanh";
    }
    const it = ITEMS[itemId];
    if (it && world) world.tipAt(itemId, it.memory);
  }

  function openDialog(token) {
    if (!activeToken(token) || !current || S.phase === "result") return;
    if (dialogOpen) {
      revealTypewriter();
      return;
    }

    dayCtx.dialogStarted = true;
    dialogOpen = true;
    $("#scene").classList.add("story-open");
    setHint("");
    if (world) world.setHotspotsGlow(false);
    if (world && world.npcFocus && current.kind !== "empty" && !dayCtx.letterDrop) world.npcFocus(true);

    $("#event-title").textContent = current.node.title;
    $("#event-text").innerHTML = "";
    $("#choices").innerHTML = "";
    $("#result").classList.add("hidden");
    $("#notes").textContent = "";
    hideKeepRow();
    $("#next-day").classList.add("hidden");

    typeDialog(C.visibleParas(S, current.node), token);
  }

  function typeDialog(paras, token) {
    cancelTypewriter();
    const texts = paras.map(p => p.text);
    const chars = texts.map(t => Array.from(t));
    const parasEl = $("#event-text");
    const els = texts.map(() => {
      const p = document.createElement("p");
      parasEl.appendChild(p);
      return p;
    });

    function finishText() {
      if (!activeToken(token)) return;
      cancelTypewriter();
      texts.forEach((t, i) => { els[i].textContent = t; });
      renderChoices(token);
    }

    if (!texts.length) {
      renderChoices(token);
      return;
    }

    let pi = 0;
    let ci = 0;
    typing = true;
    revealAllText = finishText;

    function tick() {
      if (!activeToken(token) || !dialogOpen) return;
      if (pi >= chars.length) {
        cancelTypewriter();
        renderChoices(token);
        return;
      }
      if (ci < chars[pi].length) {
        els[pi].textContent += chars[pi][ci];
        ci += 1;
        typeTimer = setTimeout(tick, 36);
        return;
      }
      pi += 1;
      ci = 0;
      typeTimer = setTimeout(tick, 120);
    }

    tick();
  }

  function renderChoices(token) {
    if (!activeToken(token) || !dialogOpen || !current || S.phase === "result") return;
    const wrap = $("#choices");
    wrap.innerHTML = "";
    C.visibleChoices(S, current.node).forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = choice.label;
      btn.onclick = e => {
        e.stopPropagation();
        choose(choice, token);
      };
      wrap.appendChild(btn);
    });
  }

  function choose(choice, token) {
    if (!activeToken(token) || S.phase === "result" || S.phase === "beat") return;
    if (typeof Ambient !== "undefined") Ambient.play("accept");
    cancelTypewriter();
    const itemId = choice.item || null;
    const final = C.isFinalBeat(current.node, S);
    C.applyChoice(S, choice);
    S.chosen = {
      result: choice.result,
      quote: choice.quote || null,
      item: itemId,
      returning: !!choice.schedule,
      mid: !final,
    };
    S.phase = final ? "result" : "beat";
    save();

    $("#choices").innerHTML = "";
    dialogOpen = false;
    renderHud();
    showResult(S.chosen, true);

    if (world) {
      if (world.setItems) world.setItems(S.items.slice());
      if (world.setFlags) world.setFlags(S.flags);
      if (itemId && world.pulseItem) world.pulseItem(itemId);
      if (final) {
        world.setPhase("result");
        if (world.pulseFocus) world.pulseFocus(focusFor(current && current.id, current && current.kind));
        if (current.kind !== "empty") world.npcLeave(!!MOUNTAIN_LEAVE[current.id]);
      }
    }
  }

  // sang nhịp kế trong cùng một ngày — khách vẫn ở lại sân
  function advanceBeat() {
    if (advancing) return;
    S.beat = (S.beat || 0) + 1;
    S.phase = "day";
    S.chosen = null;
    save();
    if (typeof Ambient !== "undefined") Ambient.play("menu");

    $("#result").classList.add("hidden");
    $("#notes").textContent = "";
    hideKeepRow();
    $("#next-day").classList.add("hidden");
    $("#event-text").innerHTML = "";
    $("#choices").innerHTML = "";
    $("#scene").classList.add("story-open");
    dialogOpen = true;
    renderHud();

    const token = dayCtx ? dayCtx.token : dayToken;
    typeDialog(C.visibleParas(S, current.node), token);
  }

  function onNextButton() {
    if (S.phase === "beat") advanceBeat();
    else nextDay();
  }

  function showResult(ch, playUnlock) {
    setHint("");
    const r = $("#result");
    r.textContent = ch.result;
    r.classList.remove("hidden");

    const notes = [];
    if (ch.quote) notes.push("✎ Một câu mới được ghi lại.");
    if (ch.item && ITEMS[ch.item]) notes.push("◦ " + ITEMS[ch.item].name + ", giờ thuộc về tiểu viện.");
    if (ch.returning) notes.push("◦ Chuyện này còn hẹn một ngày quay lại.");
    if (!ch.mid) notes.push("Còn " + Math.max(0, C.TOTAL_DAYS - S.day) + " ngày trong năm.");
    $("#notes").textContent = notes.join("   ");
    if (playUnlock && (ch.quote || ch.item) && typeof Ambient !== "undefined") Ambient.play("quote");
    renderKeepRow(ch);
    const nd = $("#next-day");
    nd.textContent = ch.mid ? "Lặng nghe tiếp…" : "Khép lại một ngày";
    nd.classList.toggle("btn-continue", !!ch.mid);
    nd.classList.remove("hidden");
    const sc = $("#story-scroll");
    if (sc) {
      const toEnd = () => { sc.scrollTop = sc.scrollHeight; };
      requestAnimationFrame(() => requestAnimationFrame(toEnd));
      setTimeout(toEnd, 90);
      setTimeout(toEnd, 320);
    }
  }

  // Nút để người chơi CHỦ ĐỘNG giữ lại khoảnh khắc/câu chữ hiện tại vào Sổ tay.
  function renderKeepRow(ch) {
    const row = $("#keep-row");
    if (!row) return;
    row.innerHTML = "";
    const text = ch && ch.result ? ch.result : "";
    if (!text) { row.classList.add("hidden"); return; }
    row.classList.remove("hidden");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "keep-btn";
    const already = C.hasNote(S, text);
    function paint(saved) {
      btn.textContent = saved ? "✓ Đã ghi vào Sổ tay" : "✎ Ghi khoảnh khắc này vào Sổ tay";
      btn.classList.toggle("kept", saved);
      btn.disabled = saved;
    }
    paint(already);
    btn.onclick = e => {
      e.stopPropagation();
      const label = current && current.node ? current.node.title : "";
      if (C.keepNote(S, { text: text, label: label, day: S.day })) {
        save();
        renderHud();
        paint(true);
        if (typeof Ambient !== "undefined") Ambient.play("quote");
      }
    };
    row.appendChild(btn);
  }

  function nextDay() {
    if (advancing) return;
    advancing = true;
    $("#next-day").disabled = true;
    if (world) world.setPhase("night");

    setTimeout(() => {
      S.day += 1;
      S.current = null;
      S.chosen = null;
      S.phase = "day";
      S.beat = 0;
      if (ensureDay()) {
        if (typeof Ambient !== "undefined" && Ambient.isOn()) Ambient.setScene(season(), weather());
        if (shouldInterlude()) showInterlude();
      }
    }, world ? 750 : 0);
  }

  function showEpilogue() {
    const audioReady = !autoplayOn && typeof Ambient !== "undefined" && !Ambient.isOn()
      ? Ambient.bootEpilogue()
      : null;
    S.phase = "end";
    save();
    $("#title-screen").classList.add("hidden");
    $("#game").classList.add("hidden");
    $("#epilogue").classList.remove("hidden");
    document.body.dataset.season = "dong";
    if (typeof Ambient !== "undefined" && Ambient.isOn() && !audioReady) Ambient.setEpilogue();

    if (!$("#epilogue .ink-fx")) {
      const fxc = document.createElement("div");
      fxc.className = "ink-fx";
      for (let i = 0; i < 12; i++) {
        const d = document.createElement("div");
        d.className = "fx-p fx-snow";
        d.style.left = (3 + (i * 89) % 94) + "%";
        d.style.animationDuration = (9 + ((i * 37) % 100) / 100 * 7) + "s";
        d.style.animationDelay = "-" + ((i * 53) % 140) / 10 + "s";
        fxc.appendChild(d);
      }
      $("#epilogue").prepend(fxc);
    }

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
    if (typeof Ambient !== "undefined") Ambient.play("quote");
    const list = $("#modal-list");
    list.innerHTML = "";
    $("#modal-title").textContent = "Câu đã ghi";

    const sub = document.createElement("p");
    sub.className = "modal-sub";
    sub.textContent = "Danh sách những câu đáng nhớ đã được ghi lại sau các chuyện bạn trải qua.";
    list.appendChild(sub);

    if (!S.journal.length) {
      const e = document.createElement("p");
      e.className = "dim";
      e.textContent = "Chưa có câu nào. Khi một chuyện để lại dư âm, câu đáng nhớ sẽ hiện ở đây.";
      list.appendChild(e);
    } else {
      S.journal.forEach(q => {
        const p = document.createElement("p");
        p.className = "quote";
        p.textContent = "“" + QUOTES[q] + "”";
        list.appendChild(p);
      });
    }
    $("#modal").classList.remove("hidden");
    $("#modal").setAttribute("aria-hidden", "false");
  }

  function openCourtyard() {
    if (typeof Ambient !== "undefined") Ambient.play("menu");
    const list = $("#modal-list");
    list.innerHTML = "";
    $("#modal-title").textContent = "Vật đã giữ";

    const sub = document.createElement("p");
    sub.className = "modal-sub";
    sub.textContent = "Danh sách những vật đang nằm trong sân vì một người, một lựa chọn, hoặc một chuyện đã qua.";
    list.appendChild(sub);

    if (!S.items.length) {
      const e = document.createElement("p");
      e.className = "dim";
      e.textContent = "Chưa có vật nào. Khi khách để lại thứ gì, hoặc bạn giữ lại thứ gì, nó sẽ hiện ở đây.";
      list.appendChild(e);
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
    $("#modal").setAttribute("aria-hidden", "false");
  }

  function openNotebook() {
    if (typeof Ambient !== "undefined") Ambient.play("menu");
    const list = $("#modal-list");
    list.innerHTML = "";
    $("#modal-title").textContent = "Sổ tay";

    const sub = document.createElement("p");
    sub.className = "modal-sub";
    sub.textContent = "Những khoảnh khắc bạn tự tay ghi lại. Có thể chép cả cuốn ra tệp, hoặc lưu một khoảnh khắc thành thẻ ảnh.";
    list.appendChild(sub);

    const actions = document.createElement("div");
    actions.className = "nb-actions";
    const mdBtn = document.createElement("button");
    mdBtn.type = "button";
    mdBtn.className = "nb-export";
    mdBtn.textContent = "⬇ Chép sổ ra tệp (.md)";
    mdBtn.disabled = !((S.notebook && S.notebook.length) || S.journal.length || S.items.length);
    mdBtn.onclick = exportNotebookMd;
    actions.appendChild(mdBtn);
    list.appendChild(actions);

    const notes = S.notebook || [];
    if (!notes.length) {
      const e = document.createElement("p");
      e.className = "dim";
      e.textContent = "Sổ còn trống. Sau mỗi chuyện, chạm “Ghi khoảnh khắc này vào Sổ tay” để giữ lại câu chữ mình thấy đẹp.";
      list.appendChild(e);
    } else {
      notes.forEach(n => {
        const d = document.createElement("div");
        d.className = "nb-entry";

        const meta = document.createElement("div");
        meta.className = "nb-meta";
        meta.textContent = (C.SEASON_NAMES[n.season] || "") + " · Ngày " + n.day + (n.label ? " · " + n.label : "");

        const q = document.createElement("p");
        q.className = "nb-text";
        q.textContent = "“" + n.text + "”";

        const card = document.createElement("button");
        card.type = "button";
        card.className = "nb-card-btn";
        card.textContent = "◦ Lưu thành thẻ ảnh (PNG)";
        card.onclick = () => savePostcard(n);

        d.appendChild(meta);
        d.appendChild(q);
        d.appendChild(card);
        list.appendChild(d);
      });
    }
    $("#modal").classList.remove("hidden");
    $("#modal").setAttribute("aria-hidden", "false");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportNotebookMd() {
    try {
      const md = C.notebookMarkdown(S);
      downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), "so-nho-tieu-vien.md");
      if (typeof Ambient !== "undefined") Ambient.play("quote");
    } catch (e) {
      alert("Không chép được tệp trên trình duyệt này.");
    }
  }

  // Bảng màu thẻ ảnh theo mùa (giấy · mực · nhấn · núi · chữ Hán)
  const CARD_PAL = {
    xuan: { paper: "#f2f3ea", paper2: "#e2e7d4", ink: "#2f342a", accent: "#7a8f5f", mtn: "#9db083", kanji: "春" },
    ha:   { paper: "#f6f1e0", paper2: "#e6e1c4", ink: "#33301f", accent: "#8a7a3c", mtn: "#7f9a5c", kanji: "夏" },
    thu:  { paper: "#f5eee3", paper2: "#eadbc2", ink: "#3a2f22", accent: "#a5683a", mtn: "#c08a4e", kanji: "秋" },
    dong: { paper: "#eef0f2", paper2: "#dae1e7", ink: "#2b3138", accent: "#5c6e7e", mtn: "#9aa9b4", kanji: "冬" },
  };

  function wrapLines(ctx, text, maxW) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach(w => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  // Thẻ ảnh tự vẽ hoàn toàn bằng canvas — không nhúng ảnh ngoài nên không dính
  // tainted-canvas, toDataURL chạy được cả khi mở bằng file://.
  function renderPostcard(entry) {
    const P = CARD_PAL[entry.season] || CARD_PAL.xuan;
    const W = 1200, H = 675;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, P.paper); bg.addColorStop(1, P.paper2);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // núi mờ ở phần dưới
    ctx.save();
    ctx.globalAlpha = 0.5; ctx.fillStyle = P.mtn;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.82);
    ctx.lineTo(W * 0.22, H * 0.60); ctx.lineTo(W * 0.40, H * 0.78);
    ctx.lineTo(W * 0.60, H * 0.55); ctx.lineTo(W * 0.82, H * 0.80);
    ctx.lineTo(W, H * 0.66); ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // chữ Hán mùa, mờ ở góc phải
    ctx.save();
    ctx.globalAlpha = 0.12; ctx.fillStyle = P.accent;
    ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.font = "600 260px 'Noto Serif', Georgia, serif";
    ctx.fillText(P.kanji, W - 46, -18);
    ctx.restore();

    // khung trong
    ctx.strokeStyle = "rgba(60,58,45,0.28)"; ctx.lineWidth = 2;
    ctx.strokeRect(48, 44, W - 96, H - 88);

    const x = 110;
    // kicker: tên chuyện
    if (entry.label) {
      let lab = entry.label;
      if (lab.length > 46) lab = lab.slice(0, 44) + "…";
      ctx.fillStyle = P.accent; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.font = "600 22px 'Noto Sans', system-ui, sans-serif";
      ctx.fillText(lab, x, 118);
    }

    // câu chữ, canh giữa theo chiều dọc, tự co cỡ nếu dài
    const text = "“" + entry.text + "”";
    const maxW = W - 220;
    let size = text.length > 220 ? 30 : text.length > 140 ? 34 : text.length > 80 ? 40 : 46;
    ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.font = "italic " + size + "px 'Noto Serif', Georgia, serif";
    let lines = wrapLines(ctx, text, maxW);
    while (lines.length * size * 1.5 > H - 280 && size > 22) {
      size -= 2;
      ctx.font = "italic " + size + "px 'Noto Serif', Georgia, serif";
      lines = wrapLines(ctx, text, maxW);
    }
    const lineH = size * 1.5;
    let y = (H - lines.length * lineH) / 2 + size;
    lines.forEach(ln => { ctx.fillText(ln, x, y); y += lineH; });

    // gạch chân + footer
    ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, H - 98); ctx.lineTo(W - x, H - 98); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.accent; ctx.textAlign = "left";
    ctx.font = "600 24px 'Noto Sans', system-ui, sans-serif";
    ctx.fillText("Tiểu Viện Dưới Núi", x, H - 60);
    ctx.fillStyle = "rgba(60,58,45,0.7)"; ctx.textAlign = "right";
    ctx.font = "400 22px 'Noto Sans', system-ui, sans-serif";
    ctx.fillText((C.SEASON_NAMES[entry.season] || "") + " · Ngày " + entry.day + "/" + C.TOTAL_DAYS, W - x, H - 60);

    return cv.toDataURL("image/png");
  }

  function savePostcard(entry) {
    try {
      const url = renderPostcard(entry);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tieu-vien-" + entry.season + "-ngay" + entry.day + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (typeof Ambient !== "undefined") Ambient.play("quote");
    } catch (e) {
      alert("Không lưu được thẻ ảnh trên trình duyệt này. Sếp thử “Chép sổ ra tệp (.md)”.");
    }
  }

  function resetGame() {
    if (!confirm("Bắt đầu lại một năm mới? Năm cũ sẽ không giữ lại.")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  function runAutoplay(days) {
    function chooseFirstVisible() {
      if (!S.current) { S.current = C.pickToday(S); S.beat = 0; }
      current = C.resolveNode(S, S.current);

      if (!(S.phase === "result" && S.chosen)) {
        let guard = 0;
        while (guard++ < 16) {
          const choice = C.visibleChoices(S, current.node)[0];
          if (!choice) return false;
          C.applyChoice(S, choice);
          if (C.isFinalBeat(current.node, S)) {
            S.chosen = { result: choice.result, quote: choice.quote || null, item: choice.item || null, returning: !!choice.schedule };
            S.phase = "result";
            break;
          }
          S.beat = (S.beat || 0) + 1;
        }
      }
      return true;
    }

    for (let i = 0; i < days && S.day <= C.TOTAL_DAYS; i++) {
      if (!chooseFirstVisible()) break;

      S.day += 1;
      S.current = null;
      S.chosen = null;
      S.phase = "day";
      S.beat = 0;
    }

    save();
  }

  function syncSoundButton() {
    const btn = $("#btn-sound");
    const enabled = Ambient.isOn();
    const running = Ambient.isRunning ? Ambient.isRunning() : enabled;
    btn.classList.toggle("muted", !enabled || !running);
    btn.title = enabled && running ? "Tắt âm thanh" : "Chạm để bật âm thanh";
    btn.setAttribute("aria-label", btn.title);
    const state = $("#sound-state");
    if (state) state.textContent = enabled && running ? "Đang bật" : "Đang tắt";
  }

  // ---- interlude: thẻ chương ở ngày đầu mỗi mùa ----
  function shouldInterlude() {
    if (autoplayOn) return false;
    if (S.phase !== "day" || S.beat !== 0 || S.chosen) return false;
    if (((S.day - 1) % C.DAYS_PER_SEASON) !== 0) return false;
    if (typeof SEASON_INTRO === "undefined") return false;
    if (!S.shownSeasons) S.shownSeasons = [];
    return S.shownSeasons.indexOf(C.seasonOf(S.day)) < 0;
  }

  function showInterlude(cb) {
    const done = typeof cb === "function" ? cb : function () {};
    const sk = C.seasonOf(S.day);
    const info = typeof SEASON_INTRO !== "undefined" ? SEASON_INTRO[sk] : null;
    const el = $("#interlude");
    if (!info || !el) { done(); return; }

    el.dataset.season = sk;
    el.querySelector(".interlude-mark").textContent = info.mark;
    el.querySelector(".interlude-kicker").textContent =
      S.day === 1 ? "Dưới núi có một tiểu viện" : "Sang mùa · Ngày " + S.day + "/" + C.TOTAL_DAYS;
    el.querySelector(".interlude-season").textContent = "Mùa " + info.name;
    const textEl = el.querySelector(".interlude-text");
    textEl.innerHTML = "";
    const paras = [{ t: info.prologue }, { t: info.line }];
    // từ mùa thứ hai trở đi: soi bản tâm đang nghiêng đâu (ngày 1 chưa có gì để soi)
    if (S.day > 1 && typeof BAN_TAM !== "undefined") {
      const bt = BAN_TAM[C.banTamKey(S)];
      if (bt) paras.push({ t: bt, cls: "interlude-mind" });
    }
    paras.forEach(function (o) {
      if (!o.t) return;
      const p = document.createElement("p");
      p.textContent = o.t;
      if (o.cls) p.className = o.cls;
      textEl.appendChild(p);
    });

    if (!S.shownSeasons) S.shownSeasons = [];
    if (S.shownSeasons.indexOf(sk) < 0) S.shownSeasons.push(sk);
    save();

    el.classList.remove("hidden");
    el.setAttribute("aria-hidden", "false");
    let closed = false;
    function dismiss() {
      if (closed) return;
      closed = true;
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      if (typeof Ambient !== "undefined") Ambient.play("menu");
      done();
    }
    const go = $("#interlude-go");
    if (go) go.onclick = dismiss;
    el.onclick = function (e) { if (e.target === el) dismiss(); };
  }

  function enterGame(opts) {
    const unlockAudio = !opts || opts.unlockAudio !== false;
    // Audio phải được mở khóa trước mọi dựng scene/layout để giữ user activation trên iOS.
    const audioReady = unlockAudio && typeof Ambient !== "undefined"
      ? Ambient.boot(season(), weather())
      : null;

    $("#title-screen").classList.add("hidden");
    $("#epilogue").classList.add("hidden");
    $("#game").classList.remove("hidden");

    if (!world) {
      world = InkScene.boot($("#stage"));
    }

    if (!ensureDay()) return;

    syncSoundButton();
    if (audioReady && typeof audioReady.then === "function") audioReady.then(syncSoundButton);
    if (shouldInterlude()) showInterlude(maybeCoach);
    else maybeCoach();
  }

  function maybeCoach() {
    let seen = false;
    try { seen = localStorage.getItem("tieuvien_coached_v12") === "1"; } catch (e) {}
    if (seen) return;
    const coach = $("#coach");
    if (!coach) return;
    coach.classList.remove("hidden");
    coach.setAttribute("aria-hidden", "false");
    function dismiss() {
      coach.classList.add("hidden");
      coach.setAttribute("aria-hidden", "true");
      try { localStorage.setItem("tieuvien_coached_v12", "1"); } catch (e) {}
      if (typeof Ambient !== "undefined") Ambient.play("menu");
    }
    const ok = $("#coach-ok");
    if (ok) ok.onclick = dismiss;
    coach.onclick = e => { if (e.target === coach) dismiss(); };
  }

  window.addEventListener("DOMContentLoaded", () => {
    C = createCore({ ARCS, ARC_STARTS, SEASON_EVENTS, EMPTY_DAY, QUOTES, ITEMS, YARD_LINES, EPILOGUE });

    $("#btn-journal").onclick = openJournal;
    $("#btn-courtyard").onclick = openCourtyard;
    $("#btn-notebook").onclick = openNotebook;
    $("#btn-reset").onclick = resetGame;
    $("#modal-close").onclick = () => {
      if (typeof Ambient !== "undefined") Ambient.play("cancel");
      $("#modal").classList.add("hidden");
      $("#modal").setAttribute("aria-hidden", "true");
    };
    $("#modal").onclick = e => {
      if (e.target.id === "modal") {
        if (typeof Ambient !== "undefined") Ambient.play("cancel");
        $("#modal").classList.add("hidden");
        $("#modal").setAttribute("aria-hidden", "true");
      }
    };
    $("#next-day").onclick = onNextButton;
    $("#scene").onclick = handleTextTap;
    $("#btn-again").onclick = () => { localStorage.removeItem(SAVE_KEY); location.reload(); };
    $("#btn-sound").onclick = () => {
      if (Ambient.isOn() && Ambient.isRunning && !Ambient.isRunning()) {
        Ambient.ensure().then(ok => {
          if (ok && S) {
            if (S.phase === "end") Ambient.setEpilogue();
            else Ambient.setScene(season(), weather());
          }
          if (ok) Ambient.play("start");
          syncSoundButton();
        });
        return;
      }
      Ambient.toggle();
      if (Ambient.isOn() && S) {
        if (S.phase === "end") Ambient.setEpilogue();
        else Ambient.setScene(season(), weather());
      }
      syncSoundButton();
      if (Ambient.isOn() && Ambient.ensure) {
        Ambient.ensure().then(ok => {
          if (ok) Ambient.play("start");
          syncSoundButton();
        });
      }
    };

    // Nếu browser chặn lần đầu, mọi cú chạm thật tiếp theo đều thử resume lại.
    document.addEventListener("pointerdown", e => {
      if (e.target.closest && e.target.closest("#btn-sound")) return;
      if (Ambient.isOn() && Ambient.ensure && !Ambient.isRunning()) {
        Ambient.ensure().then(syncSoundButton);
      }
    }, { capture: true });

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

    // migrate save cũ chưa có Sổ tay
    if (S && !S.notebook) S.notebook = [];

    const autoplay = parseInt(new URLSearchParams(location.search).get("autoplay") || "0", 10);
    if (autoplay > 0) {
      autoplayOn = true;
      runAutoplay(autoplay);
      enterGame({ unlockAudio: false });
    }
  });
})();
