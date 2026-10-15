/**
 * Ladder figures: one product, a field sensor node, as it grows up. All share
 * one camera and scale so the set reads as a single object:
 *
 *   trl12     Idea: a pencil sketch of the node on graph paper
 *   trl3      Model: the node as a simulation wireframe with dimensions
 *   trl4      Prototype: a breadboard with jumpers
 *   trl5      a custom PCB in an open enclosure, probe in the soil (What it takes)
 *   trl6      the golden sample, closed and finished (closing CTA)
 *   trl8      Product: three qualified units on a test rack, all three lights lit
 */
import { k, ctx, ic, smd, header, hole, jumper, wireBox, rng, type Plan, type Point3 } from './parts';

export const STAGE_W = 400;
export const STAGE_H = 300;

const P = k.fitProjection(
  [...k.boxCorners({ x: -112, y: -84, w: 224, d: 168, r: 0 }, -8, 70)],
  STAGE_W,
  STAGE_H,
  { pad: 10 },
);
const c = ctx(P);

const NODE_W = 88;
const NODE_D = 62;
const BASE_H = 30;
const LID_H = 7;
const node = (ox: number, oy: number): Plan => ({ x: ox - NODE_W / 2, y: oy - NODE_D / 2, w: NODE_W, d: NODE_D, r: 7 });

/** The node's own PCB, used inside the open enclosure. */
function nodePcb(ox: number, oy: number, z: number) {
  const plan = k.insetPlan(node(ox, oy), 7);
  const zt = z + 2;
  return [
    c.box(plan, z, 2, { tone: 'mid', crease: 'lo' }, 4, 0.5),
    k.corners(plan, 4).map(([x, y]) => hole(c, x, y, zt, 1.8)).join(''),
    ic(c, { cx: ox - 10, cy: oy, z: zt, w: 18, d: 18, h: 2.4, pins: 6, sides: 4, mark: 'MCU', markSize: 3 }),
    c.box({ x: ox + 12, y: oy - 18, w: 12, d: 10, r: 1 }, zt, 3, { tone: 'hi', crease: 'lo' }, 2, 0.4),
    c.box({ x: ox + 14, y: oy + 6, w: 16, d: 12, r: 1 }, zt, 7, { tone: 'mid', crease: 'lo' }, 2, 0.4),
    smd(c, ox - 26, oy - 14, zt, 'y', 4, 2, 1.2),
    smd(c, ox - 26, oy + 12, zt, 'y', 4, 2, 1.2),
    c.D([c.at([ox + 22, oy + 12, zt + 7]), c.at([ox + 18, oy + 12, zt + 7])], { size: 0.9, tone: 'hi' }),
  ].join('');
}

/** The finished unit: base, lid, screws, label plate, LED window, antenna, gland. */
function closedNode(ox: number, oy: number, { led = true, lit = true } = {}) {
  const plan = node(ox, oy);
  const lid = k.insetPlan(plan, -1);
  const zl = BASE_H + LID_H;
  const out: string[] = [c.halo(k.insetPlan(plan, 4), 0)];
  // Antenna at the back corner paints before the body.
  const ant: [number, number] = [plan.x + 12, plan.y + 10];
  out.push(c.box(plan, 0, BASE_H, { tone: 'mid', crease: 'lo' }, 8, 1));
  out.push(c.L(k.sideSeam(plan, 6, c.P, 8), { tone: 'faint' }));
  // Cable gland on the +x face.
  const g: Point3 = [plan.x + plan.w, oy + 8, 12];
  out.push(c.L(k.sideRing(g, 5, 'x', P, 22) + k.sideRing(g, 3, 'x', P, 18), { tone: 'mid' }));
  out.push(c.box(lid, BASE_H, LID_H, { tone: 'hi', crease: 'lo' }, 8, 1.2));
  out.push(c.post(ant[0], ant[1], 3.4, zl, 6, { tone: 'mid', crease: 'lo' }, 18));
  out.push(c.post(ant[0], ant[1], 1.8, zl + 6, 24, { tone: 'hi', crease: 'none' }, 14));
  out.push(c.post(ant[0], ant[1], 2.4, zl + 30, 2.4, { tone: 'hi', crease: 'lo' }, 14));
  const screws = k.corners(lid, 5.5);
  out.push(c.L(screws.map(([x, y]) => k.ring(x, y, 2.2, zl, P, 16)).join(''), { tone: 'lo' }));
  out.push(c.D(screws.map(([x, y]) => c.at([x, y, zl])), { size: 0.7, tone: 'mid' }));
  // Label plate with three rule lines.
  const lp: Plan = { x: ox - 18, y: oy - 6, w: 40, d: 22, r: 1.5 };
  out.push(c.L(k.planOutline(lp, zl, P, 3), { tone: 'mid' }));
  out.push(c.engrave('TRILIGHT', lp.x + 4, lp.y + 8, zl, 5, 'hi'));
  out.push(c.L([12, 15.5, 19].map((dy, i) => k.lineOnTop([lp.x + 4, lp.y + dy], [lp.x + (i === 2 ? 22 : 34), lp.y + dy], zl, P)).join(''), { tone: 'lo', free: true }));
  if (led) {
    const lx = plan.x + plan.w - 12;
    const ly = plan.y + plan.d - 12;
    out.push(c.L(k.ring(lx, ly, 3.6, zl, P, 20), { tone: 'mid' }));
    out.push(`<g class="bp-led${lit ? ' is-on' : ''}">${c.D([c.at([lx, ly, zl])], { size: 2.2, tone: 'hi' })}</g>`);
  }
  return out.join('');
}

/* ------------------------------------------------------------------ stages */

function idea() {
  const sheet: Plan = { x: -96, y: -66, w: 172, d: 128, r: 1 };
  const z = 0.8;
  const out: string[] = [c.halo(k.insetPlan(sheet, 4), 0), c.box(sheet, 0, z, { tone: 'mid', crease: 'none' }, 2)];
  // Graph paper.
  const grid: string[] = [];
  for (let x = sheet.x + 8; x < sheet.x + sheet.w; x += 8) grid.push(k.lineOnTop([x, sheet.y], [x, sheet.y + sheet.d], z, P));
  for (let y = sheet.y + 8; y < sheet.y + sheet.d; y += 8) grid.push(k.lineOnTop([sheet.x, y], [sheet.x + sheet.w, y], z, P));
  out.push(c.L(grid.join(''), { tone: 'faint' }));
  // The sketch: the node drawn in iso on the page, slightly loose.
  const r = rng(11);
  const jit = () => (r() - 0.5) * 1.6;
  const m = (x: number, y: number, h: number): [number, number] => [-14 + (x - y) * 0.62 + jit(), 4 + (x + y) * 0.36 - h * 0.7 + jit()];
  const W = 44, D = 31, H1 = 15, H2 = 19;
  const strokes: [number, number][][] = [
    [m(-W, -D, H2), m(W, -D, H2), m(W, D, H2), m(-W, D, H2), m(-W, -D, H2)],
    [m(W, -D, H2), m(W, -D, -H1 + 2)], [m(W, D, H2), m(W, D, -H1 + 2)], [m(-W, D, H2), m(-W, D, -H1 + 2)],
    [m(W, -D, -H1 + 2), m(W, D, -H1 + 2), m(-W, D, -H1 + 2)],
    [m(W, -D, H1 - 8), m(W, D, H1 - 8), m(-W, D, H1 - 8)],
    [m(-W + 10, -D + 8, H2), m(-W + 10, -D + 8, H2 + 22)],
  ];
  out.push(`<g class="bp-sketch">${c.L(strokes.map((s) => k.onTop(s, z, P)).join(''), { tone: 'hi' })}</g>`);
  // Notes in the margin: an arrow to the antenna and scribbled lines.
  const notes: [number, number][][] = [
    [[-70, -40], [-52, -34], [-44, -26]],
    [[-44, -26], [-48, -28]], [[-44, -26], [-46, -30]],
  ];
  for (let row = 0; row < 3; row++) {
    const pts: [number, number][] = [];
    const len = row === 2 ? 26 : 40;
    for (let t = 0; t <= len; t += 2) pts.push([30 + t, 24 + row * 9 + Math.sin(t * 0.9 + row) * 1.2]);
    notes.push(pts);
  }
  out.push(`<g class="bp-sketch">${c.L(notes.map((s) => k.onTop(s, z, P)).join(''), { tone: 'mid', free: true })}</g>`);
  out.push(c.engrave('IDEA 01 · FIELD NODE', -88, -54, z, 5, 'mid'));
  out.push(c.L(k.ring(54, -40, 9, z, P, 28), { tone: 'lo' }));
  out.push(c.engrave('?', 54, -37, z, 9, 'mid', 'middle'));
  // A pencil lying beside the page: hex body, ferrule, eraser, sharpened tip.
  const py = 74;
  out.push(c.box({ x: -40, y: py - 3.5, w: 92, d: 7, r: 1.2 }, 0, 6, { tone: 'hi', crease: 'lo' }, 2, 0.4));
  out.push(c.L(k.lineOnTop([-40, py], [52, py], 6, P), { tone: 'faint' }));
  out.push(c.box({ x: -52, y: py - 3.6, w: 12, d: 7.2, r: 1 }, 0, 6.2, { tone: 'mid', crease: 'lo' }, 2));
  out.push(c.box({ x: -62, y: py - 3.4, w: 10, d: 6.8, r: 2.4 }, 0, 6, { tone: 'lo', crease: 'lo' }, 3));
  out.push(c.S(k.extrude([[52, py - 3.5], [66, py - 0.6], [66, py + 0.6], [52, py + 3.5]], 0, 6, P), { tone: 'mid', crease: 'lo' }));
  return out.join('');
}

function model() {
  const out: string[] = [];
  // Simulation floor: a fine grid fading at its edges.
  const grid: string[] = [];
  for (let x = -100; x <= 100; x += 10) grid.push(k.lineOnTop([x, -76], [x, 76], 0, P));
  for (let y = -76; y <= 76; y += 10) grid.push(k.lineOnTop([-100, y], [100, y], 0, P));
  out.push(c.L(grid.join(''), { tone: 'faint' }));
  const plan = { ...node(0, 0), r: 0 };
  const lid = { ...k.insetPlan(plan, -1), r: 0 };
  const zl = BASE_H + LID_H;
  out.push(wireBox(c, plan, 0, BASE_H, 'mid'));
  out.push(wireBox(c, k.insetPlan(plan, 7), 6, 8, 'lo'));
  out.push(wireBox(c, lid, BASE_H, zl, 'hi'));
  // Mesh on the lid.
  const mesh: string[] = [];
  for (let i = 1; i < 8; i++) mesh.push(k.lineOnTop([lid.x + (lid.w / 8) * i, lid.y], [lid.x + (lid.w / 8) * i, lid.y + lid.d], zl, P));
  for (let i = 1; i < 6; i++) mesh.push(k.lineOnTop([lid.x, lid.y + (lid.d / 6) * i], [lid.x + lid.w, lid.y + (lid.d / 6) * i], zl, P));
  out.push(c.L(mesh.join(''), { tone: 'lo' }));
  // Antenna as a line, node points at the mesh vertices.
  const ant: Point3 = [plan.x + 12, plan.y + 10, zl];
  out.push(c.L(k.segment(ant, [ant[0], ant[1], zl + 32], P), { tone: 'lit' }));
  out.push(c.D([c.at(ant), c.at([ant[0], ant[1], zl + 32])], { size: 1.3, tone: 'hi' }));
  // Dimensions: width along the near edge, height at the right corner.
  const dy = plan.y + plan.d + 14;
  out.push(c.L(k.segment([plan.x, dy, 0], [plan.x + plan.w, dy, 0], P) + k.segment([plan.x, plan.y + plan.d + 2, 0], [plan.x, dy + 4, 0], P) + k.segment([plan.x + plan.w, plan.y + plan.d + 2, 0], [plan.x + plan.w, dy + 4, 0], P), { tone: 'mid' }));
  out.push(c.engrave('88', 0, dy + 9, 0, 6, 'hi', 'middle'));
  const hx = plan.x + plan.w + 14;
  const hy = plan.y + plan.d;
  out.push(c.L(k.segment([hx, hy, 0], [hx, hy, zl], P) + k.segment([plan.x + plan.w + 2, hy, 0], [hx + 4, hy, 0], P) + k.segment([plan.x + plan.w + 2, hy, zl], [hx + 4, hy, zl], P), { tone: 'mid' }));
  out.push(c.D([c.at([hx, hy, 0]), c.at([hx, hy, zl]), c.at([plan.x, dy, 0]), c.at([plan.x + plan.w, dy, 0])], { size: 1.1, tone: 'hi' }));
  // Axis gizmo.
  const o: Point3 = [-92, -66, 0];
  out.push(c.L(k.segment(o, [o[0] + 22, o[1], 0], P), { tone: 'hi' }));
  out.push(c.L(k.segment(o, [o[0], o[1] + 22, 0], P), { tone: 'mid' }));
  out.push(c.L(k.segment(o, [o[0], o[1], 22], P), { tone: 'lit' }));
  out.push(c.D([c.at(o)], { size: 1.4, tone: 'hi' }));
  return out.join('');
}

function prototype() {
  const bb: Plan = { x: -104, y: -58, w: 208, d: 116, r: 3 };
  const zt = 8;
  const out: string[] = [c.halo(k.insetPlan(bb, 6), 0), c.box(bb, 0, zt, { tone: 'mid', crease: 'lo' }, 3, 0.8)];
  // Centre channel and the two power rails each side.
  out.push(c.L(k.planOutline({ x: bb.x + 4, y: -2, w: bb.w - 8, d: 4, r: 0 }, zt, P, 1), { tone: 'lo' }));
  out.push(c.L([bb.y + 6, bb.y + 16, bb.y + bb.d - 16, bb.y + bb.d - 6].map((y) => k.lineOnTop([bb.x + 8, y], [bb.x + bb.w - 8, y], zt, P)).join(''), { tone: 'faint' }));
  out.push(c.D([...k.dotGrid(bb.x + 8, -44 + 6, 40, 5, 5, zt, P), ...k.dotGrid(bb.x + 8, 8, 40, 5, 5, zt, P)], { size: 0.55, tone: 'lo' }));
  const items: { at: Point3; svg: string }[] = [];
  // Dev board straddling the channel, on its headers.
  const dev: Plan = { x: -86, y: -22, w: 74, d: 40, r: 2 };
  items.push({
    at: [-50, 0, zt],
    svg: header(c, dev.x + 6, dev.y + 4, zt, 13, 5.2, 1) + header(c, dev.x + 6, dev.y + dev.d - 4, zt, 13, 5.2, 1)
      + c.box(dev, zt + 9, 2.4, { tone: 'mid', crease: 'lo' }, 3, 0.5)
      + ic(c, { cx: -50, cy: -2, z: zt + 11.4, w: 16, d: 16, h: 2, pins: 5, sides: 4, mark: 'MCU', markSize: 2.6 })
      + c.box({ x: dev.x - 4, y: -8, w: 12, d: 12, r: 1 }, zt + 11.4, 5, { tone: 'hi', crease: 'lo' }, 2, 0.4),
  });
  // Sensor module on three pins.
  items.push({
    at: [58, -30, zt],
    svg: header(c, 50, -30, zt, 3, 5, 1) + c.box({ x: 44, y: -42, w: 30, d: 22, r: 1.5 }, zt + 9, 2, { tone: 'mid', crease: 'lo' }, 3, 0.4)
      + c.box({ x: 52, y: -38, w: 12, d: 10, r: 1 }, zt + 11, 3, { tone: 'hi', crease: 'lo', lit: true }, 2, 0.4),
  });
  // LED and resistor on the lower half.
  items.push({ at: [60, 26, zt], svg: c.post(60, 26, 3.4, zt, 9, { tone: 'hi', crease: 'lo' }, 18) });
  items.push({ at: [38, 30, zt], svg: smd(c, 38, 30, zt, 'x', 10, 3.4, 3) });
  out.push(c.sorted(items));
  // Jumpers, painted after the parts they arc over.
  out.push(jumper(c, [-20, 24, zt], [50, -18, zt], 18, 'hi'));
  out.push(jumper(c, [-26, 30, zt], [55, -18, zt], 24, 'mid'));
  out.push(jumper(c, [-32, 36, zt], [60, -18, zt], 30, 'lo'));
  out.push(jumper(c, [70, 30, zt], [86, 50, zt], 8, 'mid'));
  return out.join('');
}

function proofOfConcept() {
  const out: string[] = [];
  // Soil at the host site, with its hatch on the near faces.
  const soil: Plan = { x: -108, y: -74, w: 216, d: 148, r: 2 };
  out.push(c.box(soil, -8, 8, { tone: 'lo', crease: 'faint' }, 2));
  const hatch: string[] = [];
  for (let x = soil.x + 6; x < soil.x + soil.w; x += 9) hatch.push(c.path3([[x, soil.y + soil.d, -1], [x - 5, soil.y + soil.d, -7]]));
  out.push(c.L(hatch.join(''), { tone: 'faint' }));
  const ox = -20;
  const oy = -10;
  const plan = node(ox, oy);
  const wall = 3;
  // Open enclosure: floor, back walls, PCB, front walls.
  out.push(c.halo(k.insetPlan(plan, 4), 0));
  out.push(c.box(plan, 0, 3, { tone: 'mid', crease: 'lo' }, 8, 0.6));
  out.push(c.box({ x: plan.x, y: plan.y, w: plan.w, d: wall, r: 1 }, 3, BASE_H - 3, { tone: 'mid', crease: 'lo' }, 2, 0.4));
  out.push(c.box({ x: plan.x, y: plan.y, w: wall, d: plan.d, r: 1 }, 3, BASE_H - 3, { tone: 'mid', crease: 'lo' }, 2, 0.4));
  out.push(nodePcb(ox, oy, 6));
  out.push(c.box({ x: plan.x + plan.w - wall, y: plan.y, w: wall, d: plan.d, r: 1 }, 3, BASE_H - 3, { tone: 'mid', crease: 'lo' }, 2, 0.4));
  out.push(c.box({ x: plan.x, y: plan.y + plan.d - wall, w: plan.w, d: wall, r: 1 }, 3, BASE_H - 3, { tone: 'mid', crease: 'lo' }, 2, 0.4));
  // Lid lifted off, its screws beside it.
  const lid = k.insetPlan(plan, -1);
  out.push(c.box(lid, 48, LID_H, { tone: 'hi', crease: 'lo' }, 8, 1.2));
  out.push(c.L(k.corners(lid, 5.5).map(([x, y]) => k.ring(x, y, 2.2, 48 + LID_H, P, 16)).join(''), { tone: 'lo' }));
  // Gland, cable and the soil probe it reads.
  const g: Point3 = [plan.x + plan.w, oy + 10, 12];
  out.push(c.L(k.sideRing(g, 4.4, 'x', P, 20), { tone: 'mid' }));
  const probe = [70, 40];
  out.push(`<path class="iso-line bp-cable" data-tone="hi" d="${c.path3([g, [g[0] + 18, g[1] + 4, 12], [probe[0]! - 6, probe[1]! - 6, 24], [probe[0]!, probe[1]!, 24]])}"/>`);
  out.push(c.post(probe[0]! - 5, probe[1]!, 1.6, 0, 18, { tone: 'hi', crease: 'none' }, 12));
  out.push(c.post(probe[0]! + 5, probe[1]!, 1.6, 0, 18, { tone: 'hi', crease: 'none' }, 12));
  out.push(c.box({ x: probe[0]! - 10, y: probe[1]! - 5, w: 20, d: 10, r: 2 }, 18, 8, { tone: 'mid', crease: 'lo', lit: true }, 3, 0.5));
  out.push(c.L(k.ring(probe[0]! - 5, probe[1]!, 2.4, 0, P, 14) + k.ring(probe[0]! + 5, probe[1]!, 2.4, 0, P, 14), { tone: 'lo' }));
  return out.join('');
}

function golden() {
  return closedNode(0, 0);
}

function qualified() {
  const out: string[] = [];
  const rack: Plan = { x: -110, y: -46, w: 220, d: 92, r: 4 };
  out.push(c.halo(k.insetPlan(rack, 4), -4));
  out.push(c.box(rack, -4, 6, { tone: 'mid', crease: 'lo' }, 4, 0.8));
  // Test leads ruler along the front edge.
  const t = k.topTicks(rack.x + 6, rack.x + rack.w - 6, 5, 5, rack.y + rack.d - 8, 2, [2, 4], P);
  out.push(c.L(t.minor, { tone: 'faint' }), c.L(t.major, { tone: 'lo' }));
  // Three identical units, scaled down to fit the rack, painted back to front.
  const units = [-72, 0, 72].map((ox) => ({ at: [ox, 0, 2] as Point3, svg: `<g transform="${k.translateAlong(P, [0, 0, 2])}">${smallNode(ox, -6)}</g>` }));
  out.push(c.sorted(units));
  return out.join('');
}

/** A compact node for the test rack: same parts, smaller body. */
function smallNode(ox: number, oy: number) {
  const plan: Plan = { x: ox - 30, y: oy - 24, w: 60, d: 48, r: 6 };
  const lid = k.insetPlan(plan, -1);
  const zl = 30;
  const out: string[] = [];
  out.push(c.box(plan, 0, 24, { tone: 'mid', crease: 'lo' }, 8, 0.8));
  out.push(c.L(k.sideSeam(plan, 5, P, 8), { tone: 'faint' }));
  out.push(c.box(lid, 24, 6, { tone: 'hi', crease: 'lo' }, 8, 1));
  out.push(c.post(plan.x + 9, plan.y + 8, 1.6, zl, 18, { tone: 'hi', crease: 'none' }, 12));
  const screws = k.corners(lid, 5);
  out.push(c.D(screws.map(([x, y]) => c.at([x, y, zl])), { size: 0.7, tone: 'mid' }));
  out.push(c.L(k.planOutline({ x: ox - 14, y: oy - 4, w: 28, d: 14, r: 1 }, zl, P, 2), { tone: 'mid' }));
  const lx = plan.x + plan.w - 10;
  const ly = plan.y + plan.d - 10;
  out.push(c.L(k.ring(lx, ly, 3.4, zl, P, 18), { tone: 'mid' }));
  out.push(`<g class="bp-led is-on">${c.D([c.at([lx, ly, zl])], { size: 2.2, tone: 'hi' })}</g>`);
  return out.join('');
}

const builders: Record<string, () => string> = {
  trl12: idea, trl3: model, trl4: prototype, trl5: proofOfConcept, trl6: golden, trl8: qualified,
};

export function stageFigure(id: string, label: string) {
  const build = builders[id];
  if (!build) return '';
  const sketchy = id === 'trl12';
  return k.figureSvg({
    width: STAGE_W,
    height: STAGE_H,
    label,
    className: `bp-svg bp-draw${sketchy ? ' bp-svg--sketch' : ''}${id === 'trl3' ? ' bp-svg--wire' : ''}`,
    body: build(),
  });
}
