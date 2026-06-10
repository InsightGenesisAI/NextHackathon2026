# AgentCFO — Autonomous Procurement Engine (APE)

Python-heavy procurement gatekeeper. The Chrome extension is a **thin client** — it scrapes DOM, renders Liquid Glass UI, and delegates all intelligence to the Python hub.

## Thin-client bridge architecture

```
Phase 1  spoke_extension.js     scrapeCartData · freezeCheckoutEvent · PII sanitize
Phase 2  python-bridge.js       transmitToPythonHub · awaitAuditDecision (4.5s timeout)
Phase 3  hardwall-ui.js         populateGlassCapsules · renderAIContextRequest · toggleWarningState
Phase 4  hardwall-ui.js         handleAbortClick · handleOverrideSubmit → Stripe via Python
         background.js           fetch proxy to Python hub (CORS / MV3 service worker)
```

## Quick start

### 1. Python hub (required)

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python api_server.py          # http://127.0.0.1:8787
```

### 2. Chrome extension

1. `chrome://extensions` → Developer mode → **Load unpacked** → `extension/`
2. Open `extension/demo_checkout.html`
3. Click **Place Order**

Extension popup settings:
- **Python hub URL** — default `http://127.0.0.1:8787`
- **Timeout fallback** — `fail-closed` (block) or `fail-open` (soft warning + proceed)

### 3. Package for distribution (deployable .zip)

The extension is plain Manifest V3 with no build step. To produce a shippable zip:

```bash
python package_extension.py        # → dist/agentcfo-extension-v<version>.zip
```

Load unpacked from `extension/` for development, or upload the generated zip to the
Chrome Web Store Developer Dashboard for distribution.

## API endpoints (v1)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/intercept` | Full APE pipeline → UI-ready capsules + telemetry + chain-of-thought |
| `POST` | `/api/v1/review` | HITL: re-evaluate a flagged purchase against the human's justification (no money moves) |
| `POST` | `/api/v1/resolve?action=approve\|decline` | Stripe auth approve / decline |

Legacy: `/api/audit`, `/api/resolve` still supported.

## Hackathon rubric features (the "Glass Brain")

- **Live Telemetry Tracker** — the loading modal animates the multi-agent pipeline
  (Agent 1 → Exa → Agent 2) and `/api/v1/intercept` returns a `telemetry` array with
  real per-stage timings (`[Done: 120ms]`).
- **Chain-of-thought audit logs** — Evaluator 2 emits a `chain_of_thought` array.
  The hard-wall has a collapsible **Audit Logs · Terminal View** revealing the
  reasoning steps, the exact Exa query Agent 1 formulated, the Stripe auth-hold id,
  and the live/simulated mode of each tool (proof of real tool use).
- **Human-in-the-loop** — submitting a justification first hits `/api/v1/review`, where
  the CFO Auditor dynamically decides whether the context justifies the override (e.g.
  *"running a 48-hour load test"* → approved) before any funds are released.
- **Graceful degradation** — if the Python hub exceeds the 4.5s timeout or drops,
  `fail-open` mode shows a soft "Bypass" state ("Market Intel Offline · Stripe Ledger
  Confirms Sufficient Funds · Approving to prevent operational blockage"); `fail-closed`
  holds the checkout.

## Extension modules

| File | Role |
|------|------|
| `js/spoke_extension.js` | DOM mutation observers, cart scrape, checkout freeze |
| `js/python-bridge.js` | Async bridge, 4.5s timeout, fail-open/closed fallback |
| `js/hardwall-ui.js` | Liquid Glass overlay + resolution handshake |
| `js/content.js` | Orchestrator wiring |
| `css/liquid-glass.css` | Frutiger Eco glass UI |

## Python spokes

| Module | Role |
|--------|------|
| `spoke_extension.py` | Server-side cart normalization |
| `spoke_cards.py` | Company DNA |
| `spoke_stripe_tracker.py` | Stripe health + auth hold |
| `spoke_market.py` | Exa benchmarks |
| `spoke_intelligence.py` | OpenAI evaluators |
| `api_server.py` | FastAPI hub |
| `main.py` | CLI reference |

## Environment variables

See `.env.example` for `STRIPE_TEST_KEY`, `EXA_API_KEY`, and `OPENAI_API_KEY`.
