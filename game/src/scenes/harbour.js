// Level 1 — Harbour Morning. A sunny harbour: boats, gulls, crates,
// a lighthouse, clouds and buoys. Gentle changes, generous hit radius.
import { puffCloud, gull, sailboat, crate, circle, fillCircle, fillEllipse, fillRect, poly, line } from '../draw.js';

export const meta = {
  id: 'harbour',
  name: 'Harbour Morning',
  timeLimit: 180,
  radius: 34,
};

export const differences = [
  { id: 'sail', x: 140, y: 368, r: 34, label: 'the sail changed colour' },
  { id: 'gull', x: 260, y: 100, r: 34, label: 'a gull went missing' },
  { id: 'crate', x: 200, y: 385, r: 34, label: 'an extra crate appeared' },
  { id: 'buoy', x: 250, y: 485, r: 34, label: "the buoy's stripe changed" },
  { id: 'lamp', x: 522, y: 240, r: 34, label: 'the lighthouse lamp lit up' },
  { id: 'cloud', x: 380, y: 90, r: 34, label: 'a cloud changed shape' },
];

function drawBuoy(ctx, x, y, stripe) {
  fillCircle(ctx, x, y, 17, '#e8452c');
  ctx.fillStyle = stripe;
  ctx.fillRect(x - 17, y - 5, 34, 10);
  fillCircle(ctx, x, y - 17, 5, '#ffd23e');
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - 17, y + 8, 34, 4);
}

export function drawScene(ctx, rect, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 600, rect.h / 560);

  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, '#aee3f5');
  sky.addColorStop(1, '#e8f7fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 335);
  fillCircle(ctx, 90, 70, 34, '#ffd23e');
  ctx.strokeStyle = '#ffd23e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    line(ctx, 90 + Math.cos(a) * 44, 70 + Math.sin(a) * 44, 90 + Math.cos(a) * 56, 70 + Math.sin(a) * 56, '#ffd23e', 5);
  }

  // Clouds; the middle one shrinks in the variant picture.
  puffCloud(ctx, 200, 60, 1, '#ffffff');
  puffCloud(ctx, 380, 90, variant ? 0.6 : 1.1, '#ffffff');
  puffCloud(ctx, 505, 50, 0.8, '#ffffff');

  // Gulls; the middle one is gone in the variant picture.
  gull(ctx, 150, 120, 1, '#33505e');
  if (!variant) gull(ctx, 260, 100, 1, '#33505e');
  gull(ctx, 330, 140, 0.85, '#33505e');

  // Sea.
  fillRect(ctx, 0, 330, 600, 230, '#2fa8a0');
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (const [wx, wy, wl] of [[60, 360, 46], [180, 395, 60], [330, 370, 52], [470, 410, 58], [120, 500, 66], [330, 520, 70], [480, 545, 60]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 7, wx + wl, wy);
    ctx.stroke();
  }

  // Rocky point and lighthouse on the right.
  fillEllipse(ctx, 522, 345, 62, 18, '#8d99a5');
  fillRect(ctx, 503, 205, 38, 140, '#fdf6e3');
  fillRect(ctx, 503, 245, 38, 18, '#e8452c');
  fillRect(ctx, 503, 300, 38, 18, '#e8452c');
  fillRect(ctx, 497, 190, 50, 16, '#33505e');
  fillCircle(ctx, 522, 178, 12, '#33505e');
  // The lamp window: dark in one picture, lit in the other.
  if (variant) {
    ctx.fillStyle = 'rgba(255, 210, 62, 0.4)';
    circle(ctx, 522, 240, 26);
    ctx.fill();
  }
  fillRect(ctx, 517, 232, 10, 16, variant ? '#ffd23e' : '#2c3e50');

  // Boats on the water.
  sailboat(ctx, 140, 395, '#7a4a21', variant ? '#1f8a70' : '#e85d3d', 46);
  sailboat(ctx, 390, 445, '#3d6b8e', '#3a6fd8', 34);
  // A little rowboat.
  poly(ctx, [[452, 500], [512, 500], [500, 514], [464, 514]], '#b8433a');
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(472, 496, 16, 4);

  // Wooden pier on the left.
  fillRect(ctx, 30, 415, 270, 16, '#a9743f');
  fillRect(ctx, 30, 431, 270, 8, '#8a5a2b');
  for (const px of [45, 110, 175, 240, 285]) {
    fillRect(ctx, px, 431, 10, 34, '#6b4423');
  }
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  for (let x = 60; x < 300; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 415);
    ctx.lineTo(x, 431);
    ctx.stroke();
  }

  // Crates on the pier; a third one appears in the variant picture.
  crate(ctx, 95, 372, 1);
  crate(ctx, 140, 378, 0.9);
  if (variant) crate(ctx, 200, 385, 0.9);

  // Buoys bobbing in the water; the near one's stripe changes colour.
  drawBuoy(ctx, 250, 485, variant ? '#ffd23e' : '#ffffff');
  fillCircle(ctx, 430, 505, 13, '#ffd23e');
  ctx.fillStyle = '#e8452c';
  ctx.fillRect(417, 500, 26, 6);

  ctx.restore();
}
