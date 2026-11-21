// Twin Isles: Spot the Difference — boot, screen state machine, game
// loop and rendering. One 1280x720 canvas holds both panels; the HUD
// and the screens are DOM laid over it inside a fixed 1280x720 stage
// that scales to fit the window.
import { levels } from './levels.js';
import { Engine } from './engine.js';
import { audio } from './audio.js';
import { storage } from './storage.js';
import { drawFoundRing, drawHintRing, drawWrongX } from './markers.js';
import { applyShot } from './shots.js';

const W = 1280;
const H = 720;
const PANEL_Y = 84;
const PANEL_W = 600;
const PANEL_H = 560;
const LEFT_X = 20;
const RIGHT_X = 660;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');

const el = (id) => document.getElementById(id);
const hudLevel = el('hud-level');
const hudFound = el('hud-found');
const hudTime = el('hud-time');
const hudTimeFill = el('hud-time-fill');
const hudScore = el('hud-score');
const hintBtn = el('hint-btn');
const muteBtn = el('mute-btn');
const pauseBtn = el('pause-btn');
const footerChips = el('found-chips');

const engine = new Engine();
let screen = 'title'; // title | play | pause | complete | failed | gameComplete
let frozen = false; // true while a staged screenshot state is showing
let lastFrame = performance.now();

// Collect page errors for the playtest harness to read back.
window.__errors = [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => window.__errors.push('rejection: ' + String(e.reason)));

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function showOnly(id) {
  for (const name of ['screen-title', 'screen-pause', 'screen-complete', 'screen-failed', 'screen-game-complete']) {
    el(name).classList.toggle('hidden', name !== id);
  }
}

function starsText(n) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
}

function buildTitle() {
  const grid = el('level-grid');
  grid.innerHTML = '';
  levels.forEach((level, i) => {
    const stars = storage.getStars(level.id);
    const best = storage.getBest(level.id);
    const card = document.createElement('button');
    card.className = 'level-card';
    card.type = 'button';
    card.innerHTML =
      '<span class="level-num">' + (i + 1) + '</span>' +
      '<span class="level-name">' + level.name + '</span>' +
      '<span class="level-meta">' + level.differences.length + ' differences · ' + fmtTime(level.timeLimit) + '</span>' +
      '<span class="level-stars">' + starsText(stars) + '</span>' +
      (best > 0 ? '<span class="level-best">Best ' + best + '</span>' : '<span class="level-best">Not played yet</span>');
    card.addEventListener('click', () => startLevel(i));
    grid.appendChild(card);
  });
  el('total-score').textContent = 'Total best score: ' + storage.totalScore(levels.map((l) => l.id));
  el('total-stars').textContent = 'Stars: ' + storage.totalStars(levels.map((l) => l.id)) + ' / ' + levels.length * 3;
}

function showTitle() {
  screen = 'title';
  buildTitle();
  showOnly('screen-title');
}

function showPlay() {
  screen = 'play';
  hudLevel.textContent = engine.level.name;
  showOnly(null);
}

function startLevel(index) {
  engine.startLevel(index);
  hudLevel.textContent = levels[index].name;
  audio.unlock();
  showPlay();
}

function showLevelComplete(breakdown, level) {
  screen = 'complete';
  el('complete-title').textContent = level.name + ' complete!';
  el('complete-stars').textContent = starsText(breakdown.stars);
  el('complete-finds').textContent = 'Finds: ' + level.differences.length + ' × 100 = ' + breakdown.finds;
  el('complete-combo').textContent = 'Combo bonus: ' + breakdown.combo;
  el('complete-time').textContent = 'Time bonus: ' + breakdown.timeLeft + 's left × 5 = ' + breakdown.timeBonus;
  el('complete-total').textContent = 'Total: ' + breakdown.total;
  const nextBtn = el('next-btn');
  const isLast = engine.levelIndex >= levels.length - 1;
  nextBtn.textContent = isLast ? 'See results' : 'Next level';
  showOnly('screen-complete');
}

function showGameComplete() {
  screen = 'gameComplete';
  const ids = levels.map((l) => l.id);
  el('final-score').textContent = 'Total score: ' + storage.totalScore(ids);
  el('final-stars').textContent = 'Stars: ' + storage.totalStars(ids) + ' / ' + levels.length * 3;
  showOnly('screen-game-complete');
}

function showFailed() {
  screen = 'failed';
  el('failed-found').textContent = 'You found ' + engine.foundCount + ' of ' + engine.totalCount + ' differences.';
  showOnly('screen-failed');
}

function showPause() {
  screen = 'pause';
  showOnly('screen-pause');
}

function togglePause() {
  if (screen === 'play') {
    if (engine.togglePause()) showPause();
  } else if (screen === 'pause') {
    engine.togglePause();
    showPlay();
  }
}

// --- HUD and footer -------------------------------------------------------

function updateHud() {
  hudLevel.textContent = engine.level.name;
  hudFound.textContent = 'Found ' + engine.foundCount + ' of ' + engine.totalCount;
  hudTime.textContent = fmtTime(engine.timeLeft);
  const frac = Math.max(0, engine.timeLeft / engine.level.timeLimit);
  hudTimeFill.style.width = (frac * 100).toFixed(1) + '%';
  hudTimeFill.classList.toggle('low', engine.timeLeft <= 60);
  hudTimeFill.classList.toggle('critical', engine.timeLeft <= 30);
  hudTimeFill.classList.toggle('pulse', engine.timeLeft <= 10);
  hudTime.classList.toggle('critical-text', engine.timeLeft <= 30);
  hudTime.classList.toggle('pulse', engine.timeLeft <= 10);
  hudScore.textContent = 'Score ' + engine.score;
  hintBtn.textContent = 'Hint · ' + engine.hintsLeft;
  hintBtn.disabled = engine.hintsLeft <= 0 || engine.foundCount >= engine.totalCount;
  const labels = engine.foundLabels();
  footerChips.innerHTML = labels.map((l) => '<span class="chip">' + l + '</span>').join('');
}

// --- Canvas rendering -----------------------------------------------------

function drawPanels() {
  const level = engine.level;
  // Panel frames.
  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = '#0f5e6e';
  ctx.lineWidth = 4;
  for (const x of [LEFT_X, RIGHT_X]) {
    ctx.beginPath();
    ctx.roundRect(x - 6, PANEL_Y - 6, PANEL_W + 12, PANEL_H + 12, 14);
    ctx.fill();
    ctx.stroke();
  }
  level.draw(ctx, { x: LEFT_X, y: PANEL_Y, w: PANEL_W, h: PANEL_H }, 0);
  level.draw(ctx, { x: RIGHT_X, y: PANEL_Y, w: PANEL_W, h: PANEL_H }, 1);
  // A / B badges.
  for (const [x, label] of [[LEFT_X, 'A'], [RIGHT_X, 'B']]) {
    ctx.fillStyle = '#0f5e6e';
    ctx.beginPath();
    ctx.arc(x + 22, PANEL_Y + 22, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 22, PANEL_Y + 23);
  }
}

function drawMarkers() {
  const level = engine.level;
  const byId = new Map(level.differences.map((d) => [d.id, d]));
  for (const [id, found] of engine.found) {
    const diff = byId.get(id);
    if (!diff) continue;
    const progress = Math.min(1, (engine.now - found.at) / 350);
    for (const x of [LEFT_X, RIGHT_X]) {
      drawFoundRing(ctx, x + diff.x, PANEL_Y + diff.y, diff.r, progress);
    }
  }
  if (engine.hint) {
    const diff = byId.get(engine.hint.diffId);
    if (diff) {
      const phase = (engine.now % 1200) / 1200;
      for (const x of [LEFT_X, RIGHT_X]) {
        drawHintRing(ctx, x + diff.x, PANEL_Y + diff.y, diff.r, phase);
      }
    }
  }
  if (engine.wrongFlash) {
    const flash = engine.wrongFlash;
    const x = flash.panel === 0 ? LEFT_X : RIGHT_X;
    const progress = Math.min(1, (engine.now - (flash.until - 650)) / 650);
    drawWrongX(ctx, x + flash.x, PANEL_Y + flash.y, progress);
  }
}

function render() {
  // Warm backdrop for the whole stage.
  ctx.fillStyle = '#fff6e5';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0f5e6e';
  ctx.fillRect(0, 0, W, 4);
  ctx.fillStyle = '#ffcf3f';
  ctx.fillRect(0, H - 4, W, 4);
  drawPanels();
  drawMarkers();
}

// --- Input ----------------------------------------------------------------

canvas.addEventListener('click', (e) => {
  if (screen !== 'play') return;
  const rect = canvas.getBoundingClientRect();
  const cx = ((e.clientX - rect.left) / rect.width) * W;
  const cy = ((e.clientY - rect.top) / rect.height) * H;
  let panel = -1;
  let px = 0;
  if (cx >= LEFT_X && cx <= LEFT_X + PANEL_W && cy >= PANEL_Y && cy <= PANEL_Y + PANEL_H) {
    panel = 0;
    px = LEFT_X;
  } else if (cx >= RIGHT_X && cx <= RIGHT_X + PANEL_W && cy >= PANEL_Y && cy <= PANEL_Y + PANEL_H) {
    panel = 1;
    px = RIGHT_X;
  }
  if (panel < 0) return;
  engine.click(cx - px, cy - PANEL_Y, panel);
});

hintBtn.addEventListener('click', () => {
  if (screen === 'play') engine.useHint();
});

muteBtn.addEventListener('click', () => {
  audio.setMuted(!audio.isMuted());
  muteBtn.textContent = audio.isMuted() ? 'Sound: Off' : 'Sound: On';
});

pauseBtn.addEventListener('click', () => togglePause());

el('resume-btn').addEventListener('click', () => togglePause());
el('restart-btn').addEventListener('click', () => startLevel(engine.levelIndex));
el('quit-btn').addEventListener('click', () => {
  engine.paused = false;
  showTitle();
});
el('next-btn').addEventListener('click', () => {
  if (engine.levelIndex >= levels.length - 1) showGameComplete();
  else startLevel(engine.levelIndex + 1);
});
el('replay-btn').addEventListener('click', () => startLevel(engine.levelIndex));
el('complete-menu-btn').addEventListener('click', () => showTitle());
el('retry-btn').addEventListener('click', () => startLevel(engine.levelIndex));
el('failed-menu-btn').addEventListener('click', () => showTitle());
el('again-btn').addEventListener('click', () => startLevel(0));
el('final-menu-btn').addEventListener('click', () => showTitle());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause();
  if ((e.key === 'h' || e.key === 'H') && screen === 'play') engine.useHint();
  if (e.key === 'm' || e.key === 'M') muteBtn.click();
});

// --- Stage scaling --------------------------------------------------------

function fitStage() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
window.addEventListener('resize', fitStage);

// --- Main loop ------------------------------------------------------------

function frame(now) {
  const dt = Math.min(100, now - lastFrame);
  lastFrame = now;
  try {
    if (screen === 'play' && !frozen) {
      engine.update(dt);
      if (engine.status === 'won') showLevelComplete(engine.breakdown, engine.level);
      else if (engine.status === 'lost') showFailed();
    }
    if (screen === 'play' || screen === 'pause' || screen === 'complete' || screen === 'failed') {
      render();
      updateHud();
    } else {
      // Title and game-complete screens keep the harbour behind the overlay.
      render();
    }
  } catch (err) {
    // Never let one bad frame kill the loop; the error is recorded for
    // the harness and the next frame still runs.
    window.__errors.push('frame: ' + String(err && err.message ? err.message : err));
  }
  requestAnimationFrame(frame);
}

// --- Boot -----------------------------------------------------------------

function boot() {
  audio.loadMuted();
  muteBtn.textContent = audio.isMuted() ? 'Sound: Off' : 'Sound: On';
  hudLevel.textContent = levels[0].name;
  fitStage();
  const shot = applyShot(engine, { showTitle, showPlay, showLevelComplete });
  if (shot) {
    frozen = true;
    if (shot === 'levels') buildTitle();
    render();
    updateHud();
  } else {
    showTitle();
  }
  requestAnimationFrame(frame);
}

// A small handle for the playtest harness (and for debugging in the browser).
window.__game = {
  engine,
  levels,
  storage,
  audio,
  startLevel,
  showTitle,
  get screen() {
    return screen;
  },
};

boot();
