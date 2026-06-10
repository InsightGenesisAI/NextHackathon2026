# AgentCFO Dashboard

A friendly, small-business-focused frontend for AgentCFO — the AI finance
assistant that helps owners avoid overspending, find better alternatives, and
keep an eye on budget health. Built with Next.js (App Router), Tailwind CSS, and
lucide-react.

This dashboard wraps the existing Python APE backend (Chrome extension + FastAPI
hub). It does **not** replace any backend logic — it provides a calmer, simpler UI
around the same intercept / resolve / financial-health endpoints.

## Pages

- **Home** (`/`) — greeting, today-at-a-glance metrics, recent activity, and a
  demo button that opens the checkout review overlay.
- **Purchase Review** (`/review`) — better-alternatives view with the agent
  timeline ("How AgentCFO decided") and an audit-log drawer.
- **Financial Health** (`/insights`) — cash flow status, budgets, and Stripe
  ledger snapshot in plain English.
- **To Do** (`/todo`) — tasks, upcoming renewals, and recommended actions.
- **Purchases / Savings / Alerts / Settings** — supporting views.

## Run locally

```bash
cd dashboard
npm install
cp .env.example .env.local   # optional — defaults to http://127.0.0.1:8787
npm run dev                  # http://localhost:3000
```

Start the Python hub (`python api_server.py` in the repo root) so live data flows
in. If the hub is offline or an endpoint is missing, the UI automatically falls
back to friendly mock data — it never breaks.

## Backend integration

The API layer lives in `src/lib/api.ts`. It calls these endpoints and degrades
gracefully to mocks (`src/lib/mockData.ts`) on error or timeout (4.5s soft cap):

| Endpoint | Used by |
|----------|---------|
| `GET /api/v1/dashboard/summary` | Home metrics |
| `GET /api/v1/purchases/recent` | Activity tables |
| `POST /api/v1/intercept` | Purchase review (mapped from the real APE pipeline) |
| `POST /api/v1/resolve` | Approve / decline a purchase |
| `POST /api/v1/review` | Human-in-the-loop justification check |
| `GET /api/v1/financial-health` | Financial Health page |
| `GET /api/v1/actions` | To Do page |
| `GET /api/v1/audit-log` | Agent timeline + audit log |

During dev, calls go through the `/hub/*` rewrite (see `next.config.mjs`) to
`PYTHON_HUB_URL`. In production, set `NEXT_PUBLIC_API_BASE` to your deployed
backend, or keep the rewrite and set `PYTHON_HUB_URL` on Vercel.

## Deploy to Vercel

This app is Vercel-native. From the `dashboard/` directory:

```bash
vercel            # preview
vercel --prod     # production
```

Set `PYTHON_HUB_URL` (and optionally `NEXT_PUBLIC_API_BASE`) in the Vercel
project's Environment Variables. The repo's root directory in Vercel should be
`dashboard`.
