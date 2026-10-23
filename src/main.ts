import './styles.css';
import './blueprint/blueprint.css';
import { registerUrl } from './config';
import { track } from './analytics';

/*
 * Native scrolling, no animation library. Things arrive as they scroll into
 * view (IntersectionObserver + CSS transitions); the hero animates on load in
 * CSS. With reduced motion, nothing moves and everything is simply there.
 */
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

root.classList.toggle('motion', !reduceMotion);

/** Calls `fn` once when `el` first comes into view. */
function onceInView(el: Element, fn: () => void, rootMargin = '0px 0px -12% 0px') {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin });
  io.observe(el);
}

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
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

track('page_view', { path: location.pathname });

/* ------------------------------------------------------------ nav + menu */

const nav = $('[data-nav]');
const menu = $<HTMLButtonElement>('[data-menu]');
const sheet = $('[data-sheet]');

const setMenu = (open: boolean) => {
  if (!nav || !menu || !sheet) return;
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  sheet.hidden = !open;
};
menu?.addEventListener('click', () => setMenu(!nav?.classList.contains('is-open')));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

let ticking = false;
const onScroll = () => {
  ticking = false;
  nav?.classList.toggle('is-scrolled', window.scrollY > 24);
};
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// In-page links glide; the menu closes behind them.
$$<HTMLAnchorElement>('a[href^="#"]:not([data-register])').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
});

/* ------------------------------------------------------------ sticky CTA */
// Shown on phones once the hero is gone, hidden again at the closing CTA.
{
  const bar = $('[data-mobile-cta]');
  const heroEl = $('.hero');
  const closingEl = $('#join');
  if (bar && heroEl && closingEl) {
    let pastHero = false;
    let atClose = false;
    const sync = () => bar.classList.toggle('is-visible', pastHero && !atClose);
    new IntersectionObserver((es) => { const e = es[es.length - 1]; pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(heroEl);
    new IntersectionObserver((es) => { const e = es[es.length - 1]; atClose = e.isIntersecting || e.boundingClientRect.top < 0; sync(); }).observe(closingEl);
  }
}

/* ------------------------------------------------------------ scroll depth */
['#ladder', '#loop', '#value', '#faq'].forEach((sel) => {
  const el = $(sel);
  if (el) onceInView(el, () => track('scroll_depth', { section: sel.slice(1) }), '0px 0px -40% 0px');
});

/* ---------------------------------------------------------------- reveals */

/** Draws a blueprint figure in (its lines, then its fills), then lights it. */
const draw = (host: Element | null | undefined) => {
  if (!host) return;
  const svg = host.matches('svg') ? host : $('svg.bp-svg, svg.ov', host);
  svg?.classList.add('is-drawn');
  if (svg?.matches('.ov')) $$('[data-count]', svg).forEach((n) => countUp(n, 900, 1300));
  window.setTimeout(() => host.classList.add('is-live'), 1600);
};

/** Counts a number up from zero, e.g. a sensor reading. */
function countUp(el: Element, delay: number, ms: number) {
  const to = Number(el.getAttribute('data-count')) || 0;
  el.textContent = '0';
  window.setTimeout(() => {
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, delay);
}

if (reduceMotion) {
  $$('[data-draw]').forEach((el) => { $('svg.bp-svg, svg.ov', el)?.classList.add('is-drawn'); el.classList.add('is-live'); });
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (e.target.hasAttribute('data-draw')) draw(e.target);
      else e.target.classList.add('is-in');
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('[data-reveal], [data-draw]').forEach((el) => io.observe(el));
}

/* ----------------------------------------------------------------- ladder */
/*
 * The ladder carousel moves on its own: every few seconds the next stage
 * slides to the middle. The rail, prev/next, arrow keys, swipes and a click
 * on a side slide move it by hand, and the countdown starts again from there.
 * The slides exist three times over, so it can always slide forward: after
 * it passes the end of the middle copy it quietly jumps back into it.
 */
const AUTO_MS = 4500;
function ladderScene() {
  const sec = $('[data-ladder]');
  if (!sec) return;
  const vp = $('[data-viewport]', sec)!;
  const trackEl = $('[data-track]', sec)!;
  const slides = $$('[data-slide]', sec);
  const tabs = $$<HTMLButtonElement>('[data-goto]', sec);
  const rail = $('.lrail', sec);
  const n = tabs.length;
  let p = n; // index into all slides; the middle copy is n … 2n-1
  const k = () => ((p % n) + n) % n;

  const place = (animate = true) => {
    vp.classList.toggle('no-anim', !animate);
    const el = slides[p];
    const x = vp.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
    trackEl.style.transform = `translate3d(${x}px, 0, 0)`;
    slides.forEach((s, j) => s.classList.toggle('is-on', j === p));
    tabs.forEach((t, j) => {
      t.classList.toggle('is-on', j === k());
      t.classList.toggle('is-past', j < k());
      t.setAttribute('aria-selected', String(j === k()));
      t.tabIndex = j === k() ? 0 : -1;
    });
    if (!animate) { void trackEl.offsetWidth; vp.classList.remove('no-anim'); }
    if (rail && rail.scrollWidth > rail.clientWidth) {
      const t = tabs[k()];
      rail.scrollTo({ left: t.offsetLeft - (rail.clientWidth - t.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };
  // Back into the middle copy once a slide past either end has settled.
  trackEl.addEventListener('transitionend', (e) => {
    if (e.target !== trackEl || (p >= n && p < 2 * n)) return;
    p = n + k();
    place(false);
  });

  let timer = 0;
  let visible = false;
  const restartFill = () => { sec.classList.remove('is-ticking'); void sec.offsetWidth; sec.classList.add('is-ticking'); };
  const schedule = () => {
    window.clearTimeout(timer);
    sec.classList.remove('is-ticking');
    if (reduceMotion || !visible || document.hidden) return;
    restartFill();
    timer = window.setTimeout(() => { p += 1; place(); track('ladder_stage', { stage: k() + 1, by: 'auto' }); schedule(); }, AUTO_MS);
  };
  const move = (to: number, by: string) => { p = to; place(); track('ladder_stage', { stage: k() + 1, by }); schedule(); };

  $('[data-prev]', sec)?.addEventListener('click', () => move(p - 1, 'button'));
  $('[data-next]', sec)?.addEventListener('click', () => move(p + 1, 'button'));
  tabs.forEach((t, j) => t.addEventListener('click', () => move(n + j, 'tab')));
  let swiped = false;
  slides.forEach((s, j) => s.addEventListener('click', () => { if (!swiped && j !== p) move(j, 'slide'); swiped = false; }));
  sec.addEventListener('keydown', (e) => {
    const onTab = document.activeElement?.hasAttribute('data-goto') ?? false;
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    move(p + step, 'key');
    if (onTab) tabs[k()].focus();
  });
  let x0: number | null = null;
  vp.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  vp.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    swiped = Math.abs(dx) > 40;
    if (swiped) move(p + (dx < 0 ? 1 : -1), 'swipe');
  });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; schedule(); }, { threshold: 0.3 }).observe(vp);
  window.addEventListener('resize', () => place(false));
  document.fonts?.ready.then(() => place(false));

  sec.style.setProperty('--auto-ms', `${AUTO_MS}ms`);
  place(false);
}

/* ------------------------------------------------------------ three lights */
// Build, Test, Deploy light one after another; with all three on, TRL 8.
function lampsScene() {
  const panel = $('[data-lamps]');
  if (!panel) return;
  const board = $('.board', panel);
  const nodes = $$('[data-lamp]', panel);
  // The force drawings draw as --d runs 0 → 1 (blueprint.css, .bp-scrub).
  const figs = $$<SVGSVGElement>('.force__fig svg', panel);
  const drawFig = (svg: SVGSVGElement, ms: number) => {
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      svg.style.setProperty('--d', (1 - Math.pow(1 - p, 3)).toFixed(3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion) {
    nodes.forEach((n) => n.classList.add('is-lit'));
    board?.classList.add('is-done');
    figs.forEach((f) => f.style.setProperty('--d', '1'));
    return;
  }
  onceInView(board ?? panel, () => {
    nodes.forEach((n, k) => window.setTimeout(() => n.classList.add('is-lit'), 350 + k * 650));
    window.setTimeout(() => board?.classList.add('is-done'), 350 + nodes.length * 650);
  }, '0px 0px -30% 0px');
  figs.forEach((f, k) => onceInView(f, () => window.setTimeout(() => drawFig(f, 1800), k * 220), '0px 0px -15% 0px'));
}

ladderScene();
lampsScene();
