// ─── RENDER TABLE ─────────────────────────────────────────────────
function renderTable(items) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  if (!items || !items.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Geen items gevonden</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.itemName}</strong><br/><small class="text-muted">${item.description ?? ""}</small></td>
      <td>${item.categoryName}</td>
      <td>${renderBadge(item.remainingAmount)}</td>
      <td>${item.remainingAmount} stuks</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>
        <button class="btn btn-sm btn-outline-primary">Details</button>
        <button class="btn btn-sm btn-outline-success">+ Voorraad</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ─── BADGE ────────────────────────────────────────────────────────
function renderBadge(amount) {
  if (amount <= 50) return `<span class="badge badge-kritiek">Kritiek</span>`;
  if (amount <= 100) return `<span class="badge badge-laag">Laag</span>`;
  return `<span class="badge badge-goed">Goed</span>`;
}

// ─── SSE ──────────────────────────────────────────────────────────
function initVoorraadSSE() {
  const eventSource = new EventSource(
    "api/totale-voorraad/fetch-totale-voorraad",
    {
      withCredentials: true,
    },
  );

  eventSource.onmessage = (event) => {
    const items = JSON.parse(event.data);
    renderTable(items);
  };

  eventSource.onerror = (err) => {
    console.error("SSE fout:", err);
    eventSource.close();
  };
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initVoorraadSSE();
});
