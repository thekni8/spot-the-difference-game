// Found-ring markers, the hint pulse and the wrong-click X flash.
// Each draw call takes a progress value (0..1) so the caller owns timing;
// nothing here reads the clock, which keeps the staged screenshots exact.

const RING = '#ffcf3f';
const RING_EDGE = '#e85d3d';

// A found difference: a warm double ring with a small pop at the start.
export function drawFoundRing(ctx, x, y, r, progress) {
  const pop = progress < 0.25 ? 1 + (0.25 - progress) * 1.6 : 1;
  const rad = r * pop;
  ctx.save();
  ctx.lineWidth = 5;
  ctx.strokeStyle = RING_EDGE;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = RING;
  ctx.beginPath();
  ctx.arc(x, y, rad - 5, 0, Math.PI * 2);
  ctx.stroke();
  // A tiny tick inside the ring so a found spot reads at a glance.
  ctx.strokeStyle = RING_EDGE;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9, y + 1);
  ctx.lineTo(x - 2, y + 8);
  ctx.lineTo(x + 10, y - 7);
  ctx.stroke();
  ctx.restore();
}

// A soft pulsing ring around one unfound difference while a hint is live.
// `phase` cycles 0..1 and drives the breathing radius and alpha.
export function drawHintRing(ctx, x, y, r, phase) {
  const breathe = 1 + Math.sin(phase * Math.PI * 2) * 0.12;
  const alpha = 0.55 + Math.sin(phase * Math.PI * 2) * 0.25;
  ctx.save();
  ctx.globalAlpha = Math.max(0.25, Math.min(0.9, alpha));
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#7ee0ff';
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, r * breathe + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, r * breathe + 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// A red X that flashes where a wrong click landed and fades out.
export function drawWrongX(ctx, x, y, progress) {
  const alpha = 1 - progress;
  if (alpha <= 0) return;
  const size = 16 + progress * 10;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e83a2e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.stroke();
  ctx.restore();
}
