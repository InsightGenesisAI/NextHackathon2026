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

## Accounts & onboarding

- `/signup` — create an account (name, company, email, password). Passwords are
  hashed with Node's built-in `crypto` (scrypt). Sessions are cookie-based.
- `/login`, `/logout` — sign in / out.
- After signup (which now collects company name, country, and optional
  address), users go through company enrichment + onboarding:
  1. **Company lookup** — Exa searches the web for the company and OpenAI
     structures the findings into a fixed criteria schema (legal name, industry,
     description, HQ, website, key products, etc.).
  2. **Confirm & correct** — the user reviews the AI-filled profile, edits any
     wrong fields, or clicks "This isn't my company" to start fresh and fill it
     in manually.
  3. **AI context questions** — generated on the spot from a hardcoded criteria
     list (budget, top categories, approvers, priorities), tailored to the
     confirmed company.

All of this is editable later on the Settings page — the company profile is a
live form, and the spending-context answers are shown there too.

The dashboard pages are gated: signed-out users are sent to `/login`, and
signed-in users who haven't finished onboarding are sent to `/onboarding`. The
saved company profile appears on the Settings page and personalizes the
dashboard greeting.

### AI & company enrichment

Company lookup uses Exa (search) and OpenAI (structuring + question generation)
when their keys are set; otherwise it falls back to manual entry plus a built-in
heuristic question generator, so onboarding never breaks.

```bash
EXA_API_KEY=...                 # optional, enables web company lookup
OPENAI_API_KEY=sk-...           # optional, structures findings + AI questions
OPENAI_MODEL=gpt-4o-mini        # optional, defaults to gpt-4o-mini
```

> Accounts, sessions, and profiles are in-memory, so they reset on restart and
> on serverless cold starts. Swap `server/auth.js` for a database + durable
> session store for production.

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
  store.js          # per-user (Stripe-gated) + public-hub data getters
  stripe.js         # the demo financial dataset that "lives in Stripe"
  mockData.js       # demo content for the Purchase Review page
  format.js         # money/date helpers + HTML escaping
  clientScript.js   # browser JS (served from memory at /app.js)
  auth.js           # accounts, sessions, company profile, Stripe flag
  enrichment.js     # Exa + AI company lookup and context questions
  views/
    layout.js       # HTML shell (Tailwind CDN + Lucide)
    partials.js     # reusable UI fragments (incl. Stripe connect banner)
    pages.js        # per-page render functions
    auth.js         # login / signup / onboarding views
api/index.js        # Vercel serverless entrypoint → server handler
vercel.json         # routes all requests to the Node handler
```

## Stripe connection (data source)

The dashboard shows **no financial data until the user connects Stripe**. The
demo dataset lives in `server/stripe.js` (standing in for the Stripe API), and
is gated per-user by `user.stripeConnected`:

- Before connecting: every page shows an empty state / "Connect Stripe" banner
  and metrics read zero.
- After connecting (Settings → Stripe connection, or any "Connect Stripe"
  button): purchases, budgets, and financial health populate from the demo
  Stripe data. Disconnecting empties it again.

The public hub API (`/api/v1/*`, the browser extension's backend) has no user
session, so it always serves the demo Stripe data and accepts extension-reported
purchases at runtime.

> Note: the store is in-memory, so history resets on restart (and on serverless
> cold starts). Swap `store.js` for a real database for production.

## Financials & Taxes

Once Stripe is connected, two more pages light up from the same demo dataset
(`server/stripe.js`):

- **Financials** (`/financials`) — revenue streams, expense breakdown, COGS,
  gross/operating/net profit and margins, MRR/ARR/EBITDA, a 12-month revenue
  trend, and a monthly P&L table.
- **Taxes** (`/taxes`) — estimates annual taxes over the fiscal cycle from the
  pre-tax profit, broken down by component with an effective rate and after-tax
  income. It surfaces tax-efficiency tips and per-item treatment notes, with a
  clear disclaimer that these are estimates, not advice.

The tax engine (`server/taxengine.js`) uses Exa to pull current,
location-specific rate context and OpenAI to structure the estimate and
recommendations. Without keys it falls back to built-in heuristic rate tables
(US/UK/Canada/Ireland/Australia/Germany/Singapore + a generic default), so the
page always renders. Set `EXA_API_KEY` and `OPENAI_API_KEY` to enable the live
path.

## Deploy to Vercel

`vercel.json` is configured to run the Node handler as a serverless function
(`@vercel/node`) and rewrite all routes to it. Set the project root directory to
`dashboard` in the Vercel project settings.

```bash
vercel --prod
```
