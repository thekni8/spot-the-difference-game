// Level 2 — Forest Camp. A campsite clearing: tent, campfire, trees,
// a lantern, a backpack, mushrooms and birds. Medium changes.
import { puffCloud, gull, pine, flame, paperLantern, fillCircle, fillEllipse, fillRect, poly, line, rr } from '../draw.js';

export const meta = {
  id: 'forest',
  name: 'Forest Camp',
  timeLimit: 150,
  radius: 32,
};

export const differences = [
  { id: 'tent-door', x: 190, y: 335, r: 32, label: 'the tent door opened' },
  { id: 'flame', x: 340, y: 410, r: 32, label: 'the campfire flame shrank' },
  { id: 'lantern', x: 460, y: 255, r: 32, label: 'the lantern went out' },
  { id: 'mushroom', x: 95, y: 490, r: 32, label: 'a mushroom disappeared' },
  { id: 'bird', x: 360, y: 90, r: 32, label: 'an extra bird appeared' },
  { id: 'pack', x: 280, y: 480, r: 32, label: 'the backpack changed colour' },
  { id: 'pine', x: 500, y: 170, r: 32, label: 'a pine tree got shorter' },
];

function drawMushroom(ctx, x, y, s) {
  ctx.fillStyle = '#f2ead8';
  ctx.fillRect(x - 3 * s, y, 6 * s, 12 * s);
  ctx.fillStyle = '#e8452c';
  ctx.beginPath();
  ctx.arc(x, y, 12 * s, Math.PI, 0);
  ctx.fill();
  fillCircle(ctx, x - 5 * s, y - 5 * s, 2.5 * s, '#ffffff');
  fillCircle(ctx, x + 4 * s, y - 8 * s, 2 * s, '#ffffff');
}

export function drawScene(ctx, rect, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 600, rect.h / 560);

  // Sky, sun and far mountains.
  const sky = ctx.createLinearGradient(0, 0, 0, 215);
  sky.addColorStop(0, '#a8d8f0');
  sky.addColorStop(1, '#e6f4fb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 215);
  fillCircle(ctx, 70, 60, 26, '#ffd23e');
  poly(ctx, [[0, 215], [110, 90], [230, 215]], '#7ba7c9');
  poly(ctx, [[150, 215], [300, 70], [460, 215]], '#6b97bd');
  poly(ctx, [[380, 215], [500, 110], [600, 215]], '#7ba7c9');
  fillEllipse(ctx, 300, 70, 34, 14, '#ffffff');
  puffCloud(ctx, 430, 55, 0.9, '#ffffff');

  // Grass clearing.
  fillRect(ctx, 0, 210, 600, 350, '#7cb84f');
  fillEllipse(ctx, 120, 300, 90, 22, '#6aa843');
  fillEllipse(ctx, 430, 300, 110, 24, '#6aa843');
  fillEllipse(ctx, 300, 520, 150, 26, '#6aa843');
  // Grass tufts.
  ctx.strokeStyle = '#5d9a38';
  ctx.lineWidth = 2.5;
  for (const [gx, gy] of [[60, 260], [250, 250], [520, 260], [80, 540], [560, 530], [180, 540], [420, 545]]) {
    ctx.beginPath();
    ctx.moveTo(gx - 6, gy);
    ctx.lineTo(gx - 8, gy - 9);
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy - 11);
    ctx.moveTo(gx + 6, gy);
    ctx.lineTo(gx + 8, gy - 9);
    ctx.stroke();
  }

  // Birds; a third one joins in the variant picture.
  gull(ctx, 180, 80, 1, '#33505e');
  gull(ctx, 300, 60, 0.9, '#33505e');
  if (variant) gull(ctx, 360, 90, 0.9, '#33505e');

  // Back pines; the right-hand one is shorter in the variant picture.
  pine(ctx, 60, 205, 110, 70, '#2f7a3d', false);
  pine(ctx, 125, 210, 88, 56, '#35853f', false);
  pine(ctx, 430, 205, 80, 52, '#2f7a3d', false);
  pine(ctx, 500, 200, variant ? 85 : 122, 66, '#35853f', false);
  pine(ctx, 558, 212, 92, 58, '#2f7a3d', false);

  // Orange tent with a door flap that opens in the variant picture.
  poly(ctx, [[110, 380], [190, 250], [270, 380]], '#ff8c42');
  poly(ctx, [[190, 250], [270, 380], [232, 380]], '#e8732a');
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(104, 378, 172, 8);
  if (variant) {
    poly(ctx, [[176, 380], [190, 318], [204, 380]], '#3a2a1a');
    poly(ctx, [[176, 380], [190, 318], [190, 380]], '#ff8c42');
  } else {
    poly(ctx, [[176, 380], [190, 318], [204, 380]], '#d95f1e');
    line(ctx, 190, 318, 190, 380, '#b34a12', 2);
  }
  // Sleeping bag rolled beside the tent.
  rr(ctx, 250, 420, 62, 22, 10);
  ctx.fillStyle = '#3a6fd8';
  ctx.fill();
  ctx.fillStyle = '#2a55a8';
  ctx.fillRect(250, 420, 12, 22);

  // Campfire: stone ring, crossed logs, flame (smaller in the variant).
  fillEllipse(ctx, 340, 448, 46, 12, '#8d99a5');
  for (const [sx, sy] of [[300, 436], [318, 446], [362, 446], [378, 436], [340, 452]]) {
    fillCircle(ctx, sx, sy, 7, '#6e7a85');
  }
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(318, 442);
  ctx.lineTo(362, 428);
  ctx.moveTo(362, 442);
  ctx.lineTo(318, 428);
  ctx.stroke();
  flame(ctx, 340, 428, variant ? 0.55 : 1);

  // Lantern hanging from a post; lit in one picture, dark in the other.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(448, 200, 8, 46);
  ctx.fillRect(448, 200, 34, 7);
  paperLantern(ctx, 460, 255, 17, !variant);

  // Backpack; red in one picture, green in the other.
  const pack = variant ? '#3d8a4f' : '#e8452c';
  rr(ctx, 258, 458, 46, 52, 10);
  ctx.fillStyle = pack;
  ctx.fill();
  rr(ctx, 258, 458, 46, 14, 8);
  ctx.fillStyle = variant ? '#2f6e3e' : '#b83224';
  ctx.fill();
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(270, 458);
  ctx.quadraticCurveTo(281, 446, 292, 458);
  ctx.stroke();

  // Mushrooms by the left pine; one is gone in the variant picture.
  drawMushroom(ctx, 80, 492, 1);
  drawMushroom(ctx, 108, 496, 0.8);
  if (!variant) drawMushroom(ctx, 95, 478, 0.7);

  // A log bench on the right.
  fillRect(ctx, 440, 470, 110, 16, '#a9743f');
  fillRect(ctx, 452, 486, 12, 18, '#6b4423');
  fillRect(ctx, 526, 486, 12, 18, '#6b4423');

  ctx.restore();
}
