/**
 * Shared drawing helpers for the blueprint figures: a small context bound to
 * one projection, plus the electronic parts the figures are built from
 * (packages with leads, passives, headers, jumper wires).
 *
 * World units are about 1 px of the real thing, x and y on the floor, z up.
 * Everything here returns SVG strings; nothing runs in the browser.
 */
import * as k from './iso-kit';
import type { Plan, Plane, Point3, Projection, Tone } from './iso-kit';

export { k };
export type { Plan, Plane, Point3, Projection };

/** Deterministic noise so every build draws the same traces. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function ctx(P: Projection) {
  const at = (p: Point3) => k.iso(p, P);
  const S = (paths: k.SolidPaths, style?: k.SolidStyle) => k.solidSvg(paths, style);
  const L = (d: string, style?: k.LineStyle) => k.lineSvg(d, style);
  const D = (points: Array<[number, number] | [number, number, number]>, style?: { size?: number; tone?: Tone; pulse?: boolean }) =>
    k.dotsSvg(points, style);
  const depth = (p: Point3) => k.depthOf(p, P);
  /** Paints items back to front by the depth of their anchor point. */
  const sorted = (items: { at: Point3; svg: string }[]) =>
    [...items].sort((a, b) => depth(a.at) - depth(b.at)).map((i) => i.svg).join('');
  const box = (plan: Plan, z: number, h: number, style?: k.SolidStyle, steps = 3, bevel = 0) =>
    S(k.slabOf(plan, z, h, P, steps, bevel), style);
  const post = (x: number, y: number, r: number, z: number, h: number, style?: k.SolidStyle, steps = 20) =>
    S(k.cylinder(x, y, r, z, h, P, steps), style);
  /** A polyline through world points. */
  const path3 = (pts: Point3[], closed = false) => k.pathOf(pts.map(at), closed);
  /** Text lying flat on a top face. */
  const engrave = (text: string, x: number, y: number, z: number, size: number, tone: Tone = 'mid', anchor: 'start' | 'middle' | 'end' = 'start', along: 'x' | 'y' = 'x') =>
    k.faceTextSvg(k.topMatrix([x, y], z, P, along), text, { size, tone, anchor });
  const halo = (plan: Plan, z: number) => `<path class="iso-halo" d="${k.haloOf(plan, z, 0.1, P)}"/>`;
  return { P, at, S, L, D, depth, sorted, box, post, path3, engrave, halo };
}
export type Ctx = ReturnType<typeof ctx>;

const centred = (cx: number, cy: number, w: number, d: number, r = 0.6): Plan => ({ x: cx - w / 2, y: cy - d / 2, w, d, r });

/**
 * A leaded IC package (QFP when `sides` is 4, SOIC when 2) sitting on a board
 * at height z: gull-wing leads, a moulded body with a bevel, a pin-1 dimple
 * and an optional marking. Leads behind the body paint first.
 */
export function ic(
  c: Ctx,
  { cx, cy, z, w, d, h = 3, pins = 8, sides = 4, mark = '', lit = false, markSize = 2.2 }:
  { cx: number; cy: number; z: number; w: number; d: number; h?: number; pins?: number; sides?: 2 | 4; mark?: string; lit?: boolean; markSize?: number },
) {
  const back: { at: Point3; svg: string }[] = [];
  const front: { at: Point3; svg: string }[] = [];
  const lead = (x: number, y: number, lw: number, ld: number) => {
    const svg = c.box(centred(x, y, lw, ld, 0.2), z, 0.9, { tone: 'mid', crease: 'none' }, 2);
    (c.depth([x, y, z]) < c.depth([cx, cy, z]) ? back : front).push({ at: [x, y, z], svg });
  };
  const pitch = (n: number, span: number) => Array.from({ length: n }, (_, i) => -span / 2 + (span / (n - 1)) * i);
  const L = 3.4;
  pitch(pins, d - 4).forEach((o) => { lead(cx - w / 2 - L / 2 + 0.4, cy + o, L, 0.9); lead(cx + w / 2 + L / 2 - 0.4, cy + o, L, 0.9); });
  if (sides === 4) pitch(pins, w - 4).forEach((o) => { lead(cx + o, cy - d / 2 - L / 2 + 0.4, 0.9, L); lead(cx + o, cy + d / 2 + L / 2 - 0.4, 0.9, L); });
  const body = centred(cx, cy, w, d, 0.8);
  return [
    c.sorted(back),
    c.box(body, z + 0.4, h, { tone: 'hi', crease: 'lo', lit }, 3, 0.6),
    c.L(k.ring(cx - w / 2 + 2.6, cy - d / 2 + 2.6, 0.9, z + 0.4 + h, c.P, 14), { tone: 'mid' }),
    mark ? c.engrave(mark, cx, cy + markSize * 0.35, z + 0.4 + h, markSize, 'mid', 'middle') : '',
    c.sorted(front),
  ].join('');
}

/** A two-terminal SMD part (resistor, capacitor): body with metal end caps. */
export function smd(c: Ctx, cx: number, cy: number, z: number, along: 'x' | 'y' = 'x', len = 5, wid = 2.6, h = 1.6) {
  const w = along === 'x' ? len : wid;
  const d = along === 'x' ? wid : len;
  const cap = 1.1;
  const ends = along === 'x'
    ? [centred(cx - len / 2 + cap / 2, cy, cap, wid, 0.2), centred(cx + len / 2 - cap / 2, cy, cap, wid, 0.2)]
    : [centred(cx, cy - len / 2 + cap / 2, wid, cap, 0.2), centred(cx, cy + len / 2 - cap / 2, wid, cap, 0.2)];
  return [
    c.box(ends[0], z, h, { tone: 'mid', crease: 'none' }, 2),
    c.box(centred(cx, cy, along === 'x' ? w - cap * 2 : w, along === 'x' ? d : d - cap * 2, 0.2), z, h, { tone: 'lo', crease: 'none' }, 2),
    c.box(ends[1], z, h, { tone: 'mid', crease: 'none' }, 2),
  ].join('');
}

/** A row of header pins: plastic carrier with square posts sticking up. */
export function header(c: Ctx, x0: number, y: number, z: number, count: number, pitch = 5, rows = 1) {
  const out: { at: Point3; svg: string }[] = [];
  const carrier = { x: x0 - pitch / 2, y: y - pitch / 2, w: pitch * count, d: pitch * rows, r: 0.4 };
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < count; i++) {
      const px = x0 + i * pitch;
      const py = y + r * pitch;
      out.push({ at: [px, py, z], svg: c.box(centred(px, py, 1.2, 1.2, 0.1), z + 3, 6, { tone: 'hi', crease: 'none' }, 2) });
    }
  return c.box(carrier, z, 3, { tone: 'lo' }, 2, 0.4) + c.sorted(out);
}

/** A jumper wire arcing between two points on a board, with its two plugs. */
export function jumper(c: Ctx, a: Point3, b: Point3, lift: number, tone: Tone = 'mid') {
  const pts: Point3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + 4 * lift * t * (1 - t)]);
  }
  return [
    c.post(a[0], a[1], 1.4, a[2], 4, { tone: 'mid', crease: 'none' }, 12),
    c.post(b[0], b[1], 1.4, b[2], 4, { tone: 'mid', crease: 'none' }, 12),
    `<path class="iso-line bp-cable" data-tone="${tone}" d="${c.path3(pts.map(([x, y, z]) => [x, y, z + 4] as Point3))}"/>`,
  ].join('');
}

/** A mounting hole: plated ring with a dark bore. */
export function hole(c: Ctx, x: number, y: number, z: number, r = 3) {
  return c.L(k.ring(x, y, r, z, c.P, 24), { tone: 'mid' }) + c.L(k.ring(x, y, r * 0.55, z, c.P, 20), { tone: 'lo' });
}

/** Wireframe of a box: visible edges solid, hidden edges dashed. */
export function wireBox(c: Ctx, plan: Plan, z0: number, z1: number, tone: Tone = 'hi') {
  const { x, y, w, d } = plan;
  const xs = [x, x + w];
  const ys = [y, y + d];
  const [vx, vy] = k.towardViewer(c.P);
  const hiddenX = vx > 0 ? x : x + w; // the far face along x
  const hiddenY = vy > 0 ? y : y + d;
  const solid: string[] = [];
  const dashed: string[] = [];
  const seg = (p: Point3, q: Point3, hidden: boolean) => (hidden ? dashed : solid).push(k.segment(p, q, c.P));
  for (const zz of [z0, z1]) {
    for (const yy of ys) seg([x, yy, zz], [x + w, yy, zz], zz === z0 && yy === hiddenY);
    for (const xx of xs) seg([xx, y, zz], [xx, y + d, zz], zz === z0 && xx === hiddenX);
  }
  for (const xx of xs) for (const yy of ys) seg([xx, yy, z0], [xx, yy, z1], xx === hiddenX && yy === hiddenY);
  return c.L(dashed.join(''), { tone: 'lo', dashed: true }) + c.L(solid.join(''), { tone });
}
