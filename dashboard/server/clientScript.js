// Client-side interactivity, served from memory so it bundles reliably on
// serverless platforms (no filesystem read needed at runtime).
const CLIENT_JS = `// AgentCFO dashboard client (vanilla JS).
(function () {
  function refreshIcons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

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

  // ── Taxes: stream AI recommendations after the page paints ──
  function fmtMoney(cents) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format((cents || 0) / 100);
  }
  (function () {
    var loading = document.getElementById("tips-loading");
    var content = document.getElementById("tips-content");
    if (!loading || !content) return;
    fetch("/taxes/recommendations")
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
    function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  })();
})();
`;

module.exports = { CLIENT_JS };
