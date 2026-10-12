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


/** Where each frame layer exits to as the camera pushes through. */
const exits: Record<string, gsap.TweenVars> = {
  'back-l': { xPercent: -90, scale: 1.15 },
  'back-r': { xPercent: 90, scale: 1.15 },
  'vine-l': { yPercent: -110 },
  'vine-r': { yPercent: -110 },
  l: { xPercent: -115, scale: 1.25 },
  r: { xPercent: 115, scale: 1.25 },
  pile: { yPercent: 80, scale: 1.15 },
};

function introScene() {
  const q = gsap.utils.selector(intro);
  const [rightBracket, leftBracket, cross] = $$<SVGPathElement>('.xmark path', intro);

  // Entrance: the frame assembles inward from the edges, then the copy.
  const pics = (k: string) => q(`[data-layer="${k}"] picture`);
  gsap.timeline({ defaults: { duration: 1.6, ease: 'power3.out' } })
    .from([...pics('back-l'), ...pics('back-r')], { autoAlpha: 0, scale: 0.94 }, 0)
    .from(pics('l'), { autoAlpha: 0, xPercent: -18 }, 0.1)
    .from(pics('r'), { autoAlpha: 0, xPercent: 18 }, 0.1)
    .from([...pics('vine-l'), ...pics('vine-r')], { autoAlpha: 0, yPercent: -14 }, 0.25)
    .from(pics('pile'), { autoAlpha: 0, yPercent: 16 }, 0.2)
    .from(q('.bracket, .hero__display, .hero__sub, .hero__cta, .facts'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.45);

  gsap.set(q('.lens'), { autoAlpha: 0, scale: 0.55 });
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

  // 1 · the frame parts like a camera pushing through it.
  tl.to(q('[data-hero]'), { autoAlpha: 0, y: -60, scale: 0.94, duration: 1.6 }, 0)
    .to(q('.scrollcue'), { autoAlpha: 0, duration: 0.6 }, 0);
  Object.entries(exits).forEach(([k, v]) => tl.to(q(`.frame--hero [data-layer="${k}"]`), { ...v, duration: 3.2 }, 0));
  tl.to(q('.frame--hero'), { autoAlpha: 0, duration: 0.8 }, 2.6)

    // 2 · two beams lock into the Trilight X.
    .to(q('.xmark'), { autoAlpha: 1, duration: 0.3 }, 1.6)
    .to(leftBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.7)
    .to(rightBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.7)
    .to(cross, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 1.9)
    .to(q('.xmark'), { scale: 3.2, autoAlpha: 0, duration: 1.6, ease: 'power1.in' }, 4.2)

    // 3 · through the machine's eye.
    .to(q('.lens'), { autoAlpha: 1, scale: 1, duration: 2 }, 4.4)
    .to(q('.lens-caption'), { autoAlpha: 1, y: 0, duration: 0.9 }, 5.2)
    .to(q('.lens-caption'), { autoAlpha: 0, y: -16, duration: 0.7 }, 7)
    .to(q('.reticle'), { autoAlpha: 0, duration: 0.6 }, 7)
    .to(q('.lens picture'), { scale: 8, duration: 2.6, ease: 'power2.in' }, 7)
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

  // The stage is built like a set: room, foreground, then the builder walks in.
  tl.fromTo(q('.what__bg'), { scale: 1.18, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 }, 0)
    .fromTo(q('.what__shade'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0)
    .fromTo(q('.what__fore'), { yPercent: 70 }, { yPercent: 0, duration: 2, ease: 'power2.out' }, 0.4)
    .fromTo(q('.what__figure'), { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2, ease: 'power2.out' }, 0.9)
    .fromTo(q('[data-step="1"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.4)
    .fromTo(q('.det'), { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, 2.6)
    .to(q('[data-step="1"]'), { autoAlpha: 0, y: -30, duration: 0.9 }, 4.4)
    .to(q('[data-step="2"]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 4.9)
    .fromTo(q('.trl li:not(.is-market) .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.16 }, 5.1)
    .fromTo(q('.trl .is-market .trl__bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 6.5)
    // Scene change: the builder exits frame, the set falls away.
    .to(q('.what__figure'), { xPercent: 110, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 7.6)
    .to(q('.what__fore'), { yPercent: 80, duration: 1.4, ease: 'power2.in' }, 7.9)
    .to(q('[data-step="2"]'), { autoAlpha: 0, y: -20, duration: 0.9 }, 8.2);
}

function lampsScene() {
  const list = $('[data-lamps]');
  if (!list) return;
  const lamps = $$('[data-lamp]', list);
  ScrollTrigger.create({
    trigger: list,
    start: 'top 75%',
    end: 'bottom 45%',
    onUpdate: (self) => {
      const on = self.progress > 0.72 ? 3 : self.progress > 0.38 ? 2 : self.progress > 0.04 ? 1 : 0;
      lamps.forEach((l, i) => l.classList.toggle('is-on', i < on));
    },
    onLeave: () => lamps.forEach((l) => l.classList.add('is-on')),
  });
}

function closingScene() {
  const sec = $('.closing');
  if (!sec) return;
  const q = gsap.utils.selector(sec);
  // The frame closes back in around the final call to action.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: 0.8 },
  });
  Object.entries(exits).forEach(([k, v]) => tl.from(q(`[data-layer="${k}"]`), { ...v, duration: 1 }, 0));
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
}

function pointerParallax() {
  const depth: Record<string, number> = { 'back-l': 10, 'back-r': 10, 'vine-l': 16, 'vine-r': 16, l: 26, r: 26, pile: 34 };
  const layers = $$('.frame--hero [data-layer]').map((el) => {
    const p = $('picture', el)!;
    return {
      x: gsap.quickTo(p, 'x', { duration: 1, ease: 'power3.out' }),
      y: gsap.quickTo(p, 'y', { duration: 1, ease: 'power3.out' }),
      d: depth[el.dataset.layer ?? ''] ?? 16,
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
  closingScene();
  reveals();
  if (finePointer) pointerParallax();
}

// Fonts and lazy images change layout; re-measure scroll scenes once settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
