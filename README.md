# alexgravely.dev

Alex Gravely's personal site: Astro 7 with the EmDash CMS, deployed as a single Cloudflare Worker (D1 for data, R2 for media).

The rebuild is in progress. See [docs/rebuild-plan.md](docs/rebuild-plan.md) for the plan, decisions, and open questions.

## Requirements

- Node 22.12 or later
- pnpm

## Local development

```bash
pnpm install
pnpm dev
```

- Site: http://localhost:4321
- CMS admin: http://localhost:4321/_emdash/admin (the first visit runs the setup wizard)

Local D1 and R2 data live in `.wrangler/` and are not committed.

For the invoice and contact pages, also:

```bash
cp .dev.vars.example .dev.vars   # then fill in Stripe test and PayPal sandbox credentials
pnpm db:migrate:local            # creates the invoice and contact tables
```

### Loading the seed content locally

On a fresh local database, the dev server creates the collections from `seed/seed.json` but not their entries. To load the entries and sign in without passkey setup, open http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin once (dev only). To start over, stop the server and delete `.wrangler/state`.

## Content

Everything on the site comes from EmDash collections: `profile` (one entry, slug `main`), `jobs`, `skills`, `education`, `portfolio`, `certifications`, `open_source`, `services`, `posts` (the blog), and `pages` (titles and intro text for the projects, services, contact and blog pages). The header links are the EmDash menu `primary`. Read them through the helpers in `src/lib/content.ts`. Use `getPortfolio()` for every portfolio list so new entries appear everywhere.

## Pages

| Route | Content |
|---|---|
| `/` | Profile as highlighted JSON |
| `/resume` | Résumé, with print styles |
| `/projects`, `/projects/[slug]` | `portfolio` collection |
| `/services` | `services` collection |
| `/contact` | Contact form: `/api/contact` saves to D1 (`contact_messages`) and emails `NOTIFY_EMAIL` |
| `/blog`, `/blog/[slug]` | `posts` collection |

To remove a page: take it out of the `primary` menu in the admin, then delete its file under `src/pages/`.

The contact form uses a hidden honeypot field against spam. For stronger protection, create a Cloudflare Turnstile widget, set `TURNSTILE_SITE_KEY` in `wrangler.jsonc`, and add `TURNSTILE_SECRET_KEY` as a secret.

## Invoices and payments

Clients pay invoices by card (Stripe Checkout) or PayPal/Venmo (PayPal buttons). The full design and rules are in section 6 of the rebuild plan.

| Route | What it does |
|---|---|
| `/admin/invoices` | Create, email, void, and copy links for invoices; lists payments that need a manual refund. Requires an EmDash admin login. |
| `/pay/[token]` | The client's invoice page. `noindex`; unknown tokens are a plain 404. |
| `/api/pay/stripe`, `/api/pay/paypal/create`, `/api/pay/paypal/capture` | Start a payment. Only the token is accepted from the browser; amounts come from D1. |
| `/api/webhooks/stripe`, `/api/webhooks/paypal` | Verified webhooks: the only thing that marks an invoice paid. |

Invoice tables are plain D1 (`migrations/`), not EmDash content. Code is in `src/lib/invoices/`. Emails (invoice link, receipt, and notices to `NOTIFY_EMAIL`) go out through Cloudflare Email Sending via the `EMAIL` binding; locally, Wrangler writes them to `.wrangler/tmp/email/` instead of sending.

### Before going live

1. Onboard the sender domain for `EMAIL_FROM` in Cloudflare (Email Service → Email Sending).
2. Create the D1 database and R2 bucket (the first `pnpm deploy` does this), then run `pnpm db:migrate:remote`.
3. Set secrets: `wrangler secret put` for `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`.
4. In `wrangler.jsonc` vars, set `PAYPAL_CLIENT_ID`, and switch `PAYPAL_API_BASE` to `https://api-m.paypal.com` for live payments.
5. Register webhooks:
   - Stripe: `https://alexgravely.dev/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   - PayPal: `https://alexgravely.dev/api/webhooks/paypal` for `PAYMENT.CAPTURE.COMPLETED`; its webhook ID is `PAYPAL_WEBHOOK_ID`.
6. Make a sandbox payment with each provider before switching to live keys.

## Components

Site components can be Astro or Svelte 5 (`.svelte`, in `src/components/`). React is installed only for the EmDash admin. `Ticker.svelte` (the résumé's live counter) is an example of a Svelte island.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server, using local D1 and R2 through Wrangler |
| `pnpm build` | Production build into `dist/` |
| `pnpm typecheck` | `astro check` |
| `pnpm db:migrate:local` / `db:migrate:remote` | Apply D1 migrations (invoices, contact messages) to local / production D1 |
| `pnpm cf-typegen` | Regenerates `worker-configuration.d.ts` after `wrangler.jsonc` changes |
| `pnpm deploy` | Build and `wrangler deploy` |

## Layout

| Path | What it is |
|---|---|
| `astro.config.mjs` | Astro, Cloudflare adapter, React (for the EmDash admin), Svelte, EmDash with D1 and R2 |
| `wrangler.jsonc` | Worker name, D1 (`DB`), R2 (`MEDIA`) and email (`EMAIL`) bindings, public vars, EmDash cron |
| `src/worker.ts` | Worker entry point (EmDash handler plus scheduled tasks) |
| `src/live.config.ts` | Registers EmDash content with Astro |
| `seed/seed.json` | EmDash collections and their initial content |
| `src/lib/content.ts` | Content query helpers |
| `src/lib/invoices/` | Invoice storage, Stripe, PayPal, email |
| `src/lib/admin.ts` | EmDash-login gate for `/admin/*` pages |
| `migrations/` | D1 migrations for the invoice and contact-message tables |
| `src/lib/email.ts` | Shared email sender (Cloudflare Email Sending) |
| `src/lib/contact.ts` | Contact form validation, storage, Turnstile |
| `src/lib/dates.ts`, `src/lib/json-highlight.ts` | Date formatting and age; home page JSON highlighting |
| `src/styles/global.css` | Theme variables and base styles |
| `src/components/` | Site components (Astro or Svelte) |
| `emdash-env.d.ts` | Generated content types (rewritten by the dev server) |
