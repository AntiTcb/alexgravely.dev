# alexgravely.dev rebuild: handoff plan

This file is the brief for rebuilding this repository. It records decisions already made by the owner (Alex Gravely) and the open questions that still need his answer. Suggested location in the repo: `docs/rebuild-plan.md`.

**How to use this file:** treat the "Decisions" sections as settled. Treat anything under "Open questions" as unresolved: ask the owner rather than guessing. Where this file says "verify", check the current official docs before writing code, because the notes here were gathered on 2026-10-05 and were not all tested.

---

## 1. Goal

Replace the current site with a full rebuild:

- **Framework:** Astro, version 7.3.5 or later (`^7.3.5`)
- **CMS:** EmDash, running inside the Astro project
- **Hosting:** Cloudflare (Workers, D1, R2)
- **New functionality:** more pages than today, including a page where freelance clients pay invoices by Stripe or PayPal

This is a rebuild, not a migration of the existing code. Reuse the content and the visual ideas, not the SvelteKit source.

## 2. What exists today

A two-page site on a pre-1.0 SvelteKit (Svelte 3, Vite 2, SCSS), deployed to Netlify as a static build.

| Path | What it is |
|---|---|
| `src/routes/index.svelte` | Home. Renders `static/profile.json` as a syntax-highlighted JSON block, then rewrites URL and email strings into links on mount. |
| `src/routes/resume.svelte` | Résumé. One large hand-written component: profile, work history, skills (devicon images), education, side projects, TCG judging, open source. Has a live "developer for X years" ticker (start date 2008-01-01), a print button, and a print stylesheet. |
| `src/lib/Header.svelte` | Sticky nav with two links. |
| `src/lib/Analytics.svelte` | Google Analytics, measurement ID `G-M1CN4YR1VL`. |
| `src/lib/Footer.svelte` | Exists but is not mounted. |
| `static/profile.json` | Profile data and trivia shown on the home page. |
| `src/app.scss`, `src/variables.scss` | Dark theme, Fira Mono, CSS variables, breakpoint mixin. |
| `netlify.toml` | Netlify build config (Node 14). |

Known content problems to fix during the rebuild:

- The YugiTube link on the résumé is malformed (`<a ...></a>YugiTube</a>`), so its text is not clickable.
- `profile.json` and the résumé disagree on the portfolio list (genesysformat.com appears only in the JSON; YugiTube and RiftTube appear only on the résumé).
- `profile.json` has a hardcoded `age` and an old-style Discord tag (`AntiTcb#0001`). See open questions.
- The print button is a `div` with a click handler. Make it a real `<button>`.

## 3. Decisions: stack

| Piece | Decision |
|---|---|
| Astro | `^7.3.5` (7.3.5 or any later 7.x). Requires Node 22.12 or later. |
| Adapter | `@astrojs/cloudflare` 14.x. Its peer requirements are Astro `^7.2.0` and Wrangler `^4.125.0`. |
| CMS | `emdash` `^1.1.0`. Its peer range is `astro >=6`, plus `react` and `react-dom` `>=18` and `@astrojs/react` `>=5` for the admin UI. It also lists `@emdash-cms/auth-atproto` as a peer: verify whether that is required or optional. |
| Database | Cloudflare D1, used both by EmDash and by the invoice tables in section 6. |
| Media | Cloudflare R2, through EmDash's storage configuration. Verify the exact import and options in the EmDash docs. |
| Rendering | Server-rendered. EmDash requires its pages to be server-rendered. |
| Package manager | pnpm (the repo already uses it). |
| Deploy target | A single Cloudflare Worker containing the site, the EmDash admin, and the payment endpoints. |

EmDash integration notes, to verify against the current docs before use:

- Scaffold reference: `npm create emdash@latest`.
- Config: `emdash()` from `emdash/astro` in `astro.config.mjs`. **Verified in phase 1:** `d1()` and `r2()` come from `@emdash-cms/cloudflare`, not `emdash/db`. The Worker entry is `src/worker.ts` using `@emdash-cms/cloudflare/worker`, per the official `starter-cloudflare` template (github.com/emdash-cms/templates).
- **Verified in phase 1:** `@emdash-cms/auth-atproto` is an optional peer and is not installed.
- A `src/live.config.ts` using `defineLiveCollection` from `astro:content` and `emdashLoader` from `emdash/runtime`.
- Queries: `getEmDashCollection` and `getEmDashEntry` from `emdash`. Rich text renders with `PortableText` from `emdash/ui`.
- Types: `npx emdash types`.
- Official guide: https://docs.astro.build/en/guides/cms/emdash/ and the repo at https://github.com/emdash-cms/emdash.

## 4. Pages

Settled by the owner: home, résumé, and the pay flow. The rest were proposed and not yet confirmed (see open questions).

| Route | Status | Source of content |
|---|---|---|
| `/` | Settled | Profile entry in EmDash. |
| `/resume` | Settled | `profile`, `jobs`, `skills`, `education`, `portfolio`, `certifications`, `open_source` collections. Keep the print stylesheet behavior: hide nav and icons, print link URLs, list skills as text. Keep the live ticker as a small client script with the start date as a CMS field. |
| `/pay/[token]` and `/pay` | Settled | Invoice tables in D1 (section 6). |
| `/projects`, `/projects/[slug]` | Proposed | `portfolio` collection, which has a long write-up field. |
| `/services` | Proposed | What Alex offers freelance, linking to contact. |
| `/contact` | Proposed | Form handled by a Worker endpoint. |
| `/blog` | Proposed, optional | EmDash posts. |

Carry over: Google Analytics (same measurement ID), favicons and `site.webmanifest`, the dark monospace look as a starting point.

## 5. Content model (EmDash)

Move all hardcoded résumé and profile content into the CMS so nothing requires a code edit.

| Collection | Fields |
|---|---|
| `profile` (single entry) | name, tagline, summary, location, birth date (age is calculated from it), contact links (email, GitHub, LinkedIn, Discord), career start date, trivia |
| `jobs` | title, company, start date, end date (empty means present), company description, responsibilities list, sort order |
| `skills` | name, category (language, framework, system), icon, sort order |
| `education` | program, school, dates, completed flag, coursework |
| `portfolio` | name, URL, summary, role, tech used, résumé bullet points, featured flag, show-on-résumé flag, sort order, optional long write-up. Replaces the earlier `projects` idea: one collection drives every portfolio list on the site. |
| `certifications` | area (for example Yu-Gi-Oh! TCG, Riftbound), credential, since date, notes, optional link |
| `open_source` | project, role, description |

Seed these from `resume.svelte` and `profile.json`. Where the two disagree, the résumé is the more recently edited source (last commit 2026-09-08, "Update side projects"), but confirm with the owner.

**Done in phase 2 (2026-10-06):** all seven collections are defined in `seed/seed.json` and seeded with the old content. The owner confirmed both portfolio lists are correct, so `portfolio` holds the merged nine sites (the résumé's grouped entries, YugiTube/RiftTube and DragonForce/Herman Li, are separate entries). Notes:

- Pages read the portfolio only through `getPortfolio()` in `src/lib/content.ts`, so a new CMS entry shows up everywhere.
- Genesys Format came only from `profile.json` and has no summary, role, or bullet points yet; fill them in through the admin.
- `age` is no longer stored: the profile holds a birth date (1994-03-10) and the home page calculates the age, without showing the date. Discord is now `antitcb`. Location was carried over unchanged from `profile.json`.
- The section-level dates on the résumé are fields: "Freelance" heading and start date on `profile`; TCG judging and open source start dates come from the earliest `since` among their entries.
- `profile` is an ordinary collection with one entry, slug `main`.
- Svelte (`@astrojs/svelte`) is installed for site components, at the owner's request. React remains for the EmDash admin.

**Done in phase 3 (2026-10-06):**

- Home renders the profile as highlighted JSON, built on the server in the old `profile.json` shape. URLs and emails become links without client JavaScript. The portfolio list is the featured `portfolio` entries.
- Résumé reads every section from the collections. The live ticker is a Svelte island (`src/components/Ticker.svelte`) reading `career_start`. The print button is a real `<button>`. Print styles hide the nav, icons, ticker and button, print link URLs, and list skills as text.
- Google Analytics (`G-M1CN4YR1VL`) loads in production builds only.
- FontAwesome, highlight.js and luxon were not carried over: icons are images or inline SVG, highlighting is a small server-side function, and date math is in `src/lib/dates.ts`.
- EmDash returns custom `datetime` fields as ISO strings (the generated types agree), not `Date` objects as its docs say. The date helpers accept both.

## 6. Decisions: payments

**Model: invoice links.** Alex creates an invoice and sends the client a link. The client cannot choose or change the amount.

**Providers: Stripe and PayPal as two separate integrations.** PayPal cannot be routed through Stripe here, because Stripe only offers PayPal to businesses based in the EU, UK, Switzerland, Norway and Liechtenstein, and this business is US-based (confirmed by the owner). Venmo is offered through the PayPal buttons (confirmed).

### 6.1 Storage

Invoices live in their own D1 tables, not in an EmDash collection. They are financial records, need atomic status changes, and must not be reachable through content queries.

```sql
CREATE TABLE invoices (
  id            TEXT PRIMARY KEY,            -- uuid
  token         TEXT NOT NULL UNIQUE,        -- 32 random bytes, base64url
  client_name   TEXT NOT NULL,
  client_email  TEXT,
  description   TEXT NOT NULL,               -- or JSON line items
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  currency      TEXT NOT NULL DEFAULT 'USD',
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','paid','void')),
  due_date      TEXT,
  provider      TEXT CHECK (provider IN ('stripe','paypal')),
  provider_txn  TEXT,
  paid_at       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE payment_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id    TEXT NOT NULL REFERENCES invoices(id),
  provider      TEXT NOT NULL,
  event_id      TEXT NOT NULL,               -- provider's event ID
  event_type    TEXT NOT NULL,
  applied       INTEGER NOT NULL,            -- 1 if it changed the invoice, 0 if not
  received_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (provider, event_id)
);
```

### 6.2 Routes

| Route | Purpose |
|---|---|
| `GET /pay/[token]` | Shows the invoice with Stripe and PayPal buttons. |
| `GET /pay` | Short explainer: use the link from your invoice. |
| `POST /api/pay/stripe` | Creates a Stripe Checkout session for the token and returns its URL. |
| `POST /api/pay/paypal/create` | Creates a PayPal order for the token. |
| `POST /api/pay/paypal/capture` | Captures the approved PayPal order. |
| `POST /api/webhooks/stripe` | Verifies the signature and marks the invoice paid. |
| `POST /api/webhooks/paypal` | Verifies the signature and marks the invoice paid. |
| `/admin/invoices` | Create, email, void, and copy links for invoices. Protected by the EmDash admin login (see 6.6). |

### 6.3 Rules

1. **Amounts come from the database only.** The browser sends just the token. Never accept an amount or currency from the client.
2. **Tokens are unguessable.** Unknown tokens return a plain 404. All `/pay` pages send `noindex`.
3. **Webhooks are the source of truth.** The return redirect only shows a thank-you or pending message; it never changes status.
4. **Marking paid is conditional and idempotent:** `UPDATE invoices SET status='paid', ... WHERE id=? AND status='open'`. Record every webhook in `payment_events`; a duplicate event ID is ignored.
5. **Double payment:** if a verified payment arrives for an invoice that is already paid by the other provider, record it with `applied = 0` and surface it in the admin for a manual refund. Do not auto-refund.
6. **Paid and void invoices** render their status with no payment buttons, and the create endpoints refuse them.
7. **Secrets** are Wrangler secrets, never committed and never sent to the browser. Only the Stripe publishable key and the PayPal client ID may reach the client.

### 6.4 Provider notes (verify against current docs)

- **Stripe:** Checkout Session in `payment` mode with a single line item built from the invoice, and the invoice ID in `metadata` and `client_reference_id`. Handle `checkout.session.completed`. On Workers, verify webhook signatures with the async, Web Crypto based verification, not the Node crypto one.
- **PayPal:** Orders v2 over plain `fetch` (OAuth client-credentials token, create order with the invoice ID as `custom_id`, capture after approval). Use the PayPal JS SDK button on the page. Verify webhooks through PayPal's verify-webhook-signature endpoint and handle the capture-completed event. Venmo is available to US merchants through the same checkout, if the owner wants it.

### 6.5 Environment

| Name | Kind |
|---|---|
| `DB` | D1 binding |
| `MEDIA` | R2 binding (name confirmed in phase 1) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Secrets |
| `PAYPAL_CLIENT_ID` | Variable (public) |
| `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` | Secrets |
| `PAYPAL_API_BASE` | Variable: sandbox or live API base URL |
| `STRIPE_API_BASE` | Variable: `https://api.stripe.com` (overridable for tests) |
| `EMAIL` | `send_email` binding (Cloudflare Email Sending) |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `NOTIFY_EMAIL` | Variables: sender, and where payment notices go |

### 6.6 Built in phase 4 (2026-10-06)

- **Admin protection:** reuses the EmDash login. EmDash's middleware sets `Astro.locals.user` on every route, so `/admin/invoices` requires a signed-in user with the ADMIN role (level 50) and otherwise redirects to `/_emdash/admin/login?redirect=...`. Cloudflare Access is not needed. Admin form posts also require a same-origin `Origin` header.
- **Emails (owner decision: the site sends them):** invoice link on create (optional checkbox) and via Send/Resend; receipt to the client when a payment is applied; notices to `NOTIFY_EMAIL` on payment and on any payment that needs review. Sent with Cloudflare Email Sending (`send_email` binding `EMAIL`), the same mechanism as EmDash's `@emdash-cms/cloudflare` email plugin. The sender domain must be onboarded before launch.
- **Schema additions** to 6.1: `invoices.emailed_at`; `payment_events.provider_txn`, `amount_cents`, `currency`.
- **Amount check:** a webhook payment applies only if its amount and currency match the invoice exactly. Otherwise it is recorded with `applied = 0` and shown under "Needs review", like a double payment.
- **Mark-paid** runs as one D1 batch: the conditional `UPDATE ... WHERE status = 'open'` and the event insert, whose `applied` is the update's `changes()`. Replays hit the unique `(provider, event_id)` and change nothing.
- **PayPal capture endpoint** refuses invoices that aren't open and orders whose `custom_id` isn't this invoice. Orders also set PayPal `invoice_id`, so PayPal itself rejects a second completed payment for an invoice.
- **No provider SDKs on the server:** Stripe and PayPal are called with `fetch`; Stripe signatures are checked with Web Crypto HMAC (5-minute tolerance). `STRIPE_API_BASE` is a var so tests can point at a mock.
- **Verified locally** against mock Stripe and PayPal APIs (51 checks: tampering, replays, double payment, amount and currency mismatch, void, unknown tokens, `noindex`, admin login and CSRF). **Not yet tested against the real Stripe test mode or PayPal sandbox**, which needs the owner's credentials; the PayPal button UI also hasn't been exercised because the build sandbox couldn't reach paypal.com.

## 7. Build order

Build without live credentials first. Everything through phase 4 can be done and tested with placeholders and provider sandboxes.

1. **Scaffold.** *(Done 2026-10-06.)* New Astro project on a branch, Cloudflare adapter, React, EmDash, `wrangler` config with D1 and R2 bindings, local dev running. Remove the SvelteKit source and `netlify.toml` once the new project builds.
2. **Content model.** *(Done 2026-10-06.)* Create the collections in section 5 and seed them from the old files. The old sources were removed in phase 1; read them from `main` (`git show main:src/routes/resume.svelte`, `git show main:static/profile.json`).
3. **Core pages.** *(Done 2026-10-06.)* Base layout, header, home, résumé with print styles and ticker, analytics.
4. **Payments.** *(Built 2026-10-06; real-sandbox test pending credentials.)* D1 migration, `/pay` routes, both providers against their sandboxes, webhooks, admin invoice page.
5. **Remaining pages.** Whichever proposed pages the owner confirms.
6. **Deploy.** Cloudflare resources, secrets, webhook endpoints registered with Stripe and PayPal, then DNS cutover. The owner does the cutover and supplies live credentials.

## 8. Acceptance checks

- `pnpm build` succeeds on Node 22.12 or later with Astro `^7.3.5`.
- All résumé and profile content is editable in the EmDash admin, and none is hardcoded in components.
- The résumé prints cleanly on one flow of pages, with link URLs visible and no icons.
- An open invoice can be paid in the Stripe sandbox and in the PayPal sandbox, and each flips the invoice to `paid` only through a verified webhook.
- Replaying a webhook does not change anything. Tampering with the request body cannot change the amount charged.
- Paid and void invoice links show status and offer no payment buttons. An unknown token returns 404.
- `/pay` pages are `noindex`, and `/admin/invoices` is unreachable without authentication.

## 9. Open questions for the owner

1. **Proposed pages:** which of `/projects`, `/services`, `/contact`, `/blog` to build.
2. ~~**Home page:** keep the highlighted-JSON presentation, or redesign it.~~ Resolved: keep it for now.
3. ~~**Admin protection for `/admin/invoices`.**~~ Resolved: reuses the EmDash admin login (see 6.6).
4. ~~**`socialinks/`:** move to its own repo, or delete.~~ Resolved: deleted on 2026-10-06 (still in git history).
5. **Profile data:** current location. (Resolved: portfolio lists merged; age calculated from a birth date; Discord is `antitcb`.)
6. ~~**Business location.**~~ Resolved: US-based.
7. ~~**Venmo.**~~ Resolved: enabled through PayPal.
8. ~~**Invoice emails.**~~ Resolved: the site sends invoice links and receipts (see 6.6). Still to choose: the sender address (`EMAIL_FROM`, currently `invoices@alexgravely.dev`).
9. **Domain:** whether DNS for alexgravely.dev is already on Cloudflare.

## 10. Out of scope

- Storing card data, or any custom card form. Both providers' hosted flows handle payment details.
- Subscriptions, recurring billing, tax calculation, and multi-currency.
- Client accounts or logins.
