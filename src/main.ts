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

['#what', '#ladder', '#value', '#faq'].forEach((sel) => {
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
      .fromTo(q('[data-core-head]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 2.6)
      .to({}, { duration: 1 }, 3.6)
      .to(q('[data-core-head], [data-core-labels]'), { autoAlpha: 0, duration: 0.6 }, 4.4)
      .to(fig, { autoAlpha: 0, scale: 0.94, duration: 0.6 }, 4.5);
    layout();
    return () => tl.scrollTrigger?.kill();
  });
  window.addEventListener('resize', layout);
}

/**
 * The board draws itself in, then the loop runs: pulses ride the copper
 * sense → decide → act, the tags light in turn and the motor's pulley turns.
 */
function whatScene() {
  const scene = $('.scene--what')!;
  const q = gsap.utils.selector(scene);
  const board = $('[data-board]', scene)!;
  const svg = $('svg', board)!;
  const tags = $$('[data-tag]', board);
  const shaft = $<SVGPathElement>('.bp-shaft', svg);
  const steps: string[] = shaft ? JSON.parse(shaft.dataset.steps ?? '[]') : [];
  gsap.set(q('[data-step="2"]'), { autoAlpha: 0, y: 30 });
  gsap.set(tags, { autoAlpha: 0 });

  // The loop: one cycle every 1.65 s, matching the pulse animation in CSS.
  let raf = 0;
  let t0 = 0;
  const run = (now: number) => {
    const t = (Math.max(0, now - t0) / 1650) % 1;
    const live = t < 0.4 ? 0 : t < 0.73 ? 1 : 2;
    tags.forEach((tag, i) => tag.classList.toggle('is-on', i === live));
    if (shaft && steps.length) shaft.setAttribute('d', steps[Math.floor(Math.max(0, now - t0) / 60) % steps.length]!);
    raf = requestAnimationFrame(run);
  };
  const start = () => {
    if (raf) return;
    board.classList.add('is-live');
    t0 = performance.now();
    raf = requestAnimationFrame(run);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    board.classList.remove('is-live');
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene, start: 'top 90%', end: 'bottom bottom', scrub: 0.8,
      onEnter: () => draw(svg),
      onToggle: (self) => (self.isActive ? start() : stop()),
    },
  });
  tl.fromTo(board, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
    .fromTo(q('[data-step="1"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.8)
    .to(tags, { autoAlpha: 1, duration: 0.6, stagger: 0.25 }, 1.6)
    .to(q('[data-step="1"]'), { autoAlpha: 0, y: -30, duration: 0.9 }, 4.4)
    .to(q('[data-step="2"]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 4.9)
    .fromTo(q('.trl li:not(.is-market) .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.16 }, 5.1)
    .fromTo(q('.trl .is-market .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 6.5)
    .to(board, { autoAlpha: 0, x: -60, duration: 1.2, ease: 'power2.in' }, 7.8)
    .to(q('[data-step="2"]'), { autoAlpha: 0, y: -20, duration: 0.9 }, 8.2);
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

function ladderScene() {
  const section = $('#ladder')!;
  const viewport = $('[data-ladder-viewport]', section)!;
  const trackEl = $('[data-ladder-track]', section)!;
  const stages = $$('[data-stage]', section);
  const light = (upTo: number) => stages.forEach((s, i) => {
    s.classList.toggle('is-lit', i <= upTo);
    if (i <= upTo + 1) draw($('svg', s));
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const distance = () => Math.max(0, trackEl.scrollWidth - viewport.clientWidth);
    light(0);
    const tween = gsap.to(trackEl, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight * 0.35}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => light(Math.round(self.progress * (stages.length - 1))),
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(trackEl, { clearProps: 'transform' });
    };
  });
  mm.add('(max-width: 899px)', () => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-lit');
        draw($('svg', en.target));
      }),
      { root: viewport, threshold: 0.55 },
    );
    stages.forEach((s) => io.observe(s));
    return () => io.disconnect();
  });
}

function stepsScene() {
  const list = $('[data-steps]');
  const beam = $('[data-steps-beam]');
  if (!list || !beam) return;
  const items = $$('[data-step-item]', list);
  const vertical = () => window.matchMedia('(max-width: 899px)').matches;
  ScrollTrigger.create({
    trigger: list,
    start: 'top 75%',
    end: 'bottom 55%',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(beam, vertical() ? { scaleY: p, scaleX: 1 } : { scaleX: p, scaleY: 1 });
      items.forEach((it, i) => it.classList.toggle('is-lit', p >= i / (items.length - 1) - 0.02));
    },
  });
}

function closingScene() {
  const sec = $('.closing');
  if (!sec) return;
  const q = gsap.utils.selector(sec);
  ScrollTrigger.create({ trigger: sec, start: 'top 70%', once: true, onEnter: () => draw($('[data-closing-fig] svg', sec)) });
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

  // Line icons draw themselves.
  $$<SVGElement>('[data-draw] svg *').forEach((el) => {
    const len = (el as unknown as SVGGeometryElement).getTotalLength?.() ?? 100;
    gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el.closest('.row')!, start: 'top 82%', once: true },
    });
  });

  // Big numbers count up once.
  $$('[data-count]').forEach((el) => {
    const raw = el.dataset.count ?? '';
    const m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num);
    if (target === 0) return;
    const o = { v: 0 };
    el.textContent = `${pre}0${post}`;
    gsap.to(o, {
      v: target, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => { el.textContent = `${pre}${Math.round(o.v)}${post}`; },
    });
  });
}

function ticker() {
  // Reel timecode and the title block's TRL counter, which climbs with the page.
  const tcs = $$('[data-timecode]');
  const t0 = performance.now();
  window.setInterval(() => {
    if (document.hidden) return;
    const s = Math.floor((performance.now() - t0) / 1000);
    const txt = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
    tcs.forEach((t) => { t.textContent = txt; });
  }, 1000);
  const trl = $('[data-trl]');
  if (trl) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => { trl.textContent = String(Math.min(8, Math.round(self.progress * 8))); },
    });
  }
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
  whatScene();
  lampsScene();
  ladderScene();
  stepsScene();
  closingScene();
  reveals();
  ticker();
  if (finePointer) pointerParallax();
}

// Fonts and lazy images change layout; re-measure scroll scenes once settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
