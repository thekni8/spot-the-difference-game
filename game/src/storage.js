// Best scores and stars per level, persisted in localStorage.
// All reads tolerate a missing or corrupt store and return sane defaults.

const KEY = 'twin-isles-spot-difference-v1';

// A staging override used only by the screenshot states in shots.js:
// when set, the title screen shows these stars/scores instead of the
// player's real ones, without writing anything to localStorage.
let staging = null;

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { best: {}, stars: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { best: {}, stars: {} };
    return {
      best: parsed.best && typeof parsed.best === 'object' ? parsed.best : {},
      stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {},
    };
  } catch (e) {
    return { best: {}, stars: {} };
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {}
}

export const storage = {
  setStaging(overrides) {
    staging = overrides || null;
  },
  clearStaging() {
    staging = null;
  },
  getStars(levelId) {
    if (staging && staging.stars && levelId in staging.stars) return staging.stars[levelId];
    return readStore().stars[levelId] || 0;
  },
  setStars(levelId, stars) {
    const store = readStore();
    const prev = store.stars[levelId] || 0;
    if (stars > prev) {
      store.stars[levelId] = stars;
      writeStore(store);
    }
    return Math.max(prev, stars);
  },
  getBest(levelId) {
    if (staging && staging.best && levelId in staging.best) return staging.best[levelId];
    return readStore().best[levelId] || 0;
  },
  setBest(levelId, score) {
    const store = readStore();
    const prev = store.best[levelId] || 0;
    if (score > prev) {
      store.best[levelId] = score;
      writeStore(store);
    }
    return Math.max(prev, score);
  },
  totalScore(levelIds) {
    let total = 0;
    for (const id of levelIds) total += this.getBest(id);
    return total;
  },
  totalStars(levelIds) {
    let total = 0;
    for (const id of levelIds) total += this.getStars(id);
    return total;
  },
};
