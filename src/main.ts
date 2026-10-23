import './styles.css';
import './blueprint/blueprint.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

/* ------------------------------------------------------------ in-page links */
// Native scrolling (no smooth-scroll library): the scenes scrub with their
// own easing, and input stays instant.
$$<HTMLAnchorElement>('a[href^="#"]:not([data-register])').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
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
 * The hero. The prerendered board fades in behind the copy and the chip draws
 * itself. On scroll the copy clears, the hand brings the chip in and seats it,
 * the copper lights out from the socket.
 * Only transforms and a few attributes change per frame, so it stays smooth.
 */
function introScene() {
  const q = gsap.utils.selector(intro);
  const stage = $('[data-city-stage]', intro)!;
  const live = $<SVGSVGElement>('.city__live', stage)!;
  const chip = $('[data-hero-chip]', live)!;
  const hand = $('[data-city-hand]', stage)!;
  const data = JSON.parse($('[data-city-data]', intro)!.textContent ?? '{}') as CityData;
  // Drop: 1 = held at lift height, 0 = seated. Out: the hand pulling away.
  const state = { drop: 2.2, out: 0, power: 0 };
  let unit = stage.offsetWidth / data.w;
  const apply = () => {
    const [lx, ly] = data.lift;
    chip.setAttribute('transform', `translate(${(lx * state.drop).toFixed(2)} ${(ly * state.drop).toFixed(2)})`);
    const hx = (lx * state.drop + 260 * state.out) * unit;
    const hy = (ly * state.drop - 420 * state.out) * unit;
    hand.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
    live.style.setProperty('--power', state.power.toFixed(3));
    // The socket's light fades as the chip comes down into it.
    live.style.setProperty('--socket', Math.min(1, Math.max(0, (state.drop - 0.05) / 0.6)).toFixed(3));
    live.style.setProperty('--power-on', state.power > 0.01 ? '1' : '0');
  };
  apply();
  window.addEventListener('resize', () => { unit = stage.offsetWidth / data.w; apply(); });
  gsap.set(stage, { transformOrigin: `${((data.centre[0] / data.w) * 100).toFixed(2)}% ${((data.centre[1] / data.h) * 100).toFixed(2)}%` });

  gsap.timeline({ defaults: { duration: 1.2, ease: 'power3.out' } })
    .from(q('.dwg__c'), { autoAlpha: 0, scale: 1.6, duration: 0.9, stagger: 0.06 }, 0.1)
    .from(q('.dwg__ruler, .dwg__block'), { autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.4)
    .from(q('.hero__headline, .hero__sub, .hero__cta, .facts'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.3);
  // The board reveals only once its image is decoded; the chip, its copper and
  // the socket's light come in after it, never before.
  const baseImg = $<HTMLImageElement>('.city__layer img', stage);
  const ready = baseImg && !baseImg.complete ? baseImg.decode().catch(() => undefined) : Promise.resolve();
  ready.then(() => {
    gsap.set(q('.city__layer'), { visibility: 'visible' });
    gsap.timeline()
      .fromTo(q('.city__layer'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut', stagger: 0.12 }, 0)
      .set(live, { visibility: 'visible' }, 1.1)
      .add(() => draw(live), 1.1)
      .fromTo(live, { '--socket-in': 0 }, { '--socket-in': 1, duration: 1.2, ease: 'power1.out' }, 1.6);
  });

  const mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 760px)', wide: '(min-width: 761px)' }, (ctx) => {
    const isPhone = ctx.conditions?.phone;
    gsap.set(q('[data-hero]'), { yPercent: isPhone ? 0 : -46 });
    // The city sits right of the copy on desktop, under it on a phone.
    gsap.set(stage, isPhone ? { x: 0, y: () => window.innerHeight * 0.18, scale: 1 } : { x: () => window.innerWidth * 0.2, y: 0, scale: 0.92 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // Ends a screen early: the last screen is the ladder sliding up over it.
      scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom 200%', scrub: 0.6, invalidateOnRefresh: true },
      onUpdate: apply,
    });
    tl.to(q('[data-hero]'), { autoAlpha: 0, x: isPhone ? 0 : -60, y: isPhone ? -40 : 0, duration: 0.9 }, 0)
      .to(q('.scrollcue'), { autoAlpha: 0, duration: 0.4 }, 0)
      .to(q('.city__shade'), { autoAlpha: 0, duration: 1 }, 0.1)
      .to(stage, { x: 0, y: 0, scale: isPhone ? 1.25 : 1.05, duration: 1.3, ease: 'power2.inOut' }, 0.2)
      // The hand brings the chip in from above, pauses over the socket, seats it.
      .to(hand, { opacity: 1, duration: 0.3 }, 0.8)
      .to(state, { drop: 0.35, duration: 1.4, ease: 'power2.out' }, 0.8)
      .to(state, { drop: 0, duration: 0.8, ease: 'power1.inOut' }, 2.4)
      .to(state, { out: 1, duration: 0.9, ease: 'power2.in' }, 3.3)
      .to(hand, { opacity: 0, duration: 0.4 }, 3.8)
      // Power-up: the copper lights out from the socket.
      .to(state, { power: 1, duration: 1.1 }, 3.4)
      // Hold on the powered board a moment, then hand over to the ladder.
      .to({}, { duration: 0.8 }, 4.5)
      .to(q('.dwg'), { autoAlpha: 0, duration: 0.5 }, 4.8);
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
 * The ladder carousel: one stage in view. Buttons, the stage rail, arrow keys
 * and swipes move between stages; a drawing draws itself the first time its
 * stage is shown.
 */
function ladderScene() {
  const sec = $('[data-ladder]');
  if (!sec) return;
  const track = $('[data-track]', sec)!;
  const slides = $$('[data-slide]', sec);
  const tabs = $$<HTMLButtonElement>('[data-goto]', sec);
  const prev = $<HTMLButtonElement>('[data-prev]', sec)!;
  const next = $<HTMLButtonElement>('[data-next]', sec)!;
  const bar = $('[data-progress]', sec);
  let i = 0;
  const go = (to: number, focusTab = false) => {
    i = Math.max(0, Math.min(slides.length - 1, to));
    track.style.transform = `translate3d(${-i * 100}%, 0, 0)`;
    slides.forEach((s, j) => { s.classList.toggle('is-active', j === i); s.toggleAttribute('inert', j !== i); });
    tabs.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.classList.toggle('is-past', j < i); t.setAttribute('aria-selected', String(j === i)); });
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    if (bar) bar.style.transform = `scaleX(${(i + 1) / slides.length})`;
    draw($('svg', slides[i]));
    if (focusTab) tabs[i]?.focus();
    tabs[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  };
  sec.classList.add('is-carousel');
  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));
  tabs.forEach((t, j) => t.addEventListener('click', () => go(j)));
  sec.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1, document.activeElement?.hasAttribute('data-goto')); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1, document.activeElement?.hasAttribute('data-goto')); }
  });
  let x0: number | null = null;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  track.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  });
  ScrollTrigger.create({ trigger: sec, start: 'top 70%', once: true, onEnter: () => go(i) });
  go(0);
  autoplay(sec, () => i, (to) => go(to), slides.length, [prev, next, ...tabs, track]);
}

/**
 * A/B test: does the ladder advance on its own? Variant from ?ladder=auto or
 * ?ladder=manual, else a 50/50 assignment remembered per browser. Reported as
 * trl8_ab_assign {test, variant}; stage views as trl8_ladder_stage.
 */
const AUTO_MS = 5000;
function ladderVariant(): 'auto' | 'manual' {
  const q = new URLSearchParams(location.search).get('ladder');
  if (q === 'auto' || q === 'manual') return q;
  try {
    const kept = localStorage.getItem('trl8_ab_ladder');
    if (kept === 'auto' || kept === 'manual') return kept;
    const v = Math.random() < 0.5 ? 'auto' : 'manual';
    localStorage.setItem('trl8_ab_ladder', v);
    return v;
  } catch {
    return 'auto';
  }
}

function autoplay(sec: HTMLElement, at: () => number, go: (to: number) => void, count: number, controls: Element[]) {
  const variant = ladderVariant();
  track('ab_assign', { test: 'ladder_autoplay', variant });
  if (variant !== 'auto') return;
  sec.classList.add('is-auto');
  sec.style.setProperty('--auto-ms', `${AUTO_MS}ms`);
  let timer = 0;
  let visible = false;
  let hovering = false;
  let stopped = false;
  // Restarting the active tab's fill keeps the countdown honest.
  const restartFill = () => { sec.classList.remove('is-ticking'); void sec.offsetWidth; sec.classList.add('is-ticking'); };
  const schedule = () => {
    window.clearTimeout(timer);
    sec.classList.remove('is-ticking');
    if (stopped || !visible || hovering || document.hidden) return;
    restartFill();
    timer = window.setTimeout(() => { go((at() + 1) % count); track('ladder_stage', { stage: at() + 1, by: 'auto' }); schedule(); }, AUTO_MS);
  };
  // Any hand on the controls ends autoplay: the reader has taken over.
  controls.forEach((c) => c.addEventListener('pointerdown', () => { stopped = true; schedule(); }));
  sec.addEventListener('keydown', () => { stopped = true; schedule(); });
  sec.addEventListener('pointerenter', () => { hovering = true; schedule(); });
  sec.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 40%', onToggle: (self) => { visible = self.isActive; schedule(); } });
}

function lampsScene() {
  const list = $('[data-lamps]');
  if (!list) return;
  const beam = $('[data-lamp-beam]');
  const lamps = $$('[data-lamp]', list);
  const figs = lamps.map((l) => $<SVGSVGElement>('svg', l)!);
  const set = (i: number, d: number) => {
    figs[i]?.style.setProperty('--d', d.toFixed(3));
    lamps[i]?.classList.toggle('is-on', d > 0.92);
  };
  const clamp = gsap.utils.clamp(0, 1);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const st = ScrollTrigger.create({
      trigger: list, start: 'top 85%', end: 'bottom 55%', scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (beam) gsap.set(beam, { scaleX: p });
        lamps.forEach((_, i) => set(i, clamp((p - i * 0.27) / 0.46)));
      },
    });
    return () => st.kill();
  });
  mm.add('(max-width: 899px)', () => {
    const sts = lamps.map((l, i) => ScrollTrigger.create({
      trigger: l, start: 'top 90%', end: 'center 50%', scrub: true,
      onUpdate: (self) => set(i, self.progress),
    }));
    return () => sts.forEach((t) => t.kill());
  });
}

/**
 * Closing: the arms wake from rest into their pose as the section scrolls in,
 * then the left arm's beam lights the glass block. A supplied video plays
 * while in view instead.
 */
function closingScene() {
  const sec = $('.closing');
  if (!sec) return;
  const q = gsap.utils.selector(sec);
  const video = $<HTMLVideoElement>('[data-closing-video]', sec);
  if (video) {
    ScrollTrigger.create({ trigger: sec, start: 'top 80%', end: 'bottom 20%', onToggle: (self) => (self.isActive ? video.play().catch(() => {}) : video.pause()) });
  }
  const joints = $$<SVGGElement>('[data-joint]', sec);
  if (joints.length) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 15%', scrub: 0.6 } });
    joints.forEach((j) => {
      const [ox, oy] = (j.dataset.origin ?? '0 0').split(' ').map(Number);
      const from = Number(j.dataset.rest);
      const to = Number(j.dataset.pose);
      j.removeAttribute('transform');
      tl.fromTo(j, { rotation: from, svgOrigin: `${ox} ${oy}` }, { rotation: to, svgOrigin: `${ox} ${oy}`, duration: 1, ease: 'power2.inOut' }, 0);
    });
    tl.fromTo(q('[data-beam]'), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.85)
      .fromTo(q('.stage__glass'), { '--glow': 0 }, { '--glow': 1, duration: 0.35 }, 0.85);
  }
  gsap.from(q('.closing__inner > *'), {
    autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: q('.closing__inner')[0], start: 'top 85%', once: true },
  });
}

/**
 * The Demo Day banner answers the pointer: a light follows it across the
 * panel, the cards tilt toward it, and the year resolves like a readout when
 * the banner arrives. One rAF-throttled handler, nothing runs while idle.
 */
function finaleScene() {
  const panel = $('[data-finale]');
  if (!panel) return;
  const year = $('[data-scramble]', panel);
  if (year) {
    const final = year.dataset.scramble ?? '';
    ScrollTrigger.create({
      trigger: panel, start: 'top 80%', once: true,
      onEnter: () => {
        let frame = 0;
        const id = window.setInterval(() => {
          frame++;
          year.textContent = final.split('').map((ch, i) => (frame > 6 + i * 4 ? ch : String(Math.floor(Math.random() * 10)))).join('');
          if (frame > 6 + final.length * 4) window.clearInterval(id);
        }, 45);
      },
    });
  }
  if (!finePointer) return;
  const cards = $$('.finale__cards li', panel);
  let raf = 0;
  let ev: PointerEvent | null = null;
  const update = () => {
    raf = 0;
    if (!ev) return;
    const r = panel.getBoundingClientRect();
    panel.style.setProperty('--mx', `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    panel.style.setProperty('--my', `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    cards.forEach((c) => {
      const b = c.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (ev!.clientX - (b.left + b.width / 2)) / (b.width / 2 + 120)));
      const ny = Math.max(-1, Math.min(1, (ev!.clientY - (b.top + b.height / 2)) / (b.height / 2 + 120)));
      c.style.setProperty('--ry', `${(nx * 7).toFixed(2)}deg`);
      c.style.setProperty('--rx', `${(-ny * 7).toFixed(2)}deg`);
    });
  };
  panel.addEventListener('pointermove', (e) => { ev = e; if (!raf) raf = requestAnimationFrame(update); });
  panel.addEventListener('pointerleave', () => {
    ev = null;
    cards.forEach((c) => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
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

  // Drawings outside the scroll scenes draw in as they arrive.
  $$('[data-door-media] svg').forEach((svg) =>
    ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => draw(svg) }),
  );

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
  finaleScene();
  reveals();
  ticker();
  if (finePointer) pointerParallax();
}

// Fonts and lazy images change layout; re-measure scroll scenes once settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
