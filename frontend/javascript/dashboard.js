//sends spoedaanvraag
function postSpoedAanvraag() {
  document
    .getElementById("btn-spoed-versturen")
    .addEventListener("click", async () => {
      const zoek = document.getElementById("spoed-zoek").value.trim();
      const afdeling = document.getElementById("spoed-afdeling").value.trim();
      const situatie = document.getElementById("spoed-situatie").value.trim();

      // Basic validation
      if (!zoek || !afdeling || !situatie) {
        alert("Vul alle velden in.");
        return;
      }

      const btn = document.getElementById("btn-spoed-versturen");
      btn.disabled = true;
      btn.textContent = "Bezig met versturen...";

      try {
        const response = await fetch("/api/dashboard/send-spoed-aanvraag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            itemInfo: [
              {
                itemId: parseInt(zoek),
                departmentName: afdeling,
                textField: situatie,
              },
            ],
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(data.message || "Er is iets misgegaan.");
          return;
        }

        alert("Spoedaanvraag verstuurd!");
      } catch (err) {
        alert("Kan geen verbinding maken met de server.");
        console.error("Spoed fout:", err);
      } finally {
        btn.disabled = false;
        btn.textContent = "Spoedaanvraag versturen";
      }
    });
}

// ─── RENDER MELDINGEN ─────────────────────────────────────────────
function renderMeldingen(meldingen) {
  const container = document.getElementById("notifications-list");
  const badge = document.getElementById("notif-badge");

  if (!meldingen || meldingen.length === 0) {
    badge.textContent = "0";
    container.innerHTML = `<p class="text-muted small text-center">Geen meldingen.</p>`;
    return;
  }

  badge.textContent = meldingen.length;

  const items = meldingen
    .map(
      (melding) => `
    <div class="alert alert-warning py-2 px-3 mb-2">
      <strong>${melding.departmentName ?? "Onbekend"}</strong>
      <p class="mb-0 small">${melding.textField ?? "-"}</p>
      <span class="text-muted" style="font-size:0.75rem">${melding.createdAt ?? ""}</span>
    </div>
  `,
    )
    .join("");

  container.innerHTML = items;
}

// ─── RENDER KRITIEKE VOORRAAD ─────────────────────────────────────
function renderKritiekeVoorraad(items) {
  const container = document.getElementById("critical-stock-list");

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-muted small">Geen kritieke voorraad gevonden.</p>`;
    return;
  }

  const rows = items
    .map(
      (item) => `
    <tr>
      <td>${item.itemName ?? "-"}</td>
      <td>${item.category ?? "-"}</td>
      <td><span class="badge bg-danger">${item.currentStock}</span></td>
      <td>${item.minimumStock}</td>
    </tr>
  `,
    )
    .join("");

  container.innerHTML = `
    <div class="row mb-3">
      <div class="col">
        <select class="form-select">
          <option>Alle voorraadniveaus</option>
        </select>
      </div>
      <div class="col">
        <select class="form-select">
          <option>Alle categorieën</option>
        </select>
      </div>
    </div>
    <table class="table table-sm table-hover">
      <thead>
        <tr>
          <th>Naam</th>
          <th>Categorie</th>
          <th>Huidige voorraad</th>
          <th>Minimum</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

//Create the SSE connection, so data can be send to the frontend
function initDashboardSSE() {
  const eventSource = new EventSource("/api/dashboard/fetch-display-data", {
    withCredentials: true,
  });

  eventSource.onmessage = (event) => {
    const { kritiekeVoorraadData, spoedAanvraagenData } = JSON.parse(
      event.data,
    );

    renderKritiekeVoorraad(kritiekeVoorraadData);
    renderMeldingen(spoedAanvraagenData);
  };

  eventSource.onerror = (err) => {
    console.error("SSE fout:", err);
    eventSource.close();
  };
}

//Actually starts the sse stream
document.addEventListener("DOMContentLoaded", () => {
  initDashboardSSE();
});
