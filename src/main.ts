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

if (!reduceMotion) {
  introScene();
  whatScene();
  lightsScene();
  ladderScene();
  closingScene();
  reveals();
  hudTicker();
  if (finePointer) pointerParallax();
}

function introScene() {
  const q = gsap.utils.selector(intro);
  const paths = $$<SVGPathElement>('.xmark path', intro);
  const [rightBracket, leftBracket, cross] = paths;

  // Entrance: objects power on from the edges, HUD tags snap in.
  gsap.from(q('.obj picture'), {
    autoAlpha: 0, scale: 0.92, duration: 1.4, ease: 'power3.out', stagger: 0.08, delay: 0.1,
  });
  gsap.from(q('.hud-tag'), { autoAlpha: 0, x: -8, duration: 0.5, stagger: 0.1, delay: 0.9, ease: 'power2.out' });
  gsap.from(q('[data-hero] > *'), { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.08, ease: 'power3.out' });

  gsap.set(q('.lens'), { autoAlpha: 0, scale: 0.55 });
  gsap.set(q('.xmark'), { autoAlpha: 0 });
  gsap.set(leftBracket, { x: -260, autoAlpha: 0 });
  gsap.set(rightBracket, { x: 260, autoAlpha: 0 });
  gsap.set(cross, { scale: 0, rotate: -90, transformOrigin: '50% 50%', autoAlpha: 0 });
  gsap.set(q('.lens-caption'), { autoAlpha: 0, y: 24 });
  gsap.set(q('.blackout'), { autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
  });

  // 1 · the frame parts: every layer flies past the camera at its own depth.
  tl.to(q('[data-hero]'), { autoAlpha: 0, y: -70, scale: 0.95, duration: 1.8 }, 0)
    .to(q('.hud, .scrollcue'), { autoAlpha: 0, duration: 0.8 }, 0)
    .to(q('.obj--drone'), { xPercent: -40, yPercent: -140, scale: 1.6, duration: 3.4 }, 0)
    .to(q('.obj--pcb'), { xPercent: 70, yPercent: -120, scale: 1.7, rotate: 18, duration: 3.4 }, 0)
    .to(q('.obj--head'), { xPercent: 120, scale: 1.5, duration: 3.4 }, 0)
    .to(q('.obj--arm'), { xPercent: -120, yPercent: 20, scale: 1.5, duration: 3.4 }, 0)
    .to(q('.obj--rover'), { xPercent: 80, yPercent: 110, scale: 1.7, duration: 3.4 }, 0)
    .to(q('.obj'), { autoAlpha: 0, duration: 1 }, 2.5)
    .to(q('.bp-grid'), { scale: 1.6, autoAlpha: 0.35, duration: 4 }, 0)
    .to(q('.glow--blue'), { xPercent: -30, duration: 4 }, 0)
    .to(q('.glow--teal'), { xPercent: 30, duration: 4 }, 0)

    // 2 · two beams cross and lock into the Trilight X.
    .to(q('.xmark'), { autoAlpha: 1, duration: 0.3 }, 1.6)
    .to(leftBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.7)
    .to(rightBracket, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.7)
    .to(cross, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 1.9)
    .to(q('.xmark'), { scale: 3.2, autoAlpha: 0, duration: 1.6, ease: 'power1.in' }, 4.2)

    // 3 · through the machine's eye.
    .to(q('.lens'), { autoAlpha: 1, scale: 1, duration: 2 }, 4.4)
    .to(q('.lens-caption'), { autoAlpha: 1, y: 0, duration: 0.9 }, 5.2)
    .to(q('.lens-caption'), { autoAlpha: 0, y: -16, duration: 0.7 }, 7)
    .to(q('.reticle, .lens__det'), { autoAlpha: 0, duration: 0.6 }, 7)
    .to(q('.lens picture'), { scale: 8, duration: 2.6, ease: 'power2.in' }, 7)
    .to(q('.blackout'), { autoAlpha: 1, duration: 0.9 }, 8.9);
}

function whatScene() {
  const scene = $('.scene--what')!;
  const q = gsap.utils.selector(scene);

  gsap.set(q('[data-step="2"]'), { autoAlpha: 0, y: 30 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
  });

  tl.fromTo(q('.what__bg'), { scale: 1.18, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 2 }, 0)
    .fromTo(q('.what__floor'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.5 }, 0.5)
    .fromTo(q('.what__figure'), { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2, ease: 'power2.out' }, 0.7)
    .fromTo(q('[data-step="1"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.3)
    .fromTo(q('.det'), { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.35 }, 2.4)
    .to(q('[data-step="1"]'), { autoAlpha: 0, y: -30, duration: 0.9 }, 4.4)
    .to(q('[data-step="2"]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 4.9)
    .fromTo(q('.trl-scale li:not(.is-market) .bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.16 }, 5.1)
    .fromTo(q('.trl-scale .is-market .bar'), { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 6.5)
    // The builder and robot roll out of frame, like a scene change.
    .to(q('.what__figure'), { xPercent: 110, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 7.6)
    .to(q('[data-step="2"]'), { autoAlpha: 0, y: -20, duration: 0.9 }, 8.2)
    .to(q('.what__bg'), { autoAlpha: 0.2, duration: 1 }, 8.2);
}

function lightsScene() {
  $$('[data-light]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 72%',
      onEnter: () => el.classList.add('is-on'),
      onLeaveBack: () => el.classList.remove('is-on'),
    });
  });
  const list = $('.lights__list');
  const beam = $('.lights__beam');
  if (list && beam) {
    gsap.fromTo(beam, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
    });
  }
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
    // Native sideways swipe on phones; light the gates as cards scroll in.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('is-lit')),
      { root: viewport, threshold: 0.55 },
    );
    stages.forEach((s) => io.observe(s));
    return () => io.disconnect();
  });
}

function closingScene() {
  const sec = $('.closing');
  if (!sec) return;
  const q = gsap.utils.selector(sec);
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top 85%', end: 'center 55%', scrub: 0.6 },
  });
  tl.fromTo(q('.beam--a'), { rotate: 0, xPercent: -40, autoAlpha: 0 }, { rotate: 45, xPercent: 0, autoAlpha: 1 }, 0)
    .fromTo(q('.beam--b'), { rotate: 0, xPercent: 40, autoAlpha: 0 }, { rotate: -45, xPercent: 0, autoAlpha: 1 }, 0)
    .fromTo(q('.closing__mark'), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 0.14 }, 0.3);
}

function reveals() {
  const items = $$('[data-reveal]');
  gsap.set(items, { autoAlpha: 0, y: 36 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });
}

function hudTicker() {
  const coords = $('[data-coords]');
  const trl = $('[data-trl]');
  if (coords) {
    let t = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      t += 1;
      const lat = (17.385 + Math.sin(t / 7) * 0.0004).toFixed(4);
      const lon = (78.4867 + Math.cos(t / 9) * 0.0004).toFixed(4);
      coords.textContent = `${lat}° N · ${lon}° E`;
    }, 900);
  }
  if (trl) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => { trl.textContent = String(Math.min(8, Math.round(self.progress * 8))); },
    });
  }
}

function pointerParallax() {
  const objs = $$('.obj picture', intro).map((el, i) => ({
    x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
    depth: [22, 34, 28, 40, 16][i] ?? 24,
  }));
  const heroInner = $('[data-hero]', intro);
  const hx = heroInner ? gsap.quickTo(heroInner, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
  intro.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    objs.forEach((o) => { o.x(-nx * o.depth); o.y(-ny * o.depth); });
    hx?.(nx * 6);
  });
}

// Fonts and lazy images change layout; re-measure scroll scenes once settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
