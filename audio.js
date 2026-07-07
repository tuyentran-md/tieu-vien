// ===== AMBIENT — gió, mưa, chuông gió, chim + SFX mõ/chuông; toàn bộ sinh bằng WebAudio, không file =====

const Ambient = (() => {
  let ac = null, master = null, on = false;
  let windGain, rainGain, waterGain, padGain, chimeTimer = null, birdTimer = null, musicTimer = null;
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
    if (ac) { ac.resume(); return; }
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .26; master.connect(ac.destination);

    // gió — brown noise + lowpass, phập phồng chậm
    const wind = ac.createBufferSource(); wind.buffer = noiseBuffer(4, true); wind.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    windGain = ac.createGain(); windGain.gain.value = .14;
    const lfo = ac.createOscillator(); lfo.frequency.value = .06;
    const lfoG = ac.createGain(); lfoG.gain.value = .12;
    lfo.connect(lfoG); lfoG.connect(windGain.gain);
    wind.connect(lp); lp.connect(windGain); windGain.connect(master);
    wind.start(); lfo.start();

    // mưa — white noise bandpass, bật/tắt theo thời tiết
    const rain = ac.createBufferSource(); rain.buffer = noiseBuffer(3, false); rain.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = .6;
    rainGain = ac.createGain(); rainGain.gain.value = 0;
    rain.connect(bp); bp.connect(rainGain); rainGain.connect(master);
    rain.start();

    // nước chảy rất nhỏ — noise hẹp, lăn chậm dưới nền
    const water = ac.createBufferSource(); water.buffer = noiseBuffer(5, false); water.loop = true;
    const wp = ac.createBiquadFilter(); wp.type = "bandpass"; wp.frequency.value = 680; wp.Q.value = .75;
    waterGain = ac.createGain(); waterGain.gain.value = .022;
    water.connect(wp); wp.connect(waterGain); waterGain.connect(master);
    water.start();

    // nhạc nền không lời: pad rất mềm, đủ nghe nhưng nằm dưới lời.
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
  }

  function setPad(season, gain) {
    if (!padGain || !padOscs.length) return;
    const t = ac.currentTime;
    const chord = PAD_CHORDS[season] || PAD_CHORDS.xuan;
    padOscs.forEach((o, i) => o.frequency.setTargetAtTime(chord[i % chord.length], t, 1.8));
    padGain.gain.cancelScheduledValues(t);
    padGain.gain.setTargetAtTime(gain, t, 2.4);
  }

  // chuông gió mềm — bỏ overtone cao/chói
  function bell(freq, vol, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200; lp.Q.value = .35;
    lp.connect(master);
    [1, 1.5, 2].forEach((h, i) => {
      const o = ac.createOscillator(); o.type = i ? "triangle" : "sine"; o.frequency.value = freq*h;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol/(i+1.8), t+.055);
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
    g.gain.linearRampToValueAtTime(vol, t + .9);
    g.gain.setTargetAtTime(.0001, t + dur * .62, dur * .22);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200; lp.Q.value = .45;
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
    ng.gain.setValueAtTime(vol*.5, t);
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
    g.gain.linearRampToValueAtTime(.05, t+.02);
    g.gain.exponentialRampToValueAtTime(.0001, t+.18);
    o.start(t); o.stop(t+.25);
    if (Math.random()<.6) setTimeout(chirp, 180+Math.random()*160);
  }

  function schedule(season, weather) {
    clearInterval(chimeTimer); clearInterval(birdTimer); clearInterval(musicTimer);
    chimeTimer = setInterval(() => {
      if (Math.random() < (season==="dong" ? .08 : .16)) {
        bell(PENTA_LOW[season][Math.floor(Math.random()*3)] * 1.5, .024, 4.2);
      }
    }, 24000);
    if (season==="xuan" && weather!=="rain")
      birdTimer = setInterval(() => { if (Math.random()<.42) chirp(); }, 8500);
    const scale = PENTA_LOW[season] || PENTA_LOW.xuan;
    const playDrift = () => {
      if (!on || !ac) return;
      const i = Math.floor(Math.random() * scale.length);
      softNote(scale[i], season === "dong" ? .018 : .026, 8.5 + Math.random() * 3.5);
      if (Math.random() < .55) setTimeout(() => softNote(scale[(i + 2) % scale.length], .014, 7.2), 1300);
    };
    setTimeout(playDrift, 700);
    musicTimer = setInterval(playDrift, season === "ha" ? 7600 : 8400);
  }

  function setScene(season, weather) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    rainGain.gain.linearRampToValueAtTime(weather==="rain" ? .13 : 0, t+1.5);
    windGain.gain.linearRampToValueAtTime(season==="dong" ? .22 : season==="ha" ? .1 : .14, t+1.5);
    waterGain.gain.linearRampToValueAtTime(weather==="rain" ? .04 : season==="xuan" ? .032 : season==="dong" ? .016 : .024, t+1.5);
    setPad(season, weather==="rain" ? .045 : season==="dong" ? .038 : .056);
    schedule(season, weather);
  }

  function setEpilogue() {
    if (!ac || !on) return;
    clearInterval(chimeTimer); clearInterval(birdTimer); clearInterval(musicTimer);
    const t = ac.currentTime;
    rainGain.gain.linearRampToValueAtTime(0, t+1.5);
    windGain.gain.linearRampToValueAtTime(.1, t+2);
    waterGain.gain.linearRampToValueAtTime(.018, t+2);
    setPad("dong", .034);
    musicTimer = setInterval(() => softNote(PENTA_LOW.dong[Math.floor(Math.random()*3)], .016, 10), 14000);
    // đêm cuối năm: chuông rất thưa, rất khẽ
    chimeTimer = setInterval(() => {
      if (Math.random() < .16) bell(PENTA_LOW.dong[Math.floor(Math.random()*3)] * 1.5, .022, 4.8);
    }, 26000);
  }

  // SFX tổng hợp — cùng chất liệu với ambient
  function play(name) {
    if (!on || !ac) return;
    if (name === "accept") knock(170, .13);                    // chọn — một tiếng mõ mềm
    else if (name === "menu") tick(1900, .04, .05);            // lật/giở — tick giấy
    else if (name === "cancel") tick(760, .045, .07);          // gấp lại — tick trầm
    else if (name === "quote") {                               // mở khóa — hai nốt bowl mềm
      bell(392, .032, 2.8);
      setTimeout(() => bell(523.25, .024, 3.1), 220);
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
    }
    return on;
  }
  function enabledPref() { try { return localStorage.getItem(PREF_KEY) !== "0"; } catch(e){ return true; } }
  function boot(season, weather) { // gọi sau user gesture đầu tiên
    if (!enabledPref()) { on = false; return false; }
    on = true; start(); setScene(season, weather); return true;
  }

  return { toggle, boot, setScene, setEpilogue, play, isOn: () => on };
})();
