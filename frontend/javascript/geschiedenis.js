let allItems = []; // cache for filtering

function initSSE() {
  const eventSource = new EventSource("/api/geschiedenis/fetch-geschiedenis");

  eventSource.onmessage = (event) => {
    allItems = JSON.parse(event.data);
    renderTable(allItems);
  };

  eventSource.onerror = (err) => {
    console.error("SSE connection error:", err);
    eventSource.close();
    setTimeout(initSSE, 3000);
  };
}

function renderTable(items) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  if (!items || !items.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Geen geschiedenis gevonden.</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.createdAt)}</td>
      <td>${item.activiteit ?? "-"}</td>
      <td>${item.afdeling ?? "-"}</td>
      <td>${renderBadge(item.type)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderBadge(type) {
  switch (type) {
    case "emergency":
      return `<span class="badge bg-danger">Spoed</span>`;
    case "normal":
      return `<span class="badge bg-primary">Normaal</span>`;
    case "warning":
      return `<span class="badge bg-warning text-dark">Waarschuwing</span>`;
    case "stock":
      return `<span class="badge bg-success">Voorraad</span>`;
    default:
      return `<span class="badge bg-secondary">${type ?? "Onbekend"}</span>`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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
    const withinPeriode = cutoff ? new Date(item.createdAt) >= cutoff : true;
    const matchesType = type === "all" || item.type === type;
    return withinPeriode && matchesType;
  });

  renderTable(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  initSSE();

  document
    .getElementById("periodeFilter")
    .addEventListener("change", applyFilters);
  document
    .getElementById("typeFilter")
    .addEventListener("change", applyFilters);
});
