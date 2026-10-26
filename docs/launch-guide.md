# TRILIGHT website: getting found on Google and tracking visitors

Two separate jobs, both done once:

- **Part A: Google Search Console.** Tells Google the site exists so it shows up in search.
- **Part B: Google Analytics 4 (GA4).** Counts visitors and Join clicks.

Before you start, check the address is right. The site assumes it lives at
**https://www.trilight.niatindia.com**. If the live address is different, do step 0 first.

---

## Step 0 (only if the live address is NOT www.trilight.niatindia.com)

1. In Replit, open **Deployments → your deployment → Secrets** (or Tools → Secrets).
2. Add `VITE_SITE_URL` = your real address, e.g. `https://www.example.com` (no slash at the end).
3. Press **Redeploy**.

---

## Make the address work without "www" too

Right now `www.trilight.niatindia.com` works but `trilight.niatindia.com`
doesn't: the plain address has no DNS record, so browsers can't find it.
People often type it without www, so fix this once:

1. In Replit, open **Deployments → Settings → Link a domain** and add
   `trilight.niatindia.com` (the plain one, as a second domain next to www).
2. Replit shows two records, an **A record** and a **TXT record**
   (`replit-verify=…`). Send both to the IT team that manages `niatindia.com`
   and ask them to add them for `trilight.niatindia.com`.
3. Wait until Replit shows the domain as **Verified** (minutes to a few hours).
4. Test: open `https://trilight.niatindia.com` in a private window.

Both addresses then show the same site. The page tells Google that the www
address is the main one, so search ranking isn't split between them.

---

## Part A: the sitemap and Google Search Console

### What the sitemap is

A sitemap is a small list of the site's pages that you hand to Google, so it
doesn't have to discover them on its own. The site creates it automatically on
every build. Nothing to edit. Open these to see them:

- `https://www.trilight.niatindia.com/sitemap.xml`: the list of pages (the home page).
- `https://www.trilight.niatindia.com/robots.txt`: tells search engines they may read the site, and where the sitemap is.

If both open in the browser, you're ready.

### Steps (about 15 minutes, plus 1–7 days for Google)

1. Go to **https://search.google.com/search-console** and sign in with the
   NIAT Google account that should own the site.
2. Click **Add property** and choose **Domain**. Type `trilight.niatindia.com`
   (without www; a Domain property covers both the www and plain addresses)
   and click Continue.
3. Google shows a **TXT record** (a line starting with `google-site-verification=`).
   Copy it.
4. Send it to whoever manages DNS for `niatindia.com` (IT team) and ask them
   to add it as a **TXT record** for `trilight.niatindia.com`.
5. Back in Search Console, click **Verify**. If it fails, wait an hour and
   try again; DNS can take time.
6. In the left menu, open **Sitemaps**. In "Add a new sitemap", type
   `sitemap.xml` and click **Submit**. The status should become **Success**.
7. In the top search bar, paste `https://www.trilight.niatindia.com/` and press
   Enter, then click **Request indexing**.

Google usually lists the page within a few days. To check, search
`site:trilight.niatindia.com` on Google.

### Optional checks (5 minutes)

- **Share preview:** paste the link into https://www.linkedin.com/post-inspector/ to see the card shown on LinkedIn and WhatsApp.
- **Structured data:** paste the link into https://search.google.com/test/rich-results. It should find "FAQ" and "Organization" with no errors.

### After that

Nothing to repeat. Every redeploy updates the sitemap date automatically.
In Search Console, check **Performance** once a month to see how many people
find the site through Google and what they searched for.

---

## Part B: Google Analytics 4 (data tracking)

### Steps (about 15 minutes)

1. Go to **https://analytics.google.com** and sign in with the NIAT account.
2. Click **Admin** (gear icon, bottom left) → **Create → Property**.
   - Property name: `TRILIGHT Website`
   - Time zone: India, Currency: Indian Rupee → Next, fill the business details → **Create**.
3. Choose platform **Web**.
   - Website URL: `www.trilight.niatindia.com`
   - Stream name: `TRILIGHT Website` → **Create stream**.
4. Copy the **Measurement ID**. It looks like `G-XXXXXXXXXX`.
5. In Replit: **Deployments → Secrets**, add
   `VITE_GA_ID` = the Measurement ID. Then **Redeploy**.
6. Check it works: open the live site in a new tab, then in Google Analytics go to
   **Reports → Realtime**. Within a minute you should see 1 active user.

That's it. Page views now count automatically.

### What gets tracked

| Event name | When it fires | Extra detail |
|---|---|---|
| `page_view` | Someone opens the site | automatic |
| `trl8_cta_click` | Someone clicks any **Join the Program** button | `section`: which button (nav, hero, doors, finale, closing, sticky) |
| `trl8_scroll_depth` | Someone reaches a section | `section`: ladder, loop, value, faq |
| `trl8_ladder_stage` | The ladder moves on its own | `stage` number |
| `trl8_ab_assign` | A visitor is put in the ladder A/B test | `variant`: auto or manual |

### Make the reports useful (10 minutes, do once, a day after step 6)

The events need to arrive at least once before they appear in these menus.

1. **Count Join clicks as conversions:** Admin → **Events** → find
   `trl8_cta_click` → switch on **Mark as key event**.
2. **See which button and which A/B version:** Admin → **Custom definitions** →
   **Create custom dimension**, twice:
   - Name `Button`, Scope Event, Event parameter `section`
   - Name `Ladder variant`, Scope Event, Event parameter `variant`
3. **Read the results:** Reports → Engagement → **Events** → click
   `trl8_cta_click` to see clicks per button. For the A/B test, use
   **Explore → Free form** with dimension *Ladder variant* and metric *Key events*.

### Using Google Tag Manager instead (only if your team already uses it)

Use `VITE_GTM_ID` = `GTM-XXXXXXX` instead of `VITE_GA_ID` (not both), then
set up the GA4 tag inside Tag Manager. All the events above arrive there too.

---

## Before you switch analytics on

Turning on GA means the site collects visitor data. Ask NIAT's legal or
privacy team whether a cookie or consent notice is needed (India's DPDP Act).
