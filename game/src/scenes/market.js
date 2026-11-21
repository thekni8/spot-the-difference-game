// Level 3 — Night Market. An evening market: striped awnings, paper
// lanterns, fruit crates, signs, string lights and a cat on a roof.
// A busier scene with smaller changes.
import { paperLantern, circle, fillCircle, fillEllipse, fillRect, poly, line, rr, star } from '../draw.js';

export const meta = {
  id: 'market',
  name: 'Night Market',
  timeLimit: 150,
  radius: 30,
};

export const differences = [
  { id: 'awning', x: 300, y: 265, r: 30, label: 'an awning changed colour' },
  { id: 'lantern', x: 400, y: 165, r: 30, label: 'a lantern went missing' },
  { id: 'apples', x: 120, y: 360, r: 30, label: 'an apple disappeared' },
  { id: 'cat', x: 470, y: 235, r: 30, label: 'the cat left the roof' },
  { id: 'sign', x: 120, y: 225, r: 30, label: 'a shop sign changed' },
  { id: 'bulb', x: 300, y: 120, r: 30, label: 'a string-light bulb went out' },
  { id: 'basket', x: 520, y: 470, r: 30, label: 'an extra basket appeared' },
  { id: 'moon', x: 520, y: 70, r: 30, label: 'the moon changed phase' },
];

function drawStall(ctx, x, w, stripeA, stripeB, counterY) {
  // Posts and counter.
  ctx.fillStyle = '#5b3a29';
  ctx.fillRect(x, 285, 10, counterY - 285 + 50);
  ctx.fillRect(x + w - 10, 285, 10, counterY - 285 + 50);
  // Striped awning.
  const stripes = 6;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? stripeA : stripeB;
    ctx.fillRect(x + (w / stripes) * i, 252, w / stripes + 1, 34);
  }
  ctx.fillStyle = stripeA;
  ctx.beginPath();
  ctx.moveTo(x - 6, 286);
  ctx.lineTo(x + w + 6, 286);
  ctx.lineTo(x + w - 14, 300);
  ctx.lineTo(x + 14, 300);
  ctx.closePath();
  ctx.fill();
  // Counter with goods shelf.
  fillRect(ctx, x - 4, counterY, w + 8, 54, '#8a5a2b');
  fillRect(ctx, x - 4, counterY, w + 8, 10, '#a9743f');
}

function drawApples(ctx, x, y, count) {
  const spots = [[0, 0], [18, 2], [36, 0], [9, -12], [27, -12]];
  for (let i = 0; i < count; i++) {
    const [dx, dy] = spots[i];
    fillCircle(ctx, x + dx, y + dy, 9, '#e8452c');
    ctx.fillStyle = '#5d9a38';
    ctx.fillRect(x + dx - 1, y + dy - 13, 3, 6);
  }
}

function drawOranges(ctx, x, y) {
  for (const [dx, dy] of [[0, 0], [18, 2], [36, 0], [9, -12], [27, -12]]) {
    fillCircle(ctx, x + dx, y + dy, 9, '#ff8c42');
    fillCircle(ctx, x + dx - 3, y + dy - 3, 2, '#ffd23e');
  }
}

function drawBread(ctx, x, y) {
  for (const [dx, dy] of [[0, 0], [22, 1], [44, 0]]) {
    ctx.fillStyle = '#d9a05b';
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dy, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a9743f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + dx - 6, y + dy - 4);
    ctx.lineTo(x + dx + 6, y + dy - 4);
    ctx.stroke();
  }
}

function drawCat(ctx, x, y) {
  // A cat curled on a roof: body, head, ears, tail.
  ctx.fillStyle = '#3a3a4a';
  ctx.beginPath();
  ctx.ellipse(x, y, 20, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, x + 16, y - 8, 9, '#3a3a4a');
  poly(ctx, [[x + 10, y - 14], [x + 12, y - 22], [x + 16, y - 15]], '#3a3a4a');
  poly(ctx, [[x + 18, y - 15], [x + 22, y - 22], [x + 24, y - 14]], '#3a3a4a');
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 2);
  ctx.quadraticCurveTo(x - 30, y - 6, x - 22, y - 14);
  ctx.stroke();
  fillCircle(ctx, x + 19, y - 9, 1.6, '#ffd23e');
}

function drawBasket(ctx, x, y, s) {
  ctx.fillStyle = '#c98f4e';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y);
  ctx.lineTo(x + 20 * s, y);
  ctx.lineTo(x + 15 * s, y + 22 * s);
  ctx.lineTo(x - 15 * s, y + 22 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y + 8 * s);
  ctx.lineTo(x + 20 * s, y + 8 * s);
  ctx.moveTo(x - 18 * s, y + 15 * s);
  ctx.lineTo(x + 18 * s, y + 15 * s);
  ctx.stroke();
  fillCircle(ctx, x - 8 * s, y - 4 * s, 6 * s, '#ff8c42');
  fillCircle(ctx, x + 8 * s, y - 4 * s, 6 * s, '#e8452c');
}

export function drawScene(ctx, rect, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 600, rect.h / 560);

  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#3b2d5c');
  sky.addColorStop(0.7, '#7a4a72');
  sky.addColorStop(1, '#e07856');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);
  // Early stars.
  ctx.fillStyle = '#ffffff';
  for (const [sx, sy] of [[40, 40], [120, 26], [210, 48], [300, 30], [380, 44], [450, 26], [560, 44], [70, 90], [250, 84]]) {
    fillCircle(ctx, sx, sy, 2, '#ffffff');
  }
  // Moon: crescent in one picture, full in the other.
  fillCircle(ctx, 520, 70, 26, '#ffe9a8');
  if (!variant) {
    fillCircle(ctx, 530, 64, 22, '#3b2d5c');
  } else {
    fillCircle(ctx, 512, 62, 4, '#e8c96a');
    fillCircle(ctx, 528, 78, 3, '#e8c96a');
  }

  // String lights sagging across the top; one bulb is out in the variant.
  ctx.strokeStyle = '#2c2438';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(300, 150, 600, 92);
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const bx = t * 600;
    const by = 96 + Math.sin(t * Math.PI) * 34;
    const lit = !(variant && i === 6);
    fillCircle(ctx, bx, by + 8, 7, lit ? '#ffd23e' : '#4a4458');
    if (lit) {
      ctx.fillStyle = 'rgba(255, 210, 62, 0.3)';
      circle(ctx, bx, by + 8, 13);
      ctx.fill();
    }
  }

  // Cobble ground.
  fillRect(ctx, 0, 300, 600, 260, '#5c4a68');
  ctx.fillStyle = '#6b5878';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.beginPath();
      ctx.ellipse(40 + col * 74 + (row % 2) * 30, 330 + row * 56, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stall A: fruit, with a hanging sign whose symbol changes.
  drawStall(ctx, 60, 140, '#e8452c', '#fdf6e3', 380);
  line(ctx, 120, 300, 120, 208, '#5b3a29', 3);
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath();
  ctx.arc(120, 225, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (variant) {
    fillCircle(ctx, 120, 225, 7, '#e8452c');
  } else {
    star(ctx, 120, 225, 9, '#e8452c');
  }
  drawApples(ctx, 100, 368, variant ? 4 : 5);
  drawBasket(ctx, 150, 452, 0.9);

  // Stall B: oranges; its awning stripes change colour in the variant.
  drawStall(ctx, 230, 140, variant ? '#ffd23e' : '#3d8a4f', '#fdf6e3', 380);
  drawOranges(ctx, 282, 368);

  // Stall C: bread, with a cat on the roof in one picture.
  drawStall(ctx, 400, 150, '#3a6fd8', '#fdf6e3', 380);
  drawBread(ctx, 440, 368);
  if (!variant) drawCat(ctx, 470, 235);

  // Paper lanterns between the stalls; the right one is gone in the variant.
  line(ctx, 200, 140, 200, 148, '#2c2438', 2);
  paperLantern(ctx, 200, 175, 16, true);
  if (!variant) {
    line(ctx, 400, 140, 400, 148, '#2c2438', 2);
    paperLantern(ctx, 400, 165, 16, true);
  }

  // Crates and baskets on the ground; one extra basket in the variant.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(330, 452, 44, 40);
  ctx.strokeStyle = '#5b3a29';
  ctx.lineWidth = 2;
  ctx.strokeRect(330, 452, 44, 40);
  ctx.beginPath();
  ctx.moveTo(330, 452);
  ctx.lineTo(374, 492);
  ctx.moveTo(374, 452);
  ctx.lineTo(330, 492);
  ctx.stroke();
  drawBasket(ctx, 250, 470, 1);
  if (variant) drawBasket(ctx, 520, 470, 1);

  ctx.restore();
}
