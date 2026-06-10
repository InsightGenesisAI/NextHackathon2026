const apiBase = document.getElementById("apiBase");
const hubBase = document.getElementById("hubBase");
const riskTolerance = document.getElementById("riskTolerance");
const saveBtn = document.getElementById("save");
const hubDot = document.getElementById("hub-dot");
const hubText = document.getElementById("hub-text");

const DEFAULT_API_BASE = "http://127.0.0.1:8787";
const DEFAULT_HUB_BASE = "https://next-hackathon2026.vercel.app";

chrome.storage.sync.get(["apiBase", "hubBase", "riskTolerance"], (stored) => {
  if (stored.apiBase) apiBase.value = stored.apiBase;
  if (stored.hubBase) hubBase.value = stored.hubBase;
  if (stored.riskTolerance) riskTolerance.value = stored.riskTolerance;
  checkHub(stored.hubBase || DEFAULT_HUB_BASE);
});

saveBtn.addEventListener("click", () => {
  const audit = apiBase.value.trim();
  const hub = hubBase.value.trim();
  chrome.storage.sync.set(
    { apiBase: audit, hubBase: hub, riskTolerance: riskTolerance.value },
    () => {
      saveBtn.textContent = "Saved!";
      checkHub(hub);
      setTimeout(() => {
        saveBtn.textContent = "Save Settings";
      }, 1400);
    }
  );
});

document.getElementById("launchDemo").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("demo.html") });
});

document.getElementById("previewUI").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("preview.html") });
});

document.getElementById("openDashboard").addEventListener("click", () => {
  const url = (hubBase.value.trim() || DEFAULT_HUB_BASE).replace(/\/$/, "");
  chrome.tabs.create({ url });
});

// Health check against the dashboard hub (Vercel).
async function checkHub(base) {
  const url = (base || DEFAULT_HUB_BASE).replace(/\/$/, "");
  hubDot.className = "status-dot";
  hubText.textContent = "Checking dashboard hub…";
  try {
    const res = await fetch(`${url}/api/v1/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      hubDot.classList.add("status-dot--ok");
      hubText.textContent = "Dashboard hub online — history & finances connected";
    } else {
      throw new Error("not ok");
    }
  } catch {
    hubDot.classList.add("status-dot--err");
    hubText.textContent = "Dashboard hub offline — check the hub URL";
  }
}
