import './styles.css';
import './blueprint/blueprint.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { registerUrl } from './config';
import { track } from './analytics';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

if (!reduceMotion) root.classList.add('motion');

/* ---------------------------------------------------------------- register */

const dialog = $<HTMLDialogElement>('#reg-dialog');
const portalHref = registerUrl();

$$<HTMLAnchorElement>('[data-register]').forEach((a) => {
  if (portalHref) a.href = portalHref;
  a.addEventListener('click', (e) => {
    track('cta_click', { section: a.dataset.section ?? 'unknown' });
    if (portalHref) return;
    // Portal login not wired yet: say so instead of faking a registration.
    e.preventDefault();
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    else window.alert('Registration opens soon. You’ll log in with your NxtWave learning portal credentials.');
  });
});

dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

track('page_view', { path: location.pathname });

/* ------------------------------------------------------------ smooth scroll */

let lenis: Lenis | null = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

$$<HTMLAnchorElement>('a[href^="#"]:not([data-register])').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: id === '#top' ? 0 : -8 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ------------------------------------------------------------ nav + sticky CTA */

const nav = $('[data-nav]');
const mobileCta = $('[data-mobile-cta]');
const intro = $('.scene--intro')!;

ScrollTrigger.create({
  start: 40,
  end: 'max',
  onToggle: (self) => nav?.classList.toggle('is-scrolled', self.isActive),
});
ScrollTrigger.create({
  trigger: intro,
  start: 'bottom 80%',
  endTrigger: '#join',
  end: 'top 80%',
  onToggle: (self) => mobileCta?.classList.toggle('is-visible', self.isActive),
});

/* ------------------------------------------------------------ scroll depth */

['#ladder', '#loop', '#value', '#faq'].forEach((sel) => {
  const el = $(sel);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 60%',
    once: true,
    onEnter: () => track('scroll_depth', { section: sel.slice(1) }),
  });
});

/* ------------------------------------------------------------ motion scenes */


type CityData = { w: number; h: number; lift: [number, number]; centre: [number, number] };

/** Adds `is-drawn` to a blueprint figure: its lines draw in, then fills settle. */
const draw = (svg: Element | null | undefined) => svg?.classList.add('is-drawn');

/**
 * The hero. The circuit city draws itself in on load behind the copy. On
 * scroll the copy clears, a hand brings the chip in and seats it, the copper
 * lights out from the socket, and the camera dives into the chip.
 */
function introScene() {
  const q = gsap.utils.selector(intro);
  const svg = $<SVGSVGElement>('[data-city] svg', intro)!;
  const data = JSON.parse($('[data-city-data]', intro)!.textContent ?? '{}') as CityData;
  const chip = $('[data-hero-chip]', svg)!;
  const hand = $('[data-hero-hand]', svg)!;
  // Drop: 1 = held up at lift height, 0 = seated. Out: the hand pulling away.
  const state = { drop: 2.2, out: 0, power: 0 };
  const apply = () => {
    const [lx, ly] = data.lift;
    const t = `translate(${(lx * state.drop).toFixed(2)} ${(ly * state.drop).toFixed(2)})`;
    chip.setAttribute('transform', t);
    hand.setAttribute('transform', `translate(${(lx * state.drop + 260 * state.out).toFixed(2)} ${(ly * state.drop - 420 * state.out).toFixed(2)})`);
    svg.style.setProperty('--power', state.power.toFixed(3));
    svg.style.setProperty('--power-on', state.power > 0.01 ? '1' : '0');
  };
  apply();
  gsap.set(svg, { transformOrigin: `${((data.centre[0] / data.w) * 100).toFixed(2)}% ${((data.centre[1] / data.h) * 100).toFixed(2)}%` });

  gsap.timeline({ defaults: { duration: 1.2, ease: 'power3.out' } })
    .from(q('.dwg__c'), { autoAlpha: 0, scale: 1.6, duration: 0.9, stagger: 0.06 }, 0.1)
    .from(q('.dwg__ruler, .dwg__block'), { autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.4)
    .from(q('.hero__headline, .hero__sub, .hero__cta, .facts'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.3);
  window.setTimeout(() => draw(svg), 200);

  const mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 760px)', wide: '(min-width: 761px)' }, (ctx) => {
    const isPhone = ctx.conditions?.phone;
    gsap.set(q('[data-hero]'), { yPercent: isPhone ? 0 : -46 });
    // The city sits right of the copy on desktop, under it on a phone.
    gsap.set(svg, isPhone ? { x: 0, y: () => window.innerHeight * 0.18, scale: 1 } : { x: () => window.innerWidth * 0.2, y: 0, scale: 0.92 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      onUpdate: apply,
    });
    tl.to(q('[data-hero]'), { autoAlpha: 0, x: isPhone ? 0 : -60, y: isPhone ? -40 : 0, duration: 0.9 }, 0)
      .to(q('.scrollcue'), { autoAlpha: 0, duration: 0.4 }, 0)
      .to(q('.city__shade'), { autoAlpha: 0, duration: 1 }, 0.1)
      .to(svg, { x: 0, y: 0, scale: isPhone ? 1.25 : 1.05, duration: 1.3, ease: 'power2.inOut' }, 0.2)
      // The hand brings the chip in from above, pauses over the socket, seats it.
      .to(hand, { opacity: 1, duration: 0.3 }, 0.8)
      .to(state, { drop: 0.35, duration: 1.4, ease: 'power2.out' }, 0.8)
      .to(state, { drop: 0, duration: 0.8, ease: 'power1.inOut' }, 2.4)
      .to(state, { out: 1, duration: 0.9, ease: 'power2.in' }, 3.3)
      .to(hand, { opacity: 0, duration: 0.4 }, 3.8)
      // Power-up: the copper lights out from the socket.
      .to(state, { power: 1, duration: 1.1 }, 3.4)
      // The dive into the chip, then a cut to the ladder.
      .to(q('.dwg'), { autoAlpha: 0, duration: 0.4 }, 4.6)
      .to(svg, { scale: isPhone ? 12 : 9, duration: 1.6, ease: 'power3.in' }, 4.7)
      .to(q('.dive'), { opacity: 1, duration: 0.5 }, 5.9);
    apply();
    return () => tl.scrollTrigger?.kill();
  });
}

/**
 * The loop: each card's board block draws in as it arrives; while the section
 * is on screen the copper carries pulses sense → decide → act and the motor's
 * pulley turns.
 */
function loopScene() {
  const sec = $('#loop');
  if (!sec) return;
  const cards = $$('.card3__fig svg', sec);
  const shaft = $<SVGPathElement>('.bp-shaft', sec);
  const steps: string[] = shaft ? JSON.parse(shaft.dataset.steps ?? '[]') : [];
  cards.forEach((svg, i) => ScrollTrigger.create({
    trigger: svg, start: 'top 85%', once: true,
    onEnter: () => window.setTimeout(() => draw(svg), i * 180),
  }));
  let raf = 0;
  let t0 = 0;
  const run = (now: number) => {
    if (shaft && steps.length) shaft.setAttribute('d', steps[Math.floor(Math.max(0, now - t0) / 60) % steps.length]!);
    raf = requestAnimationFrame(run);
  };
  ScrollTrigger.create({
    trigger: sec, start: 'top 60%', end: 'bottom 30%',
    onToggle: (self) => {
      sec.classList.toggle('is-live', self.isActive);
      if (self.isActive && !raf) { t0 = performance.now(); raf = requestAnimationFrame(run); }
      if (!self.isActive) { cancelAnimationFrame(raf); raf = 0; }
    },
  });
}

/**
 * The ladder, pinned: as you scroll the drawing on the left grows into the
 * next stage (sketch → model → prototype → product) and the step on the
 * right changes with it. Each gate lights as its stage arrives.
 */
function ladderScene() {
  const sec = $('#ladder');
  if (!sec) return;
  const figs = $$('[data-journey-fig]', sec);
  const steps = $$('[data-journey-step]', sec);
  const gates = $$('[data-journey-gate]', sec);
  const tag = $('[data-journey-tag]', sec);
  const tags = steps.map((s) => $('.journey__n', s)?.textContent ?? '');
  let current = -1;
  const show = (i: number) => {
    if (i === current) return;
    current = i;
    figs.forEach((f, j) => f.classList.toggle('is-active', j === i));
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    gates.forEach((g, j) => g.classList.toggle('is-on', j <= i));
    if (tag) tag.textContent = tags[i] ?? '';
    draw($('svg', figs[i]));
  };
  show(0);
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => show(Math.min(figs.length - 1, Math.floor(self.progress * figs.length * 0.999))),
  });
}

function lampsScene() {
  const sec = $('#lights');
  const list = $('[data-lamps]');
  const beam = $('[data-lamp-beam]');
  if (!sec || !list) return;
  const lamps = $$('[data-lamp]', list);
  ScrollTrigger.create({
    trigger: list,
    start: 'top 72%',
    end: 'bottom 55%',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      if (beam) gsap.set(beam, { scaleX: p });
      const on = p > 0.9 ? 3 : p > 0.45 ? 2 : p > 0.02 ? 1 : 0;
      lamps.forEach((l, i) => {
        l.classList.toggle('is-on', i < on);
        if (i < on) draw($('svg', l));
      });
    },
  });
}

function closingScene() {
  const sec = $('.closing');
  if (!sec) return;
  const q = gsap.utils.selector(sec);
  ScrollTrigger.create({ trigger: sec, start: 'top 70%', once: true, onEnter: () => draw($('[data-closing-fig] svg', sec)) });
  const fig = $('.value__fig svg');
  if (fig) ScrollTrigger.create({ trigger: fig, start: 'top 80%', once: true, onEnter: () => draw(fig) });
  gsap.from(q('.closing__inner > :not([data-closing-fig])'), {
    autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: sec, start: 'top 60%', once: true },
  });
}

function reveals() {
  const items = $$('[data-reveal]');
  gsap.set(items, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });

  // Kicker rules draw in as each section head arrives.
  $$('.head').forEach((h) =>
    ScrollTrigger.create({ trigger: h, start: 'top 85%', once: true, onEnter: () => h.classList.add('is-in') }),
  );
}

function ticker() {
  // The title block's TRL counter climbs with the page.
  const trl = $('[data-trl]');
  if (!trl) return;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { trl.textContent = String(Math.min(8, Math.round(self.progress * 8))); },
  });
}

function pointerParallax() {
  // The drawing tilts a few pixels toward the pointer, like paper under a lamp.
  const fig = $('[data-city]', intro);
  if (!fig) return;
  const x = gsap.quickTo(fig, 'x', { duration: 1, ease: 'power3.out' });
  const y = gsap.quickTo(fig, 'y', { duration: 1, ease: 'power3.out' });
  intro.addEventListener('pointermove', (e) => {
    x(-(e.clientX / window.innerWidth - 0.5) * 14);
    y(-(e.clientY / window.innerHeight - 0.5) * 10);
  });
}

if (!reduceMotion) {
  introScene();
  ladderScene();
  loopScene();
  lampsScene();
  closingScene();
  reveals();
  ticker();
  if (finePointer) pointerParallax();
}

// Fonts and lazy images change layout; re-measure scroll scenes once settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
