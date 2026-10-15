/**
 * The vehicles the ladder grows into: a quadcopter drone and a robotic rover,
 * built from the kit's solids so they share the blueprint's line, tone and
 * hidden-line rules.
 *
 * The drone comes in two builds on one frame:
 *   proto  bare carbon frame, flight-controller board with its chip, ESC
 *          leads running out along the arms, battery strapped on, no props
 *   final  canopy, GPS puck, antenna, props, camera gimbal, landing skids
 */
import { k, ic, smd, drum, bar, type Ctx, type Plan, type Point3 } from './parts';

const DIAG: [number, number][] = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
const ARM_R0 = 18;
const ARM_R1 = 88;
const BODY_H = 14;

export type DroneBuild = 'proto' | 'final';

export function drone(c: Ctx, { ox = 0, oy = 0, z0 = 30, build = 'final' as DroneBuild, parcel = false } = {}) {
  const items: { at: Point3; svg: string }[] = [];
  const s2 = Math.SQRT1_2;
  const body: Plan = { x: ox - 28, y: oy - 28, w: 56, d: 56, r: 9 };
  const top = z0 + BODY_H;

  // Landing skids and their posts (final build), or short standoffs (proto).
  if (build === 'final') {
    for (const sy of [-1, 1]) {
      const y = oy + sy * 22;
      items.push({ at: [ox, y, z0 - 26], svg: c.box({ x: ox - 36, y: y - 2, w: 72, d: 4, r: 2 }, z0 - 26, 3, { tone: 'mid', crease: 'lo' }, 3) });
      for (const sx of [-1, 1]) items.push({ at: [ox + sx * 16, y, z0 - 23], svg: c.post(ox + sx * 16, y, 1.6, z0 - 23, 23, { tone: 'mid', crease: 'none' }, 10) });
    }
  } else {
    for (const [sx, sy] of DIAG) items.push({ at: [ox + sx * 20, oy + sy * 20, z0 - 8], svg: c.post(ox + sx * 20, oy + sy * 20, 2.2, z0 - 8, 8, { tone: 'mid', crease: 'none' }, 10) });
  }
  if (parcel) {
    // A parcel on a winch line under the body.
    items.push({ at: [ox, oy, z0 - 60], svg: c.box({ x: ox - 16, y: oy - 13, w: 32, d: 26, r: 1 }, z0 - 64, 22, { tone: 'hi', crease: 'lo' }, 2, 0.6)
      + c.L(k.lineOnTop([ox - 16, oy], [ox + 16, oy], z0 - 42, c.P), { tone: 'lo' })
      + c.L(k.segment([ox, oy, z0 - 42], [ox, oy, z0], c.P), { tone: 'mid' }) });
  }

  // Arms and motors, each anchored where it stands so the painter's order holds.
  for (const [sx, sy] of DIAG) {
    const u: [number, number] = [sx * s2, sy * s2];
    const a: [number, number] = [ox + u[0] * ARM_R0, oy + u[1] * ARM_R0];
    const b: [number, number] = [ox + u[0] * ARM_R1, oy + u[1] * ARM_R1];
    const m: [number, number] = [ox + u[0] * (ARM_R1 + 4), oy + u[1] * (ARM_R1 + 4)];
    const armZ = z0 + 4;
    let svg = bar(c, a, b, 9, armZ, 5, { tone: 'mid', crease: 'lo' });
    // Motor mount plate, stator can and bell.
    svg += c.post(m[0], m[1], 11, armZ, 3, { tone: 'mid', crease: 'lo' }, 28);
    svg += c.post(m[0], m[1], 9, armZ + 3, 9, { tone: 'hi', crease: 'lo' }, 28);
    svg += c.L(k.knurl(m[0], m[1], 9, armZ + 4, armZ + 11, 22, c.P, 0.4), { tone: 'faint' });
    svg += c.post(m[0], m[1], 2, armZ + 12, 4, { tone: 'hi', crease: 'none' }, 10);
    if (build === 'final') {
      // Prop: two blades and the disc they sweep.
      const pz = armZ + 16;
      const ang = Math.atan2(u[1], u[0]) + Math.PI / 2;
      const d: [number, number] = [Math.cos(ang) * 30, Math.sin(ang) * 30];
      svg += c.L(k.ring(m[0], m[1], 31, pz, c.P, 48), { tone: 'faint', dashed: true });
      svg += bar(c, [m[0] - d[0], m[1] - d[1]], [m[0] + d[0], m[1] + d[1]], 5, pz, 1.2, { tone: 'hi', crease: 'none' });
      svg += c.post(m[0], m[1], 3.4, pz, 2.4, { tone: 'hi', crease: 'lo' }, 14);
    } else {
      // ESC on the arm and its leads back to the frame.
      const e: [number, number] = [ox + u[0] * 50, oy + u[1] * 50];
      svg += c.box({ x: e[0] - 6, y: e[1] - 6, w: 12, d: 12, r: 1 }, armZ + 5, 3, { tone: 'hi', crease: 'lo' }, 2, 0.4);
      svg += `<path class="iso-line bp-cable" data-tone="mid" d="${c.path3([[m[0] - u[0] * 8, m[1] - u[1] * 8, armZ + 8], [e[0] + u[0] * 6, e[1] + u[1] * 6, armZ + 9], [ox + u[0] * 24, oy + u[1] * 24, top + 2]])}"/>`;
    }
    items.push({ at: [m[0], m[1], armZ], svg });
  }

  // The body and what sits on it.
  let core = c.box(body, z0, BODY_H, { tone: 'mid', crease: 'lo' }, 6, 1);
  core += c.L(k.sideSeam(body, z0 + 4, c.P, 6), { tone: 'faint' });
  if (build === 'final') {
    const can = k.insetPlan(body, 5);
    core += c.box(can, top, 8, { tone: 'hi', crease: 'lo' }, 8, 1.4);
    core += c.L(k.planOutline(k.insetPlan(can, 5), top + 8, c.P, 6), { tone: 'lo' });
    core += c.post(ox - 4, oy - 4, 9, top + 8, 4, { tone: 'hi', crease: 'lo' }, 28);
    core += c.post(ox - 18, oy + 14, 1.4, top + 8, 18, { tone: 'mid', crease: 'none' }, 8);
    core += `<g class="bp-led is-on">${c.D([c.at([ox + 16, oy + 16, top + 8])], { size: 2.2, tone: 'hi' })}</g>`;
    // Camera gimbal under the near corner.
    core += c.post(ox + 18, oy + 18, 2.4, z0 - 8, 8, { tone: 'mid', crease: 'none' }, 10);
    core += drum(c, [ox + 18, oy + 18, z0 - 14], 7, 12, 'x', { hub: 0.5, lit: true });
  } else {
    // Flight controller: board on standoffs with the chip lit, battery behind.
    core += c.box({ x: ox - 22, y: oy - 26, w: 44, d: 14, r: 2 }, top, 9, { tone: 'mid', crease: 'lo' }, 3, 0.6);
    core += c.L([0.3, 0.7].map((t) => k.lineOnTop([ox - 22 + 44 * t, oy - 26], [ox - 22 + 44 * t, oy - 12], top + 9, c.P)).join(''), { tone: 'lo' });
    const fc: Plan = { x: ox - 18, y: oy - 8, w: 36, d: 32, r: 2 };
    core += c.box(fc, top + 3, 1.6, { tone: 'mid', crease: 'lo' }, 3, 0.4);
    core += ic(c, { cx: ox, cy: oy + 8, z: top + 4.6, w: 14, d: 14, h: 2, pins: 5, sides: 4, lit: true });
    core += smd(c, ox - 12, oy + 20, top + 4.6, 'x', 4, 2, 1.2) + smd(c, ox + 12, oy - 2, top + 4.6, 'y', 4, 2, 1.2);
  }
  items.push({ at: [ox, oy, z0], svg: core });
  return c.sorted(items);
}

/** A four-wheeled robotic rover: chassis, wheels, sensor mast, lidar, camera. */
export function rover(c: Ctx, { ox = 0, oy = 0, z0 = 0 } = {}) {
  const R = 14;
  const cz = z0 + R;
  const chassis: Plan = { x: ox - 46, y: oy - 28, w: 92, d: 56, r: 6 };
  const deck = z0 + R + 18;
  const wheels = [[-30, -1], [30, -1], [-30, 1], [30, 1]].map(([dx, sy]) => ({
    at: [ox + dx!, oy + sy! * 35, cz] as Point3,
    svg: drum(c, [ox + dx!, oy + sy! * 35, cz], R, 12, 'y', { hub: 0.45, treads: 14 }),
    near: sy! > 0,
  }));
  const out: string[] = [];
  out.push(c.halo(k.insetPlan(chassis, -6), z0));
  out.push(c.sorted(wheels.filter((w) => !w.near)));
  out.push(c.box(chassis, z0 + R - 4, 22, { tone: 'mid', crease: 'lo' }, 6, 1));
  out.push(c.L(k.sideSeam(chassis, z0 + R + 4, c.P, 6), { tone: 'faint' }));
  // Bumper and camera on the +x nose.
  out.push(c.box({ x: ox + 46, y: oy - 20, w: 5, d: 40, r: 2 }, z0 + R - 2, 8, { tone: 'hi', crease: 'lo' }, 3));
  const cam: Point3 = [ox + 46, oy, deck - 7];
  out.push(c.L(k.sideRing(cam, 4.5, 'x', c.P, 20) + k.sideRing(cam, 2.4, 'x', c.P, 16), { tone: 'lit' }));
  // Deck: lid seam, vents, mast with lidar, antenna, status light.
  out.push(c.L(k.planOutline(k.insetPlan(chassis, 6), deck, c.P, 6), { tone: 'lo' }));
  out.push(c.L([0, 1, 2, 3].map((i) => k.lineOnTop([ox - 36 + i * 5, oy + 10], [ox - 36 + i * 5, oy + 20], deck, c.P)).join(''), { tone: 'faint' }));
  out.push(c.post(ox + 12, oy - 6, 4, deck, 16, { tone: 'mid', crease: 'lo' }, 16));
  out.push(c.post(ox + 12, oy - 6, 10, deck + 16, 7, { tone: 'hi', crease: 'lo', lit: true }, 32));
  out.push(c.L(k.sideArc(ox + 12, oy - 6, 10, deck + 19.5, c.P, 28), { tone: 'lit' }));
  out.push(c.post(ox - 30, oy - 18, 1.4, deck, 22, { tone: 'mid', crease: 'none' }, 8));
  out.push(`<g class="bp-led is-on">${c.D([c.at([ox - 30, oy + 4, deck])], { size: 2.2, tone: 'hi' })}</g>`);
  out.push(c.sorted(wheels.filter((w) => w.near)));
  return out.join('');
}

/**
 * The drone as plain world segments, for drawings of it: the sketch maps
 * them onto paper, the simulation shows them as a wireframe.
 */
export function droneSegments(ox = 0, oy = 0, z0 = 30): { solid: [Point3, Point3][]; dashed: [Point3, Point3][]; rings: { c: Point3; r: number; dashed?: boolean }[] } {
  const solid: [Point3, Point3][] = [];
  const dashed: [Point3, Point3][] = [];
  const rings: { c: Point3; r: number; dashed?: boolean }[] = [];
  const s2 = Math.SQRT1_2;
  const top = z0 + BODY_H;
  const sq = (z: number, h: number): Point3[] => [[ox - h, oy - h, z], [ox + h, oy - h, z], [ox + h, oy + h, z], [ox - h, oy + h, z]];
  for (const [z, h] of [[z0, 28], [top, 28], [top, 23], [top + 8, 23]] as const) {
    const p = sq(z, h);
    p.forEach((q, i) => solid.push([q, p[(i + 1) % 4]!]));
  }
  sq(z0, 28).forEach((q, i) => solid.push([q, sq(top, 28)[i]!]));
  sq(top, 23).forEach((q, i) => solid.push([q, sq(top + 8, 23)[i]!]));
  for (const [sx, sy] of DIAG) {
    const u = [sx * s2, sy * s2];
    const m: Point3 = [ox + u[0]! * (ARM_R1 + 4), oy + u[1]! * (ARM_R1 + 4), z0 + 4];
    solid.push([[ox + u[0]! * ARM_R0, oy + u[1]! * ARM_R0, z0 + 6], [m[0], m[1], z0 + 6]]);
    rings.push({ c: [m[0], m[1], z0 + 16], r: 9 });
    rings.push({ c: [m[0], m[1], z0 + 7], r: 9 });
    rings.push({ c: [m[0], m[1], z0 + 20], r: 31, dashed: true });
    solid.push([[m[0], m[1], z0 + 7], [m[0], m[1], z0 + 20]]);
  }
  for (const sy of [-1, 1]) {
    solid.push([[ox - 36, oy + sy * 22, z0 - 26], [ox + 36, oy + sy * 22, z0 - 26]]);
    for (const sx of [-1, 1]) dashed.push([[ox + sx * 16, oy + sy * 22, z0 - 26], [ox + sx * 16, oy + sy * 22, z0]]);
  }
  return { solid, dashed, rings };
}
