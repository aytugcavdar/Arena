// Math utility functions
export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

export function normalize(x, y) {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function weightedRandom(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w.enabled && w.weight > 0);
  const total = entries.reduce((sum, [, w]) => sum + w.weight, 0);
  let r = Math.random() * total;
  for (const [type, data] of entries) {
    r -= data.weight;
    if (r <= 0) return type;
  }
  return entries[entries.length - 1]?.[0];
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function lerpColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t)), g = Math.round(lerp(g1, g2, t)), b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
