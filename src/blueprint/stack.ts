/**
 * Hero figure: four stacked plates in isometric line art, one per step of the
 * ladder (TRL 1–2 at the bottom, TRL 8 on top), and a level ruler beside them.
 * A hand with tweezers brings the Trilight chip in and seats it on the top
 * plate; the plate lights up, the ruler climbs to TRL 8 and signals run down
 * through the stack. The hand comes back now and then to tap the chip.
 *
 * Drawn at build time as plain SVG. Colours and motion live in CSS (.stk-*);
 * without motion the figure shows its final state: chip seated, all lit.
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

/** The chip: a square package centred on the top plate. */
const CHIP = { u0: 0.37, u1: 0.63, h: 13 };
/** The hand drawing (public/img/hero/hand-light.webp) and where its tweezer tip is. */
export const HAND = { src: '/img/hero/hand-light.webp', size: 250, tipX: 303 / 1254, tipY: 1108 / 1254 };

type UV = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** Screen point of a plate coordinate (u, v in 0..1) at height z. */
function pt(u: number, v: number, z: number): [number, number] {
  return [CX + (u - v) * A, CY + (u + v) * B - z];
}
const pts = (list: [number, number][]) => list.map((q) => q.map(f).join(',')).join(' ');
const poly = (uv: UV[], z: number) => pts(uv.map(([u, v]) => pt(u, v, z)));

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
      // Leave room for the chip on the top plate.
      if (top && Math.abs(u - 0.5) < 0.2 && Math.abs(v - 0.5) < 0.2) continue;
      if (r() > weight(i, j, n) * density * 1.6) continue;
      const d = 0.006 + r() * 0.008;
      // On the top plate each dot lights in a wave out from the chip.
      const attrs = top
        ? ` class="${r() < 0.35 ? 'lt tw' : 'lt'}" style="--dl:${f(Math.hypot(u - 0.5, v - 0.5) * 1.6)}s;--tw:${f(r() * 3)}s"`
        : '';
      out.push(`<polygon${attrs} points="${poly([[u - d, v], [u, v - d], [u + d, v], [u, v + d]], z)}"/>`);
    }
  }
  return out.join('');
}

/** An affine map that lays the mark (its own SVG coordinates) flat at uv centre, height z. */
function markOn(markInner: string, z: number, widthUv: number) {
  const k = widthUv / 214.53;
  const u0 = 0.5 - (214.53 * k) / 2;
  const v0 = 0.5 - (118.8 * k) / 2;
  const a = A * k, b = B * k, c = -A * k, d = B * k;
  const e = CX + A * (u0 - v0) - A * k * 634.98 + A * k * 451;
  const ff = CY - z + B * (u0 + v0) - B * k * 634.98 - B * k * 451;
  return `<g class="stk-mark" transform="matrix(${[a, b, c, d, e, ff].map((n) => n.toFixed(4)).join(' ')})">${markInner}</g>`;
}

/** The chip: a square package with pins on its two visible sides and the mark on top. */
function chip(markInner: string, z: number) {
  const { u0, u1, h } = CHIP;
  const top = z + h;
  const side = (a: UV, b: UV) => pts([pt(...a, top), pt(...b, top), pt(...b, z), pt(...a, z)]);
  const pins: string[] = [];
  for (let i = 1; i < 8; i++) {
    const s = u0 + ((u1 - u0) * i) / 8;
    // Front-left face (v = u1) and front-right face (u = u1).
    for (const [a, b] of [[pt(s, u1, z + 4), pt(s, u1 + 0.022, z - 2)], [pt(u1, s, z + 4), pt(u1 + 0.022, s, z - 2)]]) {
      pins.push(`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`);
    }
  }
  const [lx, ly] = pt(u0 + 0.035, u1 - 0.035, top);
  return `
    <g class="stk-chip">
      <g class="stk-pins">${pins.join('')}</g>
      <polygon class="stk-side" points="${side([u0, u1], [u1, u1])}"/>
      <polygon class="stk-side stk-side--r" points="${side([u1, u0], [u1, u1])}"/>
      <polygon class="stk-chiptop" points="${poly([[u0, u0], [u1, u0], [u1, u1], [u0, u1]], top)}"/>
      ${markOn(markInner, top, 0.2)}
      <circle class="stk-led" cx="${f(lx)}" cy="${f(ly)}" r="2.4"/>
    </g>`;
}

/** An isometric circle on a plate, for the pulse when the chip seats. */
function ring(z: number, r: number, cls: string) {
  const list: [number, number][] = [];
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    list.push(pt(0.5 + r * Math.cos(t), 0.5 + r * Math.sin(t), z));
  }
  return `<polygon class="${cls}" points="${pts(list)}"/>`;
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
    const side = (edge: UV[]) => {
      const [a, b] = edge.map(([u, v]) => pt(u, v, z));
      const [c, d] = edge.map(([u, v]) => pt(u, v, z - T)).reverse();
      return pts([a, b, c, d]);
    };
    // Stems down to the plate below; signals run along them once the chip is in.
    const stems = i === 0 ? [] : Array.from({ length: 5 }, (_, k) => {
      const u = 0.15 + r() * 0.7, v = 0.15 + r() * 0.7;
      const [x1, y1] = pt(u, v, z - T);
      const [, y2] = pt(u, v, z - GAP);
      return { d: `M${f(x1)} ${f(y1)}V${f(y2)}`, k };
    });
    return `
    <g class="stk-pl stk-pl--${p.tone}" style="--i:${i};--dz:${topZ - z}">
      <g class="stk-stems">${stems.map((s) => `<path d="${s.d}"/>`).join('')}</g>
      <g class="stk-sig">${stems.map((s) => `<path d="${s.d}" pathLength="100" style="--k:${f(s.k * 0.45 + i * 0.3)}s"/>`).join('')}</g>
      <polygon class="stk-side" points="${side([[0, 1], [1, 1]])}"/>
      <polygon class="stk-side stk-side--r" points="${side([[1, 0], [1, 1]])}"/>
      <polygon class="stk-top" points="${poly(face, z)}"/>
      <polygon class="stk-inset" points="${poly([[0.06, 0.06], [0.94, 0.06], [0.94, 0.94], [0.06, 0.94]], z)}"/>
      <g class="stk-dots">${dots(i, z, p.density, top)}</g>
      ${top ? `${ring(z, 0.2, 'stk-ring')}${ring(z, 0.2, 'stk-ring stk-ring--2')}` : ''}
    </g>`;
  }).join('');

  // The chip and the hand that brings it in. The tweezer tip holds the chip's right corner.
  const [tx, ty] = pt(CHIP.u1, CHIP.u0, topZ + CHIP.h);
  const hx = tx - HAND.size * HAND.tipX;
  const hy = ty - HAND.size * HAND.tipY;
  const drop = `
  <g class="stk-drop">
    ${chip(markInner, topZ)}
    <g class="stk-hand"><image href="${HAND.src}" x="${f(hx)}" y="${f(hy)}" width="${HAND.size}" height="${HAND.size}"/></g>
  </g>`;

  // Silhouette of the box the stack sits in.
  const o = 0.07;
  const zt = topZ + 46, zb = -T - 26;
  const hex = pts([pt(-o, -o, zt), pt(1 + o, -o, zt), pt(1 + o, -o, zb), pt(1 + o, 1 + o, zb), pt(-o, 1 + o, zb), pt(-o, 1 + o, zt)]);
  const front = [pt(1 + o, 1 + o, zt), pt(1 + o, 1 + o, zb)];

  // Ruler: one tick every 10px, a label at each plate's right corner; the bar climbs to TRL 8.
  const rx = CX + A * (1 + o) + 46;
  const levelY = PLATES.map((_, i) => pt(1, 0, i * GAP)[1]);
  const y0 = levelY[levelY.length - 1] - 14, y1 = levelY[0] + 22;
  const ticks: string[] = [];
  for (let y = y0; y <= y1; y += 10) ticks.push(`<line x1="${f(rx)}" y1="${f(y)}" x2="${f(rx + 8)}" y2="${f(y)}"/>`);
  const labels = PLATES.map((p, i) => {
    const y = levelY[i];
    return i === PLATES.length - 1
      ? `<g class="stk-now"><rect x="${f(rx + 14)}" y="${f(y - 8)}" width="44" height="16"/><text x="${f(rx + 36)}" y="${f(y + 3.6)}" text-anchor="middle">${p.level}</text></g>`
      : `<text class="stk-lbl" x="${f(rx + 16)}" y="${f(y + 3.6)}">${p.level}</text>`;
  }).join('');
  const [hxEdge] = pt(1 + o, -o, 0);
  const linkY = levelY[2];
  const barTop = levelY[levelY.length - 1] - 6;

  return `<svg class="stk" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label.replace(/"/g, '&quot;')}">
  <polygon class="stk-frame" points="${hex}"/>
  <line class="stk-frame" x1="${f(front[0][0])}" y1="${f(front[0][1])}" x2="${f(front[1][0])}" y2="${f(front[1][1])}"/>
  ${plates}
  ${drop}
  <g class="stk-ruler">
    <line class="stk-link" x1="${f(hxEdge)}" y1="${f(linkY)}" x2="${f(rx)}" y2="${f(linkY)}"/>
    <rect class="stk-bar" x="${f(rx - 3)}" y="${f(barTop)}" width="5" height="${f(y1 - barTop)}"/>
    <line x1="${f(rx)}" y1="${f(y0)}" x2="${f(rx)}" y2="${f(y1)}"/>
    ${ticks.join('')}
    ${labels}
  </g>
</svg>`;
}
