/**
 * Fig. 1 · The Trilight core: a hardware stack drawn as an isometric
 * blueprint. Six layers, each built at its assembled height; the page lifts
 * them apart on scroll (exploded view) by the screen offsets exported here.
 *
 *   5 shield   protective lid with engraved marking
 *   4 die      processing matrix: micro-bump field, pad ring
 *   3 routing  signal routing grid: traces and vias
 *   2 logic    neural logic array: 8 × 8 compute cells
 *   1 power    power distribution plane: rails, vias, inductors
 *   0 base     hardware interface base: substrate, BGA balls, passives
 */
import { k, ctx, rng, smd, type Ctx, type Plan, type Point3 } from './parts';

export const CORE_W = 760;
export const CORE_H = 820;

/** World lift between neighbouring layers when fully exploded. */
const GAP = 58;
const SIDE = 220;
const base: Plan = { x: -SIDE / 2, y: -SIDE / 2, w: SIDE, d: SIDE, r: 5 };
const inset = (by: number, r = 3): Plan => ({ ...k.insetPlan(base, by), r });

type Layer = { id: string; z: number; h: number; plan: Plan; draw: (c: Ctx) => string };

const layers: Layer[] = [
  { id: 'base', z: 0, h: 9, plan: base, draw: drawBase },
  { id: 'power', z: 9, h: 5, plan: inset(10), draw: drawPower },
  { id: 'logic', z: 14, h: 4, plan: inset(20), draw: drawLogic },
  { id: 'routing', z: 18, h: 3, plan: inset(28), draw: drawRouting },
  { id: 'die', z: 21, h: 5, plan: inset(58, 2), draw: drawDie },
  { id: 'shield', z: 26, h: 9, plan: inset(38, 10), draw: drawShield },
];

const top = (l: Layer) => l.z + l.h;

function drawBase(c: Ctx) {
  const L = layers[0];
  const z1 = top(L);
  const out: string[] = [c.halo(k.insetPlan(base, 6), -4)];
  // BGA solder balls under the substrate, back to front.
  const balls: { at: Point3; svg: string }[] = [];
  for (let i = 0; i < 13; i++)
    for (let j = 0; j < 13; j++) {
      const x = -90 + i * 15;
      const y = -90 + j * 15;
      // Only the rows along the near edges show under the substrate.
      if (i < 11 && j < 11) continue;
      balls.push({ at: [x, y, -4], svg: c.post(x, y, 3.6, -4, 4, { tone: 'mid', crease: 'none' }, 12) });
    }
  out.push(c.sorted(balls));
  out.push(c.box(base, 0, L.h, { tone: 'mid', crease: 'lo' }, 4, 1.2));
  // Laminate seams on the visible sides: the core and its two build-up layers.
  out.push(c.L(k.sideSeam(base, 3, c.P, 4) + k.sideSeam(base, 6, c.P, 4), { tone: 'faint' }));
  out.push(c.L(k.planOutline(k.insetPlan(base, 4), z1, c.P, 4), { tone: 'lo' }));
  // Land-grid of pads around the edge, where the layers above land.
  const pads: [number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const o = -97 + i * 7.76;
    pads.push([o, -103], [o, 103], [-103, o], [103, o]);
  }
  out.push(c.D(pads.map(([x, y]) => c.at([x, y, z1])), { size: 0.75, tone: 'mid' }));
  // Decoupling capacitors in the ring between the base and the power layer.
  const caps: { at: Point3; svg: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const o = -66 + i * 22;
    caps.push({ at: [o, -94, z1], svg: smd(c, o, -94, z1, 'x') });
    caps.push({ at: [o, 94, z1], svg: smd(c, o, 94, z1, 'x') });
    caps.push({ at: [-94, o, z1], svg: smd(c, -94, o, z1, 'y') });
    caps.push({ at: [94, o, z1], svg: smd(c, 94, o, z1, 'y') });
  }
  out.push(c.sorted(caps));
  // Fiducials and the pin-1 corner.
  out.push(c.L(k.ring(-100, -100, 2.2, z1, c.P, 18) + k.ring(100, 100, 2.2, z1, c.P, 18), { tone: 'mid' }));
  out.push(c.D([c.at([-100, -100, z1]), c.at([100, 100, z1])], { size: 0.8, tone: 'hi' }));
  out.push(c.engrave('TRL8 · IF-BASE', 22, 108.6, z1, 4.2, 'lo'));
  return out.join('');
}

function drawPower(c: Ctx) {
  const L = layers[1];
  const z1 = top(L);
  const out: string[] = [c.box(L.plan, L.z, L.h, { tone: 'mid', crease: 'lo' }, 4, 1)];
  out.push(c.L(k.sideSeam(L.plan, L.z + 2.5, c.P, 4), { tone: 'faint' }));
  // Split power planes: three nested islands with a moat between them.
  for (const by of [8, 30, 52]) out.push(c.L(k.planOutline(k.insetPlan(L.plan, by), z1, c.P, 4), { tone: by === 8 ? 'lo' : 'mid' }));
  // Rails crossing the islands.
  const rails: string[] = [];
  for (const o of [-60, -20, 20, 60]) rails.push(k.lineOnTop([o, -L.plan.d / 2 + 8], [o, L.plan.d / 2 - 8], z1, c.P));
  out.push(c.L(rails.join(''), { tone: 'faint' }));
  // Stitching vias between the rails.
  const vias: [number, number][] = [];
  for (let i = 0; i < 18; i++) for (let j = 0; j < 18; j++) {
    const x = -85 + i * 10;
    const y = -85 + j * 10;
    if (Math.abs(x) < 40 && Math.abs(y) < 40) continue;
    vias.push([x, y]);
  }
  out.push(c.D(vias.map(([x, y]) => c.at([x, y, z1])), { size: 0.6, tone: 'lo' }));
  // Inductors and bulk capacitors on the four corners.
  const parts: { at: Point3; svg: string }[] = [];
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const x = sx * 72;
    const y = sy * 72;
    parts.push({
      at: [x, y, z1],
      svg: c.box({ x: x - 9, y: y - 9, w: 18, d: 18, r: 2 }, z1, 8, { tone: 'hi', crease: 'lo' }, 3, 0.6)
        + c.L(k.ring(x, y, 5.4, z1 + 8, c.P, 28), { tone: 'mid' })
        + c.engrave('2R2', x, y + 1.4, z1 + 8, 3.4, 'lo', 'middle'),
    });
  }
  out.push(c.sorted(parts));
  // The core of the plane: a thermal pad of vias under the die.
  out.push(c.L(k.planOutline({ x: -30, y: -30, w: 60, d: 60, r: 2 }, z1, c.P, 3), { tone: 'mid' }));
  out.push(c.D(k.dotGrid(-24, -24, 7, 7, 8, z1, c.P), { size: 0.9, tone: 'mid' }));
  return out.join('');
}

function drawLogic(c: Ctx) {
  const L = layers[2];
  const z1 = top(L);
  const out: string[] = [c.box(L.plan, L.z, L.h, { tone: 'mid', crease: 'lo' }, 4, 1)];
  out.push(c.L(k.planOutline(k.insetPlan(L.plan, 5), z1, c.P, 4), { tone: 'lo' }));
  // 8 × 8 compute cells, each with its own register strip.
  const cells: { at: Point3; svg: string }[] = [];
  const n = 8;
  const pitch = 19;
  const size = 13;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const x = -((n - 1) * pitch) / 2 + i * pitch;
      const y = -((n - 1) * pitch) / 2 + j * pitch;
      const plan = { x: x - size / 2, y: y - size / 2, w: size, d: size, r: 1.2 };
      cells.push({
        at: [x, y, z1],
        svg: c.box(plan, z1, 4, { tone: 'hi', crease: 'lo' }, 2, 0.6)
          + c.L(k.planOutline(k.insetPlan(plan, 2.6), z1 + 4, c.P, 3), { tone: 'faint' })
          + c.D([c.at([x, y, z1 + 4])], { size: 0.7, tone: 'mid' }),
      });
    }
  out.push(c.sorted(cells));
  return out.join('');
}

function drawRouting(c: Ctx) {
  const L = layers[3];
  const z1 = top(L);
  const out: string[] = [c.box(L.plan, L.z, L.h, { tone: 'mid', crease: 'lo' }, 4, 0.8)];
  const half = L.plan.w / 2 - 7;
  const rand = rng(7);
  const traces: string[] = [];
  const ends: [number, number][] = [];
  // Manhattan routes with 45° jogs, from the edge fan-out in toward the die.
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < 11; i++) {
      const o = -half + 8 + i * ((half * 2 - 16) / 10);
      const inward = 18 + rand() * 30;
      const jog = (rand() - 0.5) * 18;
      const pts: [number, number][] = [[o, -half], [o, -half + inward], [o + jog, -half + inward + Math.abs(jog)], [o + jog, -half + inward + Math.abs(jog) + 10 + rand() * 12]];
      const rot = pts.map(([x, y]) => {
        const r = side * (Math.PI / 2);
        return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)] as [number, number];
      });
      traces.push(k.onTop(rot, z1, c.P));
      ends.push(rot[rot.length - 1]!);
    }
  out.push(c.L(traces.join(''), { tone: 'mid' }));
  out.push(c.D(ends.map(([x, y]) => c.at([x, y, z1])), { size: 1, tone: 'hi' }));
  // A fine mesh in the middle where the die lands.
  const mesh: string[] = [];
  for (let i = -6; i <= 6; i++) {
    mesh.push(k.lineOnTop([i * 6, -36], [i * 6, 36], z1, c.P));
    mesh.push(k.lineOnTop([-36, i * 6], [36, i * 6], z1, c.P));
  }
  out.push(c.L(mesh.join(''), { tone: 'faint' }));
  out.push(c.L(k.planOutline({ x: -38, y: -38, w: 76, d: 76, r: 1 }, z1, c.P, 2), { tone: 'lo' }));
  return out.join('');
}

function drawDie(c: Ctx) {
  const L = layers[4];
  const z1 = top(L);
  const out: string[] = [c.box(L.plan, L.z, L.h, { tone: 'hi', crease: 'lo', lit: true }, 3, 0.8)];
  // Guard ring and pad ring.
  out.push(c.L(k.planOutline(k.insetPlan(L.plan, 3), z1, c.P, 2), { tone: 'mid' }));
  const pads: string[] = [];
  const span = L.plan.w - 14;
  for (let i = 0; i < 14; i++) {
    const o = -span / 2 + i * (span / 13);
    const e = L.plan.w / 2 - 6.5;
    for (const [x, y, w, d] of [[o, -e, 3, 2], [o, e, 3, 2], [-e, o, 2, 3], [e, o, 2, 3]] as const)
      pads.push(k.planOutline({ x: x - w / 2, y: y - d / 2, w, d, r: 0 }, z1, c.P, 1));
  }
  out.push(c.L(pads.join(''), { tone: 'lo' }));
  // Four processing cores as engraved blocks, with a micro-bump field between.
  for (const [x, y] of [[-14, -14], [14, -14], [-14, 14], [14, 14]] as const)
    out.push(c.L(k.planOutline({ x: x - 10, y: y - 10, w: 20, d: 20, r: 0.5 }, z1, c.P, 1), { tone: 'lit' }));
  out.push(c.D(k.dotGrid(-22, -22, 12, 12, 4, z1, c.P), { size: 0.45, tone: 'mid' }));
  return out.join('');
}

function drawShield(c: Ctx) {
  const L = layers[5];
  const skirt = L.plan;
  const lid = k.insetPlan(skirt, 5);
  const z1 = top(L);
  const out: string[] = [];
  out.push(c.box(skirt, L.z, 3, { tone: 'mid', crease: 'lo' }, 6, 0.6));
  out.push(c.box(lid, L.z + 3, L.h - 3, { tone: 'hi', crease: 'lo' }, 8, 1.4));
  out.push(c.L(k.planOutline(k.insetPlan(lid, 6), z1, c.P, 6), { tone: 'lo' }));
  // Pin-1 triangle and the alignment dot.
  const tri: [number, number][] = [[lid.x + 9, lid.y + 9], [lid.x + 19, lid.y + 9], [lid.x + 9, lid.y + 19]];
  out.push(c.L(k.onTop(tri, z1, c.P, true), { tone: 'hi' }));
  out.push(c.L(k.ring(lid.x + lid.w - 13, lid.y + lid.d - 13, 3.4, z1, c.P, 24), { tone: 'mid' }));
  // Engraved marking.
  out.push(c.engrave('TRILIGHT', 0, -4, z1, 11, 'hi', 'middle'));
  out.push(c.engrave('CORE · TRL-08', 0, 10, z1, 5.6, 'mid', 'middle'));
  out.push(c.engrave('2026 · NIAT', 0, 20, z1, 4.4, 'lo', 'middle'));
  // Screws through the skirt.
  const screws = k.corners(skirt, 4.5);
  out.push(c.L(screws.map(([x, y]) => k.ring(x, y, 1.6, L.z + 3, c.P, 14)).join(''), { tone: 'lo' }));
  out.push(c.D(screws.map(([x, y]) => c.at([x, y, L.z + 3])), { size: 0.6, tone: 'mid' }));
  return out.join('');
}

export type CoreLayerInfo = {
  id: string;
  /** Screen offset (viewBox units) of one world unit up, times this layer's lift. */
  lift: [number, number];
  /** Leftmost and rightmost screen points of the layer's top face, assembled. */
  left: [number, number];
  right: [number, number];
};

export function coreFigure(label: string) {
  const extreme: Point3[] = [
    ...k.boxCorners(base, -6, 0),
    ...k.boxCorners(layers[5].plan, 0, top(layers[5]) + GAP * 5),
  ];
  const P = k.fitProjection(extreme, CORE_W, CORE_H, { pad: 24 });
  const c = ctx(P);
  const info: CoreLayerInfo[] = [];
  const groups = layers.map((l, i) => {
    const { x, y, w, d } = l.plan;
    const corners = ([[x, y], [x + w, y], [x, y + d], [x + w, y + d]] as const).map(([px, py]) => c.at([px, py, top(l)]));
    const left = corners.reduce((a, b) => (b[0] < a[0] ? b : a));
    const right = corners.reduce((a, b) => (b[0] > a[0] ? b : a));
    info.push({ id: l.id, lift: k.axisVector(P, [0, 0, GAP * i]), left, right });
    return { id: l.id, body: l.draw(c) };
  });
  // How far the assembled stack sits below the centre of the viewBox.
  const assembledTop = c.at([0, 0, top(layers[5])])[1];
  const explodedTop = assembledTop + k.axisVector(P, [0, 0, GAP * 5])[1];
  const centreShift = (explodedTop - assembledTop) / 2;
  const svg = k.figureSvg({
    width: CORE_W,
    height: CORE_H,
    label,
    className: 'bp-svg bp-draw',
    // Assembled and centred by default, so the drawing is right without JS.
    body: `<g data-core>${groups.map((g) => `<g class="bp-layer" data-layer="${g.id}" transform="translate(0 ${centreShift.toFixed(2)})">${g.body}</g>`).join('')}</g>`,
  });
  return { svg, info, centreShift };
}
