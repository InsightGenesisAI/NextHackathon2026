const { esc } = require("../format");

const NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/purchases", label: "Purchases", icon: "shopping-bag" },
  { href: "/financials", label: "Financials", icon: "bar-chart-3" },
  { href: "/taxes", label: "Taxes", icon: "landmark" },
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
      ? "bg-white/70 text-brand-700 shadow-soft border border-white/70"
      : "text-ink-soft hover:bg-white/50 hover:text-ink border border-transparent";
    const iconCls = active ? "text-brand-600" : "text-ink-faint";
    return `<a href="${href}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${cls}">
      <i data-lucide="${icon}" class="h-5 w-5 ${iconCls}"></i>${label}
    </a>`;
  }).join("");

  return `<aside class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/60 bg-white/55 px-3 py-5 backdrop-blur-xl lg:flex">
    <a href="/" class="mb-6 flex items-center gap-2 px-3">
      <span class="glass-sheen flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
        <i data-lucide="leaf" class="h-5 w-5"></i>
      </span>
      <span class="text-lg font-bold tracking-tight text-ink">AgentCFO</span>
    </a>
    <nav class="flex flex-1 flex-col gap-1">${links}</nav>
    <div class="mt-4 rounded-2xl border border-white/60 bg-gradient-to-br from-brand-100/80 to-white/40 p-4 backdrop-blur">
      <p class="flex items-center gap-1.5 text-sm font-semibold text-brand-800"><i data-lucide="leaf" class="h-4 w-4"></i>Protection is ON</p>
      <p class="mt-1 text-xs leading-relaxed text-brand-700">AgentCFO is watching your purchases in the background.</p>
    </div>
  </aside>`;
}

function topnav(user) {
  const account = user
    ? `<div class="hidden items-center gap-2 sm:flex">
         <span class="text-sm font-medium text-ink-soft">${esc(user.company || user.name || "")}</span>
         <a href="/logout" class="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-ink-soft hover:bg-gray-50" title="Sign out"><i data-lucide="log-out" class="h-4 w-4"></i>Sign out</a>
       </div>`
    : "";
  const initial = user && user.name ? esc(user.name.trim()[0].toUpperCase()) : "A";
  return `<header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/50 bg-white/45 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
    <a href="/" class="flex items-center gap-2 lg:hidden"><span class="text-base font-bold text-ink">AgentCFO</span></a>
    <div class="hidden flex-1 items-center sm:flex">
      <div class="flex w-full max-w-md items-center gap-2 rounded-xl border border-white/60 bg-white/55 px-3 py-2 backdrop-blur">
        <i data-lucide="search" class="h-4 w-4 text-ink-faint"></i>
        <input placeholder="Search purchases, tools, budgets…" class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint" />
      </div>
    </div>
    <div class="ml-auto flex items-center gap-3">
      ${account}
      <span class="hidden items-center gap-1.5 rounded-full border border-white/60 bg-brand-50/80 px-3 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur sm:flex">
        <i data-lucide="shield-check" class="h-3.5 w-3.5"></i>Protection ON
      </span>
      <button aria-label="Alerts" class="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-white/60">
        <i data-lucide="bell" class="h-5 w-5"></i>
        <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500"></span>
      </button>
      <div class="glass-sheen flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">${initial}</div>
    </div>
  </header>`;
}

function layout({ title, pathname, body, extraScript = "", user = null }) {
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
          brand: { 50:"#eafaf0",100:"#d3f4e0",200:"#ade9c6",300:"#7edaa6",400:"#4ec888",500:"#27ad6a",600:"#1c8d55",700:"#1a7146",800:"#195b3a",900:"#154a31" },
          ink: { DEFAULT:"#16271f", soft:"#3f5a4d", faint:"#7d9488" },
          canvas: "#eef9f3",
        },
        borderRadius: { xl:"1rem","2xl":"1.25rem","3xl":"1.5rem" },
        boxShadow: {
          card:"0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 30px rgba(20,80,50,0.10), 0 2px 8px rgba(20,80,50,0.06)",
          soft:"0 2px 10px rgba(20,80,50,0.07)",
          pop:"0 20px 60px rgba(16,60,40,0.22)",
        },
        fontFamily: { sans:["Inter","system-ui","sans-serif"] },
      } },
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { color-scheme: light; }
    html { scroll-behavior: smooth; }
    html,body{
      color:#16271f;-webkit-font-smoothing:antialiased;font-family:Inter,system-ui,sans-serif;
      min-height:100%;
    }
    /* Frutiger Aero aurora — layered green/aqua light, fixed so it feels like glass over nature */
    body{
      background:
        radial-gradient(1100px 620px at 8% -12%, #c9f6dd 0%, rgba(201,246,221,0) 55%),
        radial-gradient(1000px 720px at 112% 4%, #c4ecfb 0%, rgba(196,236,251,0) 52%),
        radial-gradient(900px 640px at 50% 118%, #defaea 0%, rgba(222,250,234,0) 55%),
        linear-gradient(180deg, #eafaf2 0%, #eef7fb 100%);
      background-attachment: fixed;
    }
    /* Liquid glass: frost every card/surface (overrides opaque white via 2-class specificity) */
    .bg-white.shadow-card, .bg-white.shadow-soft, .bg-white.shadow-pop{
      background: linear-gradient(155deg, rgba(255,255,255,0.86), rgba(255,255,255,0.60)) !important;
      backdrop-filter: blur(16px) saturate(150%);
      -webkit-backdrop-filter: blur(16px) saturate(150%);
      border-color: rgba(255,255,255,0.75) !important;
    }
    /* Glossy gel for primary brand fills (buttons + icon chips) */
    .bg-brand-500{
      background-image: linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%), linear-gradient(180deg,#3ec585,#1c8d55) !important;
      box-shadow: 0 1px 0 rgba(255,255,255,0.45) inset, 0 8px 18px rgba(28,141,85,0.28);
    }
    .hover\\:bg-brand-600:hover{
      background-image: linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%), linear-gradient(180deg,#36b97c,#176f43) !important;
    }
    /* Satisfying tactile feedback on every control */
    button, a, .ape-press{ transition: transform .14s cubic-bezier(.22,1,.36,1), box-shadow .2s ease, background-color .2s ease, background-image .2s ease; }
    button:active{ transform: translateY(1px) scale(.985); }
    a:active{ transform: translateY(1px); }
    /* Cards gently lift */
    .shadow-card{ transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease; }
    .shadow-card:hover{ box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 16px 44px rgba(20,80,50,0.16), 0 4px 12px rgba(20,80,50,0.08); }
    /* Brand focus ring */
    input:focus, textarea:focus, select:focus, button:focus-visible, a:focus-visible{ outline: none; box-shadow: 0 0 0 3px rgba(78,200,136,0.35); border-radius: .6rem; }
    .progress-fill{transition:width .9s cubic-bezier(.22,1,.36,1);}
    @keyframes soft-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .animate-soft-in{animation:soft-in .45s cubic-bezier(.22,1,.36,1) both;}
    /* Glossy sheen sweep used on hero surfaces */
    @keyframes sheen{0%{transform:translateX(-120%);}60%,100%{transform:translateX(220%);}}
    .glass-sheen{position:relative;overflow:hidden;}
    .glass-sheen::after{content:"";position:absolute;top:0;left:0;height:100%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:translateX(-120%);animation:sheen 6s ease-in-out infinite;pointer-events:none;}
    /* Spinner */
    @keyframes spin{to{transform:rotate(360deg);}}
    .ape-spin{animation:spin .8s linear infinite;}
    .thin-scroll::-webkit-scrollbar{width:10px;height:10px;}
    .thin-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9fe0bd,#5cc78a);border-radius:999px;border:2px solid transparent;background-clip:padding-box;}
    ::-webkit-scrollbar{width:12px;height:12px;}
    ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#bfe9d2,#7ed4a4);border-radius:999px;border:3px solid transparent;background-clip:padding-box;}
    ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#9fe0bd,#5cc78a);background-clip:padding-box;}
    [x-cloak]{display:none;}
  </style>
</head>
<body class="font-sans">
  <div class="flex min-h-screen bg-canvas">
    ${sidebar(pathname)}
    <div class="flex min-w-0 flex-1 flex-col">
      ${topnav(user)}
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
