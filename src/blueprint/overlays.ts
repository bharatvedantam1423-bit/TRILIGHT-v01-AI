/**
 * Line-art overlays for the three Fundamentals photos (public/img/loop/*.webp),
 * drawn in the hero's language: thin lines, mono tags, pulses. Coordinates are
 * in the photos' own pixels (1254 × 1254); the SVG covers the picture the way
 * the image does (object-fit: cover ↔ preserveAspectRatio slice).
 *
 * Lines draw in when the card arrives; then rings pulse, signals run and the
 * readings count up (src/main.ts). Without motion everything is just drawn.
 */
const S = 1254;
type P = [number, number];

const line = (d: string, cls = '') => `<path class="ov-line ${cls}" d="${d}" pathLength="1"/>`;
const flow = (d: string, cls = '') => `<path class="ov-flow ${cls}" d="${d}" pathLength="100"/>`;
const pulse = ([x, y]: P, r: number, ry = r, cls = '') =>
  `<g class="ov-pulse ${cls}"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}"/></g>`;
const dot = ([x, y]: P, cls = '') => `<circle class="ov-dot ${cls}" cx="${x}" cy="${y}" r="7"/>`;

/**
 * A white mono tag; `count` makes the number in it count up when shown.
 * Sized from its text (28px mono ≈ 18.6 units a character); `end` sets x as
 * its right edge.
 */
function tag([x0, y]: P, text: string, { count = '', d = 0, end = false } = {}) {
  const w = Math.round(text.replace('#', count).length * 18.6 + 70);
  const x = end ? x0 - w : x0;
  const body = count ? text.replace('#', `<tspan data-count="${count}">${count}</tspan>`) : text;
  return `<g class="ov-tag" style="--td:${d}s" transform="translate(${x} ${y})">
    <rect width="${w}" height="54"/><rect class="ov-tag__sq" x="18" y="21" width="12" height="12"/>
    <text x="42" y="36">${body}</text></g>`;
}

/** Corner brackets round a box. */
function brackets(x0: number, y0: number, x1: number, y1: number, k = 26) {
  return line(`M${x0} ${y0 + k}V${y0}H${x0 + k}M${x1 - k} ${y0}H${x1}V${y0 + k}M${x1} ${y1 - k}V${y1}H${x1 - k}M${x0 + k} ${y1}H${x0}V${y1 - k}`, 'ov-line--strong');
}

function sense() {
  return [
    // The sensing field under the detector.
    pulse([585, 600], 300, 84, 'ov-pulse--field'),
    line('M285 600a300 84 0 1 0 600 0a300 84 0 1 0 -600 0', 'ov-line--dash'),
    // The smoke, traced up into the vents.
    flow('M300 1120C330 960 480 860 440 740S540 640 572 600', 'ov-flow--up'),
    // The status light and its reading.
    pulse([580, 507], 20, 20, 'ov-pulse--led'),
    line('M600 520L760 700H900'),
    dot([580, 507], 'ov-dot--red'),
    tag([1232, 673], 'SMOKE · # PPM', { count: '412', d: 0.2, end: true }),
  ].join('');
}

function decide() {
  return [
    brackets(515, 880, 690, 1035),
    // Signal from the smoke chamber into the microcontroller.
    line('M880 905H780L740 945H700', 'ov-line--dim'),
    flow('M880 905H780L740 945H700', 'ov-flow--sig'),
    pulse([515, 893], 18, 18, 'ov-pulse--led'),
    // The decision, read out above the board.
    line('M602 880V735'),
    `<g class="ov-tag ov-read" style="--td:0.25s" transform="translate(452 520)">
      <rect width="400" height="214"/>
      <text class="ov-read__h" x="26" y="44">DECIDING</text>
      <text x="26" y="104">BURNT TOAST</text><text class="ov-read__v" x="374" y="104">0.06</text>
      <rect class="ov-bar__bg" x="26" y="118" width="348" height="8"/><rect class="ov-bar ov-bar--lo" x="26" y="118" width="21" height="8"/>
      <text x="26" y="168">REAL FIRE</text><text class="ov-read__v" x="374" y="168">0.94</text>
      <rect class="ov-bar__bg" x="26" y="182" width="348" height="8"/><rect class="ov-bar ov-bar--hi" x="26" y="182" width="327" height="8"/>
    </g>`,
  ].join('');
}

function act() {
  return [
    // The spray cone and the water falling.
    line('M612 392L330 1060M642 392L930 1060', 'ov-line--dash'),
    flow('M612 392L330 1060', 'ov-flow--down'),
    flow('M627 392V1060', 'ov-flow--down ov-flow--b'),
    flow('M642 392L930 1060', 'ov-flow--down ov-flow--c'),
    pulse([627, 352], 46, 46, 'ov-pulse--led'),
    line('M660 330L720 278H760'),
    tag([760, 251], 'VALVE · OPEN', { d: 0.15 }),
    // The phone, calling the fire brigade.
    pulse([1180, 1078], 74, 74, 'ov-pulse--call'),
    line('M1112 1104L1076 1140H1040'),
    tag([1040, 1113], 'CALLING · FIRE 101', { d: 0.35, end: true }),
  ].join('');
}

const scenes: Record<string, () => string> = { sense, decide, act };

export function loopOverlay(id: string) {
  const draw = scenes[id];
  if (!draw) return '';
  return `<svg class="ov ov--${id}" viewBox="0 0 ${S} ${S}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${draw()}</svg>`;
}
