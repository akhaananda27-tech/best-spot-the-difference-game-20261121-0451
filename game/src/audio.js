// Tiny synthesized sounds (WebAudio, no audio files). The context is created lazily
// on the first user gesture so the page stays silent until played.
let ctx = null;

function ac(w) {
  if (w.muted) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(w, freq, dur, type, vol, when = 0) {
  const c = ac(w);
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function makeSfx(w) {
  return {
    click: () => tone(w, 520, 0.07, 'triangle', 0.12),
    found: () => {
      tone(w, 660, 0.1, 'sine', 0.16);
      tone(w, 990, 0.14, 'sine', 0.16, 0.09);
    },
    wrong: () => tone(w, 140, 0.18, 'sawtooth', 0.08),
    hint: () => tone(w, 880, 0.12, 'sine', 0.12),
    sceneDone: () => {
      tone(w, 523, 0.12, 'triangle', 0.16);
      tone(w, 659, 0.12, 'triangle', 0.16, 0.11);
      tone(w, 784, 0.2, 'triangle', 0.16, 0.22);
    },
    gameDone: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(w, f, 0.2, 'triangle', 0.16, i * 0.13));
    },
  };
}
