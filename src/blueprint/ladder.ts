/**
 * The field node: a custom PCB in an open enclosure at a host site, wired to
 * a soil probe (TRL 5, proof of concept). Drawn for "What it takes".
 */
import { k, ctx, ic, smd, hole, type Plan, type Point3 } from './parts';

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

/* ------------------------------------------------------------------ stages */

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

const builders: Record<string, () => string> = { trl5: proofOfConcept };

export function stageFigure(id: string, label: string) {
  const build = builders[id];
  if (!build) return '';
  return k.figureSvg({
    width: STAGE_W,
    height: STAGE_H,
    label,
    className: 'bp-svg bp-draw',
    body: build(),
  });
}
