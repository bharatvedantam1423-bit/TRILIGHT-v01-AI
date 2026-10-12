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

## Configure before launch (`.env`, see `.env.example`)

| Variable | What it does |
|---|---|
| `VITE_PORTAL_LOGIN_URL` | Learning portal SSO/OAuth login URL. The page adds `redirect_uri=<site>/registered.html?registered=1`. **While empty, every Register button opens a "Registration opens soon" message**; the page never fakes a registration. |
| `VITE_PLATFORM_URL` | TRL8 platform on Replit. After login, students are sent here. While empty, `registered.html` shows the holding screen ("You're registered, we'll notify you…"). |
| `VITE_HELP_EMAIL` | Optional help address shown by the FAQ and the final CTA. |

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

- GSAP ScrollTrigger + Lenis drive two sticky scroll scenes (hero frame parts →
  the Trilight X forms → zoom through a robot's lens → lab stage with the
  builder), lights that switch on, a pinned sideways ladder (native swipe on
  phones) and the closing beams that form the X.
- `prefers-reduced-motion` and no-JS get a static, fully readable page.
- Phones get smaller image variants and fewer layers; ~50 KB gzipped JS; images ~1 MB total.

## Assets

- `public/brand/`: logo, wordmark and mark taken as vectors straight from the
  Trilight Brand Guidelines PDF; favicon follows the guideline's favicon lockup.
- `public/img/`: hardware renders, lens, lab stage and problem photos generated
  for this page with Magnific (Seedream), with backgrounds removed for the
  layered cut-outs. They're illustrative, not photos of real NIAT projects.
