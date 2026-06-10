// Formatting helpers (server-side) + HTML escaping.

function money(cents, opts = {}) {
  if (cents === 0 && opts.showFree) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function moneyPerMonth(cents, billing) {
  if (cents === 0) return "Free";
  const suffix = billing === "annual" ? "/yr" : billing === "one-time" ? "" : "/mo";
  return `${money(cents)}${suffix}`;
}

function relativeDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day && now.getDate() === d.getDate()) return "Today";
  if (diffMs < 2 * day) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dateLabel(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(iso) {
  const d = new Date(iso);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { money, moneyPerMonth, relativeDate, dateLabel, daysUntil, esc };
