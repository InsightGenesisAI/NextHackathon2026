/**
 * hardwall-ui.js — Neo-Frutiger Aero Liquid Glass Hard-Wall
 */
const LiquidGlassUI = (() => {
  let overlayEl = null;
  let session = {
    pendingAuthId: null,
    isFlagged: false,
    originButton: null,
    originForm: null,
    showFailOpen: false,
    onSessionEnd: null,
    cart: null,
    audit: null,
    reported: false,
  };

  const ICONS = {
    exa: `<svg class="ape-skeuo-icon" viewBox="0 0 48 48" aria-hidden="true">
      <defs><radialGradient id="globeG" cx="35%" cy="30%"><stop offset="0%" stop-color="#dff6f8"/><stop offset="100%" stop-color="#5eb8d4"/></radialGradient></defs>
      <circle cx="24" cy="24" r="18" fill="url(#globeG)" stroke="rgba(255,255,255,.85)" stroke-width="2"/>
      <ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"/>
      <path d="M8 24c4-8 10-12 16-12s12 4 16 12" fill="none" stroke="rgba(114,196,154,.7)" stroke-width="1.5"/>
      <path d="M12 32 Q24 38 36 32" fill="none" stroke="#72c49a" stroke-width="1.2"/>
    </svg>`,
    stripe: `<svg class="ape-skeuo-icon" viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="cardG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0f4f8"/><stop offset="100%" stop-color="#b8c4d0"/></linearGradient></defs>
      <rect x="8" y="14" width="32" height="22" rx="4" fill="url(#cardG)" stroke="rgba(255,255,255,.9)" stroke-width="1.5"/>
      <rect x="8" y="20" width="32" height="5" fill="rgba(47,95,74,.25)"/>
      <rect x="12" y="28" width="12" height="3" rx="1" fill="rgba(255,255,255,.6)"/>
    </svg>`,
    dna: `<svg class="ape-skeuo-icon" viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="26" rx="20" ry="16" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.9)" stroke-width="2"/>
      <path d="M24 12 C18 18 16 26 24 34 C32 26 30 18 24 12Z" fill="#72c49a" stroke="#2f5f4a" stroke-width=".8"/>
      <path d="M24 14 L24 32" stroke="rgba(47,95,74,.4)" stroke-width="1"/>
    </svg>`,
    leaf: `<svg class="ape-leaf-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4 C8 12 6 22 16 28 C26 22 24 12 16 4Z" fill="#7dcea0" stroke="#2f5f4a" stroke-width=".6"/>
      <path d="M16 8 L16 24" stroke="rgba(47,95,74,.35)" stroke-width="1"/>
    </svg>`,
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureOverlay() {
    if (!overlayEl) {
      overlayEl = document.createElement("div");
      overlayEl.id = "ape-hardwall-overlay";
      document.documentElement.appendChild(overlayEl);
    }
    return overlayEl;
  }

  // Pipeline stages shown live while Python runs the multi-agent orchestration.
  const PIPELINE_STAGES = [
    { agent: "Agent 1: Search Strategist", label: "Compiling Exa query", icon: "dna" },
    { agent: "Exa API", label: "Pulling market benchmarks", icon: "exa" },
    { agent: "Agent 2: CFO Auditor", label: "Cross-referencing Stripe ledger", icon: "stripe" },
  ];

  let _telemetryTimer = null;

  function showLoadingPulse() {
    const overlay = ensureOverlay();
    overlay.className = "ape-glass ape-glass--loading";

    const rows = PIPELINE_STAGES.map(
      (s, i) => `
        <li class="ape-telem-row" data-stage="${i}">
          <span class="ape-telem-spinner" aria-hidden="true"></span>
          <span class="ape-telem-agent">${escapeHtml(s.agent)}</span>
          <span class="ape-telem-label">${escapeHtml(s.label)}…</span>
          <span class="ape-telem-status">Queued</span>
        </li>`
    ).join("");

    overlay.innerHTML = `
      <div class="ape-eco-aurora" aria-hidden="true"></div>
      <div class="ape-glass-modal ape-glass-modal--pulse" role="status">
        <div class="ape-glint-sweep" aria-hidden="true"></div>
        <div class="ape-eco-banner">
          <span class="ape-leaf-pulse">${ICONS.leaf}</span>
          <div><h1 class="ape-banner-title">APE Intercept · Glass Brain</h1>
          <p class="ape-banner-sub">Orchestrating multi-agent procurement audit…</p></div>
        </div>
        <ul class="ape-telemetry" id="ape-telemetry" aria-label="Live agent telemetry">${rows}</ul>
        <div class="ape-scan-line"><span class="ape-scan-dot"></span>Python hub · Exa · Stripe · OpenAI</div>
      </div>`;

    _animateTelemetry();
  }

  /** Sequentially light up pipeline stages to visualize the live agent handoff. */
  function _animateTelemetry() {
    clearInterval(_telemetryTimer);
    let i = 0;
    const advance = () => {
      const rows = overlayEl?.querySelectorAll(".ape-telem-row");
      if (!rows || !rows.length) return;
      if (i > 0) {
        rows[i - 1].classList.remove("ape-telem-row--active");
        rows[i - 1].classList.add("ape-telem-row--done");
        rows[i - 1].querySelector(".ape-telem-status").textContent = "Thinking…";
      }
      if (i < rows.length) {
        rows[i].classList.add("ape-telem-row--active");
        rows[i].querySelector(".ape-telem-status").textContent = "Running…";
        i += 1;
      }
    };
    advance();
    _telemetryTimer = setInterval(advance, 950);
  }

  function _stopTelemetry() {
    clearInterval(_telemetryTimer);
    _telemetryTimer = null;
  }

  function renderMarketCapsule(c) {
    const delta = c.efficiency_delta ?? -(c.metric_percent || 0);
    const deltaClass = delta <= -15 ? "ape-delta--bad" : "ape-delta--ok";
    return `
      <article class="ape-capsule ape-capsule--aqua" data-capsule="market">
        <div class="ape-capsule-sheen" aria-hidden="true"></div>
        <div class="ape-capsule-row">
          ${ICONS.exa}
          <div class="ape-capsule-meta">
            <span class="ape-capsule-label">${escapeHtml(c.label || "Market Intelligence")}</span>
            <h3 class="ape-capsule-title">${escapeHtml(c.headline || "Market Benchmark Baseline")}</h3>
          </div>
          <span class="ape-delta-badge ${deltaClass}">Efficiency Delta: ${delta}%</span>
        </div>
        <div class="ape-metric-compare">
          <span><em>Target</em> ${escapeHtml(c.target_display || "—")}</span>
          <span class="ape-metric-divider">|</span>
          <span><em>Market Fair Rate</em> ${escapeHtml(c.fair_rate_display || "—")}</span>
        </div>
        <p class="ape-capsule-body">${escapeHtml(c.body)}</p>
      </article>`;
  }

  function renderFinancialCapsule(c) {
    const fill = c.budget_fill_percent ?? c.metric_percent ?? 0;
    return `
      <article class="ape-capsule ape-capsule--mint" data-capsule="financial">
        <div class="ape-capsule-sheen" aria-hidden="true"></div>
        <div class="ape-capsule-row">
          ${ICONS.stripe}
          <div class="ape-capsule-meta">
            <span class="ape-capsule-label">${escapeHtml(c.label || "Financial Health")}</span>
            <h3 class="ape-capsule-title">${escapeHtml(c.headline || "Stripe Corporate Ledger")}</h3>
          </div>
        </div>
        <div class="ape-thermo">
          <div class="ape-thermo-track">
            <div class="ape-thermo-fluid" style="width:${Math.min(fill, 100)}%"></div>
            <div class="ape-thermo-glow" style="left:calc(${Math.min(fill, 100)}% - 4px)"></div>
          </div>
          <span class="ape-thermo-pct">${Math.round(fill)}%</span>
        </div>
        <p class="ape-thermo-caption">${escapeHtml(c.budget_label || "Q3 Team Software Budget")}</p>
        <p class="ape-capsule-body">${escapeHtml(c.body)}</p>
      </article>`;
  }

  function renderCompanyCapsule(c) {
    const items = c.checklist || [{ text: c.body, status: "ok" }];
    const checks = items
      .map(
        (item) => `
        <li class="ape-dew-check ape-dew-check--${item.status || "ok"}">
          <span class="ape-dew-icon" aria-hidden="true"></span>
          ${escapeHtml(item.text)}
        </li>`
      )
      .join("");
    return `
      <article class="ape-capsule ape-capsule--crystal" data-capsule="company">
        <div class="ape-capsule-sheen" aria-hidden="true"></div>
        <div class="ape-capsule-row">
          ${ICONS.dna}
          <div class="ape-capsule-meta">
            <span class="ape-capsule-label">${escapeHtml(c.label || "Strategic Alignment")}</span>
            <h3 class="ape-capsule-title">${escapeHtml(c.headline || "Corporate DNA Sync")}</h3>
          </div>
        </div>
        <ul class="ape-dew-list">${checks}</ul>
      </article>`;
  }

  /** Inject Exa + Stripe + DNA glass capsules from Python JSON */
  function populateGlassCapsules(capsules) {
    if (!capsules) return "";
    return [
      capsules.market ? renderMarketCapsule(capsules.market) : "",
      capsules.financial ? renderFinancialCapsule(capsules.financial) : "",
      capsules.company ? renderCompanyCapsule(capsules.company) : "",
    ].join("");
  }

  /** Display CFO Auditor question — updates placeholder + hidden label */
  function renderAIContextRequest(text) {
    const question =
      text ||
      "Why is this premium enterprise tier required over our unutilized alternative software licenses?";
    const field = overlayEl?.querySelector("#ape-justification");
    const label = overlayEl?.querySelector("#ape-context-label");
    if (field) {
      field.placeholder = `[AI Query: ${question} Enter justification here…]`;
    }
    if (label) label.textContent = question;
  }

  /** Flagged → bioluminescent yellow-green warning aura */
  function toggleWarningState(isFlagged) {
    session.isFlagged = isFlagged;
    const modal = overlayEl?.querySelector(".ape-glass-modal");
    if (!modal) return;
    modal.classList.toggle("ape-glass-modal--flagged", isFlagged);
    overlayEl?.classList.toggle("ape-glass--flagged", isFlagged);
  }

  function renderAuditPanel(auditResponse, checkoutContext = {}) {
    _stopTelemetry();
    const overlay = ensureOverlay();
    const audit = auditResponse.audit || auditResponse;
    session.pendingAuthId = auditResponse.pending_auth_id;
    session.originButton = checkoutContext.originButton || null;
    session.originForm = checkoutContext.originForm || null;
    session.showFailOpen = !!checkoutContext.showFailOpen;
    session.onSessionEnd = checkoutContext.onSessionEnd || null;
    session.cart = checkoutContext.cart || null;
    session.audit = audit;
    session.reported = false;

    overlay.className = "ape-glass";
    overlay.innerHTML = `
      <div class="ape-eco-aurora" aria-hidden="true"></div>
      <div class="ape-glass-modal ${audit.is_flagged ? "ape-glass-modal--flagged" : ""}" role="dialog" aria-modal="true">
        <div class="ape-glint-sweep" aria-hidden="true"></div>

        <header class="ape-eco-banner">
          <span class="ape-leaf-pulse">${ICONS.leaf}</span>
          <div class="ape-banner-copy">
            <h1 class="ape-banner-title">🛑 APE Intercept: Procurement &amp; Eco-Fiscal Audit</h1>
            <p class="ape-banner-sub">Transaction frozen on credit network pending internal authorization</p>
          </div>
        </header>

        <section id="ape-capsules" class="ape-capsule-grid" aria-label="Three-spoke data grid">
          ${populateGlassCapsules(audit.capsules)}
        </section>

        ${renderAuditLogs(auditResponse, audit)}

        <footer class="ape-gatekeeper">
          <label class="ape-gatekeeper-label" for="ape-justification">
            <span class="ape-label-tag">Context Required</span>
            <span id="ape-context-label"></span>
          </label>
          <div class="ape-recess-field">
            <textarea id="ape-justification" class="ape-recess-input" rows="3"></textarea>
          </div>
          <div class="ape-glass-actions">
            <button type="button" id="ape-abort" class="ape-gel-btn ape-gel-btn--abort">
              <span class="ape-btn-glint" aria-hidden="true"></span>
              Abort &amp; Release Funds
            </button>
            <button type="button" id="ape-override" class="ape-gel-btn ape-gel-btn--proceed">
              <span class="ape-btn-glint" aria-hidden="true"></span>
              Submit Justification to CFO
            </button>
          </div>
          ${session.showFailOpen ? `<button type="button" id="ape-failopen" class="ape-gel-btn ape-gel-btn--soft">Proceed without audit (Fail-Open Bypass)</button>` : ""}
          <p id="ape-status" class="ape-glass-status" hidden></p>
        </footer>
      </div>`;

    renderAIContextRequest(audit.missing_context_question);
    toggleWarningState(audit.is_flagged);

    overlay.querySelector("#ape-abort").addEventListener("click", handleAbortClick);
    overlay.querySelector("#ape-override").addEventListener("click", () => {
      handleOverrideSubmit(overlay.querySelector("#ape-justification").value);
    });
    overlay.querySelector("#ape-failopen")?.addEventListener("click", handleFailOpenProceed);
  }

  /** Collapsible "Audit Logs" — proves multi-agent orchestration + real tool use. */
  function renderAuditLogs(auditResponse, audit) {
    const telemetry = auditResponse.telemetry || [];
    const tool = auditResponse.tool_use || {};
    const cot = audit.chain_of_thought || [];

    const telemRows = telemetry
      .map(
        (t) => `<li class="ape-log-line ape-log-line--${t.status || "done"}">
          <span class="ape-log-agent">${escapeHtml(t.agent)}</span>
          <span class="ape-log-label">${escapeHtml(t.label)}</span>
          <span class="ape-log-ms">${t.status === "error" ? "ERR" : "[Done: " + t.ms + "ms]"}</span>
        </li>`
      )
      .join("");

    const cotRows = cot
      .map((step) => `<li class="ape-cot-step">${escapeHtml(step)}</li>`)
      .join("");

    const sources = (tool.exa_sources || [])
      .filter(Boolean)
      .map((u) => `<li class="ape-tool-src">${escapeHtml(u)}</li>`)
      .join("");

    return `
      <details class="ape-audit-logs">
        <summary class="ape-audit-summary">
          <span class="ape-term-dot"></span> Audit Logs · Terminal View
          <span class="ape-audit-hint">multi-agent reasoning trace</span>
        </summary>
        <div class="ape-audit-body">
          ${telemRows ? `<p class="ape-log-head">Orchestration Pipeline</p><ul class="ape-log-list">${telemRows}</ul>` : ""}
          ${cotRows ? `<p class="ape-log-head">CFO Auditor · Chain of Thought</p><ol class="ape-cot-list">${cotRows}</ol>` : ""}
          <p class="ape-log-head">Tool Use · Live Data Cited</p>
          <ul class="ape-tool-list">
            <li><span class="ape-tool-k">Exa query (Agent 1)</span><span class="ape-tool-v">${escapeHtml(tool.exa_query || auditResponse.exa_query || "—")}</span></li>
            <li><span class="ape-tool-k">Exa mode</span><span class="ape-tool-v">${escapeHtml(tool.exa_mode || "—")}</span></li>
            <li><span class="ape-tool-k">Stripe mode</span><span class="ape-tool-v">${escapeHtml(tool.stripe_mode || "—")}</span></li>
            <li><span class="ape-tool-k">Stripe auth hold</span><span class="ape-tool-v">${escapeHtml(tool.pending_auth_id || auditResponse.pending_auth_id || "—")}</span></li>
          </ul>
          ${sources ? `<p class="ape-log-head">Exa Sources</p><ul class="ape-tool-list">${sources}</ul>` : ""}
        </div>
      </details>`;
  }

  /**
   * Build a hub-friendly purchase record from the captured cart + audit, then
   * report it to the dashboard hub (Vercel) so it appears in history.
   * Fire-and-forget and de-duped per session.
   */
  function reportDecisionToHub(status) {
    if (session.reported) return;
    session.reported = true;

    const cart = session.cart || {};
    const audit = session.audit || {};
    const market = audit.capsules && audit.capsules.market;
    const premium = (audit.signals && audit.signals.market_premium_percent) ||
      (market && market.metric_percent) || 0;
    const amount = cart.amount_cents || 0;
    const savings = premium > 0 ? Math.round((amount * premium) / (100 + premium)) : 0;

    const purchase = {
      merchant: cart.merchant || "Detected vendor",
      item:
        (cart.line_items && cart.line_items[0] && cart.line_items[0].name) ||
        cart.merchant ||
        "Detected purchase",
      amount_cents: amount,
      status,
      savingsCents: status === "approved" ? 0 : savings,
    };

    if (typeof PythonBridge !== "undefined" && PythonBridge.reportPurchaseToHub) {
      PythonBridge.reportPurchaseToHub(purchase);
    }
  }

  async function handleAbortClick() {
    const status = overlayEl.querySelector("#ape-status");
    status.hidden = false;
    status.textContent = "Sending decline signal to Python hub…";

    try {
      if (session.pendingAuthId) {
        await PythonBridge.resolveWithPython(session.pendingAuthId, "decline");
      }
      status.textContent = "Authorization declined. Purchase terminated.";
    } catch (err) {
      status.textContent = `Decline sent locally (${err.message}).`;
    }

    reportDecisionToHub("flagged");

    setTimeout(() => {
      destroyModal();
      SpokeExtension.unfreezeCheckout();
      window.history.back();
    }, 900);
  }

  async function handleOverrideSubmit(justificationText) {
    const status = overlayEl.querySelector("#ape-status");
    const justification = (justificationText || "").trim();

    if (!justification) {
      status.hidden = false;
      status.className = "ape-glass-status ape-glass-status--error";
      status.textContent = "Justification required before override.";
      return;
    }

    status.hidden = false;
    status.className = "ape-glass-status";
    status.textContent = "CFO Auditor re-evaluating your justification…";

    // HITL: agent dynamically reviews the human's context before any money moves.
    let review = { approved: true, reasoning: "", chain_of_thought: [] };
    try {
      if (session.pendingAuthId) {
        review = await PythonBridge.reviewWithPython(session.pendingAuthId, justification);
      }
    } catch (err) {
      // If review is unreachable, fall through to direct approval (fail-open on review only).
      review = { approved: true, reasoning: `Review skipped (${err.message}).`, chain_of_thought: [] };
    }

    renderReviewReasoning(review);

    if (!review.approved) {
      status.className = "ape-glass-status ape-glass-status--error";
      status.textContent = review.reasoning || "Justification insufficient — purchase remains flagged.";
      return;
    }

    status.className = "ape-glass-status";
    status.textContent = "Justification accepted — releasing funds via Stripe…";

    try {
      if (session.pendingAuthId) {
        const result = await PythonBridge.resolveWithPython(
          session.pendingAuthId,
          "approve",
          justification
        );
        if (!result.success && result.error) throw new Error(result.error);
      }

      status.className = "ape-glass-status ape-glass-status--success";
      status.textContent = "Approved — releasing checkout.";

      reportDecisionToHub("approved");

      setTimeout(() => {
        destroyModal();
        SpokeExtension.triggerOriginalCheckout(session.originButton, session.originForm);
      }, 800);
    } catch (err) {
      status.className = "ape-glass-status ape-glass-status--error";
      status.textContent = err.message;
    }
  }

  /** Show the agent's HITL reasoning trace after a justification is submitted. */
  function renderReviewReasoning(review) {
    if (!overlayEl) return;
    const existing = overlayEl.querySelector("#ape-review-trace");
    if (existing) existing.remove();

    const steps = (review.chain_of_thought || [])
      .map((s) => `<li class="ape-cot-step">${escapeHtml(s)}</li>`)
      .join("");
    const verdictClass = review.approved ? "ape-review--ok" : "ape-review--hold";

    const block = document.createElement("div");
    block.id = "ape-review-trace";
    block.className = `ape-review-trace ${verdictClass}`;
    block.innerHTML = `
      <p class="ape-review-verdict">${review.approved ? "✅ Override Approved by CFO Auditor" : "⏸ Held — Stronger Context Needed"}</p>
      ${review.reasoning ? `<p class="ape-review-reason">${escapeHtml(review.reasoning)}</p>` : ""}
      ${steps ? `<ol class="ape-cot-list">${steps}</ol>` : ""}`;

    const footer = overlayEl.querySelector(".ape-gatekeeper");
    footer?.insertBefore(block, footer.querySelector(".ape-glass-actions"));
  }

  function handleFailOpenProceed() {
    reportDecisionToHub("review");
    destroyModal();
    SpokeExtension.triggerOriginalCheckout(session.originButton, session.originForm);
  }

  function destroyModal() {
    _stopTelemetry();
    const cb = session.onSessionEnd;
    overlayEl?.remove();
    overlayEl = null;
    session = {
      pendingAuthId: null,
      isFlagged: false,
      originButton: null,
      originForm: null,
      showFailOpen: false,
      onSessionEnd: null,
      cart: null,
      audit: null,
      reported: false,
    };
    if (typeof cb === "function") cb();
  }

  return {
    showLoadingPulse,
    populateGlassCapsules,
    renderAIContextRequest,
    toggleWarningState,
    renderAuditPanel,
    handleAbortClick,
    handleOverrideSubmit,
    destroyModal,
  };
})();
