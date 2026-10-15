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

`src/analytics.ts` pushes funnel events to `window.dataLayer`, ready for GTM or GA4:
`trl8_page_view`, `trl8_cta_click {section}`, `trl8_scroll_depth {section}`,
`trl8_login_success`, `trl8_platform_redirect`.

## Motion and performance

Every illustration is an isometric **blueprint**: hardware drawn as line art on
navy grid paper, built at build time from real solids with correct hidden lines
(`src/blueprint/`, using the vendored [Anatomy](https://github.com/wheresryan22/anatomy)
iso kit, MIT). Each figure draws itself in like a pen, back to front, then its
fills settle in.

1. **Hero · the circuit city.** A dense board drawn in isometric line art,
   components standing like buildings round an empty socket. On scroll the
   copy clears, a hand with tweezers seats the Trilight chip, the copper lights
   out from the socket, and the camera dives into the chip.
2. **The ladder (pinned).** The drawing on the left grows from a pencil sketch
   of a drone (Idea) to its simulation wireframe (Model), the bare prototype
   with its flight-controller chip (Prototype) and the finished drone with a
   robotic rover (Product); the step on the right changes with it.
3. **Fundamentals.** One sense → decide → act board framed in three cards:
   signal pulses run along the copper and the motor pulley turns.
4. **The three forces.** One drawing per light: Build (a second identical unit
   and its BOM/SOP/QA sheet), Test (a rover on a roller rig), Deploy (a drone
   delivering parcels). Each light, and the LED in its drawing, turns on in turn.
5. **Closing.** The finished drone and rover draw in above the last call to
   action, followed by the Demo Day program finale.

- `prefers-reduced-motion` and no-JS get a static, fully drawn, readable page.
- Figure text (callouts, alt text) lives in `src/content.ts` (`anatomy`, `loop`, `ladder`, `value`).

## Assets

- `public/brand/`: logo, wordmark and mark taken as vectors straight from the
  Trilight Brand Guidelines PDF; favicon follows the guideline's favicon lockup.
- `src/blueprint/`: the figures, as code. `hero.ts` (circuit city, chip and
  hand), `journey.ts` (ladder stages and the three forces), `vehicles.ts`
  (drone and rover), `board.ts` (the loop cards), `ladder.ts` (field node), `parts.ts` (ICs,
  passives, headers, jumpers), `blueprint.css` (palette and draw-on).
- `public/img/`: the problem photos were generated for this page with Magnific
  (Seedream). They're illustrative, not photos of real people or places.
