// Deterministic screenshot staging. Reads ?shot=... and puts the game
// into one exact state, with no randomness anywhere in the staged states.
// When a shot is applied the caller freezes the engine clock, so the
// timer, the hint ring and the marker pops stay exactly as staged.
import { storage } from './storage.js';

function stageFound(engine, count) {
  const diffs = engine.level.differences.slice(0, count);
  for (const d of diffs) {
    // Found long enough ago that the pop animation has settled.
    engine.found.set(d.id, { at: engine.now - 1000, panel: 0 });
  }
}

export function applyShot(engine, hooks) {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) return null;

  if (shot === 'cover') {
    // Level 1 mid-play: exactly 3 of 6 found, timer about 2:30.
    engine.startLevel(0);
    stageFound(engine, 3);
    engine.timeLeft = 150;
    engine.score = 325;
    engine.comboBonus = 25;
    hooks.showPlay();
    return shot;
  }

  if (shot === 'levels') {
    // Level select with stars earned on the first three levels; the last
    // two are explicitly zeroed so real playtest data in localStorage
    // cannot leak into the staged shot.
    storage.setStaging({
      stars: { harbour: 3, forest: 2, market: 3, cabin: 0, observatory: 0 },
      best: { harbour: 1250, forest: 980, market: 1100, cabin: 0, observatory: 0 },
    });
    hooks.showTitle();
    return shot;
  }

  if (shot === 'hard') {
    // Level 4 mid-play: 5 of 9 found, timer low and red, one hint pulsing.
    engine.startLevel(3);
    stageFound(engine, 5);
    engine.timeLeft = 42;
    engine.score = 1250;
    engine.comboBonus = 75;
    const target = engine.nextUnfound();
    if (target) engine.hint = { diffId: target.id, until: engine.now + 4000 };
    hooks.showPlay();
    return shot;
  }

  if (shot === 'win') {
    // Level 2 finished with 3 stars and a full score breakdown.
    engine.startLevel(1);
    stageFound(engine, engine.totalCount);
    engine.timeLeft = 62;
    engine.score = 1060;
    engine.comboBonus = 50;
    engine.stars = 3;
    engine.status = 'won';
    engine.breakdown = {
      finds: 700,
      combo: 50,
      timeBonus: 310,
      total: 1060,
      stars: 3,
      timeLeft: 62,
      mistakes: 1,
    };
    hooks.showLevelComplete(engine.breakdown, engine.level);
    return shot;
  }

  return null;
}
