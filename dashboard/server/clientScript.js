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
    var actions = document.getElementById("review-actions");
    function show(text, held) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.remove("hidden");
      msg.className = "mt-3 rounded-xl px-3.5 py-2.5 text-sm " + (held ? "bg-amber-50 text-amber-700" : "bg-canvas text-ink-soft");
    }
    if (mode === "submit" && (!why || !why.value.trim())) {
      show("Add a quick note so AgentCFO can review it.", false);
      return;
    }
    var resultText = mode === "decline" ? "Purchase cancelled." : "Approved. You can continue checkout.";
    if (actions) {
      var ok = mode !== "decline";
      actions.innerHTML =
        '<div class="flex items-center gap-3 rounded-2xl p-1">' +
          '<span class="flex h-10 w-10 items-center justify-center rounded-xl ' + (ok ? "bg-brand-500 text-white" : "bg-gray-200 text-ink-soft") + '">' +
            '<i data-lucide="' + (ok ? "check" : "x") + '" class="h-5 w-5"></i></span>' +
          '<div><p class="text-sm font-semibold ' + (ok ? "text-brand-800" : "text-ink-soft") + '">' + (ok ? "All set!" : "Purchase cancelled") + '</p>' +
          '<p class="text-sm text-ink-soft">' + resultText + '</p></div>' +
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
})();
`;

module.exports = { CLIENT_JS };
