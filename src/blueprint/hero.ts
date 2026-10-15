/**
 * Hero · the circuit city. A dense board seen from above, components standing
 * like buildings round an empty socket, copper streets fanning out from it.
 * On scroll a hand with tweezers brings the Trilight chip in, seats it, the
 * board powers up along its traces, and the camera dives into the chip.
 *
 * Exported for the page: the SVG (board, chip group, power layer, hand group)
 * and the screen numbers the scroll scene needs (chip lift, chip centre).
 */
import { k, ctx, rng, ic, smd, hole, header, type Ctx, type Plan, type Point3 } from './parts';

export const HERO_W = 1000;
export const HERO_H = 780;

const BOARD: Plan = { x: -330, y: -330, w: 660, d: 660, r: 12 };
const BH = 7;
const Z = BH;
const CHIP = 74;
const LIFT = 260;

type Item = { at: Point3; svg: string };

/** Copper: fans of traces leaving each side of the socket for the board edge. */
function traces() {
  const rand = rng(21);
  const paths: [number, number][][] = [];
  const vias: [number, number][] = [];
  for (let side = 0; side < 4; side++) {
    const rot = side * (Math.PI / 2);
    const R = ([x, y]: [number, number]): [number, number] => [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
    for (let i = 0; i < 11; i++) {
      const o = -30 + i * 6;
      const run = 18 + Math.abs(o) * 0.5;
      const spread = o * 1.9;
      const far = 230 + rand() * 120;
      const pts: [number, number][] = [[o, -44], [o, -44 - run], [spread, -44 - run - Math.abs(spread - o)], [spread, -far]];
      paths.push(pts.map(R));
      if (far < 300) vias.push(R([spread, -far]));
    }
  }
  return { paths, vias };
}

function board(c: Ctx) {
  const out: string[] = [];
  out.push(c.box(BOARD, 0, BH, { tone: 'mid', crease: 'lo' }, 6, 1.4));
  out.push(c.L(k.planOutline(k.insetPlan(BOARD, 8), Z, c.P, 6), { tone: 'faint' }));
  const { paths, vias } = traces();
  const copper = paths.map((p) => k.onTop(p, Z, c.P));
  out.push(c.L(copper.join(''), { tone: 'mid' }));
  out.push(c.L(vias.map(([x, y]) => k.ring(x, y, 3.2, Z, c.P, 18)).join(''), { tone: 'mid' }));
  out.push(c.D(vias.map(([x, y]) => c.at([x, y, Z])), { size: 0.9, tone: 'hi' }));
  // Mounting holes and a few loose vias in the pour.
  for (const [x, y] of k.corners(BOARD, 40)) out.push(hole(c, x, y, Z, 7));
  const r = rng(4);
  const pour: [number, number][] = [];
  for (let i = 0; i < 90; i++) {
    const x = -300 + r() * 600;
    const y = -300 + r() * 600;
    if (Math.abs(x) < 90 && Math.abs(y) < 90) continue;
    pour.push([x, y]);
  }
  out.push(c.D(pour.map(([x, y]) => c.at([x, y, Z])), { size: 0.7, tone: 'lo' }));
  // The socket: land pads the chip's leads come down on, and its silkscreen.
  const pads: string[] = [];
  for (let i = 0; i < 14; i++) {
    const o = -31 + i * (62 / 13);
    for (const [x, y, w, d] of [[o, -44, 1.6, 6], [o, 44, 1.6, 6], [-44, o, 6, 1.6], [44, o, 6, 1.6]] as const)
      pads.push(k.planOutline({ x: x - w / 2, y: y - d / 2, w, d, r: 0 }, Z, c.P, 1));
  }
  out.push(`<g class="bp-pads">${c.L(pads.join(''), { tone: 'hi' })}</g>`);
  out.push(c.L(k.planOutline({ x: -54, y: -54, w: 108, d: 108, r: 2 }, Z, c.P, 2), { tone: 'lo', dashed: true }));
  out.push(c.L(k.onTop([[-54, -40], [-54, -54], [-40, -54]], Z, c.P), { tone: 'hi' }));
  out.push(c.L(k.planOutline({ x: -24, y: -24, w: 48, d: 48, r: 1 }, Z, c.P, 1), { tone: 'lo' }));
  out.push(c.engrave('U1 · TRILIGHT', -54, 64, Z, 7, 'mid'));
  // The power layer: the same copper, lit, drawn in as the board powers up.
  const power = copper.map((d) => `<path class="bp-power" pathLength="1" d="${d}"/>`).join('');
  return { svg: out.join(''), power };
}

/** The district: tall caps, inductors, a heatsink, long ICs, connectors. */
function parts(c: Ctx): Item[] {
  const items: Item[] = [];
  const cap = (x: number, y: number, r: number, h: number) => items.push({
    at: [x, y, Z],
    svg: c.post(x, y, r, Z, h, { tone: 'mid', crease: 'lo' }, 20)
      + c.L(k.sideArc(x, y, r, Z + h - 5, c.P, 12), { tone: 'faint' })
      + c.L(k.lineOnTop([x - r * 0.6, y], [x + r * 0.6, y], Z + h, c.P) + k.lineOnTop([x, y - r * 0.6], [x, y + r * 0.6], Z + h, c.P), { tone: 'lo' }),
  });
  const coil = (x: number, y: number, s: number, h: number) => items.push({
    at: [x, y, Z],
    svg: c.box({ x: x - s / 2, y: y - s / 2, w: s, d: s, r: 3 }, Z, h, { tone: 'hi', crease: 'lo' }, 3, 0.8)
      + c.L(k.ring(x, y, s * 0.3, Z + h, c.P, 16), { tone: 'mid' }),
  });
  // Four districts between the copper streets: a skyline of parts, tallest
  // near the socket and lower toward the edge of the board.
  const rr = rng(13);
  // Small packages: body, pin-1 dot and a lead seam (leads would be too fine to see).
  const smallIc = (x: number, y: number, s: number) => items.push({
    at: [x, y, Z],
    svg: c.box({ x: x - s / 2 - 2, y: y - s / 2 - 2, w: s + 4, d: s + 4, r: 0.4 }, Z, 1, { tone: 'lo', crease: 'none' }, 2)
      + c.box({ x: x - s / 2, y: y - s / 2, w: s, d: s, r: 0.8 }, Z + 1, 4, { tone: 'hi', crease: 'lo' }, 2, 0.5)
      + c.D([c.at([x - s / 2 + 3, y - s / 2 + 3, Z + 5])], { size: 0.9, tone: 'mid' }),
  });
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const x = sx * (80 + i * 34);
      const y = sy * (80 + j * 34);
      if (sx < 0 && sy < 0 && i < 3 && j < 3) continue; // the heatsink block
      // The district in front of the socket stays low so the chip stays in view.
      const near = (1 - (i + j) / 8) * (sx > 0 && sy > 0 ? 0.25 : 1);
      const pick = rr();
      if (pick < 0.12) continue;
      if (pick < 0.5) cap(x, y, 7 + rr() * 5, 16 + near * 40 + rr() * 10);
      else if (pick < 0.75) coil(x, y, 18 + rr() * 6, 10 + near * 10);
      else smallIc(x, y, 16 + rr() * 6);
    }
  }
  // A finned heatsink: the tallest block in town.
  const hs: Plan = { x: -164, y: -164, w: 92, d: 92, r: 3 };
  items.push({
    at: [-118, -118, Z],
    svg: c.box(hs, Z, 8, { tone: 'mid', crease: 'lo' }, 2, 0.6)
      + c.box(k.insetPlan(hs, 2), Z + 8, 60, { tone: 'hi', crease: 'lo' }, 2, 0.6)
      + c.L(Array.from({ length: 13 }, (_, i) => k.lineOnTop([hs.x + 2 + (i + 1) * 6.3, hs.y + 2], [hs.x + 2 + (i + 1) * 6.3, hs.y + hs.d - 2], Z + 68, c.P)).join(''), { tone: 'lo' })
      + c.L(Array.from({ length: 13 }, (_, i) => k.segment([hs.x + 2 + (i + 1) * 6.3, hs.y + hs.d - 2, Z + 68], [hs.x + 2 + (i + 1) * 6.3, hs.y + hs.d - 2, Z + 12], c.P)).join(''), { tone: 'faint' }),
  });
  // Long ICs on each axis, where the copper fans arrive.
  items.push({ at: [0, -190, Z], svg: ic(c, { cx: 0, cy: -190, z: Z, w: 96, d: 28, h: 7, pins: 9, sides: 2, leadsOn: 'y', mark: 'MEM', markSize: 8 }) });
  items.push({ at: [0, 190, Z], svg: ic(c, { cx: 0, cy: 190, z: Z, w: 96, d: 28, h: 7, pins: 9, sides: 2, leadsOn: 'y', mark: 'PWR', markSize: 8 }) });
  items.push({ at: [-190, 0, Z], svg: ic(c, { cx: -190, cy: 0, z: Z, w: 28, d: 96, h: 7, pins: 9, sides: 2, leadsOn: 'x', mark: 'RF', markSize: 8, markAlong: 'y' }) });
  items.push({ at: [190, 0, Z], svg: ic(c, { cx: 190, cy: 0, z: Z, w: 28, d: 96, h: 7, pins: 9, sides: 2, leadsOn: 'x', mark: 'I/O', markSize: 8, markAlong: 'y' }) });
  // Passives along the streets, LEDs that light on power-up, a header and a USB port.
  const r = rng(9);
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2;
    const d = 120 + r() * 160;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (Math.min(Math.abs(x), Math.abs(y)) > 60 || Math.hypot(x, y) < 110) continue;
    items.push({ at: [x, y, Z], svg: smd(c, x, y, Z, r() > 0.5 ? 'x' : 'y', 9, 4.6, 3.4) });
  }
  for (const [x, y] of [[66, -250], [-250, 66], [250, -66], [-66, 250], [40, -120], [-120, 40]] as const) {
    items.push({
      at: [x, y, Z],
      svg: c.post(x, y, 4.6, Z, 5, { tone: 'mid', crease: 'lo' }, 18) + `<g class="bp-led bp-hero-led">${c.D([c.at([x, y, Z + 5])], { size: 3, tone: 'hi' })}</g>`,
    });
  }
  items.push({ at: [150, 240, Z], svg: header(c, 110, 240, Z, 9, 10, 2) });
  items.push({ at: [250, -120, Z], svg: c.box({ x: 232, y: -140, w: 40, d: 28, r: 6 }, Z, 14, { tone: 'hi', crease: 'lo' }, 6, 1) + c.L(k.sideRing([272, -126, Z + 7], 4, 'x', c.P, 16), { tone: 'lo' }) });
  // A crystal by the socket.
  items.push({ at: [70, 0, Z], svg: c.box({ x: 62, y: -12, w: 14, d: 24, r: 6 }, Z, 5, { tone: 'hi', crease: 'lo' }, 6, 0.6) });
  return items;
}

function chip(c: Ctx) {
  return ic(c, { cx: 0, cy: 0, z: Z, w: CHIP, d: CHIP, h: 7, pins: 14, sides: 4, lit: true })
    + c.engrave('TRILIGHT', 0, 4, Z + 7.4, 12, 'hi', 'middle')
    + c.engrave('TRL-08', 0, 16, Z + 7.4, 6.5, 'mid', 'middle');
}

/* The hand, in its own frame: tweezer tip at the origin, +u up the tweezers. */
const capsule = (u0: number, u1: number, v: number, r: number) =>
  `M${u0} ${v - r}L${u1} ${v - r}A${r} ${r} 0 0 1 ${u1} ${v + r}L${u0} ${v + r}A${r} ${r} 0 0 1 ${u0} ${v - r}Z`;
const nail = (u: number, v: number, r: number) =>
  `M${u + r * 0.25} ${v - r * 0.55}Q${u - r * 0.15} ${v} ${u + r * 0.25} ${v + r * 0.55}L${u + r * 1.25} ${v + r * 0.55}Q${u + r * 1.5} ${v} ${u + r * 1.25} ${v - r * 0.55}Z`;
const crease = (u: number, v: number, r: number) => `M${u} ${v - r * 0.7}Q${u - r * 0.25} ${v} ${u} ${v + r * 0.7}`;

function handSvg() {
  const part = (d: string, extra = '') => `<path class="bp-hand__fill" d="${d}"/><path class="bp-hand__line" d="${d}"/>${extra}`;
  const L = 360; // tweezer length
  const leg = (s: number) => {
    // A tapering tweezer leg with an inner edge line and a knurled grip.
    const pts = [[0, s * 1], [L - 14, s * 7], [L, s * 12], [L, s * 15], [L - 14, s * 17], [0, s * 3]];
    const d = `M${pts.map((p) => p.join(' ')).join('L')}Z`;
    const grip = Array.from({ length: 7 }, (_, i) => {
      const u = 170 + i * 9;
      const w0 = 1 + (6 / (L - 14)) * u;
      return `M${u} ${s * (w0 + 0.8)}L${u + 4} ${s * (w0 + 2.6)}`;
    }).join('');
    return part(d, `<path class="bp-hand__detail" d="M10 ${s * 2}L${L - 20} ${s * 11}${grip}"/>`);
  };
  const r = 18;
  const o = 120; // where the grip starts along the tweezers
  return [
    // Ring and middle fingers curled behind, then the back of the hand.
    part(capsule(o + 85, o + 300, -70, r + 1), `<path class="bp-hand__detail" d="${crease(o + 140, -70, r) + crease(o + 200, -70, r)}"/>`),
    part(capsule(o + 60, o + 300, -36, r + 1), `<path class="bp-hand__detail" d="${nail(o + 60, -36, r) + crease(o + 125, -36, r) + crease(o + 185, -36, r)}"/>`),
    part(`M${o + 210} -104C${o + 260} -130 ${o + 350} -120 ${o + 400} -70L${o + 440} 40C${o + 420} 120 ${o + 350} 150 ${o + 290} 140L${o + 210} 120Z`),
    leg(-1),
    // Thumb under the tweezers, index finger over them.
    part(capsule(o + 30, o + 250, 26, r), `<path class="bp-hand__detail" d="${nail(o + 30, 26, r) + crease(o + 105, 26, r)}"/>`),
    leg(1),
    part(capsule(o, o + 270, -6, r - 1), `<path class="bp-hand__detail" d="${nail(o, -6, r - 1) + crease(o + 72, -6, r - 1) + crease(o + 140, -6, r - 1)}"/>`),
  ].join('');
}

export function heroFigure(label: string) {
  // Framed tight: the board runs off every edge, like a city seen from a tower.
  const P = k.fitProjection(k.boxCorners({ x: -175, y: -175, w: 350, d: 350, r: 0 }, 0, 40), HERO_W, HERO_H, { pad: 0 });
  const c = ctx(P);
  const b = board(c);
  const items = parts(c);
  const seam = c.depth([CHIP / 2 + 4, CHIP / 2 + 4, Z]);
  const behind = items.filter((i) => c.depth(i.at) <= seam);
  const front = items.filter((i) => c.depth(i.at) > seam);
  const lift = k.axisVector(P, [0, 0, LIFT]);
  const centre = c.at([0, 0, Z + 7]);
  // Tweezer tip on the chip's top face, a little toward the far corner.
  const tip = c.at([-6, -6, Z + 7.4]);
  const chipW = Math.hypot(...([0, 1].map((i) => c.at([CHIP / 2, -CHIP / 2, Z])[i]! - c.at([-CHIP / 2, CHIP / 2, Z])[i]!)) as [number, number]);
  const handScale = chipW / 190;
  const body = [
    `<g data-hero-board>${b.svg}${c.sorted(behind)}</g>`,
    `<g class="bp-power-layer" data-hero-power>${b.power}</g>`,
    // Seated by default (no-JS, reduced motion); the scroll scene lifts it.
    `<g data-hero-chip>${chip(c)}</g>`,
    `<g data-hero-front>${c.sorted(front)}</g>`,
    `<g class="bp-hand" data-hero-hand transform="translate(${lift[0].toFixed(2)} ${lift[1].toFixed(2)})"><g transform="translate(${tip[0].toFixed(1)} ${tip[1].toFixed(1)}) rotate(-58) scale(${handScale.toFixed(3)})">${handSvg()}</g></g>`,
  ].join('');
  const svg = k.figureSvg({ width: HERO_W, height: HERO_H, label, className: 'bp-svg bp-svg--hero bp-svg--crop bp-draw', body });
  return { svg, lift, centre };
}
