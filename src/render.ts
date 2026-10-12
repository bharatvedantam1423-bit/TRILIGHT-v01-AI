/**
 * Renders the page body from content.ts at build time (see vite.config.ts),
 * so every section is real HTML before any JavaScript runs.
 */
import {
  site, hero, whatIs, lights, projects, commitments, ladder, doors, value, register, faq, closing,
} from './content';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const arrow =
  '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const cta = (section: string, extra = '') =>
  `<a class="btn btn--primary ${extra}" href="#register" data-register data-section="${section}">${esc(site.cta)}${arrow}</a>`;

const kicker = (text: string, n?: string) =>
  `<p class="kicker">${n ? `<span class="kicker__n">${n}</span>` : ''}${esc(text)}</p>`;

function nav() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <a class="nav__logo" href="#top" aria-label="Trilight, back to top">
    <img src="/brand/wordmark-light.svg" alt="Trilight" width="132" height="30">
  </a>
  <nav class="nav__links" aria-label="Sections">
    <a href="#what">What is TRL8</a>
    <a href="#ladder">How it works</a>
    <a href="#value">What you get</a>
    <a href="#faq">FAQ</a>
  </nav>
  <a class="btn btn--primary btn--sm" href="#register" data-register data-section="nav">Register${arrow}</a>
</header>`;
}

function intro(markSvg: string) {
  const obj = (name: string, w: number, h: number, alt: string, tag: string, reading: string) => `
      <figure class="obj obj--${name}" data-obj="${name}">
        <picture>
          <source media="(max-width: 760px)" srcset="/img/${name}-sm.webp">
          <img src="/img/${name}.webp" width="${w}" height="${h}" alt="${esc(alt)}" fetchpriority="${name === 'head' || name === 'arm' ? 'high' : 'auto'}" decoding="async">
        </picture>
        <figcaption class="hud-tag" aria-hidden="true"><span>${esc(tag)}</span><b>${esc(reading)}</b></figcaption>
      </figure>`;

  return `
<section class="scene scene--intro" id="top" aria-labelledby="hero-title">
  <div class="sticky">
    <div class="bp-grid" aria-hidden="true"></div>
    <div class="glow glow--blue" aria-hidden="true"></div>
    <div class="glow glow--teal" aria-hidden="true"></div>
    <div class="scanline" aria-hidden="true"></div>

    <div class="lens only-motion" aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcset="/img/lens-sm.webp">
        <img src="/img/lens.webp" width="1920" height="1080" alt="" loading="lazy" decoding="async">
      </picture>
      <div class="reticle"><i></i><i></i><i></i></div>
      <div class="lens__det lens__det--a"><span>PERSON</span><b>0.97</b></div>
      <div class="lens__det lens__det--b"><span>SOIL MOISTURE</span><b>18% · DRY</b></div>
    </div>

    <div class="xmark only-motion" aria-hidden="true">${markSvg}</div>

    ${obj('drone', 1100, 551, 'A white quadcopter drone with teal lights', 'SENSE · IMU', '6-AXIS · LIVE')}
    ${obj('arm', 860, 1100, 'A white six-axis robotic arm with a gripper', 'ACT · SERVO J3', '42.0°')}
    ${obj('head', 775, 1100, 'A white humanoid robot head with glowing teal eyes', 'DECIDE · VISION', 'CONF 0.97')}
    ${obj('rover', 1100, 738, 'A four-wheeled autonomous rover robot with a LiDAR dome', 'LIDAR · 360°', 'RANGE 12 m')}
    ${obj('pcb', 1100, 723, 'A circuit board with a microcontroller and teal LEDs', 'MCU · BOOT', 'OK')}

    <div class="hero" data-hero>
      ${kicker(hero.kicker)}
      <h1 id="hero-title" class="hero__title"><span class="hero__lead">${esc(hero.lead)}</span> ${esc(hero.headline)}</h1>
      <p class="tagline" aria-label="Build, Test, Deploy">BUILD<i></i>TEST<i></i>DEPLOY</p>
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__cta">${cta('hero', 'btn--lg')}</div>
      <ul class="stats" aria-label="Key facts">
        ${hero.stats.map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`).join('')}
      </ul>
    </div>

    <div class="hud hud--loop" aria-hidden="true">
      <p><span>SENSE</span>3 sensors · live</p>
      <p><span>DECIDE</span>path planned</p>
      <p><span>ACT</span>valve 2 → open</p>
      <p class="hud__coords"><span>POS</span><em data-coords>17.3850° N · 78.4867° E</em></p>
      <p><span>LEVEL</span>TRL <b data-trl>0</b>/8</p>
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
      <img src="/img/stage.webp" width="1920" height="1080" alt="" loading="lazy" decoding="async">
    </picture>
    <div class="what__floor" aria-hidden="true"></div>
    <figure class="what__figure">
      <picture>
        <source media="(max-width: 760px)" srcset="/img/student-sm.webp">
        <img src="/img/student.webp" width="1100" height="976" alt="A NIAT student kneeling to adjust a small wheeled robot with a glowing eye" loading="lazy" decoding="async">
      </picture>
      <div class="det det--person" aria-hidden="true"><span>BUILDER</span><b>0.98</b></div>
      <div class="det det--robot" aria-hidden="true"><span>ROBOT</span><b>SENSE → DECIDE → ACT</b></div>
    </figure>
    <div class="what__copy">
      <div class="what__step" data-step="1">
        ${kicker(whatIs.kicker, '02')}
        <h2 id="what-title" class="h2">${esc(whatIs.headline)}</h2>
        <p class="lede">${esc(whatIs.body)}</p>
      </div>
      <div class="what__step" data-step="2">
        <h3 class="h3">${esc(whatIs.scaleTitle)}</h3>
        <p>${esc(whatIs.scaleBody)}</p>
        <ol class="trl-scale" aria-label="NASA Technology Readiness Levels 1 to 9; TRL8 covers levels 1 to 8">
          ${levels
            .map(
              (l) =>
                `<li class="${l === 9 ? 'is-market' : ''}" style="--h:${18 + l * 9}%"><span class="bar"></span><b>${l}</b></li>`,
            )
            .join('')}
        </ol>
        <p class="trl-legend"><span class="sw sw--on"></span>TRL8 program, levels 1–8 <span class="sw sw--off"></span>TRL 9, earned in the market</p>
      </div>
    </div>
  </div>
</section>`;
}

function lightsSection() {
  return `
<section class="section lights" id="lights" aria-labelledby="lights-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(lights.kicker, '03')}
      <h2 id="lights-title" class="h2">${esc(lights.headline)}</h2>
      <p class="lede">${esc(lights.body)}</p>
    </div>
    <div class="lights__rail" aria-hidden="true"><span class="lights__beam"></span></div>
    <ol class="lights__list">
      ${lights.items
        .map(
          (l) => `
      <li class="light" data-light>
        <span class="light__lamp" aria-hidden="true"><i></i></span>
        <p class="light__n">LIGHT ${l.n}</p>
        <h3 class="h3">${esc(l.name)}</h3>
        <p>${esc(l.text)}</p>
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
          <div class="project__meta"><span class="chip">${esc(p.level)}</span><h3>${esc(p.title)}</h3><p>${esc(p.team)}</p></div>
        </article>`,
          )
          .join('')}
      </div>`
    : `<div class="soon">
        <div class="soon__visual" aria-hidden="true">
          <img src="/img/rover-sm.webp" alt="" loading="lazy" width="560" height="376">
          <span class="soon__rec"><i></i>REC · MAKERS CONCLAVE</span>
        </div>
        <div class="soon__copy">
          <h3 class="h3">Project films from Makers Conclave are on their way.</h3>
          <p>Watch NIAT students demo what they’ve built: working hardware, running live. This space fills up as the first teams clear their reviews.</p>
        </div>
      </div>`;
  return `
<section class="section projects" id="projects" aria-labelledby="projects-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker('Student projects', '04')}
      <h2 id="projects-title" class="h2">Built by NIAT students.</h2>
    </div>
    ${body}
  </div>
</section>`;
}

function commitmentsSection() {
  return `
<section class="section commitments" id="commitments" aria-labelledby="commit-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(commitments.kicker, '05')}
      <h2 id="commit-title" class="h2">${esc(commitments.headline)}</h2>
    </div>
    <ol class="cards3">
      ${commitments.items
        .map(
          (c) => `
      <li class="card" data-reveal>
        <span class="card__corner card__corner--tl" aria-hidden="true"></span><span class="card__corner card__corner--br" aria-hidden="true"></span>
        <p class="card__n">${c.n}</p>
        <h3 class="h3">${esc(c.name)}</h3>
        <p>${esc(c.text)}</p>
        <p class="card__tag" aria-hidden="true">${esc(c.tag)}</p>
      </li>`,
        )
        .join('')}
    </ol>

    <h3 class="h2 h2--sm problems__title">${esc(commitments.problemsHeadline)}</h3>
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
  return `
<section class="ladder" id="ladder" aria-labelledby="ladder-title">
  <div class="ladder__sticky">
    <div class="wrap ladder__head">
      <div>
        ${kicker(ladder.kicker, '06')}
        <h2 id="ladder-title" class="h2">${esc(ladder.headline)}</h2>
      </div>
      <p class="lede">${esc(ladder.body)}</p>
    </div>
    <div class="ladder__viewport" data-ladder-viewport tabindex="0" aria-label="The TRL8 stages, scroll sideways">
      <ol class="ladder__track" data-ladder-track>
        ${ladder.stages
          .map((s, i) => {
            const firstOfPhase = i === 0 || ladder.stages[i - 1].phase !== s.phase;
            return `
        <li class="stage stage--${s.phase === 'Execution' ? 'exec' : s.phase === 'Foundation' ? 'found' : 'pre'}" data-stage>
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
      <p class="ladder__total"><b>${esc(ladder.total)}</b></p>
      <p class="fine">${esc(ladder.footnote)}</p>
      <ul class="ladder__legend" aria-hidden="true">${phases.map((p) => `<li class="lg lg--${p === 'Execution' ? 'exec' : p === 'Foundation' ? 'found' : 'pre'}">${p}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;
}

function doorsSection() {
  return `
<section class="section doors" id="doors" aria-labelledby="doors-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(doors.kicker, '07')}
      <h2 id="doors-title" class="h2">${esc(doors.headline)}</h2>
    </div>
    <div class="doors__grid">
      ${doors.items
        .map(
          (d, i) => `
      <article class="door ${i === 0 ? 'door--main' : ''}" data-reveal>
        <p class="chip">${esc(d.badge)}</p>
        <h3 class="h3">${esc(d.name)}</h3>
        <p>${esc(d.for)}</p>
        <ol class="door__steps">
          ${d.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
        </ol>
      </article>`,
        )
        .join('')}
    </div>
    <div class="doors__cta">
      ${cta('doors')}
      <p class="fine">${esc(doors.note)}</p>
    </div>
  </div>
</section>`;
}

function valueSection() {
  return `
<section class="section value" id="value" aria-labelledby="value-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(value.kicker, '08')}
      <h2 id="value-title" class="h2">${esc(value.headline)}</h2>
    </div>
    <div class="value__big">
      ${value.big
        .map(
          (b) => `
      <div class="big" data-reveal>
        <p class="big__v">${esc(b.value)}</p>
        <p class="big__l">${esc(b.label)}</p>
        <p class="muted">${esc(b.sub)}</p>
      </div>`,
        )
        .join('')}
    </div>
    <ul class="value__grid">
      ${value.items.map((v) => `<li data-reveal><h3>${esc(v.name)}</h3><p>${esc(v.text)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

function registerSection(helpEmail: string, markSvg: string) {
  const help = helpEmail
    ? `${esc(closing.help)} or write to <a href="mailto:${esc(helpEmail)}">${esc(helpEmail)}</a>.`
    : `${esc(closing.help)}.`;
  return `
<section class="section register" id="register" aria-labelledby="register-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(register.kicker, '09')}
      <h2 id="register-title" class="h2">${esc(register.headline)}</h2>
    </div>
    <ol class="steps">
      ${register.steps
        .map((s) => `<li data-reveal><span class="steps__n">${s.n}</span><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></li>`)
        .join('')}
    </ol>
    <div class="register__cta">${cta('register', 'btn--lg')}</div>
  </div>
</section>

<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq__wrap">
    <div class="faq__head">
      ${kicker('FAQ')}
      <h2 id="faq-title" class="h2">Questions, answered.</h2>
      <p class="muted">${help}</p>
    </div>
    <div class="faq__list">
      ${faq
        .map(
          (f, i) => `
      <details class="qa"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <p>${esc(f.a)}</p>
      </details>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="closing" id="join" aria-labelledby="closing-title">
  <div class="closing__beams" aria-hidden="true"><span class="beam beam--a"></span><span class="beam beam--b"></span></div>
  <div class="closing__mark" aria-hidden="true">${markSvg}</div>
  <div class="wrap closing__inner">
    <h2 id="closing-title" class="h2 h2--xl">${esc(closing.headline)}</h2>
    <p class="lede">${esc(closing.body)}</p>
    ${cta('closing', 'btn--lg')}
    <p class="fine">${help}</p>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="wrap footer__inner">
    <div>
      <img src="/brand/logo-light.svg" alt="Trilight · Build · Test · Deploy" width="180" height="49" loading="lazy">
      <p class="fine">A NxtWave Physical AI &amp; Robotics Team program for NIAT students · © 2026</p>
    </div>
    <nav class="footer__links" aria-label="Footer">
      <a href="#what">What is TRL8</a>
      <a href="#ladder">How it works</a>
      <a href="#faq">FAQ</a>
      <a href="#register" data-register data-section="footer">Register</a>
    </nav>
  </div>
</footer>

<div class="mobile-cta" data-mobile-cta>
  <a class="btn btn--primary" href="#register" data-register data-section="sticky">${esc(site.cta)}${arrow}</a>
</div>

<dialog class="dialog" id="reg-dialog" aria-labelledby="reg-dialog-title">
  <form method="dialog">
    <img src="/brand/mark.svg" alt="" width="64" height="36">
    <h2 id="reg-dialog-title" class="h3">Registration opens soon.</h2>
    <p>When it opens, you’ll log in here with your NxtWave learning portal credentials. Nothing to fill in, nothing to pay.</p>
    <button class="btn btn--primary" value="close">Got it</button>
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
    registerSection(opts.helpEmail, opts.markSvg),
    '</main>',
    footer(),
  ].join('\n');
}

export const meta = { title: site.title, description: site.description };
