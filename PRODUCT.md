# Service Ledger — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `services`, evidence Prototype) on 2026-10-23.

## What it is

A client-side list of service offerings, seeded with three authored sample lines.

## Who it is for

A portfolio visitor who wants to see a small catalog-editing UI.

## What works today

1. Add a line (name required; details and state optional). New lines go on top.
2. Search name, details or state (case-insensitive, surrounding spaces ignored) and filter by All, Available, Draft or
   Paused. Counters show lines, available and showing.
3. Remove a line. Lines persist in this browser's localStorage; corrupt or wrongly shaped stored data falls back to
   the sample instead of crashing the page.
4. `/api/mcp` answers JSON-RPC with `get_all`, `get_by_id` and `search` over the sample lines only.
5. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No tiered pricing, add-ons, booking request form, FAQs or inquiry-to-proposal flow (claims removed from the
  portfolio card in the 2026-10 review). The page says "No checkout, account, or remote catalog".
- No editing of an existing line other than removing it. No sync or export. No product analytics beyond Vercel
  Analytics.

## Live URL and deploy state

- Live: https://services.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-services-frontend` is deployed only by CLI (last production 2026-10-23 12:26, CLI
  deploy of commit c6caf1e, the Next 16.4.2 security patch) and its Git link names the old repository
  `bookchaowalit/bookchaowalit-services-frontend`, so a push to `main` does not deploy. The live site lags `main`
  (template MCP route, no storage validation, no Sentry) until the owner reconnects Vercel Git to this repository
  (owner action D9). `NEXT_PUBLIC_SENTRY_DSN` is already set on the Vercel project (Sentry project
  `marketing-services-web`, org `personal-yu0`).

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route.
