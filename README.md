# TRL8 · Trilight landing page

The single-page site for **TRL8 (Trilight)**: NxtWave's funded, gated journey that
takes a NIAT student's Physical AI idea from a sketch to a product customers pay
for. The page has one job: get students to **Join the Program** through the
NxtWave learning portal login.

**Program reference:** [`docs/TRL8-program.md`](docs/TRL8-program.md) is the full
TRL8 program document (stages, gates, grants, GRIT Miles, risks, FAQs, glossary,
case studies). Check facts on the page against it.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + static build into dist/
npm run preview    # serve the production build
```

`dist/` is plain static files (HTML, CSS, JS, WebP). Host it on any static host or CDN.

## Deploy on Vercel

1. In Vercel: **Add New… → Project → Import** `TRILIGHT-v01-AI` from GitHub.
2. Vercel reads `vercel.json` (Vite, `npm run build`, output `dist`), so leave
   the build settings as detected.
3. Under **Environment Variables**, add the `VITE_*` values below (they're
   baked in at build time, so redeploy after changing them).
4. **Deploy.** Every push to the production branch redeploys; other branches get
   preview URLs.

## Configure before launch (`.env`, see `.env.example`)

| Variable | What it does |
|---|---|
| `VITE_PORTAL_LOGIN_URL` | Learning portal SSO/OAuth login URL. The page adds `redirect_uri=<site>/registered.html?registered=1`. **While empty, every Register button opens a "Registration opens soon" message**; the page never fakes a registration. |
| `VITE_PLATFORM_URL` | TRL8 platform on Replit. After login, students are sent here. While empty, `registered.html` shows the holding screen ("You're registered, we'll notify you…"). |
| `VITE_SITE_URL` | Only for a custom domain: used for share-preview images. On Vercel it defaults to the project's production domain. |

The portal team needs to send students back to `/registered.html?registered=1`
after a successful login. The website stores no student data (PRD §15).

## Editing content

All copy and every number on the page live in **`src/content.ts`**. They're
rendered into static HTML at build time (`src/render.ts`, wired through
`vite.config.ts`), so the page is fully readable before or without JavaScript.

The copy comes from the **"TRILIGHT | WEBSITE COPY"** doc and nothing else:

- **Headlines** are the doc's, verbatim. Where it offers two (“… or …”), the one
  marked green is used and the other is kept as `alt`.
- **Section bodies, cards and stats** follow the Figma low-fidelity skeleton the
  doc's section images were taken from.
- **FAQ answers and grant figures** come from `docs/TRL8-program.md`.
- **Hero callouts** are the layer descriptions from the chip-architecture reference.

Sections, in the doc's order: 1 Hero · 2 The ladder · 3 Fundamentals (the loop)
· 4 The three forces · 5 What it takes · 6 Two doors · 7 Who can join ·
8 Problems · 9 FAQ · 10 CTA and the Demo Day program finale.

## Analytics

`src/analytics.ts` pushes funnel events to `window.dataLayer`, ready for GTM or GA4. A/B test: the ladder auto-advances for half of visitors (`trl8_ab_assign {test: ladder_autoplay, variant}`; force with `?ladder=auto` or `?ladder=manual`).
`trl8_page_view`, `trl8_cta_click {section}`, `trl8_scroll_depth {section}`,
`trl8_login_success`, `trl8_platform_redirect`.

## Design, motion and performance

**Look.** Light editorial pages modelled on zaro.ai: warm off-white paper
(`#f7f7f4`), Trilight ink (`#0c1720`), blue and teal as the only colours,
hairline rules, square buttons, mono uppercase labels, two-tone headlines (the
end of each headline in a quieter ink, set by `tone` in `src/content.ts`) and a
folder-tab cut on framed pictures. Two sections are deep navy (`#041322`): the
three forces panel and the closing, where the blueprint drawings live.

**Type.** DM Sans for everything (headlines at weight 500, tight tracking) and
JetBrains Mono for labels, both from Google Fonts. One type scale in
`src/styles.css` (`--fs-*`); nothing sets its own size.

**Motion.** Native scrolling, no animation library. Text sharpens out of a light
blur and rises a few pixels (one easing, `cubic-bezier(.16, 1, .3, 1)`); the
hero stack unfolds on load; sections reveal as they scroll in.
`prefers-reduced-motion` and no-JS get a static, fully drawn page.

1. **Hero.** Four stacked plates in isometric line art (`src/blueprint/stack.ts`),
   TRL 1–2 at the bottom to TRL 8 on top with the Trilight mark, and a level ruler.
   The four key facts sit below in dashed boxes.
2. **The ladder.** All eight stages in a list beside one stage at a time:
   picture, what to prove, time and grant. Prev/next, arrow keys or a swipe; the
   autoplay A/B test (`?ladder=auto|manual`) still runs. "Get Full Details" opens
   `/program.html`, generated from `docs/TRL8-program.md` on every build.
3. **Fundamentals.** Three cards (Sense, Decide, Act) that follow one example,
   a smoke alarm. Each shows a photo when `public/img/loop-<id>.webp` exists,
   else its blueprint drawing.
4. **The three forces.** A navy panel: Build, Test and Deploy light one after
   another, and each force's drawing draws in.
5. **What it takes, Doors, Who can join, Problems, FAQ**, then the navy
   closing CTA, the Demo Day finale and the footer with the oversized wordmark.

## Assets

Image prompts and file names: `docs/image-prompts.md`.

**Optional media slots** (drop the file in and rebuild; nothing else to change):

| File | Replaces |
|---|---|
| `public/img/door-standard.webp`, `public/img/door-fasttrack.webp` | The drawings on the two doors (16:9) |
| `public/img/loop-sense.webp`, `loop-decide.webp`, `loop-act.webp` | The drawings on the three Fundamentals cards (1:1, smoke-alarm example) |

**Old hero board.** `src/blueprint/hero.ts`, `scripts/render-hero.mjs` and
`public/img/hero-*.webp` / `hand.webp` belong to the previous circuit-city hero
and are no longer on the page.

- `public/brand/`: logo, wordmark and mark taken as vectors straight from the
  Trilight Brand Guidelines PDF; favicon follows the guideline's favicon lockup.
- `src/blueprint/`: the figures, as code. `stack.ts` (hero plates),
  `journey.ts` (ladder stages and the three forces), `vehicles.ts`
  (drone and rover), `board.ts` (the loop cards), `ladder.ts` (field node), `parts.ts` (ICs,
  passives, headers, jumpers), `blueprint.css` (palette and draw-on).
- `public/img/`: the problem photos were generated for this page with Magnific
  (Seedream). They're illustrative, not photos of real people or places.
