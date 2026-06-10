const { esc } = require("../format");

const NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/purchases", label: "Purchases", icon: "shopping-bag" },
  { href: "/savings", label: "Savings", icon: "piggy-bank" },
  { href: "/insights", label: "Insights", icon: "lightbulb" },
  { href: "/alerts", label: "Alerts", icon: "bell" },
  { href: "/todo", label: "To Do", icon: "check-square" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function sidebar(pathname) {
  const links = NAV.map(({ href, label, icon }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    const cls = active
      ? "bg-brand-50 text-brand-700"
      : "text-ink-soft hover:bg-gray-50 hover:text-ink";
    const iconCls = active ? "text-brand-600" : "text-ink-faint";
    return `<a href="${href}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${cls}">
      <i data-lucide="${icon}" class="h-5 w-5 ${iconCls}"></i>${label}
    </a>`;
  }).join("");

  return `<aside class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-5 lg:flex">
    <a href="/" class="mb-6 flex items-center gap-2 px-3">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
        <i data-lucide="leaf" class="h-5 w-5"></i>
      </span>
      <span class="text-lg font-bold tracking-tight text-ink">AgentCFO</span>
    </a>
    <nav class="flex flex-1 flex-col gap-1">${links}</nav>
    <div class="mt-4 rounded-2xl bg-brand-50 p-4">
      <p class="text-sm font-semibold text-brand-800">Protection is ON</p>
      <p class="mt-1 text-xs leading-relaxed text-brand-700">AgentCFO is watching your purchases in the background.</p>
    </div>
  </aside>`;
}

function topnav() {
  return `<header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
    <a href="/" class="flex items-center gap-2 lg:hidden"><span class="text-base font-bold text-ink">AgentCFO</span></a>
    <div class="hidden flex-1 items-center sm:flex">
      <div class="flex w-full max-w-md items-center gap-2 rounded-xl bg-canvas px-3 py-2">
        <i data-lucide="search" class="h-4 w-4 text-ink-faint"></i>
        <input placeholder="Search purchases, tools, budgets…" class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint" />
      </div>
    </div>
    <div class="ml-auto flex items-center gap-3">
      <span class="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 sm:flex">
        <i data-lucide="shield-check" class="h-3.5 w-3.5"></i>Protection ON
      </span>
      <button aria-label="Alerts" class="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-gray-50">
        <i data-lucide="bell" class="h-5 w-5"></i>
        <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500"></span>
      </button>
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">A</div>
    </div>
  </header>`;
}

function layout({ title, pathname, body, extraScript = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="AgentCFO quietly protects small businesses from overspending, finds better alternatives, and tracks budget health." />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: {
        colors: {
          brand: { 50:"#f0faf4",100:"#dcf3e4",200:"#bce7cd",300:"#8fd5ab",400:"#5cbd84",500:"#36a366",600:"#268551",700:"#206a43",800:"#1d5438",900:"#194530" },
          ink: { DEFAULT:"#1f2a37", soft:"#475467", faint:"#98a2b3" },
          canvas: "#f6f8f7",
        },
        borderRadius: { xl:"1rem","2xl":"1.25rem","3xl":"1.5rem" },
        boxShadow: {
          card:"0 1px 2px rgba(16,24,40,0.04), 0 6px 20px rgba(16,24,40,0.06)",
          soft:"0 2px 8px rgba(16,24,40,0.05)",
          pop:"0 12px 40px rgba(16,24,40,0.14)",
        },
        fontFamily: { sans:["Inter","system-ui","sans-serif"] },
      } },
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    html,body{background-color:#f6f8f7;color:#1f2a37;-webkit-font-smoothing:antialiased;font-family:Inter,system-ui,sans-serif;}
    .progress-fill{transition:width .6s cubic-bezier(.22,1,.36,1);}
    @keyframes soft-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    .animate-soft-in{animation:soft-in .35s ease both;}
    .thin-scroll::-webkit-scrollbar{width:8px;}
    .thin-scroll::-webkit-scrollbar-thumb{background:#dce5e0;border-radius:999px;}
    [x-cloak]{display:none;}
  </style>
</head>
<body class="font-sans">
  <div class="flex min-h-screen bg-canvas">
    ${sidebar(pathname)}
    <div class="flex min-w-0 flex-1 flex-col">
      ${topnav()}
      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto w-full max-w-6xl">${body}</div>
      </main>
    </div>
  </div>
  <script>
    function renderIcons(){ if(window.lucide&&window.lucide.createIcons) window.lucide.createIcons(); }
    renderIcons();
  </script>
  ${extraScript}
</body>
</html>`;
}

module.exports = { layout };
