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
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(heroEl);
    new IntersectionObserver(([e]) => { atClose = e.isIntersecting || e.boundingClientRect.top < 0; sync(); }).observe(closingEl);
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
  const svg = host.matches('svg') ? host : $('svg.bp-svg', host);
  svg?.classList.add('is-drawn');
  window.setTimeout(() => host.classList.add('is-live'), 1600);
};

if (reduceMotion) {
  $$('[data-draw]').forEach((el) => { $('svg.bp-svg', el)?.classList.add('is-drawn'); el.classList.add('is-live'); });
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
 * One stage at a time. The list, prev/next, arrow keys and swipes move
 * between the eight stages; picture and details change together.
 */
function ladderScene() {
  const sec = $('[data-ladder]');
  if (!sec) return;
  const tabs = $$<HTMLButtonElement>('[data-goto]', sec);
  const stages = $$('[data-stage]', sec);
  const prev = $<HTMLButtonElement>('[data-prev]', sec)!;
  const next = $<HTMLButtonElement>('[data-next]', sec)!;
  const list = $('.ladder__list', sec);
  let i = 0;

  const go = (to: number, focusTab = false) => {
    i = Math.max(0, Math.min(stages.length - 1, to));
    stages.forEach((s, j) => {
      const on = j === i;
      s.hidden = !on;
      s.classList.toggle('is-on', on);
    });
    tabs.forEach((t, j) => {
      t.classList.toggle('is-on', j === i);
      t.classList.toggle('is-past', j < i);
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    prev.disabled = i === 0;
    next.disabled = i === stages.length - 1;
    draw($('.stage__media', stages[i]));
    if (focusTab) tabs[i].focus();
    // Keep the active tab in view in the phone's sideways list, without moving the page.
    if (list && list.scrollWidth > list.clientWidth) {
      const t = tabs[i];
      list.scrollTo({ left: t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));
  tabs.forEach((t, j) => t.addEventListener('click', () => { go(j); track('ladder_stage', { stage: j + 1, by: 'tab' }); }));
  sec.addEventListener('keydown', (e) => {
    const onTab = document.activeElement?.hasAttribute('data-goto') ?? false;
    if (e.key === 'ArrowRight' || (onTab && e.key === 'ArrowDown')) { e.preventDefault(); go(i + 1, onTab); }
    if (e.key === 'ArrowLeft' || (onTab && e.key === 'ArrowUp')) { e.preventDefault(); go(i - 1, onTab); }
  });
  const stageBox = $('.ladder__stage', sec)!;
  let x0: number | null = null;
  stageBox.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  stageBox.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  });

  go(0);
  if (!reduceMotion) autoplay(sec, () => i, (to) => go(to), stages.length, [prev, next, ...tabs, stageBox]);
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
  // Restarting the active step's fill keeps the countdown honest.
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
  sec.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; schedule(); } });
  sec.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: 0.35 }).observe($('.ladder__frame', sec)!);
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
