/**
 * Renders the page body from content.ts at build time (see vite.config.ts),
 * so every section is real HTML before any JavaScript runs.
 *
 * Section order follows the "TRILIGHT | WEBSITE COPY" doc:
 *   1 Hero · 2 The ladder · 3 Fundamentals (the loop) · 4 Three forces ·
 *   5 What it takes · 6 Doors · 7 Who can join · 8 Problems · 9 FAQ ·
 *   10 CTA, with the Demo Day program finale.
 *
 * Look: light editorial pages (warm-neutral paper, ink type, hairlines, square
 * buttons, mono labels) with two dark navy sections, the forces panel and
 * the closing, where the blueprint drawings live.
 */
import {
  site, nav as navLinks, footerNav, hero, ladder, loop, lights, value, doors, register, problems, faq, closing, finale, footer as foot,
} from './content';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as bp from './blueprint';
import { stackFigure } from './blueprint/stack';
import { loopOverlay } from './blueprint/overlays';

/** True when an optional asset has been dropped into /public. */
const hasAsset = (path: string) => existsSync(resolve(__dirname, '../public', path));

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (i: number) => String(i).padStart(2, '0');

const arrow =
  '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>';
const outArrow =
  '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>';
const check =
  '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>';

/** Two-tone headline: the words from `tone` onwards take the quieter ink. */
function title(text: string, tone?: string) {
  if (!tone || !text.endsWith(tone)) return esc(text);
  return `${esc(text.slice(0, -tone.length))}<span class="tone">${esc(tone)}</span>`;
}

const kicker = (text: string) => `<p class="kicker"><i aria-hidden="true"></i>${esc(text)}</p>`;

const cta = (section: string, cls = 'btn--ink', text = site.cta) =>
  `<a class="btn ${cls}" href="#register" data-register data-section="${section}"><span>${esc(text)}</span>${arrow}</a>`;

const details = (cls = 'btn--ghost', section = 'details') =>
  `<a class="btn ${cls}" href="${esc(ladder.moreHref)}" target="_blank" rel="noopener" data-section="${section}"><span>${esc(ladder.more)}</span>${outArrow}</a>`;

function head(id: string, h: { kicker?: string; headline: string; tone?: string }, cls = '') {
  return `
    <header class="head ${cls}" data-reveal>
      ${h.kicker ? kicker(h.kicker) : ''}
      <h2 id="${id}" class="h2">${title(h.headline, h.tone)}</h2>
    </header>`;
}

/* -------------------------------------------------------------------- nav */
function navBar() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <div class="nav__bar">
    <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
      <img src="/brand/wordmark-dark.svg" alt="Trilight" width="112" height="25">
    </a>
    <nav class="nav__links" aria-label="Sections">
      ${navLinks.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}
    </nav>
    <div class="nav__end">
      <a class="btn btn--ink btn--sm" href="#register" data-register data-section="nav"><span class="nav__cta-long">${esc(site.cta)}</span><span class="nav__cta-short">Join</span>${arrow}</a>
      <button class="nav__menu" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-sheet" data-menu><i></i><i></i></button>
    </div>
  </div>
  <nav class="nav__sheet" id="nav-sheet" aria-label="Sections" data-sheet hidden>
    ${navLinks.map((l) => `<a href="${l.href}">${esc(l.label)}${arrow}</a>`).join('')}
  </nav>
</header>`;
}

/* ------------------------------------------------------------------ 1 hero */
function heroSection(markSvg: string) {
  return `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="rail hero__grid">
    <div class="hero__copy">
      <h1 id="hero-title" class="hero__title">${esc(hero.headline).replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>')}</h1>
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__cta">${cta('hero')}${details('btn--ghost', 'hero-details')}</div>
    </div>
    <figure class="hero__fig">${stackFigure(markSvg, hero.figureLabel)}</figure>
  </div>
  <div class="hero__facts">
    <dl class="rail facts" aria-label="Key facts">
      ${hero.stats.map((f) => `<div class="fact"><dd>${esc(f.value)}</dd><dt>${esc(f.label)}</dt></div>`).join('')}
    </dl>
  </div>
</section>`;
}

/* -------------------------------------------------------------- 2 ladder */
/*
 * An auto-advancing carousel, after Zaro's: the current stage large in the
 * middle, its neighbours peeking in at the sides. It loops through all eight
 * stages on its own; the rail above shows where it is and how long until the
 * next. The slides are rendered three times so the loop never runs out; the
 * outer copies are hidden from assistive tech and, without JS, from view.
 */
function ladderSection() {
  const st = ladder.stages;
  // public/img/ladder/<id>.webp is the stage's photo; the drawing is the fallback.
  const media = (s: (typeof st)[number], lazy: boolean) =>
    hasAsset(`img/ladder/${s.id}.webp`)
      ? `<img src="/img/ladder/${s.id}.webp" alt="${lazy ? '' : esc(s.figure.label)}" loading="${lazy ? 'lazy' : 'eager'}" decoding="async">`
      : bp.journey(s.figure.src, s.figure.label);
  const slide = (s: (typeof st)[number], i: number, copy: number) => {
    const real = copy === 1;
    return `
      <article class="cslide${real ? '' : ' is-clone'}"${real ? ` id="stage-${s.id}" role="tabpanel" aria-labelledby="tab-${s.id}"` : ' aria-hidden="true" inert'} data-slide="${i}">
        <p class="kicker"><i aria-hidden="true"></i>${esc(s.level)}${s.grant ? ` · ${esc(s.grant)}` : ''}</p>
        <div class="cslide__media">
          ${media(s, !real || i > 1)}
          <p class="cslide__label">${esc(s.title)}.</p>
        </div>
        <div class="cslide__body">
          <p class="cslide__proof">${esc(s.proof)}</p>
          <dl class="cslide__facts">
            <div><dt>Stage</dt><dd>${pad(i + 1)} / ${pad(st.length)} · ${esc(s.phase)}</dd></div>
            <div><dt>Time</dt><dd>${esc(s.time)}</dd></div>
            <div><dt>Grant</dt><dd>${s.grant ? `<b>${esc(s.grant)}</b>` : '—'}</dd></div>
          </dl>
        </div>
      </article>`;
  };
  return `
<section class="sec sec--tint ladder" id="ladder" aria-labelledby="ladder-title" data-ladder>
  <div class="rail">
    <div class="ladder__top">
      ${head('ladder-title', ladder)}
      ${details('btn--ghost', 'ladder-details')}
    </div>
    <ol class="lrail" role="tablist" aria-label="Stages">
      ${st.map((s, i) => `
      <li role="presentation">
        <button type="button" role="tab" class="ltab${i === 0 ? ' is-on' : ''}" id="tab-${s.id}" aria-selected="${i === 0}" aria-controls="stage-${s.id}" data-goto="${i}">
          <span class="ltab__n">${pad(i + 1)}</span><span class="ltab__lvl">${esc(s.level)}</span>
          <i class="ltab__fill" aria-hidden="true"></i>
        </button>
      </li>`).join('')}
    </ol>
  </div>
  <div class="carousel" data-viewport aria-roledescription="carousel" aria-label="The eight stages">
    <div class="carousel__track" data-track>
      ${[0, 1, 2].map((copy) => st.map((s, i) => slide(s, i, copy)).join('')).join('')}
    </div>
  </div>
  <div class="rail ladder__foot">
    <p class="fine ladder__note">${esc(ladder.footnote)}</p>
    <div class="ladder__ctrl">
      <button type="button" class="sq" data-prev aria-label="Previous stage"><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3.5M7.5 4l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg></button>
      <button type="button" class="sq" data-next aria-label="Next stage">${arrow}</button>
    </div>
  </div>
</section>`;
}

/* -------------------------------------------------------- 3 fundamentals */
function loopSection() {
  // The photo with its line-art overlay; the blueprint drawing if the photo is missing.
  const media = (c: (typeof loop.items)[number]) =>
    hasAsset(`img/loop/${c.id}.webp`)
      ? `<img src="/img/loop/${c.id}.webp" alt="${esc(c.photoAlt)}" loading="lazy" decoding="async">${loopOverlay(c.id)}`
      : bp.loop(c.id as 'sense' | 'decide' | 'act', c.figureLabel);
  return `
<section class="sec loop" id="loop" aria-labelledby="loop-title">
  <div class="rail">
    ${head('loop-title', loop)}
    <p class="loop__eg" data-reveal>${esc(loop.example)}</p>
  </div>
  <ol class="rail cards3">
    ${loop.items.map((c, i) => `
    <li class="card3" data-reveal style="--d:${i}">
      <div class="card3__media tab-cut" data-draw>
        ${media(c)}
        <p class="card3__name"><span>${c.n}</span>${esc(c.name)}.</p>
      </div>
      <div class="card3__body">
        <h3 class="card3__story">${c.story.map(esc).join('<br>')}</h3>
        <p class="card3__text">${esc(c.text)}</p>
        <ul class="chips" aria-label="Example parts">${c.parts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
    </li>`).join('')}
  </ol>
</section>`;
}

/* ------------------------------------------------------- 4 three forces */
function lightsSection() {
  return `
<section class="sec forces-sec" id="lights" aria-labelledby="lights-title">
  <div class="rail">
    <div class="panel" data-lamps>
      <p class="panel__tab">${esc(lights.kicker)}</p>
      <div class="panel__top">
        <h2 id="lights-title" class="h2 h2--xl" data-reveal>${title(lights.headline, lights.tone)}</h2>
        <div class="board" aria-hidden="true">
          ${lights.items.map((l, i) => `
          <div class="board__node" data-lamp="${i}" style="--d:${i}">
            <p class="board__lbl"><i></i>Light ${l.n}</p>
            <p class="board__name">${esc(l.name)}</p>
          </div>`).join('')}
          <p class="board__all"><i></i><i></i><i></i>TRL 8</p>
        </div>
      </div>
      <ol class="forces">
        ${lights.items.map((l, i) => `
        <li class="force" data-reveal style="--d:${i}">
          <div class="force__fig">${bp.force(l.id, l.figureLabel)}</div>
          <p class="kicker kicker--dark"><i aria-hidden="true"></i>Light ${l.n}</p>
          <h3 class="h3">${esc(l.name)}</h3>
          <p class="force__text">${esc(l.text)}</p>
        </li>`).join('')}
      </ol>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------- 5 what it takes */
function valueSection() {
  return `
<section class="sec value" id="value" aria-labelledby="value-title">
  <div class="rail value__grid">
    <div>
      ${head('value-title', value)}
      <p class="lede" data-reveal>${esc(value.body)}</p>
    </div>
    <p class="value__lines" data-reveal>${value.lines.map((l, i) => `<span${i ? ' class="tone"' : ''}>${esc(l)}</span>`).join(' ')}</p>
  </div>
  <div class="rail">
    <dl class="stats">
      ${value.stats.map((s, i) => `<div class="stat" data-reveal style="--d:${i % 3}"><dd>${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`).join('')}
    </dl>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- 6 doors */
function doorsSection() {
  const media = (d: (typeof doors.items)[number]) =>
    hasAsset(`img/${d.image}.webp`)
      ? `<img src="/img/${d.image}.webp" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async">`
      : bp.journey(d.figure, d.imageAlt);
  return `
<section class="sec doors" id="doors" aria-labelledby="doors-title">
  <div class="rail">
    ${head('doors-title', doors)}
    <div class="doors__frame">
      ${doors.items.map((d, i) => `
      <article class="door door--${i === 0 ? 'std' : 'fast'}" data-reveal style="--d:${i}">
        <ul class="chips chips--top"><li>${esc(d.name)}</li><li class="chip-dot">${esc(d.tag)}</li></ul>
        <h3 class="door__title">${esc(d.name)}</h3>
        <ul class="door__points">${d.points.map((s) => `<li>${check}<span>${esc(s)}</span></li>`).join('')}</ul>
        ${d.note ? `<p class="door__note">${esc(d.note)}</p>` : ''}
        <div class="door__media" data-draw>${media(d)}</div>
      </article>`).join('')}
    </div>
    <div class="doors__cta">${cta('doors')}</div>
  </div>
</section>`;
}

/* ---------------------------------------------------------- 7 who can join */
function registerSection() {
  return `
<section class="sec join" id="register" aria-labelledby="register-title">
  <div class="rail">
    ${head('register-title', register)}
    <ol class="join__cards">
      ${register.steps.map((s, i) => `
      <li class="join__card" data-reveal style="--d:${i}">
        <span class="num">${pad(i + 1)}</span>
        <h3 class="h3">${esc(s.name)}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- 8 problems */
function problemsSection() {
  return `
<section class="sec problems" id="problems" aria-labelledby="problems-title">
  <div class="rail">
    ${head('problems-title', problems, 'head--center')}
  </div>
  <ul class="rail problems__row">
    ${problems.items.map((p, i) => `
    <li class="prob" data-reveal style="--d:${i}">
      <p class="kicker"><i aria-hidden="true"></i>${esc(p.label)} · ${esc(p.reading)}</p>
      <div class="prob__media">
        <img src="${p.image}" alt="${esc(p.alt)}" width="1200" height="900" loading="lazy" decoding="async">
        <p class="prob__label">${esc(p.problem)}</p>
      </div>
      <p class="prob__idea"><span aria-hidden="true">→</span> ${esc(p.idea)}</p>
    </li>`).join('')}
  </ul>
</section>`;
}

/* -------------------------------------------------------------------- 9 faq */
function faqSection() {
  return `
<section class="sec faq" id="faq" aria-labelledby="faq-title">
  <div class="rail faq__grid">
    <div class="faq__head">
      ${head('faq-title', { kicker: 'FAQ', ...faq })}
      <p class="muted" data-reveal>${esc(faq.note)}</p>
    </div>
    <div class="faq__list">
      ${faq.items.map((f, i) => `
      <details class="qa"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <div class="qa__a"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------- 10 closing and finale */
function closingSection() {
  return `
<section class="dark closing" id="join" aria-labelledby="closing-title">
  <div class="closing__texture" aria-hidden="true"></div>
  <div class="closing__inner">
    <h2 id="closing-title" class="h2 h2--xl" data-reveal>${title(closing.headline, closing.tone)}</h2>
    <div class="closing__cta" data-reveal style="--d:1">
      <a class="btn btn--paper" href="#register" data-register data-section="closing"><i class="sqdot" aria-hidden="true"></i><span>${esc(site.cta)}</span></a>
      ${details('btn--ghost-dark', 'closing-details')}
    </div>
  </div>
</section>

<section class="dark finale" id="demo-day" aria-labelledby="finale-title">
  <div class="rail finale__grid">
    <div class="finale__date" data-reveal>
      ${kicker(finale.kicker)}
      <h2 id="finale-title" class="finale__title">${esc(finale.title.join(' '))}</h2>
      <p class="finale__when"><span>${esc(finale.month)}</span> <span class="finale__year">${esc(finale.year)}</span></p>
      <p class="fine">${esc(finale.note)}</p>
    </div>
    <div class="finale__body" data-reveal style="--d:1">
      <p class="lede">${esc(finale.body)}</p>
      <ul class="finale__cards">
        ${finale.cards.map((c, i) => `<li><span class="num">${pad(i + 1)}</span><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p></li>`).join('')}
      </ul>
      ${cta('finale', 'btn--teal', finale.cta)}
    </div>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- footer */
function footer(wordmarkSvg: string) {
  return `
<footer class="dark footer">
  <div class="rail footer__cols">
    <div>
      <p class="footer__h">Program</p>
      ${footerNav.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}
    </div>
    <div>
      <p class="footer__h">Join</p>
      <a href="#register" data-register data-section="footer">${esc(site.cta)}</a>
      <a href="${esc(ladder.moreHref)}" target="_blank" rel="noopener">${esc(ladder.more)}</a>
    </div>
    <div class="footer__about">
      <p class="footer__h">Trilight</p>
      <p>${esc(site.description)}</p>
    </div>
  </div>
  <div class="rail footer__mark" aria-hidden="true">${wordmarkSvg}</div>
  <div class="rail footer__legal">
    <p>${esc(foot.line)}</p>
    <a href="#top">Back to top ↑</a>
  </div>
</footer>

<div class="mobile-cta" data-mobile-cta>${cta('sticky')}</div>

<dialog class="dialog" id="reg-dialog" aria-labelledby="reg-dialog-title">
  <form method="dialog">
    <img src="/brand/mark.svg" alt="" width="56" height="31">
    <h2 id="reg-dialog-title" class="h3">Joining opens soon.</h2>
    <p class="muted">When it opens, you’ll log in here with your NxtWave learning portal credentials. Nothing to fill in, nothing to pay.</p>
    <button class="btn btn--ink" value="close"><span>Got it</span></button>
  </form>
</dialog>`;
}

/** Pencil filter for the sketch-stage drawing, defined once for the page. */
const defs = `<svg class="bp-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="bp-pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter></svg>`;

export function renderBody(opts: { markSvg: string; wordmarkSvg: string }) {
  return [
    defs,
    navBar(),
    '<main id="main">',
    heroSection(opts.markSvg),
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
    footer(opts.wordmarkSvg),
  ].join('\n');
}

export const meta = { title: site.title, description: site.description };
