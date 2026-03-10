/**
 * Backend routes used:
 *   GET  /api/dashboard/fetch-display-data  → SSE stream, pushes { voorraadData, alertsData } every 2s
 *   POST /api/dashboard/send-spoed-aanvraag → { userId, itemInfo, departmentName, textField }
 *
 * Data shapes from your fixed fetchDatabaseInfo.js:
 *   voorraadData.data  → [{ itemId, itemName, remainingAmount, criticalThreshold, categoryName }]
 *   alertsData.data    → [{ requestId, requestBatchId, itemName, requestedAmount, department, requestedBy, requestedDate }]
 */

// ─── SSE: Live dashboard data ─────────────────────────────────────────────────

function startDashboardStream() {
  // EventSource sends cookies automatically — no extra setup needed
  const source = new EventSource("/api/dashboard/fetch-display-data", {
    withCredentials: true,
  });

  source.onmessage = (event) => {
    try {
      const { voorraadData, alertsData } = JSON.parse(event.data);
      renderKritiekVoorraad(voorraadData?.data || []);
      allAlerts = alertsData?.data || [];
      renderMeldingen(allAlerts);
    } catch (err) {
      console.error("SSE parse error:", err);
    }
  };

  source.onerror = () => {
    // Server closed the connection (expired cookie → redirect to login)
    source.close();
    // Small delay so we don't redirect before any initial response
    setTimeout(() => {
      window.location.href = "/login?error=denied";
    }, 500);
  };
}

// ─── Kritieke Voorraad ────────────────────────────────────────────────────────
function renderKritiekVoorraad(items) {
  const container = document.getElementById("critical-stock-list");
  if (!container) return;

  // Remove the static example row (only on first real render)
  const placeholder = container.querySelector(".static-placeholder");
  if (placeholder) placeholder.remove();

  if (items.length === 0) {
    container.innerHTML = `<p class="text-success small mt-2">✓ Geen kritieke voorraad op dit moment.</p>`;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      // remainingAmount / criticalThreshold gives us the fill %
      const pct = Math.min(
        Math.round((item.remainingAmount / item.criticalThreshold) * 100),
        100,
      );
      const barColor = pct <= 30 ? "bg-danger" : "bg-warning";

      return `
      <div class="card mb-3 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="fw-bold">${item.itemName}</h6>
            <span class="badge bg-danger">Kritiek</span>
          </div>
          <small class="text-muted">
            ${item.remainingAmount} stuks &bull; Min: ${item.criticalThreshold}
            &bull; ${item.categoryName}
          </small>
          <div class="progress mt-2">
            <div class="progress-bar ${barColor}" style="width:${pct}%"></div>
          </div>
          <small class="text-danger mt-1 d-block">⚠ Direct aanvullen vereist</small>
        </div>
      </div>`;
    })
    .join("");

  // Update badge count on the kritieke voorraad header if you add one
  const badge = document.getElementById("kritiek-badge");
  if (badge) badge.textContent = items.length;
}

// ─── Meldingen ────────────────────────────────────────────────────────────────
function renderMeldingen(alerts) {
  const container = document.getElementById("notifications-list");
  if (!container) return;

  // Update unread badge
  const badge = document.getElementById("notif-badge");
  if (badge) badge.textContent = alerts.length;

  if (alerts.length === 0) {
    container.innerHTML = `<p class="text-muted small text-center py-3">Geen meldingen.</p>`;
    return;
  }

  container.innerHTML = alerts
    .map((alert) => {
      const date = new Date(alert.requestedDate).toLocaleString("nl-NL");
      return `
      <div class="card mb-3 border-danger" id="alert-${alert.requestBatchId}">
        <div class="card-body">
          <span class="badge bg-danger mb-2">AANVRAAG</span>
          <p class="small fw-bold mb-1">${alert.itemName}</p>
          <p class="small mb-1">
            Gevraagd: <strong>${alert.requestedAmount}</strong> stuks
          </p>
          <p class="small mb-1">
            Afdeling: ${alert.department} &bull; Door: ${alert.requestedBy}
          </p>
          <small class="text-muted">${date}</small>
        </div>
      </div>`;
    })
    .join("");
}

// ─── Notification filters ─────────────────────────────────────────────────────
function setupNotificationFilters() {
  const typeSelect = document.querySelector("select.form-select-sm");
  const sortSelect = document.querySelectorAll("select.form-select-sm")[1];

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      renderMeldingen(allAlerts); // filtering by type can be added here later
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const asc = sortSelect.value === "Oudste eerst";
      const sorted = [...allAlerts].sort((a, b) =>
        asc
          ? new Date(a.requestedDate) - new Date(b.requestedDate)
          : new Date(b.requestedDate) - new Date(a.requestedDate),
      );
      renderMeldingen(sorted);
    });
  }
}

// ─── Spoedaanvraag form ───────────────────────────────────────────────────────
// Keeps track of items the user has searched and selected
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

function renderSpoedSelectedItems() {
  let listEl = document.getElementById("spoed-item-list");
  if (!listEl) {
    listEl = document.createElement("div");
    listEl.id = "spoed-item-list";
    listEl.className = "mb-2";
    document.getElementById("spoed-zoek")?.parentElement?.after(listEl);
  }

  if (spoedSelectedItems.length === 0) {
    listEl.innerHTML = "";
    return;
  }

  listEl.innerHTML = `
    <ul class="list-group list-group-flush small">
      ${spoedSelectedItems
        .map(
          (item, i) => `
        <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
          ${item.nameItem} — <strong>${item.amountRequested} stuks</strong>
          <button class="btn btn-sm btn-link text-danger p-0" onclick="removeSpoedItem(${i})">✕</button>
        </li>`,
        )
        .join("")}
    </ul>`;
}

function removeSpoedItem(index) {
  spoedSelectedItems.splice(index, 1);
  renderSpoedSelectedItems();
}

async function sendSpoedaanvraag() {
  const afdelingInput = document.getElementById("spoed-afdeling");
  const situatieInput = document.getElementById("spoed-situatie");
  const btn = document.getElementById("btn-spoed-versturen");

  const departmentName = afdelingInput?.value.trim();
  const textField = situatieInput?.value.trim();

  if (spoedSelectedItems.length === 0) {
    showSpoedFeedback("Zoek en selecteer minimaal één supply.", "danger");
    return;
  }
  if (!departmentName) {
    showSpoedFeedback("Vul een afdeling in.", "danger");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Versturen...";

  try {
    // Backend body: { userId, itemInfo, departmentName, textField }
    // userId comes from the cookie/token — the server reads it via req.tokenInformation
    // We pass it as null here; your dashboardController reads it from req.body.userId
    // TODO: you may want to expose a /api/profile/me endpoint to get the userId client-side
    const response = await fetch("/api/dashboard/send-spoed-aanvraag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        // userId is intentionally NOT sent — server reads it from the JWT cookie
        itemInfo: spoedSelectedItems,
        departmentName,
        textField: textField || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showSpoedFeedback(data.message || "Er is iets misgegaan.", "danger");
      return;
    }

    showSpoedFeedback("✓ Spoedaanvraag verstuurd!", "success");
    spoedSelectedItems = [];
    renderSpoedSelectedItems();
    if (afdelingInput) afdelingInput.value = "";
    if (situatieInput) situatieInput.value = "";
  } catch (err) {
    showSpoedFeedback("Kan geen verbinding maken met de server.", "danger");
    console.error("Spoed versturen fout:", err);
  } finally {
    btn.disabled = false;
    btn.textContent = "Spoedaanvraag versturen";
  }
}

function showSpoedFeedback(msg, type) {
  let el = document.getElementById("spoed-feedback");
  if (!el) {
    el = document.createElement("div");
    el.id = "spoed-feedback";
    el.style.borderRadius = "10px";
    document.getElementById("btn-spoed-versturen")?.after(el);
  }
  el.className = `alert alert-${type} mt-2 small`;
  el.textContent = msg;
  setTimeout(() => {
    if (el) el.remove();
  }, 4000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
