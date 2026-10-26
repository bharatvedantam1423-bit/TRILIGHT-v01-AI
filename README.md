# TRILIGHT · landing page

The single-page site for **TRILIGHT by NIAT**: a funded, gated journey that takes
a student's hardware, robotics or Physical AI idea from a sketch to a product
customers pay for. The page has one job: get students to **Join the Program**
(every Join button opens the TRILIGHT dashboard).

Live: **https://www.trilight.niatindia.com**

**Program reference:** [`docs/TRL8-program.md`](docs/TRL8-program.md) is the full
program document (stages, gates, grants, FAQs, glossary). Check facts on the
page against it.

## Branches

- `main`: the final, live version. Replit deploys from here.
- `claude/sharp-mccarthy-gvqes8`: an earlier design iteration, kept for reference.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + static build into dist/
npm run preview    # serve the production build
```

`dist/` is plain static files (HTML, CSS, JS, WebP). Host it on any static host.

## Deploy on Replit

The repo includes a `.replit` file, so an import from GitHub is ready to go:

1. **Import:** Replit → Create → Import from GitHub → this repo (branch `main`).
2. **Preview:** press **Run**. It installs packages and starts the dev server on port 5173.
3. **Secrets:** under Tools → Secrets, add the `VITE_*` values you need (see
   below). They are baked in at build time, so redeploy after changing them.
4. **Deploy:** Deploy → **Static**. The build command (`npm ci && npm run build`)
   and public directory (`dist`) are read from `.replit`.
5. **Domain:** custom domains are under Deployments → Settings. The step-by-step
   for `www.` and the bare domain is in [`docs/launch-guide.md`](docs/launch-guide.md).

## Settings (`.env`, see `.env.example`)

| Variable | What it does |
|---|---|
| `VITE_SITE_URL` | Only if the domain changes. Defaults to `https://www.trilight.niatindia.com` (canonical link, share previews, sitemap). |
| `VITE_GA_ID` | GA4 measurement ID (`G-XXXXXXXXXX`). Loads gtag; funnel events are sent as GA4 events. |
| `VITE_GTM_ID` | Google Tag Manager container (`GTM-XXXXXXX`), if tags are managed in GTM instead. |

Links (Join, Full Journey, NIAT) live in `src/content.ts`: `site.joinUrl`,
`ladder.journeyUrl`, `footer.niatUrl`. The website stores no student data.

## Editing content

All copy and every number on the page live in **`src/content.ts`**. They're
rendered into static HTML at build time (`src/render.ts`, wired through
`vite.config.ts`), so the page is fully readable before or without JavaScript.

The copy comes from the **"TRILIGHT | WEBSITE COPY"** doc (and its text updates)
and nothing else. Where the doc offers two headlines, the one marked green is
used and the other is kept as `alt`.

Sections, top to bottom: Hero · The ladder · Fundamentals · The three forces ·
What it takes · Two doors · Who can join · Problems · Program finale (Demo Day)
· FAQ · Closing CTA · Footer.

## Analytics

Funnel events (`src/analytics.ts`): `trl8_page_view`, `trl8_cta_click {section}`
(which Join button), `trl8_scroll_depth {section}`, `trl8_ab_assign {test, variant}`
and `trl8_ladder_stage {stage, by}`. A/B test: the ladder auto-advances for half
of visitors; force a variant with `?ladder=auto` or `?ladder=manual`.

In GA4, mark `trl8_cta_click` as a **key event** (conversion) and register
`section` and `variant` as custom dimensions. Setup steps:
[`docs/launch-guide.md`](docs/launch-guide.md).

## Search (SEO)

Generated at build time from `src/seo.ts`:

- Title, description, canonical URL, robots, Open Graph and X cards with the
  share image `public/og.jpg` (1200×630).
- Structured data (JSON-LD): Organization (NIAT), WebSite, WebPage,
  EducationalOccupationalProgram (TRILIGHT) and FAQPage (from the FAQ).
- `robots.txt`, `sitemap.xml` and `site.webmanifest`; a `404.html` page.

Lighthouse (mobile, simulated slow 4G): SEO 100, Accessibility 100,
Best Practices 100, Performance mid-80s.

## Motion

Illustrations are isometric **blueprints**: hardware drawn as line art on navy
grid paper, built at build time (`src/blueprint/`, using the vendored
[Anatomy](https://github.com/wheresryan22/anatomy) iso kit, MIT). Each figure
draws itself in like a pen, back to front.

1. **Hero.** A circuit-city board round an empty socket. On scroll a hand with
   tweezers seats the Trilight chip and the copper lights up; the next section
   slides over the pinned hero.
2. **The ladder.** A horizontal carousel of all eight stages, Explorer to TRL 8,
   with a photo, what to prove, time and grant. "Full Journey" opens the
   student journey PDF.
3. **Fundamentals.** Sense → decide → act, told with a smoke detector.
4. **The three forces.** Build, Test, Deploy, drawn with the scroll itself.
5. **Program finale.** Interactive Demo Day banner (spotlight, tilt).
6. **Closing.** Two robot arms wake into pose and light the Trilight block.

`prefers-reduced-motion` and no-JS get a static, fully drawn, readable page.
Below-the-fold scenes start when the browser is idle, so the hero loads first.

## Files

- `src/content.ts`: all copy. `src/render.ts`: the HTML. `src/main.ts`: motion
  and interaction. `src/styles.css`: styles (type and spacing scales at the top).
- `src/seo.ts`, `src/analytics.ts`: search tags and tracking.
- `src/blueprint/`: the figures, as code. `hero.ts` (circuit city and chip),
  `journey.ts` (forces and fallbacks), `robots.ts` (closing), `vehicles.ts`,
  `board.ts`, `parts.ts`, `iso-kit.ts`, `blueprint.css`.
- `public/img/`: photos by section (`hero/`, `ladder/`, `loop/`, `doors/`,
  `problems/`). Full-size originals are in `assets/originals/` (not served).
- `public/brand/`: logo, wordmark and mark from the Trilight brand guidelines.
- `docs/`: program reference, launch guide, image prompts.
- `scripts/render-hero.mjs`: re-renders the hero board images
  (`public/img/hero/base(-sm).webp`, `front(-sm).webp`) after changing
  `src/blueprint/hero.ts`. Needs Playwright with Chromium and Python Pillow.

**Optional media slots** (drop the file in and rebuild):

| File | Replaces |
|---|---|
| `public/img/ladder/<stage>.webp` | A ladder photo (4:3); missing ones fall back to a drawing |
| `public/img/loop/<step>.webp` | A Fundamentals photo (5:4) |
| `public/img/doors/<door>.webp` | A door photo (16:9) |
| `public/video/closing.mp4` (+ `closing-poster.webp`) | The robot-arm drawing in the closing section |

The problem photos were generated for this page; they're illustrative, not
photos of real people or places.
