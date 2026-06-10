# AgentCFO Dashboard Hub

A friendly, small-business-focused finance dashboard for AgentCFO — now built as
a **pure Node.js** app with no framework. It uses only Node's built-in modules
(`http`, `url`) to serve both:

- the **dashboard UI** (server-rendered HTML, styled with Tailwind via CDN and
  Lucide icons), and
- the **hub API** at `/api/v1/*` that holds purchase history and financial
  summaries.

The dashboard is the hub. The separate browser extension reports intercepted
purchases to it and reads financial context back.

## Run locally

```bash
cd dashboard
npm start            # node server/index.js  → http://localhost:3000
```

No dependencies to install — it's all built-in Node. Requires Node 18+.

Set `PORT` to change the port:

```bash
PORT=8080 npm start
```

## Pages

- `/` — greeting, today-at-a-glance metrics, recent activity, demo review modal
- `/purchases` — full purchase history
- `/savings` — savings opportunities
- `/insights` — financial health (cash flow, budgets, ledger)
- `/alerts` — purchases needing a look
- `/todo` — tasks, renewals, recommended actions
- `/review` — better-alternatives view with agent timeline + audit log drawer
- `/settings` — protection and fallback preferences

## Hub API

CORS-enabled so the browser extension can call it from any origin.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/dashboard/summary` | Home metrics |
| GET | `/api/v1/purchases/recent` | Recent purchase history |
| GET/POST | `/api/v1/purchases` | List / record a purchase (extension reports here) |
| GET | `/api/v1/financial-health` | Financial context (extension reads this) |
| GET | `/api/v1/actions` | To-do, renewals, recommendations |
| GET | `/api/v1/audit-log` | Agent timeline + audit log |

`POST /api/v1/purchases` accepts both dashboard-style (`vendor`, `priceCents`)
and extension-style (`merchant`, `amount_cents`) field names.

## Project layout

```
server/
  index.js          # HTTP server: routing, API, static client script
  store.js          # in-memory hub store (history + summaries)
  mockData.js       # seed data
  format.js         # money/date helpers + HTML escaping
  clientScript.js   # browser JS (served from memory at /app.js)
  views/
    layout.js       # HTML shell (Tailwind CDN + Lucide)
    partials.js     # reusable UI fragments
    pages.js        # per-page render functions
api/index.js        # Vercel serverless entrypoint → server handler
vercel.json         # routes all requests to the Node handler
```

> Note: the store is in-memory, so history resets on restart (and on serverless
> cold starts). Swap `store.js` for a real database for production.

## Deploy to Vercel

`vercel.json` is configured to run the Node handler as a serverless function
(`@vercel/node`) and rewrite all routes to it. Set the project root directory to
`dashboard` in the Vercel project settings.

```bash
vercel --prod
```
