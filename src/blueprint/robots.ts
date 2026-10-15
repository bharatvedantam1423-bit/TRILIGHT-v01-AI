/**
 * Closing stage: two six-axis robot arms on a workbench either side of a
 * frosted glass block that carries the Trilight logo. The left arm turns to
 * the block and lights it with a teal beam; the right arm turns to watch it.
 *
 * Drawn front-on (a stage, not a plan) in the blueprint palette. Each arm is
 * a chain of joint groups; the static markup holds the final pose, and the
 * page animates every joint in from rest (data-rest → data-pose).
 */
const W = 1600;
const H = 620;
const TABLE = 548;
const CUBE = { x: 650, y: 132, w: 300, h: 330 };

type Pose = { a1: number; a2: number; a3: number };
const SHOULDER: [number, number] = [0, -185];
const ELBOW: [number, number] = [0, -430];
const WRIST: [number, number] = [190, -430];
const TOOL_TIP: [number, number] = [268, -430];

const rad = (d: number) => (d * Math.PI) / 180;
const rot = ([x, y]: [number, number], [cx, cy]: [number, number], deg: number): [number, number] => {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

const f = (n: number) => n.toFixed(1);
const rect = (x: number, y: number, w: number, h: number, r: number, cls = 'rb-part') =>
  `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/>`;
const circle = (x: number, y: number, r: number, cls = 'rb-part') => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
const line = (x1: number, y1: number, x2: number, y2: number, cls = 'rb-detail') => `<path class="${cls}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"/>`;
const joint = (x: number, y: number, r: number) => circle(x, y, r) + circle(x, y, r * 0.62, 'rb-detail') + circle(x, y, r * 0.18, 'rb-hub');

/** One arm, in its own frame: base at the origin on the table, reaching +x. */
function arm(id: string, pose: Pose, rest: Pose, lit: boolean) {
  const g = (name: string, origin: [number, number], a: number, r: number, body: string) =>
    `<g data-joint="${id}-${name}" data-origin="${origin[0]} ${origin[1]}" data-pose="${a}" data-rest="${r}" transform="rotate(${a} ${origin[0]} ${origin[1]})">${body}</g>`;
  const tool = [
    rect(190, -452, 74, 44, 9),
    line(214, -452, 214, -408), line(238, -452, 238, -408),
    rect(262, -444, 10, 28, 3, lit ? 'rb-part rb-lens' : 'rb-part'),
  ].join('');
  const forearm = [
    rect(0, -457, 190, 54, 27),
    line(40, -457, 40, -403), line(150, -457, 150, -403),
    circle(66, -430, 2.6, 'rb-hub'), circle(124, -430, 2.6, 'rb-hub'),
    joint(WRIST[0], WRIST[1], 30),
    g('wrist', WRIST, pose.a3, rest.a3, tool),
  ].join('');
  const upper = [
    rect(-37, -430, 74, 245, 37),
    line(-37, -240, 37, -240), line(-37, -380, 37, -380),
    rect(-14, -350, 28, 90, 6, 'rb-detail'),
    joint(ELBOW[0], ELBOW[1], 44),
    g('elbow', ELBOW, pose.a2, rest.a2, forearm),
  ].join('');
  return [
    rect(-95, -18, 190, 18, 4),
    rect(-70, -110, 140, 92, 10),
    line(-70, -64, 70, -64),
    circle(-48, -40, 3, 'rb-hub'), circle(48, -40, 3, 'rb-hub'),
    rect(-58, -150, 116, 40, 8),
    g('shoulder', SHOULDER, pose.a1, rest.a1, upper + joint(SHOULDER[0], SHOULDER[1], 52)),
  ].join('');
}

/** Where the tool tip ends up, in stage coordinates, for a pose. */
function tipOf(baseX: number, mirror: boolean, pose: Pose): [number, number] {
  let p = rot(TOOL_TIP, WRIST, pose.a3);
  p = rot(p, ELBOW, pose.a2);
  p = rot(p, SHOULDER, pose.a1);
  return [baseX + (mirror ? -p[0] : p[0]), TABLE + p[1]];
}

export function robotStage(label: string) {
  const LX = 300;
  const RX = 1300;
  // Both arms reach up and over toward the block, as in the reference: the
  // left one lights it, the right one looks on. The wrist is solved so each
  // tool points at its spot on the block.
  const solve = (baseX: number, mirror: boolean, a1: number, a2: number, target: [number, number]): Pose => {
    let w = rot(WRIST, ELBOW, a2);
    w = rot(w, SHOULDER, a1);
    const wx = baseX + (mirror ? -w[0] : w[0]);
    const wy = TABLE + w[1];
    const dx = mirror ? -(target[0] - wx) : target[0] - wx;
    const a3 = Math.round((Math.atan2(target[1] - wy, dx) * 180) / Math.PI - a1 - a2);
    return { a1, a2, a3 };
  };
  const left = solve(LX, false, 24, 34, [CUBE.x + 40, CUBE.y + CUBE.h * 0.45]);
  const right = solve(RX, true, 26, 30, [CUBE.x + CUBE.w - 30, CUBE.y + CUBE.h * 0.4]);
  const rest: Pose = { a1: -8, a2: 96, a3: 70 };
  const tip = tipOf(LX, false, left);
  const beamTop: [number, number] = [CUBE.x + CUBE.w * 0.55, CUBE.y + 6];
  const beamBot: [number, number] = [CUBE.x + CUBE.w * 0.78, CUBE.y + CUBE.h - 16];

  const svg = `
<svg class="stage__svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
  <defs>
    <linearGradient id="rb-beam" gradientUnits="userSpaceOnUse" x1="${f(tip[0])}" y1="${f(tip[1])}" x2="${f(beamTop[0])}" y2="${f((beamTop[1] + beamBot[1]) / 2)}">
      <stop offset="0" stop-color="#33dcd9" stop-opacity=".9"/>
      <stop offset=".55" stop-color="#00b6b4" stop-opacity=".35"/>
      <stop offset="1" stop-color="#00b6b4" stop-opacity=".08"/>
    </linearGradient>
    <radialGradient id="rb-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#33dcd9" stop-opacity=".35"/><stop offset="1" stop-color="#33dcd9" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="rb-table" x="0" y="${TABLE}" width="${W}" height="${H - TABLE}"/>
  <path class="rb-edge" d="M0 ${TABLE}H${W}"/>
  <path class="rb-detail" d="M0 ${TABLE + 16}H${W}"/>
  <ellipse class="rb-pool" data-beam cx="${CUBE.x + CUBE.w / 2}" cy="${TABLE - 6}" rx="${CUBE.w * 0.9}" ry="18" fill="url(#rb-pool)"/>
  ${rect(CUBE.x - 70, TABLE - 34, CUBE.w + 140, 34, 3, 'rb-part rb-stone')}
  ${rect(CUBE.x - 44, TABLE - 34 - 26, CUBE.w + 88, 26, 2, 'rb-part rb-stone')}
  ${rect(CUBE.x - 22, CUBE.y + CUBE.h, CUBE.w + 44, TABLE - 60 - CUBE.y - CUBE.h, 2, 'rb-part rb-stone')}
  ${line(CUBE.x - 70, TABLE - 22, CUBE.x + CUBE.w + 70, TABLE - 22)}
  <g transform="translate(${LX} 0) translate(0 ${TABLE})" data-arm="left">${arm('l', left, rest, true)}</g>
  <g transform="translate(${RX} 0) translate(0 ${TABLE}) scale(-1 1)" data-arm="right">${arm('r', right, rest, false)}</g>
  <path class="rb-beam" data-beam d="M${f(tip[0])} ${f(tip[1])}L${f(beamTop[0])} ${f(beamTop[1])}L${f(beamBot[0])} ${f(beamBot[1])}Z" fill="url(#rb-beam)"/>
</svg>`;
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
  return `
<div class="stagebox" role="img" aria-label="${label.replace(/"/g, '&quot;')}" data-robot-stage>
  ${svg}
  <div class="stage__glass" style="left:${pct(CUBE.x, W)};top:${pct(CUBE.y, H)};width:${pct(CUBE.w, W)};height:${pct(CUBE.h, H)}">
    <img src="/brand/logo-light.svg" alt="" width="168" height="46" loading="lazy">
  </div>
</div>`;
}
