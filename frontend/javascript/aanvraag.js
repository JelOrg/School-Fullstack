/**
 * aanvraag.js — Normale aanvraag formulier
 *
 * Backend routes:
 *   GET  /api/aanvragen            → currently returns placeholder (route exists, controller TODO)
 *   POST /api/aanvragen            → TODO: needs to be added to aanvragen.js route + controller
 *
 * Auth: cookie sent automatically (credentials:"include")
 *
 * NOTE: The aanvragen route currently only has a GET placeholder.
 * This file is written ready for when you add the POST endpoint.
 * The fetch calls below show exactly what body shape to expect in your controller.
 */

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  setupItemSearch();
  setupFormButtons();
});

// ─── Load user info from the profile endpoint ─────────────────────────────────
// TODO: add GET /api/profile/me that returns the logged-in user's info from the token
// For now we leave the textarea with a loading state
async function loadUserInfo() {
  const box = document.getElementById("gebruiker-info");
  if (!box) return;

  try {
    const response = await fetch("/api/profile", {
      credentials: "include",
    });
    const data = await response.json();

    // Adjust field names once you build the profile controller
    // Based on your schema: firstName, lastName, role.roleName, department.departmentName
    if (data.success && data.data) {
      const u = data.data;
      box.value = `Naam: ${u.firstName} ${u.lastName}\nRol: ${u.roleName || "—"}\nAfdeling: ${u.departmentName || "—"}`;

      // Pre-fill afdeling field
      const afdelingInput = document.getElementById("naam-afdeling-selector");
      if (afdelingInput && u.departmentName) {
        afdelingInput.value = u.departmentName;
      }
    } else {
      box.value = "Gebruikersinfo niet beschikbaar.";
    }
  } catch {
    box.value = "Kon gebruikersinfo niet laden.";
  }
}

// ─── Item search (live autocomplete) ─────────────────────────────────────────
// Uses GET /api/totale-voorraad?search=term once that endpoint is built
// Schema fields: itemId, itemName, remainingAmount, categories.categoryName
let selectedItem = null;

function setupItemSearch() {
  const nameInput = document.getElementById("naam-supply-selecter");
  const typeInput = document.getElementById("search-select-supplies-filter");

  // Create a suggestions container right below the name field
  if (nameInput && !document.getElementById("item-suggestions")) {
    const wrapper = document.createElement("div");
    wrapper.id = "item-suggestions";
    wrapper.style.position = "relative";
    nameInput.parentElement.appendChild(wrapper);
  }

  if (nameInput) nameInput.addEventListener("input", debounce(handleItemSearch, 300));
  if (typeInput) typeInput.addEventListener("input", debounce(handleItemSearch, 300));
}

async function handleItemSearch(e) {
  const term = e.target.value.trim();
  const suggestionsEl = document.getElementById("item-suggestions");
  if (!suggestionsEl) return;

  if (term.length < 2) {
    suggestionsEl.innerHTML = "";
    return;
  }

  try {
    // TODO: build GET /api/totale-voorraad?search=term in your totale-voorraad route + controller
    const response = await fetch(
      `/api/totale-voorraad?search=${encodeURIComponent(term)}`,
      { credentials: "include" }
    );
    const data = await response.json();
    const items = data.data || [];

    if (items.length === 0) {
      suggestionsEl.innerHTML = `<p class="small text-muted px-2">Geen items gevonden.</p>`;
      return;
    }

    suggestionsEl.innerHTML = `
      <ul class="list-group shadow" style="position:absolute;z-index:999;width:100%;">
        ${items.slice(0, 6).map((item) => `
          <li class="list-group-item list-group-item-action"
              style="cursor:pointer"
              data-id="${item.itemId}"
              data-name="${item.itemName}"
              data-category="${item.categoryName}"
              data-remaining="${item.remainingAmount}">
            <strong>${item.itemName}</strong>
            <small class="text-muted ms-2">
              ${item.categoryName} &bull; ${item.remainingAmount} stuks beschikbaar
            </small>
          </li>`).join("")}
      </ul>`;

    suggestionsEl.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        selectedItem = {
          itemId: Number(li.dataset.id),
          itemName: li.dataset.name,
          categoryName: li.dataset.category,
          remainingAmount: Number(li.dataset.remaining),
        };

        // Fill in the form fields
        const nameInput = document.getElementById("naam-supply-selecter");
        const typeInput = document.getElementById("search-select-supplies-filter");
        if (nameInput) nameInput.value = selectedItem.itemName;
        if (typeInput) typeInput.value = selectedItem.categoryName;

        // Show stock hint
        showStockHint(selectedItem.remainingAmount);
        suggestionsEl.innerHTML = "";
      });
    });

  } catch (err) {
    console.error("Item zoeken fout:", err);
  }
}

function showStockHint(remaining) {
  let hint = document.getElementById("stock-hint");
  if (!hint) {
    hint = document.createElement("small");
    hint.id = "stock-hint";
    hint.className = "text-muted d-block mt-1";
    document.getElementById("naam-supply-selecter")?.parentElement?.appendChild(hint);
  }
  hint.textContent = `Huidige voorraad: ${remaining} stuks`;
}

// ─── Form submit & clear ──────────────────────────────────────────────────────
function setupFormButtons() {
  const submitBtn = document.querySelector(".btn-primary");
  const clearBtn  = document.querySelector(".btn-danger");
  if (submitBtn) submitBtn.addEventListener("click", submitAanvraag);
  if (clearBtn)  clearBtn.addEventListener("click", clearForm);
}

async function submitAanvraag() {
  const aantalInput    = document.getElementById("aantal-supplies-selecter");
  const afdelingInput  = document.getElementById("naam-afdeling-selector");
  const opmerkingenEl  = document.querySelector('textarea[name="opmerkingen"]');
  const urgentieRadio  = document.querySelector('input[name="urgentie"]:checked');

  const aantal    = Number(aantalInput?.value);
  const afdeling  = afdelingInput?.value.trim();

  // Validate
  if (!selectedItem) {
    showFeedback("Zoek en selecteer een supply via het zoekveld.", "danger");
    return;
  }
  if (!aantal || aantal < 1) {
    showFeedback("Voer een geldig aantal in.", "danger");
    return;
  }
  if (!afdeling) {
    showFeedback("Vul een afdelingsnaam in.", "danger");
    return;
  }

  const submitBtn = document.querySelector(".btn-primary");
  submitBtn.disabled = true;
  submitBtn.textContent = "Versturen...";

  try {
    /**
     * POST /api/aanvragen
     * Body shape — add this to your aanvragen controller when you build it:
     * {
     *   itemId:          number,
     *   itemName:        string,
     *   amountRequested: number,
     *   departmentName:  string,
     *   urgency:         string,  ("normal" | "verhoogd" | "hoog")
     *   notes:           string
     * }
     */
    const response = await fetch("/api/aanvragen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        itemId:          selectedItem.itemId,
        itemName:        selectedItem.itemName,
        amountRequested: aantal,
        departmentName:  afdeling,
        urgency:         urgentieRadio?.id || "normal",
        notes:           opmerkingenEl?.value || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showFeedback(data.message || "Er is iets misgegaan.", "danger");
      return;
    }

    showFeedback("✓ Aanvraag succesvol verstuurd!", "success");
    clearForm();

  } catch (err) {
    showFeedback("Kan geen verbinding maken met de server.", "danger");
    console.error("Aanvraag versturen fout:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Aanvraag versturen";
  }
}

function clearForm() {
  selectedItem = null;

  const fields = [
    "naam-supply-selecter",
    "search-select-supplies-filter",
    "aantal-supplies-selecter",
    "naam-afdeling-selector",
  ];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const opmerkingen = document.querySelector('textarea[name="opmerkingen"]');
  if (opmerkingen) opmerkingen.value = "";

  const normalRadio = document.getElementById("normal");
  if (normalRadio) normalRadio.checked = true;

  const hint = document.getElementById("stock-hint");
  if (hint) hint.textContent = "";

  const suggestions = document.getElementById("item-suggestions");
  if (suggestions) suggestions.innerHTML = "";

  // Reload user info so the afdeling field re-fills
  loadUserInfo();
}

function showFeedback(msg, type) {
  let el = document.getElementById("aanvraag-feedback");
  if (!el) {
    el = document.createElement("div");
    el.id = "aanvraag-feedback";
    el.style.borderRadius = "10px";
    // Insert before the buttons row
    document.querySelector(".d-flex.gap-2")?.before(el);
  }
  el.className = `alert alert-${type} mb-3`;
  el.textContent = msg;
  setTimeout(() => { if (el) el.remove(); }, 5000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}