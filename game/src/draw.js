// Shared canvas helpers for the Twin Isles scenes.
// Every helper draws in the caller's local coordinate space and only
// touches fillStyle / strokeStyle / lineWidth, so scenes stay consistent.

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function fillCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, r);
  ctx.fill();
}

export function fillEllipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ellipse(ctx, x, y, rx, ry);
  ctx.fill();
}

export function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A five-pointed star centred on (x, y).
export function star(ctx, x, y, r, color, inner = 0.45) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// A puffy cartoon cloud made of overlapping circles, flat base.
export function puffCloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 20 * s);
  ctx.fill();
  circle(ctx, x + 22 * s, y + 4 * s, 16 * s);
  ctx.fill();
  circle(ctx, x - 22 * s, y + 5 * s, 15 * s);
  ctx.fill();
  circle(ctx, x + 6 * s, y - 12 * s, 15 * s);
  ctx.fill();
  ctx.fillRect(x - 38 * s, y + 2 * s, 76 * s, 14 * s);
}

// A pine tree: stacked triangles, a trunk, optional snow caps.
export function pine(ctx, x, y, h, w, green, snow) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x - 4, y, 8, 14);
  const tiers = 3;
  for (let t = 0; t < tiers; t++) {
    const top = y - h + (h / tiers) * t;
    const half = (w / 2) * (1 - t * 0.28);
    const base = y - (h / tiers) * (tiers - 1 - t) + 6;
    poly(ctx, [[x, top], [x - half, base], [x + half, base]], green);
    if (snow) {
      poly(ctx, [[x, top], [x - half * 0.45, top + (base - top) * 0.45], [x + half * 0.45, top + (base - top) * 0.45]], '#ffffff');
    }
  }
}

// A distant gull: two shallow arcs.
export function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 11 * s, y);
  ctx.stroke();
}

// A campfire flame: layered teardrops.
export function flame(ctx, x, y, s) {
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.moveTo(x, y - 34 * s);
  ctx.quadraticCurveTo(x + 18 * s, y - 6 * s, x + 10 * s, y + 6 * s);
  ctx.quadraticCurveTo(x, y + 12 * s, x - 10 * s, y + 6 * s);
  ctx.quadraticCurveTo(x - 18 * s, y - 6 * s, x, y - 34 * s);
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.moveTo(x, y - 20 * s);
  ctx.quadraticCurveTo(x + 10 * s, y - 2 * s, x + 5 * s, y + 6 * s);
  ctx.quadraticCurveTo(x, y + 9 * s, x - 5 * s, y + 6 * s);
  ctx.quadraticCurveTo(x - 10 * s, y - 2 * s, x, y - 20 * s);
  ctx.fill();
}

// A little sailboat: hull, mast and a triangular sail.
export function sailboat(ctx, x, y, hull, sail, sailH) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x - 2, y - 52, 4, 52);
  poly(ctx, [[x, y - 52], [x, y - 6], [x + 30, y - 6]], sail);
  poly(ctx, [[x, y - 52], [x, y - 6], [x - 18, y - 6]], '#fff3d6');
  poly(ctx, [[x - 34, y - 6], [x + 38, y - 6], [x + 28, y + 12], [x - 24, y + 12]], hull);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 30, y - 2, 62, 3);
}

// A round paper lantern, lit or dark.
export function paperLantern(ctx, x, y, r, lit) {
  if (lit) {
    ctx.fillStyle = 'rgba(255, 190, 60, 0.35)';
    circle(ctx, x, y, r + 16);
    ctx.fill();
  }
  ctx.fillStyle = lit ? '#ff5a3c' : '#b8433a';
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.strokeStyle = lit ? '#d63d28' : '#8c2f26';
  ctx.lineWidth = 2;
  for (const off of [-r * 0.5, 0, r * 0.5]) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.32, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    void off;
  }
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(x - 6, y - r - 5, 12, 5);
  ctx.fillRect(x - 6, y + r, 12, 5);
}

// A wooden crate with a cross brace.
export function crate(ctx, x, y, s) {
  ctx.fillStyle = '#c98f4e';
  ctx.fillRect(x, y, 44 * s, 40 * s);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, 44 * s, 40 * s);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 44 * s, y + 40 * s);
  ctx.moveTo(x + 44 * s, y);
  ctx.lineTo(x, y + 40 * s);
  ctx.stroke();
}
