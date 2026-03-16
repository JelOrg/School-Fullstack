// ─── AANVRAAG VERSTUREN ───────────────────────────────────────────
async function postAanvraag() {
  const supplyType = document
    .getElementById("search-select-supplies-filter")
    .value.trim();
  const amount = document
    .getElementById("aantal-supplies-selecter")
    .value.trim();
  const itemName = document.getElementById("naam-supply-selecter").value.trim();
  const department = document
    .getElementById("naam-afdeling-selector")
    .value.trim();
  // const urgency = document.querySelector('input[name="urgentie"]:checked').id;
  // const remarks = document
  //   .querySelector('textarea[name="opmerkingen"]')
  //   .value.trim();

  // Basic validation
  if (!supplyType || !amount || !itemName || !department) {
    alert("Vul alle verplichte velden in.");
    return;
  }

  // const btn = document.querySelector("versturen");
  // btn.disabled = true;
  // btn.textContent = "Bezig met versturen...";

  try {
    const response = await fetch("/api/aanvragen/send-normale-aanvraag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        itemInfo: [
          {
            // supplyType,
            //TODO THIS IS SUPPOSED TO BE NAME, but for now id
            itemId: parseInt(itemName),
            requestedAmount: parseInt(amount),
            departmentName: department,
            // urgency,
            // remarks,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Er is iets misgegaan.");
      return;
    }

    alert("Aanvraag verstuurd!");
    clearForm();
  } catch (err) {
    alert("Kan geen verbinding maken met de server.");
    console.error("Aanvraag fout:", err);
  } finally {
    // btn.disabled = false;
    // btn.textContent = "Aanvraag versturen";
  }
}

//Removes the placed in text
function clearForm() {
  document.getElementById("search-select-supplies-filter").value = "";
  document.getElementById("aantal-supplies-selecter").value = "";
  document.getElementById("naam-supply-selecter").value = "";
  document.getElementById("naam-afdeling-selector").value = "";
  document.querySelector('textarea[name="opmerkingen"]').value = "";
}

//Makes the pages fucntional
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("versturen").addEventListener("click", postAanvraag);
  document.getElementById("wissen").addEventListener("click", clearForm);
});
