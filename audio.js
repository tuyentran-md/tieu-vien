// ===== AMBIENT — gió thoáng, mưa, chim + SFX mõ/chuông; toàn bộ sinh bằng WebAudio, không file =====

const Ambient = (() => {
  let ac = null, master = null, on = false;
  let windGain, rainGain, waterGain, padGain, chimeTimer = null, birdTimer = null, musicTimer = null, musicIntroTimer = null;
  let padOscs = [];
  const PREF_KEY = "tieuvien_sound";
  const PAD_CHORDS = {
    xuan: [196, 261.63, 329.63, 392],
    ha: [174.61, 220, 293.66, 349.23],
    thu: [196, 246.94, 293.66, 392],
    dong: [164.81, 196, 246.94, 329.63],
  };

  function noiseBuffer(seconds, brown) {
    const len = ac.sampleRate * seconds;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i=0;i<len;i++) {
      const w = Math.random()*2-1;
      if (brown) { last = (last + .02*w) / 1.02; d[i] = last*3.5; }
      else d[i] = w;
    }
    return buf;
  }

  function start() {
    if (ac) return resumeContext();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { on = false; return Promise.resolve(false); }
    try { ac = new AudioContextClass(); }
    catch (e) { on = false; return Promise.resolve(false); }
    // Gọi resume ngay lập tức, trước khi tạo các buffer tương đối nặng bên dưới.
    const initialResume = resumeContext();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.knee.value = 16;
    comp.ratio.value = 4;
    comp.attack.value = .006;
    comp.release.value = .18;
    master = ac.createGain();
    master.gain.value = .58;
    master.connect(comp);
    comp.connect(ac.destination);

    // gió thoáng — bỏ phần trầm để không còn tiếng ù nền.
    const wind = ac.createBufferSource(); wind.buffer = noiseBuffer(4, false); wind.loop = true;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 280; hp.Q.value = .4;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1450; lp.Q.value = .45;
    windGain = ac.createGain(); windGain.gain.value = .018;
    const lfo = ac.createOscillator(); lfo.frequency.value = .06;
    const lfoG = ac.createGain(); lfoG.gain.value = .012;
    lfo.connect(lfoG); lfoG.connect(windGain.gain);
    wind.connect(hp); hp.connect(lp); lp.connect(windGain); windGain.connect(master);
    wind.start(); lfo.start();

    // mưa — white noise bandpass, bật/tắt theo thời tiết
    const rain = ac.createBufferSource(); rain.buffer = noiseBuffer(3, false); rain.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1300; bp.Q.value = .5;
    const rlp = ac.createBiquadFilter(); rlp.type = "lowpass"; rlp.frequency.value = 2200; rlp.Q.value = .3;
    rainGain = ac.createGain(); rainGain.gain.value = 0;
    rain.connect(bp); bp.connect(rlp); rlp.connect(rainGain); rainGain.connect(master);
    rain.start();

    // nước chảy rất nhỏ — noise hẹp, chỉ đủ tạo cảm giác sân vườn.
    const water = ac.createBufferSource(); water.buffer = noiseBuffer(5, false); water.loop = true;
    const wp = ac.createBiquadFilter(); wp.type = "bandpass"; wp.frequency.value = 680; wp.Q.value = .75;
    waterGain = ac.createGain(); waterGain.gain.value = .01;
    water.connect(wp); wp.connect(waterGain); waterGain.connect(master);
    water.start();

    // Dàn pad giữ lại để đổi mood nếu cần, nhưng mặc định tắt để tránh ù nền.
    const padFilter = ac.createBiquadFilter(); padFilter.type = "lowpass"; padFilter.frequency.value = 900; padFilter.Q.value = .4;
    padGain = ac.createGain(); padGain.gain.value = 0;
    padFilter.connect(padGain); padGain.connect(master);
    padOscs = PAD_CHORDS.xuan.map((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 3;
      g.gain.value = i === 0 ? .22 : .16;
      o.connect(g); g.connect(padFilter);
      o.start();
      return o;
    });
    return Promise.resolve(initialResume).then(ok => ok ? true : resumeContext());
  }

  // Resume ngay trong user gesture và phát một buffer im lặng để mở khóa iOS/WebKit.
  function resumeContext() {
    if (!ac) return Promise.resolve(false);
    let resumed;
    try { resumed = ac.state === "suspended" ? ac.resume() : Promise.resolve(); }
    catch (e) { return Promise.resolve(false); }
    return Promise.resolve(resumed).then(() => {
      if (ac.state !== "running") return false;
      try {
        const source = ac.createBufferSource();
        source.buffer = ac.createBuffer(1, 1, ac.sampleRate);
        source.connect(master || ac.destination);
        source.start(0);
      } catch (e) {}
      return true;
    }).catch(() => false);
  }

  function setPad(season, gain) {
    if (!padGain || !padOscs.length) return;
    const t = ac.currentTime;
    const chord = PAD_CHORDS[season] || PAD_CHORDS.xuan;
    padOscs.forEach((o, i) => o.frequency.setTargetAtTime(chord[i % chord.length], t, 1.8));
    padGain.gain.cancelScheduledValues(t);
    padGain.gain.setTargetAtTime(gain, t, 2.4);
  }

  // chuông gió mềm — chỉ dùng cho SFX mở khóa, không phát ngẫu nhiên trong nền.
  function bell(freq, vol, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 980; lp.Q.value = .35;
    lp.connect(master);
    [1, 1.5, 2].forEach((h, i) => {
      const o = ac.createOscillator(); o.type = i ? "triangle" : "sine"; o.frequency.value = freq*h;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol/(i+2.2), t+.06);
      g.gain.exponentialRampToValueAtTime(.0001, t+dur);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t+dur+.1);
    });
  }
  const PENTA = [440, 523.25, 587.33, 659.25, 783.99];
  const PENTA_LOW = {
    xuan: [196, 220, 261.63, 293.66, 329.63],
    ha: [174.61, 220, 246.94, 293.66, 329.63],
    thu: [196, 246.94, 293.66, 329.63, 392],
    dong: [164.81, 196, 246.94, 293.66, 329.63],
  };

  function softNote(freq, vol, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .65);
    g.gain.setTargetAtTime(.0001, t + dur * .58, dur * .2);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500; lp.Q.value = .45;
    g.connect(lp); lp.connect(master);
    [1, 1.5].forEach((mul, i) => {
      const o = ac.createOscillator();
      o.type = i ? "triangle" : "sine";
      o.frequency.value = freq * mul;
      const og = ac.createGain();
      og.gain.value = i ? .28 : 1;
      o.connect(og); og.connect(g);
      o.start(t);
      o.stop(t + dur + 1.2);
    });
  }

  function musicNote(freq, vol, delay, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime + delay;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1700;
    lp.Q.value = .45;
    lp.connect(master);
    [1, 2.01].forEach((mul, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = i ? "triangle" : "sine";
      o.frequency.value = freq * mul;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol / (i ? 5.2 : 1), t + .018);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g);
      g.connect(lp);
      o.start(t);
      o.stop(t + dur + .1);
    });
  }

  // mõ gỗ — thân sine trầm rơi nhanh + tiếng gõ nhỏ
  function knock(f0, vol) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0*.72, t+.07);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t+.004);
    g.gain.exponentialRampToValueAtTime(.0001, t+.11);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+.15);

    const n = ac.createBufferSource(); n.buffer = noiseBuffer(.05, false);
    const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500; f.Q.value = 1.2;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(vol*.44, t);
    ng.gain.exponentialRampToValueAtTime(.0001, t+.045);
    n.connect(f); f.connect(ng); ng.connect(master); n.start(t);
  }

  // tick giấy — lật trang, đóng mở
  function tick(freq, vol, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(dur+.02, false);
    const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = .9;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    n.connect(f); f.connect(g); g.connect(master); n.start(t);
  }

  function chirp() {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = "sine";
    const g = ac.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(master);
    const f0 = 2800+Math.random()*900;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0*1.4, t+.07);
    o.frequency.exponentialRampToValueAtTime(f0*.9, t+.14);
    g.gain.linearRampToValueAtTime(.15, t+.02);
    g.gain.exponentialRampToValueAtTime(.0001, t+.18);
    o.start(t); o.stop(t+.25);
    if (Math.random()<.6) setTimeout(chirp, 180+Math.random()*160);
  }

  function schedule(season, weather) {
    clearInterval(chimeTimer); clearInterval(birdTimer); clearInterval(musicTimer); clearTimeout(musicIntroTimer);
    chimeTimer = null;
    // chim: sếp thích — Xuân/Hạ rộn, Thu thưa hơn một chút, Đông và mưa thì im
    if (season!=="dong" && weather!=="rain") {
      const bp = season==="thu" ? .5 : .68;
      birdTimer = setInterval(() => { if (Math.random()<bp) chirp(); }, season==="thu" ? 7200 : 6000);
    }
    const scale = PENTA_LOW[season] || PENTA_LOW.xuan;
    // Nhiều câu nhạc, dài ngắn khác nhau, để giai điệu không lặp một kiểu.
    const motifs = [
      [0, 2, 4, 3, 2, 1],
      [1, 3, 4, 2, 3],
      [2, 4, 3, 1, 0, 2],
      [0, 1, 3, 2, 4],
      [4, 3, 1, 2, 0, 1],
      [2, 1, 3, 4, 2],
      [0, 2, 1, 3],
      [3, 4, 2, 3, 1, 0],
    ];
    let lastMotif = -1;
    const playDrift = () => {
      if (!on || !ac) return;
      // chọn ngẫu nhiên nhưng không lặp lại câu vừa chơi
      let mi = Math.floor(Math.random() * motifs.length);
      if (mi === lastMotif) mi = (mi + 1) % motifs.length;
      lastMotif = mi;
      const motif = motifs[mi];
      // đôi lúc chơi từ cuối lên đầu, để cùng một câu nghe vẫn khác
      const seq = Math.random() < .28 ? motif.slice().reverse() : motif;
      let clock = 0;
      seq.forEach((idx, n) => {
        // quãng lên cao thất thường thay vì đều đặn
        const oct = (idx >= 3 && Math.random() < .5) ? 3 : 2;
        const f = scale[idx % scale.length] * oct;
        const dur = 2.0 + Math.random() * .9;
        musicNote(f, season === "dong" ? .042 : .06, clock, dur);
        // nhịp co giãn: có nốt liền, có nốt ngân
        clock += .46 + Math.random() * .5 + (n % 3 === 2 ? .3 : 0);
      });
      if (Math.random() < .6) {
        const root = scale[seq[0] % scale.length] * 2;
        setTimeout(() => softNote(root, season === "dong" ? .018 : .024, 4.6), 200 + Math.random() * 400);
      }
    };
    musicIntroTimer = setTimeout(playDrift, 700);
    // khoảng lặng giữa các câu cũng thay đổi, tránh cảm giác đếm nhịp
    const base = season === "ha" ? 8200 : 9000;
    const tick = () => {
      playDrift();
      musicTimer = setTimeout(tick, base + Math.random() * 3200);
    };
    musicTimer = setTimeout(tick, base + Math.random() * 3200);
  }

  function setScene(season, weather) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    rainGain.gain.linearRampToValueAtTime(weather==="rain" ? .075 : 0, t+1.5);
    windGain.gain.linearRampToValueAtTime(season==="dong" ? .026 : season==="ha" ? .01 : .015, t+1.5);
    waterGain.gain.linearRampToValueAtTime(weather==="rain" ? .016 : season==="xuan" ? .009 : season==="dong" ? .004 : .007, t+1.5);
    setPad(season, 0);
    schedule(season, weather);
  }

  function setEpilogue() {
    if (!ac || !on) return;
    clearInterval(chimeTimer); clearInterval(birdTimer); clearInterval(musicTimer); clearTimeout(musicIntroTimer);
    const t = ac.currentTime;
    rainGain.gain.linearRampToValueAtTime(0, t+1.5);
    windGain.gain.linearRampToValueAtTime(.026, t+2);
    waterGain.gain.linearRampToValueAtTime(.008, t+2);
    setPad("dong", 0);
    const ending = [1, 3, 4, 2, 0];
    musicTimer = setInterval(() => {
      ending.forEach((idx, n) => musicNote(PENTA_LOW.dong[idx] * 2, .026, n * .68, 2.6));
    }, 11000);
    chimeTimer = null;
  }

  // SFX tổng hợp — cùng chất liệu với ambient
  function play(name) {
    if (!on || !ac) return;
    if (ac.state !== "running") {
      resumeContext().then(ok => { if (ok) play(name); });
      return;
    }
    if (name === "accept") knock(170, .11);                    // chọn — một tiếng mõ mềm
    else if (name === "menu") tick(1900, .05, .05);            // lật/giở — tick giấy
    else if (name === "cancel") tick(760, .05, .07);           // gấp lại — tick trầm
    else if (name === "start") {                               // xác nhận audio đã thực sự mở
      bell(392, .024, 1.7);
      setTimeout(() => bell(523.25, .016, 2.0), 180);
    }
    else if (name === "quote") {                               // mở khóa — hai nốt bowl mềm
      bell(392, .018, 2.5);
      setTimeout(() => bell(523.25, .014, 2.8), 220);
    }
  }

  function toggle() {
    on = !on;
    try { localStorage.setItem(PREF_KEY, on ? "1" : "0"); } catch(e){}
    if (on) start();
    else if (ac) {
      ac.suspend();
      clearInterval(chimeTimer);
      clearInterval(birdTimer);
      clearInterval(musicTimer);
      clearTimeout(musicIntroTimer);
    }
    return on;
  }
  function enabledPref() { try { return localStorage.getItem(PREF_KEY) !== "0"; } catch(e){ return true; } }
  function boot(season, weather) { // gọi ngay trong user gesture đầu tiên
    if (!enabledPref()) { on = false; return false; }
    on = true;
    const ready = start();
    setScene(season, weather);
    return Promise.resolve(ready).then(ok => {
      if (ok) play("start");
      return ok;
    });
  }

  function bootEpilogue() {
    if (!enabledPref()) { on = false; return false; }
    on = true;
    const ready = start();
    setEpilogue();
    return Promise.resolve(ready).then(ok => {
      if (ok) play("start");
      return ok;
    });
  }

  function ensure() {
    if (!on) return Promise.resolve(false);
    return ac ? resumeContext() : start();
  }

  return {
    toggle, boot, bootEpilogue, ensure, setScene, setEpilogue, play,
    isOn: () => on,
    isRunning: () => !!(on && ac && ac.state === "running"),
    state: () => !on ? "off" : (ac ? ac.state : "idle"),
  };
})();
