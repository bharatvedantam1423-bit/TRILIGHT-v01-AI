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
  site, nav as navLinks, hero, anatomy, ladder, loop, lights, value, doors, register, problems, faq, closing, finale, footer as foot,
} from './content';
import * as bp from './blueprint';
import { CORE_W, CORE_H } from './blueprint/core';

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
  <nav class="nav__links" aria-label="Sections">
    ${navLinks.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('\n    ')}
  </nav>
  <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
    <img src="/brand/wordmark-light.svg" alt="Trilight" width="128" height="29">
  </a>
  <a class="nav__cta" href="#register" data-register data-section="nav">${esc(site.cta)}${arrow}</a>
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

/* 1 · Hero: the copy beside the core, which comes apart on scroll. */
function intro(markSvg: string) {
  const fig = bp.core(anatomy.figureLabel);
  const data = { w: CORE_W, h: CORE_H, shift: fig.centreShift, layers: fig.info };
  return `
<section class="scene scene--intro bp-grid" id="top" aria-labelledby="hero-title">
  <div class="sticky">
    ${drawingFrame(markSvg)}

    <div class="hero" data-hero>
      <h1 id="hero-title" class="hero__headline">${esc(hero.headline).replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>')}</h1>
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__cta">${cta('hero', 'btn--lg')}</div>
      <dl class="facts" aria-label="Key facts">${hero.stats.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
    </div>

    <figure class="core" data-core>
      <div class="core__fig" data-core-fig>${fig.svg}</div>
      <ol class="core__labels" data-core-labels>
        ${anatomy.layers.map((l) => `<li class="callout callout--${l.side}" data-callout="${l.id}"><span class="callout__text"><b>${esc(l.name)}</b><span>${esc(l.text)}</span></span><i class="callout__line"></i></li>`).join('')}
      </ol>
      <script type="application/json" data-core-data>${JSON.stringify(data)}</script>
    </figure>

    <p class="scrollcue" aria-hidden="true"><span></span>Scroll</p>
  </div>
</section>`;
}

/* 2 · The ladder: four steps from idea to product; every arrow is a review. */
function ladderSection() {
  const last = ladder.groups.length - 1;
  return `
<section class="section ladder" id="ladder" aria-labelledby="ladder-title">
  <div class="wrap">
    ${head(ladder.kicker, ladder.headline, 'ladder-title', ladder.body)}
    <ol class="steps4" data-ladder>
      ${ladder.groups
        .map(
          (g, i) => `
      <li class="step4" data-step4>
        <div class="step4__fig">${bp.stage(g.figure, g.figureLabel)}</div>
        <div class="step4__gate" aria-hidden="true"><span class="step4__line"></span>${i < last ? `<span class="step4__node">${right}</span>` : ''}</div>
        <p class="step4__n">${esc(g.step)}</p>
        <h3 class="h3">${esc(g.title)}</h3>
        <dl class="step4__rows">
          ${g.rows.map((r) => `<div><dt>${esc(r.level)}</dt><dd>${esc(r.text)}</dd>${r.grant ? `<dd class="step4__grant">${esc(r.grant)}</dd>` : ''}</div>`).join('')}
        </dl>
      </li>`,
        )
        .join('')}
    </ol>
    <p class="fine ladder__foot">${esc(ladder.footnote)}</p>
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

/* 4 · The three forces: three lamps on one beam. */
function lightsSection() {
  return `
<section class="section lights bp-grid" id="lights" aria-labelledby="lights-title">
  <div class="wrap">
    ${head(lights.kicker, lights.headline, 'lights-title', undefined, true)}
    <ol class="lamps" data-lamps>
      <li class="lamps__rail" aria-hidden="true"><span data-lamp-beam></span></li>
      ${lights.items
        .map(
          (l, i) => `
      <li class="lamp" data-lamp="${i}">
        <span class="lamp__bulb" aria-hidden="true"><i></i></span>
        <p class="lamp__n">Light ${l.n}</p>
        <h3 class="h3">${esc(l.name)}</h3>
        <p class="muted">${esc(l.text)}</p>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

/* 5 · What it takes: the field build on the left, the numbers on the right. */
function valueSection() {
  return `
<section class="section value" id="value" aria-labelledby="value-title">
  <div class="wrap">
    ${head(value.kicker, value.headline, 'value-title')}
    <div class="value__grid">
      <div class="value__copy">
        <p class="value__lines">${value.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
        <p class="lede">${esc(value.body)}</p>
        <div class="value__fig" data-reveal>${bp.stage('trl5', value.figureLabel)}</div>
      </div>
      <dl class="stats6">
        ${value.stats.map((s) => `<div data-reveal><dd>${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`).join('')}
      </dl>
    </div>
  </div>
</section>`;
}

/* 6 · Two doors in. */
function doorsSection() {
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
        <h3 class="h3">${esc(d.name)}</h3>
        <ul class="door__steps">${d.points.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        ${d.note ? `<p class="muted door__note">${esc(d.note)}</p>` : ''}
      </article>`,
        )
        .join('')}
    </div>
    <div class="doors__cta">${cta('doors')}</div>
  </div>
</section>`;
}

/* 7 · Who can join: three bracket cards. */
function registerSection() {
  return `
<section class="section register" id="register" aria-labelledby="register-title">
  <div class="wrap">
    ${head(register.kicker, register.headline, 'register-title')}
    <ul class="brackets">
      ${register.steps.map((s) => `<li class="bracket" data-reveal><h3 class="h3">${esc(s.name)}</h3><p class="muted">${esc(s.text)}</p></li>`).join('')}
    </ul>
    <div class="register__cta">${cta('register', 'btn--lg')}</div>
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

/* 10 · CTA, then the program finale: Demo Day. */
function closingSection() {
  return `
<section class="closing bp-grid" id="join" aria-labelledby="closing-title">
  <div class="closing__inner">
    <div class="closing__fig" data-closing-fig>${bp.stage('trl6', 'Blueprint of the finished sensor node: closed enclosure, antenna and status light')}</div>
    <h2 id="closing-title" class="closing__title">${esc(closing.headline)}</h2>
    ${cta('closing', 'btn--lg')}
  </div>
</section>

<section class="section finale" id="demo-day" aria-labelledby="finale-title">
  <div class="wrap">
    <h2 id="finale-title" class="finale__title">${esc(finale.title[0])} <span>${esc(finale.title[1])}</span></h2>
    <div class="finale__panel" data-reveal>
      <div class="finale__date">
        <p class="label"><span>${esc(finale.kicker)}</span></p>
        <p class="finale__when"><span>${esc(finale.month)}</span><b>${esc(finale.year)}</b></p>
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
      ${navLinks.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('\n      ')}
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
