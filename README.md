# Service Ledger

A browser-local catalog of service lines: three authored sample lines, plus your own with a name, details and a state
(Available, Draft, Paused). Search, filter by state and remove. Lines are kept in this browser's localStorage only.

Live: https://services.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does not do

- No pricing tiers, add-ons, booking or inquiry form, FAQ, checkout or account.
- No sync or server storage. Clearing site data removes your lines.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: ledger logic, stored-state hook, MCP route, home page render, Sentry scrubbing
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (with a line-coverage gate) and the shared security
scan on every push and PR to `main`.

## Code map

- `lib/services.ts`: sample lines, `parseServices` (rejects corrupt or wrongly shaped storage), `filterServices`,
  `countAvailable`, `addService`, `removeService`.
- `lib/use-stored-state.ts`: localStorage-backed state via `useSyncExternalStore` (server render uses the sample).
- `app/api/mcp/route.ts`: stateless JSON-RPC endpoint with `get_all`, `get_by_id` and `search` over the sample lines
  (a visitor's own lines never leave the browser).
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped; off when
  `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `app/more-projects/page.tsx`: shared portfolio link page (copied per repository, not a package).
