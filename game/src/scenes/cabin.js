// Level 4 — Mountain Cabin. A snowy cabin at dusk: chimney smoke, pines,
// a woodpile, skis, glowing windows, footprints and an owl.
// Subtle changes, tighter hit radius, less time.
import { pine, circle, fillCircle, fillEllipse, fillRect, poly, line, rr, star } from '../draw.js';

export const meta = {
  id: 'cabin',
  name: 'Mountain Cabin',
  timeLimit: 120,
  radius: 28,
};

export const differences = [
  { id: 'smoke', x: 350, y: 200, r: 28, label: 'the chimney smoke vanished' },
  { id: 'window', x: 245, y: 330, r: 28, label: 'a cabin window went dark' },
  { id: 'owl', x: 500, y: 290, r: 28, label: 'the owl flew away' },
  { id: 'skis', x: 200, y: 420, r: 28, label: 'one ski went missing' },
  { id: 'prints', x: 300, y: 500, r: 28, label: 'the footprints faded' },
  { id: 'wood', x: 430, y: 430, r: 28, label: 'a log left the woodpile' },
  { id: 'snowcap', x: 150, y: 330, r: 28, label: 'snow fell off a pine' },
  { id: 'star', x: 150, y: 90, r: 28, label: 'a star blinked out' },
  { id: 'wreath', x: 300, y: 385, r: 28, label: 'the door wreath vanished' },
];

function drawOwl(ctx, x, y) {
  ctx.fillStyle = '#8a6a4a';
  ctx.beginPath();
  ctx.ellipse(x, y, 13, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[x - 12, y - 12], [x - 8, y - 24], [x - 3, y - 14]], '#8a6a4a');
  poly(ctx, [[x + 12, y - 12], [x + 8, y - 24], [x + 3, y - 14]], '#8a6a4a');
  fillCircle(ctx, x - 5, y - 6, 4.5, '#ffffff');
  fillCircle(ctx, x + 5, y - 6, 4.5, '#ffffff');
  fillCircle(ctx, x - 5, y - 6, 2, '#1a1a1a');
  fillCircle(ctx, x + 5, y - 6, 2, '#1a1a1a');
  poly(ctx, [[x - 3, y - 1], [x + 3, y - 1], [x, y + 4]], '#e8a33d');
  ctx.fillStyle = '#d9c9a8';
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSmoke(ctx, x, y) {
  ctx.fillStyle = 'rgba(220, 226, 235, 0.85)';
  for (const [dx, dy, r] of [[0, 0, 10], [10, -16, 13], [-4, -30, 15], [8, -46, 17], [-2, -62, 14]]) {
    circle(ctx, x + dx, y + dy, r);
    ctx.fill();
  }
}

function drawSki(ctx, x, y, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  rr(ctx, -6, -52, 12, 104, 6);
  ctx.fillStyle = '#e8452c';
  ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(-6, -20, 12, 8);
  ctx.fillRect(-6, 8, 12, 8);
  ctx.restore();
}

export function drawScene(ctx, rect, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 600, rect.h / 560);

  // Dusk sky and stars.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#1d2b52');
  sky.addColorStop(0.7, '#4a5a8a');
  sky.addColorStop(1, '#8a7aa8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 385);
  ctx.fillStyle = '#ffffff';
  for (const [sx, sy, sr] of [[60, 60, 2], [120, 40, 1.6], [200, 70, 2], [260, 44, 1.6], [330, 80, 2], [420, 50, 1.8], [480, 110, 2], [540, 60, 1.6], [90, 130, 1.8], [380, 130, 1.6], [560, 150, 1.8]]) {
    fillCircle(ctx, sx, sy, sr, '#ffffff');
  }
  // One star near the top-left is missing in the variant picture.
  if (!variant) star(ctx, 150, 90, 6, '#ffe9a8');
  // Crescent moon.
  fillCircle(ctx, 80, 70, 24, '#ffe9a8');
  fillCircle(ctx, 90, 64, 20, '#1d2b52');

  // Far snowy ridge.
  poly(ctx, [[0, 385], [130, 250], [260, 385]], '#5a6a9a');
  poly(ctx, [[180, 385], [330, 230], [480, 385]], '#4a5a8a');
  poly(ctx, [[400, 385], [520, 260], [600, 385]], '#5a6a9a');
  poly(ctx, [[110, 268], [130, 250], [150, 268], [140, 262], [120, 262]], '#ffffff');

  // Snow ground with drifts.
  fillRect(ctx, 0, 380, 600, 180, '#eef3fa');
  fillEllipse(ctx, 120, 420, 130, 22, '#ffffff');
  fillEllipse(ctx, 480, 440, 150, 24, '#ffffff');
  fillEllipse(ctx, 300, 540, 180, 20, '#dfe9f5');

  // Pines with snow; the middle one's cap melts away in the variant.
  pine(ctx, 80, 380, 130, 74, '#2f5a3d', true);
  pine(ctx, 150, 385, 100, 58, '#356b46', !variant);
  pine(ctx, 500, 390, 140, 80, '#2f5a3d', true);
  pine(ctx, 545, 395, 88, 52, '#356b46', true);
  // A bare branch on the right pine for the owl to sit on.
  line(ctx, 470, 300, 530, 282, '#5b3a29', 5);
  if (!variant) drawOwl(ctx, 500, 290);

  // Cabin: walls, snowy roof, chimney, door, windows.
  fillRect(ctx, 210, 290, 180, 140, '#8a5a2b');
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  for (let y = 310; y < 430; y += 22) {
    ctx.beginPath();
    ctx.moveTo(210, y);
    ctx.lineTo(390, y);
    ctx.stroke();
  }
  poly(ctx, [[195, 292], [300, 210], [405, 292]], '#b8433a');
  // A snow cap on the roof peak and a snowy eave line.
  poly(ctx, [[272, 238], [300, 210], [328, 238]], '#ffffff');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(195, 288, 210, 7);
  ctx.fillStyle = '#b8433a';
  ctx.fillRect(340, 205, 26, 60);
  ctx.fillStyle = '#eef3fa';
  ctx.fillRect(336, 198, 34, 10);
  // Chimney smoke curls up in one picture and is gone in the other.
  if (!variant) drawSmoke(ctx, 353, 190);

  // Windows: the left one glows in one picture and is dark in the other.
  const litLeft = !variant;
  if (litLeft) {
    ctx.fillStyle = 'rgba(255, 210, 62, 0.35)';
    ctx.fillRect(228, 312, 40, 40);
  }
  fillRect(ctx, 232, 316, 32, 32, litLeft ? '#ffd23e' : '#2c3e50');
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 3;
  ctx.strokeRect(232, 316, 32, 32);
  ctx.beginPath();
  ctx.moveTo(248, 316);
  ctx.lineTo(248, 348);
  ctx.moveTo(232, 332);
  ctx.lineTo(264, 332);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 210, 62, 0.35)';
  ctx.fillRect(338, 312, 40, 40);
  fillRect(ctx, 342, 316, 32, 32, '#ffd23e');
  ctx.strokeStyle = '#5b3a29';
  ctx.strokeRect(342, 316, 32, 32);
  ctx.beginPath();
  ctx.moveTo(358, 316);
  ctx.lineTo(358, 348);
  ctx.moveTo(342, 332);
  ctx.lineTo(374, 332);
  ctx.stroke();

  // Door with a wreath in one picture.
  fillRect(ctx, 284, 360, 32, 70, '#5b3a29');
  ctx.fillStyle = '#ffd23e';
  fillCircle(ctx, 311, 396, 3, '#ffd23e');
  if (!variant) {
    ctx.strokeStyle = '#2f7a3d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(300, 382, 11, 0, Math.PI * 2);
    ctx.stroke();
    fillCircle(ctx, 300, 371, 3, '#e8452c');
    fillCircle(ctx, 310, 386, 3, '#e8452c');
    fillCircle(ctx, 291, 390, 3, '#e8452c');
  }

  // Skis leaning on the wall; a pair in one picture, a single ski in the other.
  drawSki(ctx, 198, 420, 0.12);
  if (!variant) drawSki(ctx, 212, 420, 0.2);

  // Woodpile; the top log is missing in the variant picture.
  const logs = variant ? 5 : 6;
  for (let i = 0; i < logs; i++) {
    const lx = 414 + (i % 3) * 26;
    const ly = 448 - Math.floor(i / 3) * 16;
    ctx.fillStyle = '#a9743f';
    ctx.beginPath();
    ctx.ellipse(lx, ly, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    fillCircle(ctx, lx + 11, ly, 7, '#d9b98a');
    fillCircle(ctx, lx + 11, ly, 3, '#8a5a2b');
  }

  // Footprints from the door into the snow; only two remain in the variant.
  ctx.fillStyle = '#b9c8de';
  const prints = variant
    ? [[296, 452], [306, 470]]
    : [[296, 452], [306, 470], [294, 488], [304, 506], [296, 524], [306, 540]];
  for (const [px, py] of prints) {
    ctx.beginPath();
    ctx.ellipse(px, py, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
