/**
 * Renders the page body from content.ts at build time (see vite.config.ts),
 * so every section is real HTML before any JavaScript runs.
 *
 * Section order follows the "TRILIGHT | WEBSITE COPY" doc:
 *   1 Hero · 2 The ladder · 3 Fundamentals (the loop) · 4 Three forces ·
 *   5 What it takes · 6 Doors · 7 Who can join · 8 Problems · 9 FAQ ·
 *   10 CTA, with the Demo Day program finale.
 * Every illustration is an isometric blueprint drawn in src/blueprint/.
 */
import {
  site, nav as navLinks, footerNav, hero, ladder, loop, lights, value, doors, register, problems, faq, closing, finale, footer as foot,
} from './content';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as bp from './blueprint';
import { robotStage } from './blueprint/robots';
import { HERO_W, HERO_H, HAND_IMG } from './blueprint/hero';

/** True when an optional asset has been dropped into /public. */
const hasAsset = (path: string) => existsSync(resolve(__dirname, '../public', path));

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const arrow =
  '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14 14 6M7.5 6H14v6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const right =
  '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const cta = (section: string, extra = '', text = site.cta, icon = arrow) =>
  `<a class="btn ${extra}" href="#register" data-register data-section="${section}"><span>${esc(text)}</span>${icon}</a>`;

const label = (text: string) => `<p class="label"><span>${esc(text)}</span></p>`;

function head(kicker: string | null, title: string, id: string, body?: string, center = false) {
  return `
    <header class="head${center ? ' head--center' : ''}${body && !center ? ' head--split' : ''}">
      <div>
        ${kicker ? label(kicker) : ''}
        <h2 id="${id}" class="h2">${esc(title)}</h2>
      </div>
      ${body ? `<p class="lede">${esc(body)}</p>` : ''}
    </header>`;
}

/** Pencil filter for the sketch-stage figure, defined once for the page. */
const defs = `<svg class="bp-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="bp-pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter></svg>`;

function navBar() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <div class="nav__inner">
    <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
      <img src="/brand/wordmark-light.svg" alt="Trilight" width="128" height="29">
    </a>
    <nav class="nav__links" aria-label="Sections">
      ${navLinks.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}
      <a class="nav__cta" href="#register" data-register data-section="nav"><i class="nav__dot" aria-hidden="true"></i><span class="nav__cta-long">${esc(site.cta)}</span><span class="nav__cta-short" aria-hidden="true">Join</span>${arrow}</a>
    </nav>
  </div>
</header>`;
}

/**
 * Engineering-drawing frame around the hero: corner registration marks, edge
 * rulers and a title block with the TRL counter that climbs with the page.
 */
function drawingFrame(markSvg: string) {
  return `
    <div class="dwg" aria-hidden="true">
      <i class="dwg__c dwg__c--tl"></i><i class="dwg__c dwg__c--tr"></i><i class="dwg__c dwg__c--bl"></i><i class="dwg__c dwg__c--br"></i>
      <span class="dwg__ruler dwg__ruler--top"></span><span class="dwg__ruler dwg__ruler--left"></span>
      <div class="dwg__block">
        <span class="dwg__logo">${markSvg}</span>
        <span><span>TRL <b data-trl>0</b>/8</span></span>
      </div>
    </div>`;
}

/*
 * 1 · Hero: the copy over the circuit city. On scroll the copy clears, a hand
 * seats the chip, the board powers up and the camera dives into the chip.
 */
function intro(markSvg: string) {
  const fig = bp.heroScene();
  const data = { w: HERO_W, h: HERO_H, lift: fig.lift, centre: fig.centre };
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
  const layer = (name: string, cls: string, eager: boolean) => `
        <picture class="${cls}">
          <source media="(max-width: 760px)" srcset="/img/${name}-sm.webp">
          <img src="/img/${name}.webp" width="2600" height="2028" alt="" decoding="async" fetchpriority="${eager ? 'high' : 'low'}">
        </picture>`;
  return `
<section class="scene scene--intro bp-grid" id="top" aria-labelledby="hero-title">
  <div class="sticky">
    <div class="city" data-city>
      <div class="city__stage" data-city-stage role="img" aria-label="${esc(hero.figureLabel)}">
        ${layer('hero-base', 'city__layer', true)}
        ${fig.overlay}
        ${layer('hero-front', 'city__layer', false)}
        <img class="city__hand" data-city-hand src="${HAND_IMG.src}" alt="" width="${HAND_IMG.w}" height="${HAND_IMG.h}" decoding="async" fetchpriority="low"
          style="left:${pct(fig.hand.left, HERO_W)};top:${pct(fig.hand.top, HERO_H)};width:${pct(fig.hand.width, HERO_W)}">
      </div>
    </div>
    <div class="city__shade" aria-hidden="true"></div>
    ${drawingFrame(markSvg)}

    <div class="hero" data-hero>
      <h1 id="hero-title" class="hero__headline">${esc(hero.headline).replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>')}</h1>
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__cta">${cta('hero', 'btn--lg')}</div>
      <dl class="facts" aria-label="Key facts">${hero.stats.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
    </div>

    <script type="application/json" data-city-data>${JSON.stringify(data)}</script>
    <p class="scrollcue" aria-hidden="true"><span></span>Scroll</p>
  </div>
</section>`;
}

/*
 * 2 · The ladder: pinned. The title sits on top; below it the drawing grows on
 * the left while the step changes on the right. One thing moves at a time.
 */
function ladderSection() {
  const groups = ladder.groups;
  const n = groups.length;
  return `
<section class="journey" id="ladder" aria-labelledby="ladder-title">
  <div class="journey__sticky">
    <div class="wrap">
      <header class="journey__head">
        <div>
          ${label(ladder.kicker)}
          <h2 id="ladder-title" class="h2">${esc(ladder.headline)}</h2>
        </div>
        <p class="lede">${esc(ladder.body)}</p>
      </header>
      <div class="journey__grid">
        <div class="journey__left">
          <div class="journey__stage" aria-hidden="true">
            ${groups.map((g, i) => `<div class="journey__fig${i === 0 ? ' is-active' : ''}" data-journey-fig>${bp.journey(g.figure, g.figureLabel)}</div>`).join('')}
          </div>
          <ol class="journey__gates" aria-hidden="true">
            ${groups.map((g, i) => `<li class="${i === 0 ? 'is-on' : ''}" data-journey-gate><b>${esc(g.title)}</b></li>`).join('')}
          </ol>
        </div>
        <div class="journey__steps">
          ${groups
            .map(
              (g, i) => `
          <div class="journey__step${i === 0 ? ' is-active' : ''}" data-journey-step>
            <p class="journey__count"><b>${String(i + 1).padStart(2, '0')}</b> / ${String(n).padStart(2, '0')}</p>
            <h3 class="journey__title">${esc(g.title)}</h3>
            <p class="journey__n">${esc(g.step)}</p>
            <dl class="journey__rows">
              ${g.rows.map((r) => `<div><dt>${esc(r.level)}</dt><dd>${esc(r.text)}</dd>${r.grant ? `<dd class="journey__grant">${esc(r.grant)}</dd>` : ''}</div>`).join('')}
            </dl>
          </div>`,
            )
            .join('')}
          <p class="fine journey__foot">${esc(ladder.footnote)}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* 3 · Fundamentals: one board, framed in three cards; signals run between them. */
function loopSection() {
  return `
<section class="section loop bp-grid" id="loop" aria-labelledby="loop-title">
  <div class="wrap">
    ${head(loop.kicker, loop.headline, 'loop-title', loop.body)}
    <ol class="cards3" data-loop>
      ${loop.items
        .map(
          (c) => `
      <li class="card3" data-reveal>
        <div class="card3__fig">${bp.loop(c.id as 'sense' | 'decide' | 'act', c.figureLabel)}</div>
        <h3 class="card3__title"><span>${c.n}</span>${esc(c.name)}</h3>
        <p class="muted">${esc(c.text)}</p>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

/* 4 · The three forces: one drawing per light; each light turns on as you reach it. */
function lightsSection() {
  return `
<section class="section lights bp-grid" id="lights" aria-labelledby="lights-title">
  <div class="wrap">
    ${head(lights.kicker, lights.headline, 'lights-title', undefined, true)}
    <ol class="forces" data-lamps>
      <li class="forces__rail" aria-hidden="true"><span data-lamp-beam></span></li>
      ${lights.items
        .map(
          (l, i) => `
      <li class="force" data-lamp="${i}">
        <span class="force__light" aria-hidden="true"><i></i></span>
        <div class="force__fig">${bp.force(l.id, l.figureLabel)}</div>
        <p class="force__n">Light ${l.n}</p>
        <h3 class="h3">${esc(l.name)}</h3>
        <p class="muted">${esc(l.text)}</p>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

/* 5 · What it takes: the point, then the numbers. Nothing else. */
function valueSection() {
  return `
<section class="section value" id="value" aria-labelledby="value-title">
  <div class="wrap">
    ${head(value.kicker, value.headline, 'value-title')}
    <div class="value__intro" data-reveal>
      <p class="value__lines">${value.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
      <p class="lede">${esc(value.body)}</p>
    </div>
    <dl class="stats6">
      ${value.stats.map((s) => `<div data-reveal><dd>${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`).join('')}
    </dl>
  </div>
</section>`;
}

/* 6 · Two doors in, each with its picture (a photo when supplied, else a drawing). */
function doorsSection() {
  const media = (d: (typeof doors.items)[number]) =>
    hasAsset(`img/${d.image}.webp`)
      ? `<img src="/img/${d.image}.webp" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async">`
      : bp.journey(d.figure, d.imageAlt);
  return `
<section class="section doors" id="doors" aria-labelledby="doors-title">
  <div class="wrap">
    ${head(null, doors.headline, 'doors-title')}
    <div class="doors__grid">
      ${doors.items
        .map(
          (d, i) => `
      <article class="door${i === 0 ? ' door--main' : ''}" data-reveal>
        <span class="door__edge" aria-hidden="true"></span>
        <div class="door__media" data-door-media>${media(d)}<span class="door__scan" aria-hidden="true"></span></div>
        <div class="door__body">
          <h3 class="h3">${esc(d.name)}</h3>
          <ul class="door__steps">${d.points.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          ${d.note ? `<p class="muted door__note">${esc(d.note)}</p>` : ''}
        </div>
      </article>`,
        )
        .join('')}
    </div>
    <div class="doors__cta">${cta('doors')}</div>
  </div>
</section>`;
}

/* 7 · Who can join: three cards. */
function registerSection() {
  return `
<section class="section register" id="register" aria-labelledby="register-title">
  <div class="wrap">
    ${head(register.kicker, register.headline, 'register-title')}
    <ul class="join-cards">
      ${register.steps.map((s, i) => `<li class="join-card" data-reveal><span class="join-card__n">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${esc(s.name)}</h3><p class="muted">${esc(s.text)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

/* 8 · Problems around you. */
function problemsSection() {
  return `
<section class="section problems-sec" id="problems" aria-labelledby="problems-title">
  <div class="wrap">
    ${head(problems.kicker, problems.headline, 'problems-title')}
    <ul class="problems">
      ${problems.items
        .map(
          (p) => `
      <li class="problem" data-reveal>
        <img src="${p.image}" alt="${esc(p.alt)}" width="1200" height="900" loading="lazy" decoding="async">
        <span class="problem__det" aria-hidden="true"><span>${esc(p.label)}</span><b>${esc(p.reading)}</b></span>
        <div class="problem__copy">
          <p class="problem__p">${esc(p.problem)}</p>
          <p class="problem__i"><span aria-hidden="true">→</span> ${esc(p.idea)}</p>
        </div>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

/* 9 · FAQ. */
function faqSection() {
  return `
<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq__wrap">
    <div class="faq__head">
      ${label('FAQ')}
      <h2 id="faq-title" class="h2">${esc(faq.headline)}</h2>
      <p class="muted">${esc(faq.note)}</p>
    </div>
    <div class="faq__list">
      ${faq.items
        .map(
          (f, i) => `
      <details class="qa"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <p class="muted">${esc(f.a)}</p>
      </details>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/*
 * 10 · CTA. The stage: two robot arms either side of a glass block with the
 * Trilight logo; the left arm lights it. A video replaces it when supplied.
 */
function closingScene() {
  const v = closing.video;
  if (hasAsset(`video/${v}.mp4`)) {
    const poster = hasAsset(`video/${v}-poster.webp`) ? ` poster="/video/${v}-poster.webp"` : '';
    return `<div class="stagebox stagebox--video"><video src="/video/${v}.mp4"${poster} muted loop playsinline preload="metadata" data-closing-video aria-label="${esc(closing.sceneLabel)}"></video></div>`;
  }
  return robotStage(closing.sceneLabel);
}

/* 10 · CTA, then the program finale: Demo Day. */
function closingSection() {
  return `
<section class="closing" id="join" aria-labelledby="closing-title">
  ${closingScene()}
  <div class="closing__inner">
    <h2 id="closing-title" class="closing__title">${esc(closing.headline)}</h2>
    ${cta('closing', 'btn--lg')}
  </div>
</section>

<section class="section finale" id="demo-day" aria-labelledby="finale-title">
  <div class="wrap">
    <h2 id="finale-title" class="finale__title">${esc(finale.title[0])} <span>${esc(finale.title[1])}</span></h2>
    <div class="finale__panel" data-reveal data-finale>
      <span class="finale__trace" aria-hidden="true"></span>
      <div class="finale__date">
        <p class="label"><span>${esc(finale.kicker)}</span></p>
        <p class="finale__when"><span>${esc(finale.month)}</span><b data-scramble="${esc(finale.year)}">${esc(finale.year)}</b></p>
        <p class="fine">${esc(finale.note)}</p>
      </div>
      <div class="finale__body">
        <p class="lede">${esc(finale.body)}</p>
        <ul class="finale__cards">
          ${finale.cards.map((c) => `<li><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p></li>`).join('')}
        </ul>
        ${cta('finale', 'btn--pill', finale.cta, right)}
      </div>
    </div>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="wrap footer__inner">
    <div class="footer__brand">
      <img src="/brand/logo-light.svg" alt="Trilight · Build · Test · Deploy" width="168" height="46" loading="lazy">
      <p class="fine">${esc(foot.line)}</p>
    </div>
    <nav class="footer__links" aria-label="Footer">
      ${footerNav.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('\n      ')}
    </nav>
  </div>
</footer>

<div class="mobile-cta" data-mobile-cta>${cta('sticky')}</div>

<dialog class="dialog" id="reg-dialog" aria-labelledby="reg-dialog-title">
  <form method="dialog">
    <img src="/brand/mark.svg" alt="" width="64" height="36">
    <h2 id="reg-dialog-title" class="h3">Joining opens soon.</h2>
    <p class="muted">When it opens, you’ll log in here with your NxtWave learning portal credentials. Nothing to fill in, nothing to pay.</p>
    <button class="btn" value="close"><span>Got it</span></button>
  </form>
</dialog>`;
}

export function renderBody(opts: { markSvg: string }) {
  return [
    defs,
    navBar(),
    '<main id="main">',
    intro(opts.markSvg),
    ladderSection(),
    loopSection(),
    lightsSection(),
    valueSection(),
    doorsSection(),
    registerSection(),
    problemsSection(),
    faqSection(),
    closingSection(),
    '</main>',
    footer(),
  ].join('\n');
}

export const meta = { title: site.title, description: site.description };
