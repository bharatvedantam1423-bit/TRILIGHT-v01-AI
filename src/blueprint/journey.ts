/**
 * The ladder, as one drone growing up. All four drawings share one camera,
 * so as the page crossfades from one to the next the drone stays in place
 * and only its finish changes:
 *
 *   idea       a pencil sketch of it on graph paper ("v0.1?")
 *   model      its simulation wireframe on a grid, with a span dimension
 *   prototype  the bare frame with its flight-controller chip, ESCs and leads
 *   product    the finished drone in the air over its pad, a rover beside it
 *
 * The three forces (Build, Test, Deploy) each get a drawing too.
 */
import { k, ctx, ic, smd, hole, drum, rng, type Plan, type Point3 } from './parts';
import { drone, rover, droneSegments } from './vehicles';

export const JOURNEY_W = 640;
export const JOURNEY_H = 520;

const P = k.fitProjection(k.boxCorners({ x: -125, y: -125, w: 250, d: 250, r: 0 }, -10, 105), JOURNEY_W, JOURNEY_H, { pad: 6 });
const c = ctx(P);

const circle = (ctr: Point3, r: number, n = 28): Point3[] =>
  Array.from({ length: n + 1 }, (_, i) => [ctr[0] + r * Math.cos((i / n) * Math.PI * 2), ctr[1] + r * Math.sin((i / n) * Math.PI * 2), ctr[2]]);

function idea() {
  const sheet: Plan = { x: -130, y: -110, w: 250, d: 200, r: 1 };
  const z = 0.8;
  const out: string[] = [c.halo(k.insetPlan(sheet, 6), 0), c.box(sheet, 0, z, { tone: 'mid', crease: 'none' }, 2)];
  const grid: string[] = [];
  for (let x = sheet.x + 10; x < sheet.x + sheet.w; x += 10) grid.push(k.lineOnTop([x, sheet.y], [x, sheet.y + sheet.d], z, P));
  for (let y = sheet.y + 10; y < sheet.y + sheet.d; y += 10) grid.push(k.lineOnTop([sheet.x, y], [sheet.x + sheet.w, y], z, P));
  out.push(c.L(grid.join(''), { tone: 'faint' }));
  // The drone, drawn in iso on the page by hand: slightly loose lines.
  const r = rng(5);
  const j = () => (r() - 0.5) * 1.4;
  const m = ([x, y, h]: Point3): [number, number] => [-6 + (x - y) * 0.5 + j(), -8 + (x + y) * 0.29 - h * 0.58 + j()];
  const seg = droneSegments(0, 0, 30);
  const strokes = seg.solid.map(([a, b]) => k.onTop([m(a), m(b)], z, P));
  const rings = seg.rings.map((q) => k.onTop(circle(q.c, q.r).map(m), z, P));
  out.push(`<g class="bp-sketch">${c.L(strokes.join('') + rings.join(''), { tone: 'hi' })}</g>`);
  // Margin notes: an arrow to a prop and a few scribbled lines.
  const notes: [number, number][][] = [[[60, -70], [40, -60], [30, -48]], [[30, -48], [36, -50]], [[30, -48], [31, -54]]];
  for (let row = 0; row < 3; row++) {
    const pts: [number, number][] = [];
    for (let t = 0; t <= (row === 2 ? 24 : 38); t += 2) pts.push([62 + t, 40 + row * 9 + Math.sin(t * 0.9 + row) * 1.2]);
    notes.push(pts);
  }
  out.push(`<g class="bp-sketch">${c.L(notes.map((s) => k.onTop(s, z, P)).join(''), { tone: 'mid', free: true })}</g>`);
  out.push(c.engrave('v0.1?', 64, -72, z, 9, 'hi'));
  out.push(c.engrave('IDEA 01 · QUAD', sheet.x + 8, sheet.y + 12, z, 6, 'mid'));
  // Pencil beside the page.
  const py = 106;
  out.push(c.box({ x: -60, y: py - 4, w: 120, d: 8, r: 1.4 }, 0, 7, { tone: 'hi', crease: 'lo' }, 2, 0.4));
  out.push(c.box({ x: -74, y: py - 4.2, w: 14, d: 8.4, r: 1 }, 0, 7.2, { tone: 'mid', crease: 'lo' }, 2));
  out.push(c.box({ x: -86, y: py - 4, w: 12, d: 8, r: 3 }, 0, 7, { tone: 'lo', crease: 'lo' }, 3));
  out.push(c.S(k.extrude([[60, py - 4], [78, py - 0.6], [78, py + 0.6], [60, py + 4]], 0, 7, P), { tone: 'mid', crease: 'lo' }));
  return out.join('');
}

function model() {
  const out: string[] = [];
  const grid: string[] = [];
  for (let x = -140; x <= 140; x += 14) grid.push(k.lineOnTop([x, -140], [x, 140], 0, P));
  for (let y = -140; y <= 140; y += 14) grid.push(k.lineOnTop([-140, y], [140, y], 0, P));
  out.push(c.L(grid.join(''), { tone: 'faint' }));
  const seg = droneSegments(0, 0, 40);
  out.push(c.L(seg.dashed.map(([a, b]) => k.segment(a, b, P)).join(''), { tone: 'lo', dashed: true }));
  out.push(c.L(seg.rings.filter((q) => q.dashed).map((q) => k.ring(q.c[0], q.c[1], q.r, q.c[2], P, 40)).join(''), { tone: 'lo', dashed: true }));
  out.push(c.L(seg.rings.filter((q) => !q.dashed).map((q) => k.ring(q.c[0], q.c[1], q.r, q.c[2], P, 28)).join(''), { tone: 'mid' }));
  out.push(c.L(seg.solid.map(([a, b]) => k.segment(a, b, P)).join(''), { tone: 'hi' }));
  // Footprint shadow on the floor and the span dimension.
  out.push(c.L(k.planOutline({ x: -96, y: -96, w: 192, d: 192, r: 30 }, 0, P, 6), { tone: 'lo', dashed: true }));
  const a: Point3 = [-65, 65, 0];
  const b: Point3 = [65, -65, 0];
  out.push(c.L(k.segment([a[0] + 18, a[1] + 18, 0], [b[0] + 18, b[1] + 18, 0], P), { tone: 'mid' }));
  out.push(c.D([c.at([a[0] + 18, a[1] + 18, 0]), c.at([b[0] + 18, b[1] + 18, 0])], { size: 1.6, tone: 'hi' }));
  out.push(c.engrave('120', 26, 26, 0, 9, 'hi', 'middle', 'y'));
  // Axis gizmo and nodes at the motor centres.
  const o: Point3 = [-128, -128, 0];
  out.push(c.L(k.segment(o, [o[0] + 28, o[1], 0], P), { tone: 'hi' }), c.L(k.segment(o, [o[0], o[1] + 28, 0], P), { tone: 'mid' }), c.L(k.segment(o, [o[0], o[1], 28], P), { tone: 'lit' }));
  out.push(c.D(seg.rings.filter((q) => q.r === 9).map((q) => c.at(q.c)), { size: 1.6, tone: 'hi' }));
  return out.join('');
}

function prototype() {
  const mat: Plan = { x: -140, y: -140, w: 280, d: 280, r: 4 };
  const out: string[] = [c.box(mat, -2, 2, { tone: 'lo', crease: 'faint' }, 3)];
  const lines: string[] = [];
  for (let x = mat.x + 20; x < mat.x + mat.w; x += 20) lines.push(k.lineOnTop([x, mat.y], [x, mat.y + mat.d], 0, P));
  for (let y = mat.y + 20; y < mat.y + mat.d; y += 20) lines.push(k.lineOnTop([mat.x, y], [mat.x + mat.w, y], 0, P));
  out.push(c.L(lines.join(''), { tone: 'faint' }));
  out.push(c.halo({ x: -60, y: -60, w: 120, d: 120, r: 30 }, 0));
  out.push(drone(c, { z0: 10, build: 'proto' }));
  return out.join('');
}

function product() {
  const out: string[] = [];
  // Landing pad under the hovering drone.
  const pad: Point3 = [-46, 46, 0];
  out.push(c.post(pad[0], pad[1], 62, -3, 3, { tone: 'lo', crease: 'faint' }, 64));
  out.push(c.L(k.ring(pad[0], pad[1], 52, 0, P, 56), { tone: 'lo', dashed: true }));
  out.push(c.L(k.lineOnTop([pad[0] - 12, pad[1] - 16], [pad[0] - 12, pad[1] + 16], 0, P) + k.lineOnTop([pad[0] + 12, pad[1] - 16], [pad[0] + 12, pad[1] + 16], 0, P) + k.lineOnTop([pad[0] - 12, pad[1]], [pad[0] + 12, pad[1]], 0, P), { tone: 'mid' }));
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: pad[0] - 40, y: pad[1] - 40, w: 80, d: 80, r: 40 }, 0, 0.1, P)}" style="opacity:.35"/>`);
  out.push(rover(c, { ox: 72, oy: -58, z0: 0 }));
  out.push(drone(c, { ox: pad[0], oy: pad[1], z0: 78, build: 'final' }));
  return out.join('');
}

const journey: Record<string, () => string> = { idea, model, prototype, product };

export function journeyFigure(id: string, label: string) {
  const build = journey[id];
  if (!build) return '';
  return k.figureSvg({
    width: JOURNEY_W,
    height: JOURNEY_H,
    label,
    className: `bp-svg bp-draw${id === 'idea' ? ' bp-svg--sketch' : ''}${id === 'model' ? ' bp-svg--wire' : ''}`,
    body: build(),
  });
}

/* ---------------------------------------------------------- three forces */

export const FORCE_W = 420;
export const FORCE_H = 300;
const FP = k.fitProjection(k.boxCorners({ x: -100, y: -80, w: 200, d: 160, r: 0 }, -10, 60), FORCE_W, FORCE_H, { pad: 6 });
const f = ctx(FP);

/** A flight-controller board, as a repeatable unit: same parts every time. */
function fcBoard(ox: number, oy: number, ghost = false) {
  const plan: Plan = { x: ox - 34, y: oy - 34, w: 68, d: 68, r: 4 };
  const style = ghost ? 'bp-ghost' : '';
  return `<g class="${style}">`
    + f.halo(k.insetPlan(plan, 4), 0)
    + k.corners(plan, 6).map(([x, y]) => f.post(x, y, 2.4, 0, 6, { tone: 'mid', crease: 'none' }, 10)).join('')
    + f.box(plan, 6, 2.4, { tone: 'mid', crease: 'lo' }, 4, 0.6)
    + k.corners(plan, 6).map(([x, y]) => hole(f, x, y, 8.4, 2.4)).join('')
    + ic(f, { cx: ox, cy: oy, z: 8.4, w: 22, d: 22, h: 2.4, pins: 7, sides: 4, mark: 'FC', markSize: 4, lit: !ghost })
    + smd(f, ox - 22, oy + 22, 8.4, 'x') + smd(f, ox + 22, oy - 22, 8.4, 'y')
    + f.box({ x: ox + 18, y: oy + 14, w: 12, d: 14, r: 1 }, 8.4, 5, { tone: 'hi', crease: 'lo' }, 2)
    + `</g>`;
}

function forceBuild() {
  const out: string[] = [];
  // The SOP / BOM sheet with its checked rows.
  const sheet: Plan = { x: -100, y: 10, w: 80, d: 70, r: 0.5 };
  out.push(f.box(sheet, 0, 0.6, { tone: 'mid', crease: 'none' }, 2));
  out.push(f.engrave('BOM · SOP · QA', sheet.x + 6, sheet.y + 10, 0.6, 5.4, 'hi'));
  for (let i = 0; i < 5; i++) {
    const y = sheet.y + 20 + i * 10;
    out.push(f.L(k.lineOnTop([sheet.x + 16, y], [sheet.x + 64 - (i % 2) * 14, y], 0.6, FP), { tone: 'lo', free: true }));
    out.push(f.L(k.onTop([[sheet.x + 6, y - 1], [sheet.x + 8, y + 1.5], [sheet.x + 12, y - 3]], 0.6, FP), { tone: 'lit' }));
  }
  out.push(fcBoard(-46, -40));
  out.push(fcBoard(50, -4, true));
  out.push(`<g class="bp-led bp-force-led">${f.D([f.at([68, 14, 13.4])], { size: 2.6, tone: 'hi' })}</g>`);
  return out.join('');
}

function forceTest() {
  const out: string[] = [];
  const bed: Plan = { x: -86, y: -60, w: 172, d: 120, r: 3 };
  out.push(f.halo(k.insetPlan(bed, 6), -6));
  out.push(f.box(bed, -6, 6, { tone: 'mid', crease: 'lo' }, 3, 0.8));
  out.push(f.L(k.planOutline(k.insetPlan(bed, 6), 0, FP, 3), { tone: 'lo' }));
  // Rollers under each wheel: the rover runs in place while it's measured.
  const rollers: { at: Point3; svg: string }[] = [];
  for (const wx of [-30, 30]) for (const sx of [-9, 9]) {
    rollers.push({ at: [wx + sx, 0, 4], svg: drum(f, [wx + sx, 0, 4], 5, 100, 'y', { hub: 0 }) });
  }
  out.push(f.sorted(rollers));
  out.push(`<g transform="${k.translateAlong(FP, [0, 0, -4])}">${rover(f, { z0: 0 })}</g>`);
  // The test box with its trace, cabled to the rig.
  const box: Plan = { x: 64, y: 60, w: 40, d: 26, r: 2 };
  out.push(f.box(box, 0, 24, { tone: 'mid', crease: 'lo' }, 3, 0.6));
  const scr = [[box.x + 4, box.y + box.d, 4], [box.x + 36, box.y + box.d, 4], [box.x + 36, box.y + box.d, 20], [box.x + 4, box.y + box.d, 20]] as Point3[];
  out.push(f.L(f.path3(scr, true), { tone: 'mid' }));
  const wave: Point3[] = [];
  for (let i = 0; i <= 28; i++) wave.push([box.x + 6 + i, box.y + box.d, 12 + Math.sin(i * 0.7) * 4 * (i % 7 < 5 ? 1 : 0.3)]);
  out.push(f.L(f.path3(wave), { tone: 'lit' }));
  out.push(`<path class="iso-line bp-cable" data-tone="mid" d="${f.path3([[box.x + 4, box.y + 6, 12], [56, 40, 4], [40, 26, 2]])}"/>`);
  out.push(`<g class="bp-led bp-force-led">${f.D([f.at([box.x + 32, box.y + 6, 24])], { size: 2.6, tone: 'hi' })}</g>`);
  return out.join('');
}

function forceDeploy() {
  const out: string[] = [];
  const pad: Point3 = [-20, -20, 0];
  out.push(f.post(pad[0], pad[1], 44, -3, 3, { tone: 'lo', crease: 'faint' }, 56));
  out.push(f.L(k.lineOnTop([pad[0] - 9, pad[1] - 12], [pad[0] - 9, pad[1] + 12], 0, FP) + k.lineOnTop([pad[0] + 9, pad[1] - 12], [pad[0] + 9, pad[1] + 12], 0, FP) + k.lineOnTop([pad[0] - 9, pad[1]], [pad[0] + 9, pad[1]], 0, FP), { tone: 'mid' }));
  // Parcels already delivered, to more than one customer.
  out.push(f.box({ x: 46, y: 36, w: 30, d: 24, r: 1 }, 0, 20, { tone: 'hi', crease: 'lo' }, 2, 0.6));
  out.push(f.box({ x: 70, y: -10, w: 26, d: 22, r: 1 }, 0, 18, { tone: 'hi', crease: 'lo' }, 2, 0.6));
  out.push(f.L(k.lineOnTop([46, 48], [76, 48], 20, FP) + k.lineOnTop([70, 1], [96, 1], 18, FP), { tone: 'lo' }));
  // The drone is drawn at 62% so it fits the card; it scales about its own centre.
  const [cx, cy] = f.at([pad[0], pad[1], 70]);
  out.push(`<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(0.62) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})">${drone(f, { ox: pad[0], oy: pad[1], z0: 70, build: 'final', parcel: true })}</g>`);
  out.push(`<g class="bp-led bp-force-led">${f.D([f.at([88, 1, 18])], { size: 2.6, tone: 'hi' })}</g>`);
  return out.join('');
}

const forces: Record<string, () => string> = { build: forceBuild, test: forceTest, deploy: forceDeploy };

export function forceFigure(id: string, label: string) {
  const build = forces[id];
  if (!build) return '';
  return k.figureSvg({ width: FORCE_W, height: FORCE_H, label, className: 'bp-svg bp-draw', body: build() });
}
