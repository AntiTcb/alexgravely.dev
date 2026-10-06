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

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server, using local D1 and R2 through Wrangler |
| `pnpm build` | Production build into `dist/` |
| `pnpm typecheck` | `astro check` |
| `pnpm cf-typegen` | Regenerates `worker-configuration.d.ts` after `wrangler.jsonc` changes |
| `pnpm deploy` | Build and `wrangler deploy` |

## Layout

| Path | What it is |
|---|---|
| `astro.config.mjs` | Astro, Cloudflare adapter, React (for the EmDash admin), EmDash with D1 and R2 |
| `wrangler.jsonc` | Worker name, D1 (`DB`) and R2 (`MEDIA`) bindings, EmDash cron |
| `src/worker.ts` | Worker entry point (EmDash handler plus scheduled tasks) |
| `src/live.config.ts` | Registers EmDash content with Astro |
| `seed/seed.json` | Initial EmDash schema and settings, applied by the setup wizard |
| `emdash-env.d.ts` | Generated content types (rewritten by the dev server) |
