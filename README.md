# TRL8 · Trilight landing page

The single-page site for **TRL8 (Trilight)**: NxtWave's funded, gated journey that
takes a NIAT student's Physical AI idea from a sketch to a product customers pay
for. The page has one job: get students to **Register your interest** through the
NxtWave learning portal login.

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
| `VITE_HELP_EMAIL` | Optional help address shown by the FAQ and the final CTA. |
| `VITE_SITE_URL` | Only for a custom domain: used for share-preview images. On Vercel it defaults to the project's production domain. |

The portal team needs to send students back to `/registered.html?registered=1`
after a successful login. The website stores no student data (PRD §15).

## Editing content

All copy and every number on the page live in **`src/content.ts`**. They're
rendered into static HTML at build time (`src/render.ts`, wired through
`vite.config.ts`), so the page is fully readable before or without JavaScript.

Lines marked `SIGN-OFF` still need program approval before launch (PRD §15):
- ₹5L max grant per team, ₹3 Cr annual pool
- Per-stage grants (₹30K / ₹70K / ₹1.5L / ₹2.5L, from the Figma outline)
- Explorer 4–6 weeks, ~1–2 years total (shown as indicative)
- Competition names (iDEX, SIH, NIDAR, IRoC-U, Mehar Baba) need permission
- GRIT Miles show "values coming soon" until the updated table is shared
- IP / equity: the FAQ only says the policy is being finalised

Student project media (Makers Conclave): add entries to `projects` in
`src/content.ts`. Until then the section shows a "coming soon" panel.

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

1. **Hero.** An engineering-drawing frame (registration corners, rulers, title
   block with a TRL counter) around the Trilight core: a six-layer hardware
   stack beside the headline. On scroll it moves to centre and explodes into
   its layers (shield, processing matrix, routing grid, neural logic array,
   power distribution, interface base), each with a callout.
2. **What is Trilight.** A sense → decide → act circuit board: signal pulses
   run along the copper from the sensor to the MCU to the motor driver, the
   tags light in turn and the motor pulley turns. Then the NASA TRL scale fills.
3. **The ladder.** One product, a field sensor node, at every stage: parts
   tray, pencil sketch, simulation wireframe, breadboard, open enclosure in the
   field, golden sample, unit with its carton and paid invoice, and three
   qualified units with all three lights on. Each draws in as its gate lights.
4. **Sections.** Lamps on a beam, project reel, self-drawing line icons,
   problem photos with detection boxes, brand-octagon doors, count-up numbers,
   connected register steps.
5. **Closing.** The qualified units draw in above the last call to action.

- `prefers-reduced-motion` and no-JS get a static, fully drawn, readable page.
- Figure copy (callouts, tags, alt text) lives in `src/content.ts` (`anatomy`, `loop`, ladder `imageAlt`).

## Assets

- `public/brand/`: logo, wordmark and mark taken as vectors straight from the
  Trilight Brand Guidelines PDF; favicon follows the guideline's favicon lockup.
- `src/blueprint/`: the figures, as code. `core.ts` (hero stack), `board.ts`
  (sense → decide → act), `ladder.ts` (stage figures), `parts.ts` (ICs,
  passives, headers, jumpers), `blueprint.css` (palette and draw-on).
- `public/img/`: `lab-2` (project reel) and the problem photos were generated
  for this page with Magnific (Seedream). They're illustrative, not photos of
  real NIAT projects.
