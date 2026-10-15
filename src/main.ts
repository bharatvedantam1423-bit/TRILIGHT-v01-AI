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


type CoreData = {
  w: number;
  h: number;
  shift: number;
  layers: { id: string; lift: [number, number]; left: [number, number]; right: [number, number] }[];
};

/** Adds `is-drawn` to a blueprint figure: its lines draw in, then fills settle. */
const draw = (svg: Element | null | undefined) => svg?.classList.add('is-drawn');

/**
 * The hero blueprint. The core draws itself in on load beside the headline;
 * on scroll the copy steps aside, the core moves to centre and comes apart
 * into its six layers, and each layer's callout runs out to it.
 */
function introScene() {
  const q = gsap.utils.selector(intro);
  const fig = $('[data-core-fig]', intro)!;
  const svg = $('svg', fig)!;
  const data = JSON.parse($('[data-core-data]', intro)!.textContent ?? '{}') as CoreData;
  const groups = new Map(data.layers.map((l) => [l.id, $(`[data-layer="${l.id}"]`, svg)!]));
  const callouts = $$('[data-callout]', intro);
  const labels = $('[data-core-labels]', intro)!;
  const state = { e: 0, show: 0 };
  const phone = () => window.matchMedia('(max-width: 760px)').matches;

  // Layer offsets (viewBox units) for an explode amount e: lifted apart, and
  // re-centred so the assembled stack sits in the middle of the drawing.
  const offset = (lift: [number, number], e: number) => lift[1] * e + data.shift * (1 - e);

  function layout() {
    const e = state.e;
    data.layers.forEach((l) => groups.get(l.id)?.setAttribute('transform', `translate(0 ${offset(l.lift, e).toFixed(2)})`));
    const box = labels.getBoundingClientRect();
    const r = svg.getBoundingClientRect();
    const k = r.width / data.w;
    const pad = phone() ? 8 : Math.max(24, box.width * 0.04);
    callouts.forEach((c, i) => {
      const l = data.layers.find((x) => x.id === c.dataset.callout)!;
      const left = c.classList.contains('callout--l');
      const [px, py] = left ? l.left : l.right;
      const x = r.left - box.left + px * k;
      const y = r.top - box.top + (py + offset(l.lift, e)) * k;
      c.style.top = `${y}px`;
      if (left) { c.style.left = `${pad}px`; c.style.width = `${Math.max(0, x - pad)}px`; }
      else { c.style.left = `${x}px`; c.style.width = `${Math.max(0, box.width - pad - x)}px`; }
      // Callouts arrive top layer first, once the stack has opened up.
      const t = gsap.utils.clamp(0, 1, state.show * 1.6 - i * 0.12);
      c.style.opacity = String(t);
    });
  }

  gsap.timeline({ defaults: { duration: 1.2, ease: 'power3.out' } })
    .from(q('.dwg__c'), { autoAlpha: 0, scale: 1.6, duration: 0.9, stagger: 0.06 }, 0.1)
    .from(q('.dwg__ruler, .dwg__tag, .dwg__block'), { autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.4)
    .from(q('.hero__headline, .hero__sub, .hero__cta, .facts'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.3);
  window.setTimeout(() => draw(svg), 250);

  const mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 760px)', wide: '(min-width: 761px)' }, (ctx) => {
    const isPhone = ctx.conditions?.phone;
    // Beside the copy on desktop; faint behind it on a phone.
    // GSAP owns the transform, so the centring lives in xPercent/yPercent.
    gsap.set(fig, { xPercent: -50, yPercent: -50 });
    gsap.set(q('[data-hero]'), { yPercent: isPhone ? 0 : -46 });
    gsap.set(fig, isPhone ? { x: 0, scale: 0.9, autoAlpha: 0.35 } : { x: () => window.innerWidth * 0.2, scale: 0.92, autoAlpha: 1 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      onUpdate: layout,
    });
    tl.to(q('[data-hero]'), { autoAlpha: 0, x: isPhone ? 0 : -60, y: isPhone ? -40 : 0, duration: 1 }, 0)
      .to(q('.scrollcue'), { autoAlpha: 0, duration: 0.4 }, 0)
      .to(fig, { x: 0, scale: 1, autoAlpha: 1, duration: 1.2, ease: 'power2.inOut' }, 0.2)
      .to(state, { e: 1, duration: 2.2, ease: 'power2.inOut' }, 1.2)
      .to(state, { show: 1, duration: 1.2 }, 2.2)
      .to({}, { duration: 1 }, 3.6)
      .to(q('[data-core-labels]'), { autoAlpha: 0, duration: 0.6 }, 4.4)
      .to(fig, { autoAlpha: 0, scale: 0.94, duration: 0.6 }, 4.5);
    layout();
    return () => tl.scrollTrigger?.kill();
  });
  window.addEventListener('resize', layout);
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
 * The ladder: each step draws in as it arrives, and its review gate lights
 * once the drawing is done. Steps that share a row (desktop) run left to
 * right; stacked steps (phone) each go as they scroll into view.
 */
function ladderScene() {
  const sec = $('#ladder');
  if (!sec) return;
  const steps = $$('[data-step4]', sec);
  steps.forEach((step) => ScrollTrigger.create({
    trigger: step, start: 'top 80%', once: true,
    onEnter: () => {
      const row = steps.filter((s) => s.offsetTop === step.offsetTop);
      const delay = row.indexOf(step) * 450;
      window.setTimeout(() => { draw($('svg', step)); step.classList.add('is-lit'); }, delay);
    },
  }));
}

function lampsScene() {
  const sec = $('#lights');
  const list = $('[data-lamps]');
  const beam = $('[data-lamp-beam]');
  if (!sec || !list || !beam) return;
  const lamps = $$('[data-lamp]', list);
  const vertical = () => window.matchMedia('(max-width: 899px)').matches;
  ScrollTrigger.create({
    trigger: list,
    start: 'top 72%',
    end: 'bottom 45%',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(beam, vertical() ? { scaleY: p, scaleX: 1 } : { scaleX: p, scaleY: 1 });
      const on = p > 0.9 ? 3 : p > 0.45 ? 2 : p > 0.02 ? 1 : 0;
      lamps.forEach((l, i) => l.classList.toggle('is-on', i < on));
      sec.classList.toggle('is-done', on === 3);
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
  const fig = $('[data-core-fig] svg', intro);
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
