// ─── RENDER TABLE ─────────────────────────────────────────────────
function renderGeschiedenis(items) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  if (!items || !items.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Geen geschiedenis gevonden.</td></tr>`;
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.requestedDate)}</td>
      <td>${item.itemName ?? "-"} <small class="text-muted">(${item.requestedAmount} stuks)</small></td>
      <td>${item.firstName ?? "-"}</td>
      <td><span class="badge bg-primary">Aanvraag</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── FILTERS ──────────────────────────────────────────────────────
let allItems = [];

function applyFilters() {
  const periode = document.getElementById("periodeFilter").value;
  const type = document.getElementById("typeFilter").value;
  const now = new Date();
  const cutoff = {
    "24u": new Date(now - 24 * 60 * 60 * 1000),
    "7d": new Date(now - 7 * 24 * 60 * 60 * 1000),
    "30d": new Date(now - 30 * 24 * 60 * 60 * 1000),
  }[periode];
  const filtered = allItems.filter((item) => {
    const withinPeriode = cutoff
      ? new Date(item.requestedDate) >= cutoff
      : true;
    const matchesType = type === "all" || item.type === type;
    return withinPeriode && matchesType;
  });
  renderGeschiedenis(filtered);
}

// ─── SSE ──────────────────────────────────────────────────────────
function initGeschiedenisSSE() {
  const eventSource = new EventSource(
    "/api/geschiedenis/fetch-geschiedenis-display-data",
    {
      withCredentials: true,
    },
  );

  eventSource.onmessage = (event) => {
    const { historyData } = JSON.parse(event.data);
    allItems = historyData;
    renderGeschiedenis(allItems);
  };

  eventSource.onerror = (err) => {
    console.error("SSE fout:", err);
  };
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  //   document
  //     .getElementById("periodeFilter")
  //     .addEventListener("change", applyFilters);
  //   document
  //     .getElementById("typeFilter")
  //     .addEventListener("change", applyFilters);
  initGeschiedenisSSE();
});
