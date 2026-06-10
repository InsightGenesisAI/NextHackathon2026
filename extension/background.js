// AgentCFO extension service worker.
//
// Two separate backends:
//  1. AUDIT BACKEND (apiBase) — runs the purchase intervention pipeline
//     (intercept / resolve / review). This is the extension's own engine and
//     is independent from the dashboard. Defaults to the local Python hub.
//  2. DASHBOARD HUB (hubBase) — the Vercel dashboard. The extension reads
//     financial context from it and reports intercepted purchases to it so
//     they show up in the dashboard's history. It does NOT run intervention.
const DEFAULT_API_BASE = "http://127.0.0.1:8787";
const DEFAULT_HUB_BASE = "https://next-hackathon2026.vercel.app";

async function getApiBase() {
  const stored = await chrome.storage.sync.get(["apiBase"]);
  return stored.apiBase || DEFAULT_API_BASE;
}

async function getHubBase() {
  const stored = await chrome.storage.sync.get(["hubBase"]);
  return (stored.hubBase || DEFAULT_HUB_BASE).replace(/\/$/, "");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "APE_INTERCEPT") {
    runIntercept(message.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === "APE_RESOLVE") {
    runResolve(message.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === "APE_REVIEW") {
    runReview(message.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  // Read financial context from the dashboard hub (Vercel).
  if (message.type === "HUB_FINANCIAL_HEALTH") {
    fetchHubFinancialHealth().then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  // Report a decided purchase to the dashboard hub so it lands in history.
  if (message.type === "HUB_REPORT_PURCHASE") {
    reportPurchaseToHub(message.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  // Legacy message types
  if (message.type === "APE_AUDIT") {
    runIntercept(message.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function runIntercept(payload) {
  const apiBase = await getApiBase();
  const response = await fetch(`${apiBase}/api/v1/intercept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Intercept failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function runResolve({ auth_id, action, justification }) {
  const apiBase = await getApiBase();
  const bridgeAction = action === "approve" || action === "override" ? "approve" : "decline";
  const response = await fetch(
    `${apiBase}/api/v1/resolve?action=${bridgeAction}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_id, justification: justification || "" }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resolve failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function runReview({ auth_id, justification }) {
  const apiBase = await getApiBase();
  const response = await fetch(`${apiBase}/api/v1/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auth_id, justification: justification || "" }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Review failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function fetchHubFinancialHealth() {
  const hubBase = await getHubBase();
  const response = await fetch(`${hubBase}/api/v1/financial-health`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Hub financial-health failed (${response.status})`);
  }
  return response.json();
}

async function reportPurchaseToHub(purchase) {
  const hubBase = await getHubBase();
  const response = await fetch(`${hubBase}/api/v1/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchase || {}),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Hub report failed (${response.status}): ${detail}`);
  }
  return response.json();
}
