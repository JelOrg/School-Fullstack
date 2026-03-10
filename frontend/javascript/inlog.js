/**
 * inlog.js
 * Backend route:  POST /api/login
 * Body:           { userRoleName, userEmail, providedPassword }
 * Response:       { success, message, redirectTo }
 * Auth method:    Cookie — server sets it, browser handles it automatically.
 *                 No localStorage, no Authorization headers needed anywhere.
 */

function clearError() {
  const el = document.getElementById("login-error");
  if (el) el.textContent = "";
}

function showError(msg) {
  let el = document.getElementById("login-error");
  if (!el) {
    el = document.createElement("p");
    el.id = "login-error";
    el.style.cssText =
      "color:#d00000;font-weight:bold;text-align:center;margin-top:0.75rem;";
    document.querySelector(".login-box form").appendChild(el);
  }
  el.textContent = msg;
}

async function logIn() {
  const userRoleName = document
    .querySelector('select[name="role"]')
    .value.trim();
  const userEmail = document.querySelector('input[name="email"]').value.trim();
  const providedPassword = document
    .querySelector('input[name="password"]')
    .value.trim();

  clearError();

  if (!userEmail || !providedPassword) {
    showError("Vul uw e-mailadres en wachtwoord in.");
    return;
  }

  const btn = document.getElementById("btn-login");
  btn.disabled = true;
  btn.textContent = "Bezig met inloggen...";

  try {
    // credentials:"include" tells the browser to store the cookie the server sets
    const response = await fetch("/api/login/validation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userRoleName,
        userEmail,
        providedPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success)
      return showError(data.message || "Ongeldig e-mailadres of wachtwoord.");

    // Follow the redirectTo the server sends back ("/dashboard")
    window.location.href = data.redirectTo || "/dashboard";
  } catch (err) {
    showError("Kan geen verbinding maken met de server. Probeer opnieuw.");
    console.error("Login fout:", err);
  } finally {
    btn.disabled = false;
    btn.textContent = "Inloggen";
  }
}
