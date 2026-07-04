// ===== AMBIENT — gió, mưa, chuông gió, chim; sinh bằng WebAudio, không file =====

const Ambient = (() => {
  let ac = null, master = null, on = false;
  let windGain, rainGain, chimeTimer = null, birdTimer = null;
  const PREF_KEY = "tieuvien_sound";

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
    master = ac.createGain(); master.gain.value = .22; master.connect(ac.destination);

    // gió — brown noise + lowpass, phập phồng chậm
    const wind = ac.createBufferSource(); wind.buffer = noiseBuffer(4, true); wind.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    windGain = ac.createGain(); windGain.gain.value = .25;
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
  }

  // chuông gió — ngũ cung, thưa
  function bell(freq, vol, dur) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    [1, 2.76, 5.4].forEach((h, i) => {
      const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = freq*h;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol/(i+1.5), t+.008);
      g.gain.exponentialRampToValueAtTime(.0001, t+dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.1);
    });
  }
  const PENTA = [440, 523.25, 587.33, 659.25, 783.99];

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
    clearInterval(chimeTimer); clearInterval(birdTimer);
    chimeTimer = setInterval(() => {
      if (Math.random() < (season==="dong" ? .25 : .5)) {
        const n = 1+Math.floor(Math.random()*2);
        for (let i=0;i<n;i++) setTimeout(() => bell(PENTA[Math.floor(Math.random()*5)], .10, 3.2), i*420);
      }
    }, 11000);
    if (season==="xuan" && weather!=="rain")
      birdTimer = setInterval(() => { if (Math.random()<.55) chirp(); }, 6500);
  }

  function setScene(season, weather) {
    if (!ac || !on) return;
    const t = ac.currentTime;
    rainGain.gain.linearRampToValueAtTime(weather==="rain" ? .16 : 0, t+1.5);
    windGain.gain.linearRampToValueAtTime(season==="dong" ? .34 : season==="ha" ? .16 : .25, t+1.5);
    schedule(season, weather);
  }

  function toggle() {
    on = !on;
    try { localStorage.setItem(PREF_KEY, on ? "1" : "0"); } catch(e){}
    if (on) start(); else if (ac) { ac.suspend(); clearInterval(chimeTimer); clearInterval(birdTimer); }
    return on;
  }
  function enabledPref() { try { return localStorage.getItem(PREF_KEY) !== "0"; } catch(e){ return true; } }
  function boot(season, weather) { // gọi sau user gesture đầu tiên
    if (!enabledPref()) { on = false; return false; }
    on = true; start(); setScene(season, weather); return true;
  }

  return { toggle, boot, setScene, isOn: () => on };
})();
