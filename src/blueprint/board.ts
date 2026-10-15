/**
 * The loop · sense → decide → act, as one real board seen in three cards.
 *
 * A sensor breakout on a pin header reads the world (SENSE), a QFP
 * microcontroller decides (DECIDE), and a driver IC switches a geared motor
 * through a screw terminal (ACT). Each card frames its own block of the same
 * board, so the copper runs out of one card and into the next. Every net is
 * drawn twice: once as the trace, once as a lit pulse path the page runs
 * along it, stage by stage.
 */
import { k, ctx, ic, smd, header, hole, type Ctx, type Plan, type Point3 } from './parts';

export const CARD_W = 400;
export const CARD_H = 320;

const PCB: Plan = { x: -170, y: -80, w: 340, d: 160, r: 7 };
const PCB_H = 4;
const Z = PCB_H;

const SENSOR = { x: -122, y: -10 };
const MCU = { x: 0, y: -4 };
const DRIVER = { x: 82, y: -22 };
const TERMINAL = { x: 136, y: 30 };
const MOTOR = { x: 128, y: -44 };
const MOTOR_R = 20;
const MOTOR_TOP = 64;

type Net = { stage: 'sense' | 'decide' | 'act'; pts: [number, number][] };

/** Copper between the parts, routed with 45° corners. */
const nets: Net[] = [
  // sensor header → MCU west pins
  ...[-6, 0, 6].map((o, i): Net => ({ stage: 'sense', pts: [[-110, -18 + i * 6], [-70, -18 + i * 6], [-58, -10 + o], [-24, -10 + o]] })),
  // MCU east pins → driver inputs
  ...[0, 1, 2].map((i): Net => ({ stage: 'decide', pts: [[24, -14 + i * 6], [44, -14 + i * 6], [52, -24 + i * 4], [66, -24 + i * 4]] })),
  // driver outputs → screw terminal
  ...[0, 1].map((i): Net => ({ stage: 'act', pts: [[98, -14 + i * 6], [112, -14 + i * 6], [124, 2 + i * 6], [124, 24]] })),
];

function pcb(c: Ctx) {
  const out: string[] = [c.halo(k.insetPlan(PCB, 8), -14)];
  // Standoffs under the board.
  const feet = k.corners(PCB, 10);
  out.push(c.sorted(feet.map(([x, y]) => ({ at: [x, y, -14] as Point3, svg: c.post(x, y, 4.2, -14, 14, { tone: 'lo' }, 6) }))));
  out.push(c.box(PCB, 0, PCB_H, { tone: 'mid', crease: 'lo' }, 6, 1.2));
  out.push(c.L(k.sideSeam(PCB, 2, c.P, 6), { tone: 'faint' }));
  out.push(c.L(k.planOutline(k.insetPlan(PCB, 4), Z, c.P, 6), { tone: 'faint' }));
  out.push(feet.map(([x, y]) => hole(c, x, y, Z, 3.2)).join(''));
  // Silkscreen: block outlines and their names.
  const block = (p: Plan) => c.L(k.planOutline(p, Z, c.P, 2), { tone: 'lo', dashed: true });
  out.push(block({ x: -160, y: -66, w: 82, d: 120, r: 3 }));
  out.push(block({ x: -40, y: -50, w: 84, d: 102, r: 3 }));
  out.push(block({ x: 58, y: -70, w: 104, d: 136, r: 3 }));
  out.push(c.engrave('SENSE', -156, 50, Z, 7, 'mid'));
  out.push(c.engrave('DECIDE', -36, 48, Z, 7, 'mid'));
  out.push(c.engrave('ACT', 62, 62, Z, 7, 'mid'));
  out.push(c.engrave('TRILIGHT · S-D-A v1.0', 162, 76, Z, 4.4, 'lo', 'end'));
  // Ground pour stitching along the edges.
  const vias: [number, number][] = [];
  for (let x = -150; x <= 150; x += 12) vias.push([x, -73], [x, 73]);
  out.push(c.D(vias.map(([x, y]) => c.at([x, y, Z])), { size: 0.7, tone: 'lo' }));
  return out.join('');
}

function copper(c: Ctx) {
  const traces = nets.map((n) => k.onTop(n.pts, Z, c.P)).join('');
  const ends = nets.flatMap((n) => [n.pts[0]!, n.pts[n.pts.length - 1]!]);
  const pulses = nets
    .map((n) => `<path class="bp-pulse" data-net="${n.stage}" pathLength="1" d="${k.onTop(n.pts, Z + 0.1, c.P)}"/>`)
    .join('');
  return c.L(traces, { tone: 'mid' }) + c.D(ends.map(([x, y]) => c.at([x, y, Z])), { size: 1, tone: 'hi' }) + pulses;
}

function sensor(c: Ctx) {
  const { x, y } = SENSOR;
  const bz = Z + 10;
  const plan: Plan = { x: x - 26, y: y - 34, w: 44, d: 60, r: 3 };
  const out: string[] = [];
  out.push(header(c, -110, -18, Z, 1, 6, 3));
  out.push(c.box(plan, bz, 2.4, { tone: 'mid', crease: 'lo' }, 3, 0.6));
  out.push(hole(c, plan.x + 6, plan.y + 6, bz + 2.4, 2.2) + hole(c, plan.x + plan.w - 6, plan.y + 6, bz + 2.4, 2.2));
  // The sensing element: a ToF / optical sensor with a lens window.
  const sz = bz + 2.4;
  out.push(c.box({ x: x - 6, y: y - 4, w: 20, d: 16, r: 1.6 }, sz, 4, { tone: 'hi', crease: 'lo', lit: true }, 3, 0.5));
  out.push(c.L(k.ring(x + 0, y + 4, 3.2, sz + 4, c.P, 24) + k.ring(x + 8, y + 4, 3.2, sz + 4, c.P, 24), { tone: 'lit' }));
  out.push(c.D([c.at([x, y + 4, sz + 4]), c.at([x + 8, y + 4, sz + 4])], { size: 1, tone: 'hi' }));
  out.push(smd(c, x - 12, y + 18, sz, 'x', 4, 2, 1.2) + smd(c, x + 6, y + 18, sz, 'x', 4, 2, 1.2));
  out.push(c.engrave('ToF', x - 20, y + 26, sz, 4, 'lo'));
  return out.join('');
}

function mcu(c: Ctx) {
  const { x, y } = MCU;
  const out: string[] = [];
  // Crystal and load capacitors north of the MCU.
  out.push(c.box({ x: x - 9, y: y - 40, w: 18, d: 8, r: 3.6 }, Z, 3.2, { tone: 'hi', crease: 'lo' }, 6, 0.5));
  out.push(smd(c, x - 18, y - 36, Z, 'y', 4, 2, 1.2) + smd(c, x + 18, y - 36, Z, 'y', 4, 2, 1.2));
  out.push(ic(c, { cx: x, cy: y, z: Z, w: 40, d: 40, h: 3.2, pins: 12, sides: 4, mark: 'TRL-MCU', markSize: 4.4 }));
  // Decoupling caps around it.
  const caps: { at: Point3; svg: string }[] = [
    { at: [x - 30, y + 30, Z], svg: smd(c, x - 30, y + 30, Z, 'x') },
    { at: [x + 30, y + 30, Z], svg: smd(c, x + 30, y + 30, Z, 'x') },
    { at: [x + 30, y - 30, Z], svg: smd(c, x + 30, y - 30, Z, 'x') },
  ];
  out.push(c.sorted(caps));
  // Status LED, lit while the loop runs.
  out.push(c.box({ x: x - 34, y: y + 38, w: 6, d: 4, r: 0.6 }, Z, 1.6, { tone: 'mid', crease: 'none' }, 2));
  out.push(`<g class="bp-led">${c.D([c.at([x - 31, y + 40, Z + 1.6])], { size: 2.2, tone: 'hi' })}</g>`);
  return out.join('');
}

function driver(c: Ctx) {
  const { x, y } = DRIVER;
  return ic(c, { cx: x, cy: y, z: Z, w: 24, d: 30, h: 3, pins: 6, sides: 2, mark: 'DRV' , markSize: 4 })
    + smd(c, x + 2, y + 30, Z, 'x');
}

function terminal(c: Ctx) {
  const { x, y } = TERMINAL;
  const plan: Plan = { x: x - 18, y: y - 8, w: 36, d: 20, r: 1.4 };
  const out: string[] = [c.box(plan, Z, 14, { tone: 'mid', crease: 'lo' }, 3, 0.6)];
  const screws = [x - 9, x + 9];
  for (const sx of screws) {
    out.push(c.post(sx, y + 2, 4.4, Z + 14, 1.6, { tone: 'hi', crease: 'lo' }, 24));
    out.push(c.L(k.lineOnTop([sx - 3, y + 2], [sx + 3, y + 2], Z + 15.6, c.P), { tone: 'mid' }));
  }
  return out.join('');
}

/** Pre-built marker positions for the motor's output shaft, one per step. */
export const MOTOR_STEPS = 24;

function motor(c: Ctx) {
  const { x, y } = MOTOR;
  const out: string[] = [];
  const bracket: Plan = { x: x - 26, y: y - 26, w: 52, d: 52, r: 3 };
  out.push(c.box(bracket, Z, 4, { tone: 'mid', crease: 'lo' }, 3, 0.6));
  out.push(c.D(k.corners(bracket, 5).map(([px, py]) => c.at([px, py, Z + 4])), { size: 0.8, tone: 'mid' }));
  out.push(c.post(x, y, MOTOR_R, Z + 4, 40, { tone: 'mid', crease: 'lo' }, 56));
  out.push(c.L(k.sideArc(x, y, MOTOR_R, Z + 14, c.P, 40) + k.sideArc(x, y, MOTOR_R, Z + 34, c.P, 40), { tone: 'faint' }));
  out.push(c.L(k.knurl(x, y, MOTOR_R, Z + 16, Z + 32, 40, c.P, 0.5), { tone: 'faint' }));
  out.push(c.post(x, y, MOTOR_R - 3, Z + 44, 6, { tone: 'hi', crease: 'lo' }, 48));
  out.push(c.post(x, y, 3, Z + 50, 4, { tone: 'hi', crease: 'lo' }, 16));
  // Output pulley with a timing mark the page turns.
  const pz = MOTOR_TOP - 4;
  out.push(c.post(x, y, 11, pz, 6, { tone: 'hi', crease: 'lo', lit: true }, 40));
  out.push(c.L(k.knurl(x, y, 11, pz + 0.5, pz + 5.5, 30, c.P, 0.4), { tone: 'lo' }));
  out.push(c.L(k.ring(x, y, 3, pz + 6, c.P, 16), { tone: 'mid' }));
  const marks = Array.from({ length: MOTOR_STEPS }, (_, i) => {
    const a = (i / MOTOR_STEPS) * Math.PI * 2;
    return k.lineOnTop([x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6], [x + Math.cos(a) * 10, y + Math.sin(a) * 10], pz + 6.1, c.P);
  });
  out.push(`<path class="iso-line bp-shaft" data-tone="lit" data-free="end" d="${marks[0]}" data-steps='${JSON.stringify(marks)}'/>`);
  // Leads from the motor down to the screw terminal.
  const lead = (dx: number) => {
    const pts: Point3[] = [[x + 12 + dx, y + 16, Z + 10], [x + 14 + dx, y + 40, Z + 18], [TERMINAL.x - 9 + dx * 2.2, TERMINAL.y - 8, Z + 8]];
    return `<path class="iso-line bp-cable" data-tone="mid" d="${c.path3(pts)}"/>`;
  };
  out.push(lead(0) + lead(5));
  return out.join('');
}

type Stage = 'sense' | 'decide' | 'act';

/** The board block each card frames (its silkscreen outline), and how tall its parts stand. */
const REGIONS: Record<Stage, { plan: Plan; top: number }> = {
  sense: { plan: { x: -160, y: -66, w: 82, d: 120, r: 0 }, top: 30 },
  decide: { plan: { x: -40, y: -50, w: 84, d: 102, r: 0 }, top: 12 },
  act: { plan: { x: 58, y: -70, w: 104, d: 136, r: 0 }, top: MOTOR_TOP + 4 },
};

export function loopCard(stage: Stage, label: string) {
  const r = REGIONS[stage];
  const P = k.fitProjection(k.boxCorners(r.plan, 0, r.top), CARD_W, CARD_H, { pad: 26 });
  const c = ctx(P);
  // The card shows its own parts; the board and its copper run on past the frame.
  const parts =
    stage === 'sense' ? sensor(c)
      : stage === 'decide' ? mcu(c)
        : c.sorted([
          { at: [DRIVER.x, DRIVER.y, Z], svg: driver(c) },
          { at: [MOTOR.x, MOTOR.y, Z], svg: motor(c) },
          { at: [TERMINAL.x, TERMINAL.y, Z], svg: terminal(c) },
        ]);
  return k.figureSvg({
    width: CARD_W,
    height: CARD_H,
    label,
    className: 'bp-svg bp-svg--crop bp-draw',
    body: [pcb(c), copper(c), parts].join(''),
  });
}
