// Synthesised WebAudio sounds for Twin Isles. No audio files, no network.
// Every public method is safe to call before any user gesture and never
// throws, even where AudioContext is unavailable.

let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + startAt + dur);
    gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + startAt);
    osc.stop(ac.currentTime + startAt + dur + 0.05);
  } catch (e) {
    // Sound is garnish: a failure must never break the game.
  }
}

export const audio = {
  isMuted() {
    return muted;
  },
  setMuted(value) {
    muted = !!value;
    try {
      localStorage.setItem('twin-isles-muted', muted ? '1' : '0');
    } catch (e) {}
  },
  loadMuted() {
    try {
      muted = localStorage.getItem('twin-isles-muted') === '1';
    } catch (e) {
      muted = false;
    }
    return muted;
  },
  // Called from the first real click so the context is gesture-unlocked.
  unlock() {
    ensureCtx();
  },
  // A bright two-note chime when a difference is found.
  find() {
    tone(660, 0, 0.16, 'sine', 0.22);
    tone(990, 0.09, 0.22, 'sine', 0.2);
  },
  // A low buzz for a wrong click.
  wrong() {
    tone(160, 0, 0.22, 'sawtooth', 0.12, 110);
  },
  // A rising arpeggio for a finished level.
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => tone(f, i * 0.11, 0.24, 'triangle', 0.2));
  },
  // A soft tick when the timer drops under ten seconds.
  tick() {
    tone(880, 0, 0.06, 'square', 0.05);
  },
  // A gentle pop for a hint.
  hint() {
    tone(520, 0, 0.12, 'sine', 0.12, 780);
  },
};
