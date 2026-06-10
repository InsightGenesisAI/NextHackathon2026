// Client-side interactivity, served from memory so it bundles reliably on
// serverless platforms (no filesystem read needed at runtime).
const CLIENT_JS = `// AgentCFO dashboard client (vanilla JS).
(function () {
  function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fmtMoney(cents) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format((cents || 0) / 100);
  }

  // ── Header: notification + profile dropdowns ──
  function closeMenus(except) {
    ["notif-panel", "profile-panel"].forEach(function (id) {
      if (id !== except) { var el = document.getElementById(id); if (el) el.classList.add("hidden"); }
    });
  }
  window.__toggleNotif = function (e) {
    if (e) e.stopPropagation();
    var p = document.getElementById("notif-panel");
    if (!p) return;
    var hidden = p.classList.contains("hidden");
    closeMenus("notif-panel");
    p.classList.toggle("hidden", !hidden);
  };
  window.__toggleProfile = function (e) {
    if (e) e.stopPropagation();
    var p = document.getElementById("profile-panel");
    if (!p) return;
    var hidden = p.classList.contains("hidden");
    closeMenus("profile-panel");
    p.classList.toggle("hidden", !hidden);
  };
  document.addEventListener("click", function () { closeMenus(null); });

  // ── Extension detection → protection indicator ──
  // The extension's content script sets a marker on the page. We poll briefly.
  function extensionPresent() {
    return !!(document.documentElement.getAttribute("data-ape-extension") ||
      window.__APE_EXTENSION_ACTIVE__ ||
      document.getElementById("ape-extension-marker"));
  }
  function updateProtection(active) {
    var pill = document.getElementById("protection-pill");
    var label = document.getElementById("protection-label");
    if (pill && label) {
      pill.title = active ? "AgentCFO extension detected — checkouts are protected." : "Install the AgentCFO extension to protect checkouts.";
      label.textContent = active ? "Protection ON" : "Protection OFF";
      pill.classList.toggle("bg-brand-50/80", active);
      pill.classList.toggle("text-brand-700", active);
      pill.classList.toggle("bg-amber-50/80", !active);
      pill.classList.toggle("text-amber-700", !active);
    }
    var card = document.getElementById("protection-card");
    var ct = document.getElementById("protection-card-title");
    var cb = document.getElementById("protection-card-body");
    var cc = document.getElementById("protection-card-cta");
    if (card && ct && cb) {
      if (active) {
        card.className = "mt-4 rounded-2xl border border-white/60 bg-gradient-to-br from-brand-100/80 to-white/40 p-4 backdrop-blur";
        ct.className = "flex items-center gap-1.5 text-sm font-semibold text-brand-800";
        ct.innerHTML = '<i data-lucide="shield-check" class="h-4 w-4"></i>Protection is ON';
        cb.className = "mt-1 text-xs leading-relaxed text-brand-700";
        cb.textContent = "The AgentCFO extension is active and watching checkouts.";
        if (cc) cc.classList.add("hidden");
      } else {
        card.className = "mt-4 rounded-2xl border border-white/60 bg-gradient-to-br from-amber-100/70 to-white/40 p-4 backdrop-blur";
        ct.className = "flex items-center gap-1.5 text-sm font-semibold text-amber-800";
        ct.innerHTML = '<i data-lucide="shield-off" class="h-4 w-4"></i>Protection is OFF';
        cb.className = "mt-1 text-xs leading-relaxed text-amber-700";
        cb.textContent = "Install the AgentCFO browser extension to protect checkouts.";
        if (cc) cc.classList.remove("hidden");
      }
      refreshIcons();
    }
  }
  (function () {
    if (!document.getElementById("protection-pill") && !document.getElementById("protection-card")) return;
    var tries = 0;
    (function poll() {
      if (extensionPresent()) { updateProtection(true); return; }
      if (tries++ > 8) { updateProtection(false); return; }
      setTimeout(poll, 250);
    })();
  })();

  var modal = document.getElementById("demo-modal");
  window.__openDemo = function () {
    if (!modal) return;
    resetDemo();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };
  window.__closeDemo = function () {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
  function resetDemo() {
    var form = document.getElementById("demo-form");
    var result = document.getElementById("demo-result");
    var msg = document.getElementById("demo-msg");
    var ctx = document.getElementById("ctx");
    if (form) form.classList.remove("hidden");
    if (result) { result.classList.add("hidden"); result.classList.remove("flex"); }
    if (msg) msg.classList.add("hidden");
    if (ctx) ctx.value = "";
  }
  function demoFinish(message) {
    var form = document.getElementById("demo-form");
    var result = document.getElementById("demo-result");
    var rmsg = document.getElementById("demo-result-msg");
    if (form) form.classList.add("hidden");
    if (result) { result.classList.remove("hidden"); result.classList.add("flex"); }
    if (rmsg) rmsg.textContent = message;
  }
  window.__demoCancel = function () { demoFinish("No problem — we cancelled this purchase for you."); };
  window.__demoContinue = function () {
    var ctx = document.getElementById("ctx");
    var msg = document.getElementById("demo-msg");
    if (ctx && !ctx.value.trim()) {
      if (msg) { msg.textContent = "A quick note helps AgentCFO learn what your business needs."; msg.classList.remove("hidden"); }
      return;
    }
    demoFinish("Great — you're all set to continue checkout.");
  };

  window.__reviewResolve = function (mode) {
    var why = document.getElementById("why");
    var msg = document.getElementById("review-msg");
    var trace = document.getElementById("review-trace");
    var actions = document.getElementById("review-actions");
    var id = actions ? actions.getAttribute("data-id") : null;

    function show(text, tone) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.remove("hidden");
      var cls = "mt-3 rounded-xl px-3.5 py-2.5 text-sm ";
      if (tone === "held") cls += "bg-amber-50 text-amber-700";
      else if (tone === "ok") cls += "bg-brand-50 text-brand-700";
      else if (tone === "err") cls += "bg-rose-50 text-rose-700";
      else cls += "bg-canvas text-ink-soft";
      msg.className = cls;
    }

    function renderTrace(steps) {
      if (!trace || !steps || !steps.length) return;
      trace.classList.remove("hidden");
      trace.innerHTML = '<p class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">CFO Auditor · re-evaluation</p>' +
        '<ol class="space-y-1">' + steps.map(function (s) {
          return '<li class="text-sm text-ink-soft">' + String(s).replace(/</g, "&lt;") + '</li>';
        }).join("") + '</ol>';
    }

    if (mode === "decline") {
      show("Sending decline to the CFO ledger…", null);
      fetch("/review/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id, action: "decline" }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { finish(false, d.message || "Purchase declined."); })
        .catch(function () { finish(false, "Purchase declined (offline)."); });
      return;
    }

    // mode === "submit": real human-in-the-loop re-evaluation.
    if (!why || !why.value.trim()) {
      show("Add a justification so the CFO Auditor can re-evaluate.", "err");
      return;
    }
    show("CFO Auditor is re-evaluating your justification…", null);
    fetch("/review/justify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id, justification: why.value.trim() }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        renderTrace(d.chain_of_thought);
        if (d.approved) {
          show(d.reasoning || "Override approved — releasing the purchase.", "ok");
          setTimeout(function () { finish(true, d.reasoning || "Approved — purchase released."); }, 600);
        } else {
          show(d.reasoning || "Justification insufficient — purchase stays flagged.", "held");
        }
      })
      .catch(function () { show("Could not reach the auditor. Try again.", "err"); });

    function finish(ok, text) {
      if (!actions) return;
      actions.innerHTML =
        '<div class="flex items-center gap-3">' +
          '<span class="flex h-10 w-10 items-center justify-center rounded-xl ' + (ok ? "bg-brand-500 text-white" : "bg-gray-200 text-ink-soft") + '">' +
            '<i data-lucide="' + (ok ? "check" : "x") + '" class="h-5 w-5"></i></span>' +
          '<div><p class="text-sm font-semibold ' + (ok ? "text-brand-800" : "text-ink-soft") + '">' + (ok ? "Override approved" : "Purchase declined") + '</p>' +
          '<p class="text-sm text-ink-soft">' + String(text).replace(/</g, "&lt;") + '</p></div>' +
        '</div>';
      refreshIcons();
    }
  };

  var drawer = document.getElementById("audit-drawer");
  window.__openAudit = function () { if (drawer) { drawer.classList.remove("hidden"); drawer.classList.add("flex"); } };
  window.__closeAudit = function () { if (drawer) { drawer.classList.add("hidden"); drawer.classList.remove("flex"); } };

  window.__toggleTodo = function (btn) {
    var li = btn.closest(".todo-item");
    var svg = btn.querySelector("svg");
    var title = li ? li.querySelector(".todo-title") : null;
    var done = btn.getAttribute("data-done") === "1";
    done = !done;
    btn.setAttribute("data-done", done ? "1" : "0");
    if (done) {
      btn.classList.add("border-brand-500", "bg-brand-500", "text-white");
      btn.classList.remove("border-gray-300");
      if (svg) svg.classList.remove("hidden");
      if (li) li.classList.add("opacity-60");
      if (title) title.classList.add("line-through");
    } else {
      btn.classList.remove("border-brand-500", "bg-brand-500", "text-white");
      btn.classList.add("border-gray-300");
      if (svg) svg.classList.add("hidden");
      if (li) li.classList.remove("opacity-60");
      if (title) title.classList.remove("line-through");
    }
  };

  window.__toggle = function (btn) {
    var on = btn.getAttribute("data-on") === "1";
    on = !on;
    btn.setAttribute("data-on", on ? "1" : "0");
    var knob = btn.querySelector(".toggle-knob");
    if (on) {
      btn.classList.add("bg-brand-500"); btn.classList.remove("bg-gray-200");
      if (knob) { knob.classList.add("translate-x-5"); knob.classList.remove("translate-x-0.5"); }
    } else {
      btn.classList.remove("bg-brand-500"); btn.classList.add("bg-gray-200");
      if (knob) { knob.classList.remove("translate-x-5"); knob.classList.add("translate-x-0.5"); }
    }
  };
  window.__radio = function (btn) {
    var group = btn.getAttribute("data-group");
    document.querySelectorAll('.settings-radio[data-group="' + group + '"]').forEach(function (el) {
      el.classList.remove("border-brand-300", "bg-brand-50");
      el.classList.add("border-gray-200");
      var dot = el.querySelector(".radio-dot");
      if (dot) { dot.classList.remove("border-brand-500"); dot.classList.add("border-gray-300"); dot.innerHTML = ""; }
    });
    btn.classList.add("border-brand-300", "bg-brand-50");
    btn.classList.remove("border-gray-200");
    var dot = btn.querySelector(".radio-dot");
    if (dot) { dot.classList.add("border-brand-500"); dot.classList.remove("border-gray-300"); dot.innerHTML = '<span class="h-2.5 w-2.5 rounded-full bg-brand-500"></span>'; }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { window.__closeDemo(); window.__closeAudit(); }
  });

  // ── Purchases filter (All / Subscriptions / One-time) ──
  function applyPurchaseFilter(filter) {
    var rows = document.querySelectorAll(".purchase-row");
    var visible = 0;
    rows.forEach(function (r) {
      var match = filter === "all" || r.getAttribute("data-type") === filter;
      r.style.display = match ? "" : "none";
      if (match) visible++;
    });
    var empty = document.getElementById("purchases-empty");
    if (empty) empty.classList.toggle("hidden", visible !== 0);
  }
  window.__filterPurchases = function (btn) {
    var filter = btn.getAttribute("data-filter");
    var tabs = document.getElementById("purchases-tabs");
    if (tabs) tabs.setAttribute("data-active", filter);
    document.querySelectorAll(".purchases-tab").forEach(function (t) {
      var on = t.getAttribute("data-filter") === filter;
      t.classList.toggle("bg-brand-500", on);
      t.classList.toggle("text-white", on);
      t.classList.toggle("border-brand-500", on);
      t.classList.toggle("border-white/70", !on);
      t.classList.toggle("bg-white/60", !on);
      t.classList.toggle("text-ink-soft", !on);
    });
    applyPurchaseFilter(filter);
  };
  // Initialize default tab styling on load.
  (function () {
    var tabs = document.querySelectorAll(".purchases-tab");
    if (tabs.length) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-filter") === "all";
        t.classList.add(on ? "bg-brand-500" : "border-white/70", on ? "text-white" : "bg-white/60");
        if (on) t.classList.add("border-brand-500"); else t.classList.add("text-ink-soft");
      });
    }
  })();

  // ── Money Review: stream AI recommendations after the page paints ──
  (function () {
    var loading = document.getElementById("tips-loading");
    var content = document.getElementById("tips-content");
    if (!loading || !content) return;
    fetch("/overview/recommendations")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var tips = (d && d.efficiencyTips) || [];
        if (!tips.length) { loading.innerHTML = '<p class="text-sm text-ink-faint">No additional recommendations right now.</p>'; return; }
        content.innerHTML = tips.map(function (t) {
          var badge = t.estAnnualSavingCents > 0 ? '<span class="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">~' + fmtMoney(t.estAnnualSavingCents) + '/yr</span>' : "";
          return '<div class="animate-soft-in rounded-2xl border border-white/70 bg-white p-4 shadow-soft"><div class="flex items-start justify-between gap-3"><div><p class="text-sm font-semibold text-ink">' + esc(t.title) + '</p><p class="mt-1 text-sm text-ink-soft">' + esc(t.detail) + '</p></div>' + badge + '</div></div>';
        }).join("");
        loading.classList.add("hidden");
        content.classList.remove("hidden");
        refreshIcons();
      })
      .catch(function () { loading.innerHTML = '<p class="text-sm text-ink-faint">Could not load recommendations.</p>'; });
  })();

  // ── Review page: stream the live audit so it never looks frozen ──
  (function () {
    var resultEl = document.getElementById("review-result");
    var loadingEl = document.getElementById("review-loading");
    if (!resultEl) return;
    var id = resultEl.getAttribute("data-id");
    var approved = resultEl.getAttribute("data-approved") === "1";

    var stages = document.querySelectorAll(".review-stage");
    var si = 0;
    var timer = setInterval(function () {
      if (si > 0 && stages[si - 1]) {
        var prev = stages[si - 1];
        prev.querySelector(".stage-status").textContent = "Done";
        prev.querySelector(".stage-status").className = "stage-status text-xs font-medium text-brand-600";
        prev.querySelector(".stage-dot").className = "stage-dot flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white";
      }
      if (si < stages.length && stages[si]) {
        stages[si].querySelector(".stage-status").textContent = "Running…";
        stages[si].querySelector(".stage-status").className = "stage-status text-xs font-medium text-ink-soft";
        stages[si].querySelector(".stage-dot").className = "stage-dot flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600";
      }
      si++;
      if (si > stages.length) clearInterval(timer);
    }, 600);

    fetch("/review/run?id=" + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (d) { clearInterval(timer); renderResult(d, approved); })
      .catch(function () { clearInterval(timer); if (loadingEl) loadingEl.innerHTML = '<div class="rounded-2xl border border-white/70 bg-white p-5 shadow-card"><p class="text-sm text-rose-600">Could not complete the audit. Please retry.</p></div>'; });

    function capsule(icon, label, body, tone) {
      return '<div class="rounded-2xl border ' + tone + ' p-4"><div class="flex items-center gap-2"><i data-lucide="' + icon + '" class="h-4 w-4"></i><p class="text-xs font-semibold uppercase tracking-wide">' + esc(label) + '</p></div><p class="mt-1.5 text-sm">' + esc(body) + '</p></div>';
    }

    function renderResult(d, isApproved) {
      var v = d.verdict || {};
      var s = d.signals || {};
      var market = d.market || {};
      var flagged = !!v.is_flagged && !isApproved;
      var premium = s.market_premium_percent || 0;
      var dups = s.stack_duplicates || [];
      var violations = s.policy_violations || [];

      var tl = d.timeline || { steps: [], auditLog: [] };
      var ICON = { done: ["check", "bg-brand-500 text-white"], running: ["loader", "bg-brand-100 text-brand-600"], failed: ["flag", "bg-rose-100 text-rose-600"], pending: ["circle", "bg-gray-100 text-ink-faint"] };
      var stepsHtml = tl.steps.map(function (st, i) {
        var ic = ICON[st.status] || ICON.pending;
        return '<li class="flex gap-3"><div class="flex flex-col items-center"><span class="flex h-6 w-6 items-center justify-center rounded-full ' + ic[1] + '"><i data-lucide="' + ic[0] + '" class="h-3.5 w-3.5"></i></span>' + (i < tl.steps.length - 1 ? '<span class="my-1 w-px flex-1 bg-gray-100"></span>' : '') + '</div><div class="flex-1 pb-3"><div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold text-ink"><span class="text-brand-600">' + esc(st.actor) + '</span> · ' + esc(st.label) + '</p>' + (typeof st.ms === "number" ? '<span class="shrink-0 text-xs text-ink-faint">' + st.ms + 'ms</span>' : '') + '</div>' + (st.result ? '<p class="mt-0.5 text-sm text-ink-soft">' + esc(st.result) + '</p>' : '') + '</div></li>';
      }).join("");
      var timelineEl = document.getElementById("review-timeline");
      if (timelineEl) timelineEl.innerHTML = '<div class="rounded-2xl border border-white/70 bg-white shadow-card"><div class="px-5 py-4"><h2 class="text-base font-semibold text-ink">How AgentCFO decided</h2><p class="text-sm text-ink-soft">Live trace from the procurement audit pipeline.</p></div><ol class="space-y-1 px-5 pb-5">' + stepsHtml + '</ol></div>';

      var logEl = document.getElementById("audit-log-list");
      if (logEl) logEl.innerHTML = (tl.auditLog || []).map(function (e, i) { return '<li class="flex gap-3 rounded-xl bg-canvas p-3"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">' + (i + 1) + '</span><p class="text-sm text-ink">' + esc(e.step) + '</p></li>'; }).join("");

      if (isApproved) {
        resultEl.innerHTML =
          '<div class="rounded-2xl border border-brand-100 bg-brand-50/70 p-5"><div class="flex items-start gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft"><i data-lucide="check-circle" class="h-5 w-5"></i></span><div><p class="text-xs font-semibold uppercase tracking-wide text-brand-700">Approved &amp; cleared</p><p class="mt-0.5 text-sm text-ink-soft">This purchase passed AgentCFO checks and was approved. No action needed.</p></div></div></div>' +
          capsule("trending-up", "Market (Exa)", premium > 0 ? "About " + premium + "% vs benchmark (" + (market.mode || "scan") + ")." : "Within normal market range.", "border-gray-100 bg-white text-ink-soft");
        finishStream();
        return;
      }

      var marketBody = premium > 0 ? "Pricing is about " + premium + "% above benchmark (" + (market.mode || "scan") + ")." : "Pricing looks within normal market range.";
      var finBody = s.department_projected_utilization_percent > 100 ? "This would push the department budget to " + Math.round(s.department_projected_utilization_percent) + "% of its quarterly cap." : "Cash runway ~" + s.cash_runway_months + " months; budget impact manageable.";
      var companyBody = dups.length ? dups[0].unused_seats + " unused " + dups[0].existing_tool + " licenses already available in the same category." : "No redundant tooling found in the Stack Registry.";

      var banner = flagged
        ? '<div class="rounded-2xl border border-rose-100 bg-rose-50/70 p-5"><div class="flex items-start gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-soft"><i data-lucide="shield-alert" class="h-5 w-5"></i></span><div><p class="text-xs font-semibold uppercase tracking-wide text-rose-700">Flagged by AgentCFO</p><p class="mt-0.5 text-sm text-ink-soft">Review the findings below and add context to proceed.</p></div></div></div>'
        : '<div class="rounded-2xl border border-brand-100 bg-brand-50/70 p-5"><div class="flex items-start gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft"><i data-lucide="shield-check" class="h-5 w-5"></i></span><div><p class="text-xs font-semibold uppercase tracking-wide text-brand-700">Cleared by AgentCFO</p></div></div></div>';

      var capsules = '<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">' +
        capsule("trending-up", "Market (Exa)", marketBody, premium >= 10 ? "border-rose-100 bg-rose-50/50 text-rose-800" : "border-gray-100 bg-white text-ink-soft") +
        capsule("wallet", "Financial (Stripe)", finBody, "border-gray-100 bg-white text-ink-soft") +
        capsule("building-2", "Company (DNA)", companyBody, dups.length ? "border-amber-100 bg-amber-50/50 text-amber-800" : "border-gray-100 bg-white text-ink-soft") + '</div>';

      var violationHtml = violations.length ? '<div class="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Policy violations</p><ul class="mt-2 space-y-1.5">' + violations.map(function (vi) { return '<li class="text-sm text-ink"><span class="font-medium">' + esc(vi.rule_id) + ':</span> ' + esc(vi.detail || vi.description) + '</li>'; }).join("") + '</ul></div>' : "";

      var analysisLines = (v.concise_analysis || "").split("\\n").filter(function (l) { return l.trim(); });
      var analysisHtml = '<div class="rounded-2xl border border-white/70 bg-white p-5 shadow-card"><p class="text-xs font-semibold uppercase tracking-wide text-ink-faint">AgentCFO analysis</p><div class="mt-2 space-y-1.5">' + analysisLines.map(function (l, i) { return '<p class="text-sm ' + (i === 0 ? "font-semibold text-ink" : "text-ink-soft") + '">' + esc(l) + '</p>'; }).join("") + '</div></div>';

      var question = v.missing_context_question || "Provide business justification for this purchase.";
      var actions = '<div id="review-actions" class="rounded-2xl border border-white/70 bg-white p-5 shadow-card" data-id="' + esc(id) + '"><label for="why" class="text-sm font-medium text-ink">' + esc(question) + '</label><textarea id="why" rows="3" placeholder="Explain the business need." class="mt-2 w-full resize-none rounded-xl border border-white/70 bg-white/70 px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"></textarea><p id="review-msg" class="mt-3 hidden rounded-xl px-3.5 py-2.5 text-sm bg-canvas text-ink-soft"></p><div id="review-trace" class="mt-3 hidden"></div><div class="mt-4 flex flex-wrap gap-3"><button data-review="decline" class="review-act inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-gray-50"><i data-lucide="x" class="h-4 w-4"></i>Decline &amp; cancel</button><button data-review="submit" class="review-act inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 sm:flex-none"><i data-lucide="file-text" class="h-4 w-4"></i>Submit justification to CFO</button></div></div>';

      resultEl.innerHTML = banner + capsules + violationHtml + analysisHtml + actions;
      // Wire the dynamically-injected action buttons.
      resultEl.querySelectorAll(".review-act").forEach(function (b) {
        b.addEventListener("click", function () { window.__reviewResolve(b.getAttribute("data-review")); });
      });
      finishStream();
    }

    function finishStream() {
      if (loadingEl) loadingEl.classList.add("hidden");
      resultEl.classList.remove("hidden");
      refreshIcons();
    }
  })();
})();
`;

module.exports = { CLIENT_JS };
