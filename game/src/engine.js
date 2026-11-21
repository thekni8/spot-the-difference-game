// The game engine: one level run at a time. It owns click handling and
// hit-testing, the found set, the timer, scoring, combos, hints, the
// wrong-click penalty and the win/lose transitions. It draws nothing and
// touches no DOM; main.js reads its public fields each frame.
import { levels } from './levels.js';
import { audio } from './audio.js';
import { storage } from './storage.js';

const COMBO_WINDOW = 5; // seconds between finds that keeps a combo alive
const WRONG_COST = 5; // seconds a wrong click costs
const HINT_SECONDS = 4; // how long a hint ring stays up
const HINTS_PER_LEVEL = 3;
const FIND_POINTS = 100;
const TIME_BONUS_PER_SECOND = 5;

export class Engine {
  constructor() {
    this.levelIndex = 0;
    this.level = levels[0];
    this.found = new Map(); // diff id -> { at: ms timestamp, panel }
    this.score = 0;
    this.combo = 0;
    this.comboBonus = 0;
    this.lastFindAt = 0;
    this.timeLeft = this.level.timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.mistakes = 0;
    this.hint = null; // { diffId, until }
    this.wrongFlash = null; // { x, y, panel, until }
    this.paused = false;
    this.status = 'idle'; // idle | playing | won | lost
    this.now = 0; // ms clock the loop advances
    this.lastTickSecond = -1;
    this.breakdown = null; // set when a level is won
    this.stars = 0;
  }

  startLevel(index) {
    this.levelIndex = index;
    this.level = levels[index];
    this.found = new Map();
    this.score = 0;
    this.combo = 0;
    this.comboBonus = 0;
    this.lastFindAt = 0;
    this.timeLeft = this.level.timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.mistakes = 0;
    this.hint = null;
    this.wrongFlash = null;
    this.paused = false;
    this.status = 'playing';
    this.lastTickSecond = -1;
    this.breakdown = null;
    this.stars = 0;
  }

  get foundCount() {
    return this.found.size;
  }

  get totalCount() {
    return this.level.differences.length;
  }

  get timeUp() {
    return this.timeLeft <= 0;
  }

  // The first unfound difference, in list order: the hint target.
  nextUnfound() {
    return this.level.differences.find((d) => !this.found.has(d.id)) || null;
  }

  // A click in scene coordinates (600x560 space) on either panel.
  // Returns 'found', 'wrong' or 'ignored'.
  click(x, y, panel) {
    if (this.status !== 'playing' || this.paused) return 'ignored';
    audio.unlock();
    for (const diff of this.level.differences) {
      if (this.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      const r = diff.r;
      if (dx * dx + dy * dy <= r * r) {
        this.registerFind(diff, panel);
        return 'found';
      }
    }
    this.registerWrong(x, y, panel);
    return 'wrong';
  }

  registerFind(diff, panel) {
    const nowSec = this.now / 1000;
    if (nowSec - this.lastFindAt <= COMBO_WINDOW && this.found.size > 0) {
      this.combo += 1;
    } else {
      this.combo = 0;
    }
    this.lastFindAt = nowSec;
    const comboPoints = this.combo * 25;
    this.comboBonus += comboPoints;
    this.score += FIND_POINTS + comboPoints;
    this.found.set(diff.id, { at: this.now, panel });
    audio.find();
    if (this.found.size === this.level.differences.length) {
      this.finishLevel();
    }
  }

  registerWrong(x, y, panel) {
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_COST);
    this.mistakes += 1;
    this.combo = 0;
    this.wrongFlash = { x, y, panel, until: this.now + 650 };
    audio.wrong();
  }

  useHint() {
    if (this.status !== 'playing' || this.paused) return null;
    if (this.hintsLeft <= 0) return null;
    const target = this.nextUnfound();
    if (!target) return null;
    this.hintsLeft -= 1;
    this.hint = { diffId: target.id, until: this.now + HINT_SECONDS * 1000 };
    audio.hint();
    return target;
  }

  // Stars from time left and mistakes: 3 needs a fast, clean run.
  starsForLevel() {
    const frac = this.timeLeft / this.level.timeLimit;
    if (frac >= 0.4 && this.mistakes <= 1) return 3;
    if (frac >= 0.18 && this.mistakes <= 3) return 2;
    return 1;
  }

  finishLevel() {
    const timeBonus = Math.round(this.timeLeft) * TIME_BONUS_PER_SECOND;
    const findsPoints = this.level.differences.length * FIND_POINTS;
    this.score += timeBonus;
    this.stars = this.starsForLevel();
    this.breakdown = {
      finds: findsPoints,
      combo: this.comboBonus,
      timeBonus,
      total: this.score,
      stars: this.stars,
      timeLeft: Math.round(this.timeLeft),
      mistakes: this.mistakes,
    };
    storage.setBest(this.level.id, this.score);
    storage.setStars(this.level.id, this.stars);
    this.status = 'won';
    audio.win();
  }

  update(dtMs) {
    if (this.status !== 'playing' || this.paused) return;
    this.now += dtMs;
    this.timeLeft = Math.max(0, this.timeLeft - dtMs / 1000);
    const whole = Math.ceil(this.timeLeft);
    if (this.timeLeft <= 10 && this.timeLeft > 0 && whole !== this.lastTickSecond) {
      this.lastTickSecond = whole;
      audio.tick();
    }
    if (this.hint && this.now >= this.hint.until) this.hint = null;
    if (this.wrongFlash && this.now >= this.wrongFlash.until) this.wrongFlash = null;
    if (this.timeLeft <= 0) {
      this.status = 'lost';
    }
  }

  togglePause() {
    if (this.status !== 'playing') return false;
    this.paused = !this.paused;
    return this.paused;
  }

  // Found labels in the order they were found, for the footer recap.
  foundLabels() {
    const byId = new Map(this.level.differences.map((d) => [d.id, d.label]));
    return [...this.found.keys()].map((id) => byId.get(id));
  }
}
