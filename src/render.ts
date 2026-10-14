/**
 * Renders the page body from content.ts at build time (see vite.config.ts),
 * so every section is real HTML before any JavaScript runs.
 *
 * Layout system: one 12-col grid, section heads share the same left edge,
 * hairline rules separate rows. Cinematic layers only appear in the three
 * scroll scenes (hero frame, lens → lab stage, closing frame).
 */
import {
  site, hero, whatIs, lights, projects, commitments, ladder, doors, value, register, faq, faqHead, closing,
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

/**
 * The lab: a dark room framed by two depths of armoured wall panels (near and
 * far, mirrored on the right), the workbench in front and, in the hero, a
 * robot-camera viewfinder. Nothing floats; every layer is anchored.
 */
function lab(where: 'hero' | 'closing') {
  const eager = where === 'hero';
  const far = pic('wall-b', 608, 1400, '', eager);
  const near = pic('wall-a', 898, 1600, '', eager);
  return `
    <div class="lab lab--${where}" aria-hidden="true" data-lab>
      <div class="lab__wall lab__wall--far lab__wall--l" data-l="far-l">${far}</div>
      <div class="lab__wall lab__wall--far lab__wall--r" data-l="far-r">${far}</div>
      <div class="lab__wall lab__wall--near lab__wall--l" data-l="near-l">${near}</div>
      <div class="lab__wall lab__wall--near lab__wall--r" data-l="near-r">${near}</div>
      <div class="lab__bench" data-l="bench">${pic('bench', 2400, 746, '', eager)}<span class="lab__edge"></span></div>
      ${where === 'hero'
        ? `<div class="vf" data-l="vf">
        <i class="vf__c vf__c--tl"></i><i class="vf__c vf__c--tr"></i><i class="vf__c vf__c--bl"></i><i class="vf__c vf__c--br"></i>
        <span class="vf__rec"><i></i>Rec</span>
        <span class="vf__tc" data-timecode>00:00:00</span>
        <span class="vf__cam">Cam 01 · Trilight Lab</span>
        <span class="vf__lvl">TRL <b data-trl>0</b>/8</span>
      </div>`
        : ''}
    </div>`;
}

function nav() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <nav class="nav__links" aria-label="Sections">
    <a href="#what">What is Trilight</a>
    <a href="#ladder">How it works</a>
    <a href="#faq">FAQ</a>
  </nav>
  <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
    <img src="/brand/wordmark-light.svg" alt="Trilight" width="128" height="29">
  </a>
  <a class="nav__cta" href="#register" data-register data-section="nav">Join${arrow}</a>
</header>`;
}

function intro(markSvg: string) {
  return `
<section class="scene scene--intro" id="top" aria-labelledby="hero-title">
  <div class="sticky">
    <div class="glow" aria-hidden="true"></div>

    <div class="lens only-motion" aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcset="/img/eye-sm.webp">
        <img src="/img/eye.webp" width="1920" height="1080" alt="" fetchpriority="low" decoding="async">
      </picture>
      <div class="reticle"><i></i><i></i></div>
    </div>
    <div class="xmark only-motion" aria-hidden="true">${markSvg}</div>

    ${lab('hero')}

    <div class="hero" data-hero>
      <h1 id="hero-title" class="hero__headline">${esc(hero.headline).replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>')}</h1>
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__cta">${cta('hero', 'btn--lg')}</div>
      <dl class="facts" aria-label="Key facts">${hero.stats.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
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
    <div class="what__floor" aria-hidden="true"><i></i><i></i></div>
    <div class="what__copy">
      <div class="what__step" data-step="1">
        ${label(whatIs.kicker, '01')}
        <h2 id="what-title" class="h2">${esc(whatIs.headline)}</h2>
        <p class="lede">${esc(whatIs.body)}</p>
      </div>
      <div class="what__step" data-step="2">
        ${label(whatIs.scaleTitle, '02')}
        <p class="lede">${esc(whatIs.scaleBody)}</p>
        <ol class="trl" aria-label="NASA Technology Readiness Levels 1 to 9. Trilight covers levels 1 to 8.">
          ${levels.map((l) => `<li class="${l === 9 ? 'is-market' : ''}"><span class="trl__bar" style="--h:${20 + l * 8.5}%"></span><b>${l}</b></li>`).join('')}
        </ol>
        <p class="trl__legend"><span class="sw sw--on"></span>The Trilight ladder, levels 1–8 <span class="sw sw--off"></span>Level 9, earned in the market</p>
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
  <div class="lights__bg" aria-hidden="true">${pic('lab-2', 1920, 1080)}</div>
  <div class="wrap">
    ${sectionHead('05', lights.kicker, lights.headline, 'lights-title', lights.body, true)}
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
    <p class="lights__done" aria-hidden="true"><span>All three green</span><b>= TRL 8</b></p>
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
          ${pic('lab-2', 1920, 1080)}
          <span class="reel__scan"></span>
          <span class="reel__rec"><i></i>Makers Conclave</span>
          <span class="reel__tc" data-timecode>00:00:00</span>
          <span class="reel__play"></span>
          <span class="reel__bar"><i></i></span>
        </div>
        <div class="reel__copy">
          <p class="label"><span>Coming soon</span></p>
          <h3 class="h3">Project films from Makers Conclave are on their way.</h3>
          <p class="muted">Working hardware, demoed live by NIAT students. This space fills up as the first teams clear their reviews.</p>
        </div>
      </div>`;
  return `
<section class="section projects" id="projects" aria-labelledby="projects-title">
  <div class="wrap">
    ${sectionHead('10', 'Student projects', 'Built by NIAT students.', 'projects-title')}
    ${body}
  </div>
</section>`;
}

const icons = [
  // sense → decide → act loop
  '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15"/><circle cx="24" cy="9" r="3.2"/><circle cx="37" cy="31.5" r="3.2"/><circle cx="11" cy="31.5" r="3.2"/><path d="M30 12.5l3 1.5-.6 3.3"/></svg>',
  // evidence gate (brand octagon + check)
  '<svg viewBox="0 0 48 48"><path d="M17 6h14l11 11v14L31 42H17L6 31V17z"/><path d="M16.5 24.5l5 5 10-11"/></svg>',
  // real customer: location pin + field
  '<svg viewBox="0 0 48 48"><path d="M24 41s-12-11-12-20a12 12 0 0 1 24 0c0 9-12 20-12 20z"/><circle cx="24" cy="21" r="4.5"/><path d="M8 44h32"/></svg>',
];

function commitmentsSection() {
  return `
<section class="section commit" id="commitments" aria-labelledby="commit-title">
  <div class="wrap">
    ${sectionHead('04', commitments.kicker, commitments.headline, 'commit-title')}
    <ol class="rows">
      ${commitments.items
        .map(
          (c, i) => `
      <li class="row" data-reveal>
        <span class="row__n">${c.n}</span>
        <span class="row__icon" aria-hidden="true" data-draw>${icons[i]}</span>
        <h3 class="h3">${esc(c.name)}</h3>
        <p class="muted">${esc(c.text)}</p>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function problemsSection() {
  return `
<section class="section problems-sec" id="problems" aria-labelledby="problems-title">
  <div class="wrap">
    ${sectionHead('09', commitments.problemsKicker, commitments.problemsHeadline, 'problems-title')}
    <ul class="problems">
      ${commitments.problems
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

function ladderSection() {
  const phases = ['Pre-program', 'Foundation', 'Execution'] as const;
  const cls = (p: string) => (p === 'Execution' ? 'exec' : p === 'Foundation' ? 'found' : 'pre');
  return `
<section class="ladder" id="ladder" aria-labelledby="ladder-title">
  <div class="ladder__sticky">
    <div class="wrap ladder__head">
      <div>
        ${label(ladder.kicker, '03')}
        <h2 id="ladder-title" class="h2">${esc(ladder.headline)}</h2>
      </div>
      <p class="lede">${esc(ladder.body)}</p>
    </div>
    <div class="ladder__viewport" data-ladder-viewport tabindex="0" aria-label="The Trilight stages, scroll sideways">
      <ol class="ladder__track" data-ladder-track>
        ${ladder.stages
          .map((s, i) => {
            const firstOfPhase = i === 0 || ladder.stages[i - 1].phase !== s.phase;
            return `
        <li class="stage stage--${cls(s.phase)}" data-stage>
          <p class="stage__phase">${firstOfPhase ? esc(s.phase) : '&nbsp;'}</p>
          <div class="stage__gate" aria-hidden="true"><span class="stage__line"></span><span class="stage__node">${i === 0 ? '' : 'TRR'}</span></div>
          <div class="stage__card">
            <div class="stage__img"><img src="${s.image}" alt="${esc(s.imageAlt)}" width="560" height="560" loading="lazy" decoding="async"></div>
            <p class="stage__level">${esc(s.level)}</p>
            <h3 class="h3">${esc(s.title)}</h3>
            <p class="stage__build">${esc(s.build)}</p>
            <dl class="stage__facts">
              ${s.duration ? `<div><dt>Duration</dt><dd>${esc(s.duration)} <small>indicative</small></dd></div>` : ''}
              <div><dt>Grant</dt><dd>${s.grant ? `<b>${esc(s.grant)}</b>` : '<span class="muted">No grant at this stage</span>'}</dd></div>
              <div><dt>GRIT Miles</dt><dd><span class="muted">Values coming soon</span></dd></div>
            </dl>
          </div>
        </li>`;
          })
          .join('')}
      </ol>
    </div>
    <div class="wrap ladder__foot">
      <div>
        <p class="ladder__total"><b>${esc(ladder.total)}</b></p>
        <p class="fine">${esc(ladder.footnote)}</p>
      </div>
      <ul class="ladder__legend" aria-hidden="true">${phases.map((p) => `<li class="lg lg--${cls(p)}">${p}</li>`).join('')}</ul>
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
        <span class="door__edge" aria-hidden="true"></span>
        <p class="door__badge">${esc(d.badge)}</p>
        <h3 class="h3">${esc(d.name)}</h3>
        <ul class="door__steps">${d.points.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        ${d.note ? `<p class="muted door__note">${esc(d.note)}</p>` : ''}
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
    ${sectionHead('06', value.kicker, value.headline, 'value-title', value.body, true)}
    <dl class="stats">
      ${stats.map((s) => `<div data-reveal><dt>${esc(s.l)}</dt><dd data-count="${esc(s.v)}">${esc(s.v)}</dd></div>`).join('')}
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
    ${sectionHead('08', register.kicker, register.headline, 'register-title')}
    <ol class="steps" data-steps>
      <li class="steps__rail" aria-hidden="true"><span data-steps-beam></span></li>
      ${register.steps.map((s) => `<li class="step" data-step-item><span class="steps__node" aria-hidden="true">${s.n}</span><h3 class="h3">${esc(s.name)}</h3><p class="muted">${esc(s.text)}</p></li>`).join('')}
    </ol>
    <div class="register__cta">${cta('register', 'btn--lg')}</div>
  </div>
</section>
${problemsSection()}
${projectsSection()}
<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq__wrap">
    <div class="faq__head">
      ${label('FAQ', '11')}
      <h2 id="faq-title" class="h2">${esc(faqHead.headline)}</h2>
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
  ${lab('closing')}
  <div class="closing__inner">
    <h2 id="closing-title" class="closing__title">${esc(closing.headline)}</h2>
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
      <a href="#what">What is Trilight</a>
      <a href="#ladder">How it works</a>
      <a href="#value">What it takes</a>
      <a href="#faq">FAQ</a>
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

export function renderBody(opts: { markSvg: string; helpEmail: string }) {
  return [
    nav(),
    '<main id="main">',
    intro(opts.markSvg),
    what(),
    ladderSection(),
    commitmentsSection(),
    lightsSection(),
    valueSection(),
    doorsSection(),
    registerSection(opts.helpEmail),
    '</main>',
    footer(),
  ].join('\n');
}

export const meta = { title: site.title, description: site.description };
