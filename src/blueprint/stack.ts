/**
 * Hero figure: four stacked plates in isometric line art, one per step of the
 * ladder (TRL 1–2 at the bottom, TRL 8 on top), with the Trilight mark on the
 * top plate and a level ruler beside the stack. Drawn at build time as plain
 * SVG; colours come from CSS (.stk-*), so it follows the page theme.
 */
import { rng } from './parts';

const W = 680;
const H = 620;
const CX = 300;
const CY = 318;
const SIDE = 268;
const A = SIDE * Math.cos(Math.PI / 6);
const B = SIDE * Math.sin(Math.PI / 6);
const T = 12;
const GAP = 82;

type UV = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** Screen point of a plate coordinate (u, v in 0..1) at height z. */
function pt(u: number, v: number, z: number): [number, number] {
  return [CX + (u - v) * A, CY + (u + v) * B - z];
}
const poly = (pts: UV[], z: number) => pts.map(([u, v]) => pt(u, v, z).map(f).join(',')).join(' ');

const PLATES = [
  { level: 'TRL 1–2', tone: 'd', density: 0.3 },
  { level: 'TRL 4', tone: 'c', density: 0.42 },
  { level: 'TRL 6', tone: 'b', density: 0.5 },
  { level: 'TRL 8', tone: 'a', density: 0.55 },
] as const;

/** Where dots gather on a plate: the two centre lines and four clusters. */
function weight(i: number, j: number, n: number) {
  const m = (n - 1) / 2;
  const line = Math.abs(i - m) < 0.6 || Math.abs(j - m) < 0.6 ? 0.85 : 0;
  const q = [n * 0.22, n * 0.75];
  let cluster = 0;
  for (const a of q) for (const b of q) {
    const d = Math.hypot(i - a, j - b);
    if (d < 2.6) cluster = Math.max(cluster, 1 - d / 3.2);
  }
  return Math.max(line, cluster, 0.07);
}

function dots(level: number, z: number, density: number, top: boolean) {
  const n = 15;
  const r = rng(11 + level * 7);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u = 0.1 + (i * 0.8) / (n - 1);
      const v = 0.1 + (j * 0.8) / (n - 1);
      // Leave room for the mark on the top plate.
      if (top && Math.abs(u - 0.5) < 0.24 && Math.abs(v - 0.5) < 0.17) continue;
      if (r() > weight(i, j, n) * density * 1.6) continue;
      const d = 0.006 + r() * 0.008;
      const twinkle = top && r() < 0.35 ? ` class="tw" style="--tw:${f(r() * 3)}s"` : '';
      out.push(`<polygon${twinkle} points="${poly([[u - d, v], [u, v - d], [u + d, v], [u, v + d]], z)}"/>`);
    }
  }
  return out.join('');
}

/** The Trilight mark laid flat on the top plate. */
function markOnPlate(markInner: string, z: number) {
  const k = 0.44 / 214.53;
  const u0 = 0.5 - (214.53 * k) / 2;
  const v0 = 0.5 - (118.8 * k) / 2;
  const a = A * k, b = B * k, c = -A * k, d = B * k;
  const e = CX + A * (u0 - v0) - A * k * 634.98 + A * k * 451;
  const ff = CY - z + B * (u0 + v0) - B * k * 634.98 - B * k * 451;
  return `<g class="stk-mark" transform="matrix(${[a, b, c, d, e, ff].map((n) => n.toFixed(4)).join(' ')})">${markInner}</g>`;
}

export function stackFigure(markSvg: string, label: string) {
  const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const topZ = GAP * (PLATES.length - 1);
  const r = rng(5);

  const plates = PLATES.map((p, i) => {
    const z = i * GAP;
    const top = i === PLATES.length - 1;
    const face: UV[] = top
      ? [[0, -0.06], [0.3, -0.06], [0.36, 0], [1, 0], [1, 1], [0, 1]]
      : [[0, 0], [1, 0], [1, 1], [0, 1]];
    const left: UV[] = [[0, 1], [1, 1]];
    const right: UV[] = [[1, 0], [1, 1]];
    const side = (edge: UV[]) => {
      const [a, b] = edge.map(([u, v]) => pt(u, v, z));
      const [c, d] = edge.map(([u, v]) => pt(u, v, z - T)).reverse();
      return [a, b, c, d].map((q) => q.map(f).join(',')).join(' ');
    };
    // Faint stems down to the plate below.
    const stems = i === 0 ? '' : Array.from({ length: 5 }, () => {
      const u = 0.15 + r() * 0.7, v = 0.15 + r() * 0.7;
      const [x1, y1] = pt(u, v, z - T);
      const [, y2] = pt(u, v, z - GAP);
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x1)}" y2="${f(y2)}"/>`;
    }).join('');
    return `
    <g class="stk-pl stk-pl--${p.tone}" style="--i:${i};--dz:${topZ - z}">
      <g class="stk-stems">${stems}</g>
      <polygon class="stk-side" points="${side(left)}"/>
      <polygon class="stk-side stk-side--r" points="${side(right)}"/>
      <polygon class="stk-top" points="${poly(face, z)}"/>
      <polygon class="stk-inset" points="${poly([[0.06, 0.06], [0.94, 0.06], [0.94, 0.94], [0.06, 0.94]], z)}"/>
      <g class="stk-dots">${dots(i, z, p.density, top)}</g>
      ${top ? markOnPlate(markInner, z) : ''}
    </g>`;
  }).join('');

  // Silhouette of the box the stack sits in.
  const o = 0.07;
  const zt = topZ + 46, zb = -T - 26;
  const hex = [pt(-o, -o, zt), pt(1 + o, -o, zt), pt(1 + o, -o, zb), pt(1 + o, 1 + o, zb), pt(-o, 1 + o, zb), pt(-o, 1 + o, zt)]
    .map((q) => q.map(f).join(',')).join(' ');
  const front = [pt(1 + o, 1 + o, zt - 0), pt(1 + o, 1 + o, zb)];

  // Ruler: one tick every 10px, a label at each plate's right corner.
  const rx = CX + A * (1 + o) + 46;
  const levelY = PLATES.map((_, i) => pt(1, 0, i * GAP)[1]);
  const y0 = levelY[levelY.length - 1] - 14, y1 = levelY[0] + 22;
  const ticks: string[] = [];
  for (let y = y0; y <= y1; y += 10) ticks.push(`<line x1="${f(rx)}" y1="${f(y)}" x2="${f(rx + 8)}" y2="${f(y)}"/>`);
  const labels = PLATES.map((p, i) => {
    const y = levelY[i];
    const top = i === PLATES.length - 1;
    return top
      ? `<g class="stk-now"><rect x="${f(rx + 14)}" y="${f(y - 8)}" width="44" height="16"/><text x="${f(rx + 36)}" y="${f(y + 3.6)}" text-anchor="middle">${p.level}</text></g>`
      : `<text class="stk-lbl" x="${f(rx + 16)}" y="${f(y + 3.6)}">${p.level}</text>`;
  }).join('');
  const [hx] = pt(1 + o, -o, 0);
  const linkY = levelY[2];

  return `<svg class="stk" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label.replace(/"/g, '&quot;')}">
  <polygon class="stk-frame" points="${hex}"/>
  <line class="stk-frame" x1="${f(front[0][0])}" y1="${f(front[0][1])}" x2="${f(front[1][0])}" y2="${f(front[1][1])}"/>
  ${plates}
  <g class="stk-ruler">
    <line class="stk-link" x1="${f(hx)}" y1="${f(linkY)}" x2="${f(rx)}" y2="${f(linkY)}"/>
    <rect class="stk-bar" x="${f(rx - 3)}" y="${f(y0)}" width="5" height="${f(levelY[levelY.length - 1] - y0 + 6)}"/>
    <line x1="${f(rx)}" y1="${f(y0)}" x2="${f(rx)}" y2="${f(y1)}"/>
    ${ticks.join('')}
    ${labels}
  </g>
</svg>`;
}
