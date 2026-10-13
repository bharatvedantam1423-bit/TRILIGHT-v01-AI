import './styles.css';
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
  endTrigger: '#register',
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


/**
 * How each lab layer leaves as the camera dollies into the corridor. Nearer
 * layers travel further, which is what sells the depth.
 */
const exits: Record<string, gsap.TweenVars> = {
  'far-l': { xPercent: -170, scale: 1.25 },
  'far-r': { xPercent: 170, scale: 1.25 },
  'near-l': { xPercent: -105, scale: 1.35 },
  'near-r': { xPercent: 105, scale: 1.35 },
  bench: { yPercent: 110, scale: 1.15 },
  vf: { scale: 1.25, autoAlpha: 0 },
};

function introScene() {
  const q = gsap.utils.selector(intro);
  const [rightBracket, leftBracket, cross] = $$<SVGPathElement>('.xmark path', intro);
  const L = (k: string) => q(`.lab--hero [data-l="${k}"]`);

  // Entrance: the walls slide in from the edges, the bench rises, then the copy.
  gsap.timeline({ defaults: { duration: 1.6, ease: 'power3.out' } })
    .from([...L('far-l'), ...L('far-r')], { autoAlpha: 0, duration: 2 }, 0)
    .from(L('near-l'), { xPercent: -40 }, 0.05)
    .from(L('near-r'), { xPercent: 40 }, 0.05)
    .from(L('bench'), { yPercent: 60, autoAlpha: 0 }, 0.35)
    .from(q('.vf__c'), { autoAlpha: 0, scale: 1.6, duration: 0.9, stagger: 0.06 }, 0.8)
    .from(q('.vf span'), { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.2)
    .from(q('.bracket, .hero__display, .hero__sub, .hero__cta, .facts'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.5);

  gsap.set(q('.lens'), { autoAlpha: 0, clipPath: 'circle(6% at 50% 49%)' });
  gsap.set(q('.xmark'), { autoAlpha: 0 });
  gsap.set(leftBracket, { x: -260, autoAlpha: 0 });
  gsap.set(rightBracket, { x: 260, autoAlpha: 0 });
  gsap.set(cross, { scale: 0, rotate: -90, transformOrigin: '50% 50%', autoAlpha: 0 });
  gsap.set(q('.lens-caption'), { autoAlpha: 0, y: 24 });
  gsap.set(q('.blackout'), { autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  // 1 · dolly into the lab: walls part at their own depth, the bench drops away.
  tl.to(q('[data-hero]'), { autoAlpha: 0, y: -60, scale: 0.94, duration: 1.6 }, 0)
    .to(q('.scrollcue'), { autoAlpha: 0, duration: 0.6 }, 0);
  Object.entries(exits).forEach(([k, v]) => tl.to(L(k), { ...v, duration: 3.2 }, 0));
  tl.to(q('.lab--hero'), { autoAlpha: 0, duration: 0.9 }, 2.6)

    // 2 · at the vanishing point, two beams lock into the Trilight X.
    .to(q('.xmark'), { autoAlpha: 1, duration: 0.3 }, 1.8)
    .to(leftBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.9)
    .to(rightBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.9)
    .to(cross, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 2.1)
    .to(q('.xmark'), { scale: 3.2, autoAlpha: 0, duration: 1, ease: 'power1.in' }, 4.1)

    // 3 · through the robot's eye.
    .to(q('.lens'), { autoAlpha: 1, duration: 0.3 }, 4.9)
    .to(q('.lens'), { clipPath: 'circle(80% at 50% 49%)', duration: 1.8, ease: 'power2.inOut' }, 4.95)
    .to(q('.lens-caption'), { autoAlpha: 1, y: 0, duration: 0.9 }, 5.6)
    .to(q('.lens-caption'), { autoAlpha: 0, y: -16, duration: 0.7 }, 7)
    .to(q('.reticle'), { autoAlpha: 0, duration: 0.6 }, 7)
    .to(q('.lens picture'), { scale: 9, duration: 2.6, ease: 'power2.in' }, 7)
    .to(q('.blackout'), { autoAlpha: 1, duration: 0.6 }, 9.0);
}

function whatScene() {
  const scene = $('.scene--what')!;
  const q = gsap.utils.selector(scene);
  gsap.set(q('[data-step="2"]'), { autoAlpha: 0, y: 30 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  tl.fromTo(q('.what__bg'), { scale: 1.18, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 }, 0)
    .fromTo(q('.what__shade'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0)
    .fromTo(q('.what__floor i'), { scaleY: 0 }, { scaleY: 1, duration: 1.4, stagger: 0.2, ease: 'power2.out' }, 0.5)
    .fromTo(q('.what__figure'), { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2, ease: 'power2.out' }, 0.9)
    .fromTo(q('[data-step="1"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.4)
    .fromTo(q('.det'), { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, 2.6)
    .to(q('[data-step="1"]'), { autoAlpha: 0, y: -30, duration: 0.9 }, 4.4)
    .to(q('[data-step="2"]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 4.9)
    .fromTo(q('.trl li:not(.is-market) .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.16 }, 5.1)
    .fromTo(q('.trl .is-market .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 6.5)
    // Scene change: the builder exits frame.
    .to(q('.what__figure'), { xPercent: -110, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 7.6)
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
  const light = (upTo: number) => stages.forEach((s, i) => s.classList.toggle('is-lit', i <= upTo));

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
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('is-lit')),
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
  // The lab closes back in around the final call to action.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: 0.8 },
  });
  Object.entries(exits).forEach(([k, v]) => {
    if (k !== 'vf') tl.from(q(`[data-l="${k}"]`), { ...v, duration: 1 }, 0);
  });
  tl.from(q('.closing__inner'), { autoAlpha: 0, y: 40, duration: 0.6 }, 0.4);
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
  // Viewfinder timecode and the TRL counter that climbs with the page.
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
  const depth: Record<string, number> = { 'far-l': 8, 'far-r': 8, 'near-l': 22, 'near-r': 22, bench: 16 };
  const layers = $$<HTMLElement>('.lab--hero [data-l]')
    .filter((el) => depth[el.dataset.l ?? ''])
    .map((el) => {
      const p = $('picture', el)!;
      return {
        x: gsap.quickTo(p, 'x', { duration: 1, ease: 'power3.out' }),
        y: gsap.quickTo(p, 'y', { duration: 1, ease: 'power3.out' }),
        d: depth[el.dataset.l ?? ''],
      };
    });
  intro.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    layers.forEach((l) => { l.x(-nx * l.d); l.y(-ny * l.d * 0.6); });
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
