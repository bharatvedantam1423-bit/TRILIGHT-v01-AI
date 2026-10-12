/**
 * Renders the page body from content.ts at build time (see vite.config.ts),
 * so every section is real HTML before any JavaScript runs.
 *
 * Layout system: one 12-col grid, section heads share the same left edge,
 * hairline rules separate rows. Cinematic layers only appear in the three
 * scroll scenes (hero frame, lens → lab stage, closing frame).
 */
import {
  site, hero, whatIs, lights, projects, commitments, ladder, doors, value, register, faq, closing,
} from './content';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const arrow =
  '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14 14 6M7.5 6H14v6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const cta = (section: string, extra = '') =>
  `<a class="btn ${extra}" href="#register" data-register data-section="${section}"><span>${esc(site.cta)}</span>${arrow}</a>`;

const label = (text: string, n?: string) =>
  `<p class="label">${n ? `<span class="label__n">${n}</span>` : ''}<span>${esc(text)}</span></p>`;

const pic = (name: string, w: number, h: number, alt = '', priority = false) => `
      <picture>
        <source media="(max-width: 760px)" srcset="/img/${name}-sm.webp">
        <img src="/img/${name}.webp" width="${w}" height="${h}" alt="${esc(alt)}" decoding="async"${priority ? ' fetchpriority="high"' : ' loading="lazy"'}>
      </picture>`;

/** The hardware frame: dense cut-out clusters around an empty centre. */
function frame(where: 'hero' | 'closing') {
  const eager = where === 'hero';
  return `
    <div class="frame frame--${where}" aria-hidden="true" data-frame>
      <div class="layer layer--back-l" data-layer="back-l">${pic('fr-left2', 806, 1500, '', eager)}</div>
      <div class="layer layer--back-r" data-layer="back-r">${pic('fr-left2', 806, 1500, '', eager)}</div>
      <div class="layer layer--vine-l" data-layer="vine-l">${pic('fr-vine1', 276, 1500, '', eager)}</div>
      <div class="layer layer--vine-r" data-layer="vine-r">${pic('fr-vine1', 276, 1500, '', eager)}</div>
      <div class="layer layer--l" data-layer="l">${pic('fr-left1', 700, 1500, '', eager)}</div>
      <div class="layer layer--r" data-layer="r">${pic('fr-right2', 509, 1500, '', eager)}</div>
      <div class="layer layer--pile" data-layer="pile">${pic('fr-pile', 2400, 716, '', eager)}</div>
    </div>`;
}

function nav() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <nav class="nav__links" aria-label="Sections">
    <a href="#what">What is TRL8</a>
    <a href="#ladder">How it works</a>
    <a href="#faq">FAQ</a>
  </nav>
  <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
    <img src="/brand/wordmark-light.svg" alt="Trilight" width="128" height="29">
  </a>
  <a class="nav__cta" href="#register" data-register data-section="nav">Register${arrow}</a>
</header>`;
}

function intro(markSvg: string) {
  return `
<section class="scene scene--intro" id="top" aria-labelledby="hero-title">
  <div class="sticky">
    <div class="glow" aria-hidden="true"></div>

    <div class="lens only-motion" aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcset="/img/lens-sm.webp">
        <img src="/img/lens.webp" width="1920" height="1080" alt="" fetchpriority="low" decoding="async">
      </picture>
      <div class="reticle"><i></i><i></i></div>
    </div>
    <div class="xmark only-motion" aria-hidden="true">${markSvg}</div>

    ${frame('hero')}

    <div class="hero" data-hero>
      <h1 id="hero-title" class="hero__title">
        <span class="bracket"><span class="bracket__b" aria-hidden="true">[</span>${esc(hero.bracket)}<span class="bracket__b" aria-hidden="true">]</span></span>
        <span class="hero__display">NE<span class="hero__x">X</span>T</span>
      </h1>
      <p class="hero__sub">${esc(hero.headline)}</p>
      <div class="hero__cta">${cta('hero', 'btn--lg')}</div>
      <ul class="facts" aria-label="Key facts">${hero.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>

    <p class="scrollcue" aria-hidden="true"><span></span>Scroll</p>
    <p class="lens-caption only-motion" aria-hidden="true">Seeing the world the way a machine does.</p>
    <div class="blackout only-motion" aria-hidden="true"></div>
  </div>
</section>`;
}

function what() {
  const levels = Array.from({ length: 9 }, (_, i) => i + 1);
  return `
<section class="scene scene--what" id="what" aria-labelledby="what-title">
  <div class="sticky">
    <picture class="what__bg" aria-hidden="true">
      <source media="(max-width: 760px)" srcset="/img/stage-sm.webp">
      <img src="/img/stage.webp" width="1920" height="1080" alt="" fetchpriority="low" decoding="async">
    </picture>
    <div class="what__shade" aria-hidden="true"></div>
    <figure class="what__figure">
      <picture>
        <source media="(max-width: 760px)" srcset="/img/student-sm.webp">
        <img src="/img/student.webp" width="1100" height="976" alt="A NIAT student kneeling to adjust a small wheeled robot" fetchpriority="low" decoding="async">
      </picture>
      <span class="det" aria-hidden="true"><span>Robot</span><b>Sense → Decide → Act</b></span>
    </figure>
    <div class="what__fore" aria-hidden="true">${pic('fr-pile', 2400, 716)}</div>
    <div class="what__copy">
      <div class="what__step" data-step="1">
        ${label(whatIs.kicker, '01')}
        <h2 id="what-title" class="h2">${esc(whatIs.headline)}</h2>
        <p class="lede">${esc(whatIs.body)}</p>
      </div>
      <div class="what__step" data-step="2">
        ${label(whatIs.scaleTitle, '02')}
        <p class="lede">${esc(whatIs.scaleBody)}</p>
        <ol class="trl" aria-label="NASA Technology Readiness Levels 1 to 9. TRL8 covers levels 1 to 8.">
          ${levels.map((l) => `<li class="${l === 9 ? 'is-market' : ''}"><span class="trl__bar" style="--h:${20 + l * 8.5}%"></span><b>${l}</b></li>`).join('')}
        </ol>
        <p class="trl__legend"><span class="sw sw--on"></span>The TRL8 ladder, levels 1–8 <span class="sw sw--off"></span>Level 9, earned in the market</p>
      </div>
    </div>
  </div>
</section>`;
}

function sectionHead(n: string, kicker: string, title: string, id: string, body?: string, center = false) {
  return `
    <header class="head${center ? ' head--center' : ''}">
      ${label(kicker, n)}
      <h2 id="${id}" class="h2">${esc(title)}</h2>
      ${body ? `<p class="lede">${esc(body)}</p>` : ''}
    </header>`;
}

function lightsSection() {
  return `
<section class="section lights" id="lights" aria-labelledby="lights-title">
  <div class="wrap">
    ${sectionHead('03', lights.kicker, lights.headline, 'lights-title', lights.body, true)}
    <ol class="lamps" data-lamps>
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

function projectsSection() {
  const body = projects.length
    ? `<div class="rail" tabindex="0" aria-label="Student projects">
        ${projects
          .map(
            (p) => `
        <article class="project">
          ${p.video
            ? `<video src="${esc(p.video)}" poster="${esc(p.poster)}" muted loop playsinline preload="none" controls></video>`
            : `<img src="${esc(p.poster)}" alt="${esc(p.title)}" loading="lazy">`}
          <div class="project__meta"><p class="label"><span>${esc(p.level)}</span></p><h3 class="h3">${esc(p.title)}</h3><p class="muted">${esc(p.team)}</p></div>
        </article>`,
          )
          .join('')}
      </div>`
    : `<div class="reel">
        <div class="reel__screen" aria-hidden="true">
          ${pic('fr-left2', 806, 1500)}
          <span class="reel__rec"><i></i>Makers Conclave</span>
          <span class="reel__play"></span>
        </div>
        <div class="reel__copy">
          <h3 class="h3">Project films from Makers Conclave are on their way.</h3>
          <p class="muted">Working hardware, demoed live by NIAT students. This space fills up as the first teams clear their reviews.</p>
        </div>
      </div>`;
  return `
<section class="section projects" id="projects" aria-labelledby="projects-title">
  <div class="wrap">
    ${sectionHead('04', 'Student projects', 'Built by NIAT students.', 'projects-title')}
    ${body}
  </div>
</section>`;
}

function commitmentsSection() {
  return `
<section class="section commit" id="commitments" aria-labelledby="commit-title">
  <div class="wrap">
    ${sectionHead('05', commitments.kicker, commitments.headline, 'commit-title')}
    <ol class="rows">
      ${commitments.items
        .map(
          (c) => `
      <li class="row" data-reveal>
        <span class="row__n">${c.n}</span>
        <h3 class="h3">${esc(c.name)}</h3>
        <p class="muted">${esc(c.text)}</p>
      </li>`,
        )
        .join('')}
    </ol>

    <div class="problems">
      <h3 class="h3 problems__title">${esc(commitments.problemsHeadline)}</h3>
      <ul class="problems__grid">
        ${commitments.problems
          .map(
            (p) => `
        <li class="problem" data-reveal>
          <div class="problem__img">
            <img src="${p.image}" alt="${esc(p.alt)}" width="1200" height="900" loading="lazy" decoding="async">
          </div>
          <p class="problem__p">${esc(p.problem)}</p>
          <p class="problem__i">${esc(p.idea)}</p>
        </li>`,
          )
          .join('')}
      </ul>
    </div>
  </div>
</section>`;
}

function ladderSection() {
  const phases = ['Pre-program', 'Foundation', 'Execution'] as const;
  return `
<section class="section ladder" id="ladder" aria-labelledby="ladder-title">
  <div class="ladder__side ladder__side--l" aria-hidden="true">${pic('fr-vine1', 276, 1500)}</div>
  <div class="ladder__side ladder__side--r" aria-hidden="true">${pic('fr-right2', 509, 1500)}</div>
  <div class="wrap wrap--narrow">
    ${sectionHead('06', ladder.kicker, ladder.headline, 'ladder-title', ladder.body, true)}
    ${phases
      .map((ph) => {
        const stages = ladder.stages.filter((s) => s.phase === ph);
        return `
    <div class="menu" data-reveal>
      <h3 class="menu__head"><span>${esc(ph)}</span><span class="menu__col">Grant</span></h3>
      <ol class="menu__list">
        ${stages
          .map(
            (s) => `
        <li class="item">
          <img class="item__img" src="${s.image}" alt="${esc(s.imageAlt)}" width="560" height="560" loading="lazy" decoding="async">
          <div class="item__body">
            <p class="item__title"><span class="item__level">${esc(s.level)}</span>${esc(s.title)}</p>
            <p class="item__text">${esc(s.build)}${s.duration ? ` <span class="item__dur">${esc(s.duration)}, indicative</span>` : ''}</p>
          </div>
          <p class="item__grant">${s.grant ? esc(s.grant) : '<span aria-label="No grant at this stage">—</span>'}</p>
        </li>`,
          )
          .join('')}
      </ol>
    </div>`;
      })
      .join('')}
    <div class="ladder__foot">
      <p><b>${esc(ladder.total)}</b></p>
      <p class="fine">${esc(ladder.gritMiles)}. ${esc(ladder.footnote)}</p>
    </div>
  </div>
</section>`;
}

function doorsSection() {
  return `
<section class="section doors" id="doors" aria-labelledby="doors-title">
  <div class="wrap">
    ${sectionHead('07', doors.kicker, doors.headline, 'doors-title')}
    <div class="doors__grid">
      ${doors.items
        .map(
          (d, i) => `
      <article class="door${i === 0 ? ' door--main' : ''}" data-reveal>
        <p class="door__badge">${esc(d.badge)}</p>
        <h3 class="h3">${esc(d.name)}</h3>
        <p class="muted">${esc(d.for)}</p>
        <ol class="door__steps">${d.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      </article>`,
        )
        .join('')}
    </div>
    <div class="doors__cta">${cta('doors')}<p class="fine">${esc(doors.note)}</p></div>
  </div>
</section>`;
}

function valueSection() {
  const stats = [
    ...value.big.map((b) => ({ v: b.value, l: b.label })),
    { v: '₹0', l: 'to join, no fee' },
  ];
  return `
<section class="section value" id="value" aria-labelledby="value-title">
  <div class="wrap">
    ${sectionHead('08', value.kicker, value.headline, 'value-title', undefined, true)}
    <dl class="stats">
      ${stats.map((s) => `<div data-reveal><dt>${esc(s.l)}</dt><dd>${esc(s.v)}</dd></div>`).join('')}
    </dl>
    <ul class="perks">
      ${value.items.map((v) => `<li data-reveal><h3>${esc(v.name)}</h3><p class="muted">${esc(v.text)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

function registerSection(helpEmail: string) {
  const help = helpEmail
    ? `${esc(closing.help)} or write to <a href="mailto:${esc(helpEmail)}">${esc(helpEmail)}</a>.`
    : `${esc(closing.help)}.`;
  return `
<section class="section register" id="register" aria-labelledby="register-title">
  <div class="wrap">
    ${sectionHead('09', register.kicker, register.headline, 'register-title')}
    <ol class="steps">
      ${register.steps.map((s) => `<li data-reveal><p class="steps__n">0${s.n}</p><h3 class="h3">${esc(s.name)}</h3><p class="muted">${esc(s.text)}</p></li>`).join('')}
    </ol>
    <div class="register__cta">${cta('register', 'btn--lg')}</div>
  </div>
</section>

<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq__wrap">
    <div class="faq__head">
      ${label('FAQ', '10')}
      <h2 id="faq-title" class="h2">Questions, answered.</h2>
      <p class="muted">${help}</p>
    </div>
    <div class="faq__list">
      ${faq
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
</section>

<section class="closing" id="join" aria-labelledby="closing-title">
  ${frame('closing')}
  <div class="closing__inner">
    <h2 id="closing-title" class="closing__title">
      <span class="bracket"><span class="bracket__b" aria-hidden="true">[</span>Ready to build what’s<span class="bracket__b" aria-hidden="true">]</span></span>
      <span class="hero__display">NE<span class="hero__x">X</span>T?</span>
    </h2>
    <p class="hero__sub">${esc(closing.body)}</p>
    ${cta('closing', 'btn--lg')}
    <p class="fine">${help}</p>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="wrap footer__inner">
    <div class="footer__brand">
      <img src="/brand/logo-light.svg" alt="Trilight · Build · Test · Deploy" width="168" height="46" loading="lazy">
      <p class="fine">A NxtWave Physical AI &amp; Robotics Team program for NIAT students. © 2026</p>
    </div>
    <nav class="footer__links" aria-label="Footer">
      <a href="#what">What is TRL8</a>
      <a href="#ladder">How it works</a>
      <a href="#value">What you get</a>
      <a href="#faq">FAQ</a>
    </nav>
  </div>
</footer>

<div class="mobile-cta" data-mobile-cta>${cta('sticky')}</div>

<dialog class="dialog" id="reg-dialog" aria-labelledby="reg-dialog-title">
  <form method="dialog">
    <img src="/brand/mark.svg" alt="" width="64" height="36">
    <h2 id="reg-dialog-title" class="h3">Registration opens soon.</h2>
    <p class="muted">When it opens, you’ll log in here with your NxtWave learning portal credentials. Nothing to fill in, nothing to pay.</p>
    <button class="btn" value="close"><span>Got it</span></button>
  </form>
</dialog>`;
}

export function renderBody(opts: { markSvg: string; helpEmail: string }) {
  return [
    nav(),
    '<main id="main">',
    intro(opts.markSvg),
    what(),
    lightsSection(),
    projectsSection(),
    commitmentsSection(),
    ladderSection(),
    doorsSection(),
    valueSection(),
    registerSection(opts.helpEmail),
    '</main>',
    footer(),
  ].join('\n');
}

export const meta = { title: site.title, description: site.description };
