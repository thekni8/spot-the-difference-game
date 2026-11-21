// Level 5 — Starlight Observatory. A hilltop observatory at night:
// a telescope dome, stars, constellations, the moon, a fence, a tripod
// telescope and a comet. The smallest, subtlest changes.
import { fillCircle, fillEllipse, fillRect, poly, line, rr, star } from '../draw.js';

export const meta = {
  id: 'observatory',
  name: 'Starlight Observatory',
  timeLimit: 120,
  radius: 26,
};

export const differences = [
  { id: 'star-gone', x: 350, y: 120, r: 26, label: 'a star blinked out' },
  { id: 'dipper', x: 470, y: 200, r: 26, label: 'a constellation star moved' },
  { id: 'slit', x: 225, y: 300, r: 26, label: 'the dome slit closed' },
  { id: 'craters', x: 500, y: 90, r: 26, label: "the moon lost a crater" },
  { id: 'comet', x: 120, y: 100, r: 26, label: "the comet's tail grew" },
  { id: 'scope', x: 420, y: 390, r: 26, label: 'the telescope tilted' },
  { id: 'fence', x: 300, y: 480, r: 26, label: 'a fence post went missing' },
  { id: 'dial', x: 280, y: 385, r: 26, label: 'the dome dial moved' },
  { id: 'bush', x: 540, y: 470, r: 26, label: 'a bush appeared' },
  { id: 'star-colour', x: 520, y: 160, r: 26, label: 'a star changed colour' },
];

// Fixed star field, drawn identically in both pictures except where a
// difference says otherwise.
const STARFIELD = [
  [40, 60, 2], [90, 40, 1.6], [160, 70, 2], [210, 46, 1.6], [260, 90, 2],
  [300, 50, 1.8], [350, 120, 2], [380, 70, 1.6], [420, 110, 2], [470, 60, 1.8],
  [540, 40, 2], [560, 120, 1.8], [60, 150, 1.8], [140, 170, 2], [200, 140, 1.6],
  [250, 180, 2], [330, 200, 1.6], [380, 170, 2], [440, 140, 1.6], [520, 160, 2],
  [90, 230, 1.6], [160, 250, 2], [300, 260, 1.8], [380, 250, 1.6], [560, 220, 2],
  [40, 300, 1.8], [540, 300, 1.6], [330, 300, 1.8], [120, 320, 1.6],
];

function drawBush(ctx, x, y) {
  ctx.fillStyle = '#1e4a2e';
  ctx.beginPath();
  ctx.arc(x, y, 22, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 16, y + 4, 14, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 16, y + 4, 14, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - 30, y, 60, 8);
}

export function drawScene(ctx, rect, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 600, rect.h / 560);

  // Night sky and the Milky Way band.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0a1230');
  sky.addColorStop(1, '#1c2a55');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);
  ctx.fillStyle = 'rgba(180, 200, 255, 0.10)';
  ctx.beginPath();
  ctx.ellipse(300, 180, 330, 90, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Star field; one star is gone in the variant, one changes colour.
  for (const [sx, sy, sr] of STARFIELD) {
    if (variant && sx === 350 && sy === 120) continue;
    const colour = sx === 520 && sy === 160 && variant ? '#ffd23e' : '#ffffff';
    if (sr >= 2) star(ctx, sx, sy, sr * 2.6, colour, 0.4);
    else fillCircle(ctx, sx, sy, sr, colour);
  }

  // The Dipper: five stars joined by lines; one star shifts in the variant.
  const dipper = [[420, 190], [450, 180], [470, 200], [495, 215], [520, 205]];
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(dipper[0][0], dipper[0][1]);
  for (let i = 1; i < dipper.length; i++) {
    const [dx, dy] = dipper[i];
    const moved = variant && dx === 470 && dy === 200;
    ctx.lineTo(moved ? dx + 8 : dx, moved ? dy + 14 : dy);
  }
  ctx.stroke();
  for (const [dx, dy] of dipper) {
    const moved = variant && dx === 470 && dy === 200;
    star(ctx, moved ? dx + 8 : dx, moved ? dy + 14 : dy, 5, '#cfe0ff', 0.45);
  }

  // Comet with a tail that grows in the variant picture.
  const tailLen = variant ? 90 : 55;
  const grad = ctx.createLinearGradient(120, 100, 120 - tailLen, 100 - tailLen * 0.6);
  grad.addColorStop(0, 'rgba(190, 220, 255, 0.9)');
  grad.addColorStop(1, 'rgba(190, 220, 255, 0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(120, 100);
  ctx.lineTo(120 - tailLen, 100 - tailLen * 0.6);
  ctx.stroke();
  fillCircle(ctx, 120, 100, 9, '#eaf2ff');
  fillCircle(ctx, 120, 100, 4, '#ffffff');

  // Moon with craters; one crater is gone in the variant picture.
  fillCircle(ctx, 500, 90, 30, '#f4ead0');
  fillCircle(ctx, 490, 80, 6, '#d9cba6');
  fillCircle(ctx, 510, 100, 4, '#d9cba6');
  if (!variant) fillCircle(ctx, 505, 74, 3.5, '#d9cba6');

  // Hill and ground.
  fillEllipse(ctx, 300, 560, 460, 190, '#16301f');
  fillRect(ctx, 0, 400, 600, 160, '#16301f');
  fillEllipse(ctx, 140, 430, 130, 18, '#1e4a2e');
  fillEllipse(ctx, 470, 440, 140, 18, '#1e4a2e');
  drawBush(ctx, 90, 470);
  if (variant) drawBush(ctx, 540, 470);

  // Observatory: base building and white dome with a slit.
  fillRect(ctx, 160, 350, 130, 80, '#d9d4c8');
  ctx.fillStyle = '#b8b2a4';
  ctx.fillRect(160, 350, 130, 8);
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath();
  ctx.arc(225, 350, 68, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#d9d4c8';
  ctx.fillRect(157, 346, 136, 8);
  // The slit: open (dark slot with a glow) in one picture, closed in the other.
  if (!variant) {
    ctx.fillStyle = '#0a1230';
    ctx.fillRect(216, 288, 18, 62);
    ctx.fillStyle = 'rgba(255, 210, 62, 0.5)';
    ctx.fillRect(216, 288, 18, 10);
  } else {
    ctx.strokeStyle = '#c9c2b2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(225, 286);
    ctx.lineTo(225, 348);
    ctx.stroke();
  }
  // Door on the base building.
  fillRect(ctx, 205, 392, 26, 38, '#5b3a29');
  fillCircle(ctx, 226, 412, 2.5, '#ffd23e');
  // The little dial on the dome base; its needle points elsewhere in the variant.
  fillCircle(ctx, 280, 385, 13, '#fdf6e3');
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(280, 385, 13, 0, Math.PI * 2);
  ctx.stroke();
  const needle = variant ? 0.9 : -0.7;
  line(ctx, 280, 385, 280 + Math.cos(needle) * 10, 385 + Math.sin(needle) * 10, '#e8452c', 2.5);

  // Telescope on a tripod; it tilts up in one picture, level in the other.
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(420, 430);
  ctx.lineTo(400, 480);
  ctx.moveTo(420, 430);
  ctx.lineTo(440, 480);
  ctx.moveTo(420, 430);
  ctx.lineTo(420, 482);
  ctx.stroke();
  ctx.save();
  ctx.translate(420, 425);
  ctx.rotate(variant ? -0.15 : -0.6);
  rr(ctx, -8, -34, 68, 16, 8);
  ctx.fillStyle = '#8a94a8';
  ctx.fill();
  ctx.fillStyle = '#5a6478';
  ctx.fillRect(52, -32, 10, 12);
  ctx.restore();
  fillCircle(ctx, 420, 428, 6, '#3a3a4a');

  // Fence along the hill; one post is missing in the variant picture.
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 470);
  ctx.lineTo(560, 470);
  ctx.moveTo(40, 492);
  ctx.lineTo(560, 492);
  ctx.stroke();
  for (let px = 40; px <= 560; px += 65) {
    if (variant && px === 300) continue;
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(px - 4, 452, 8, 52);
  }

  ctx.restore();
}
