//imports and alias for page routes
import rootApi from "#routes/root";
import loginPage from "#routes/login";
import dashboardPage from "#routes/dashboard";
import aanvragenPage from "#routes/aanvragen";
import totaleVoorraadPage from "#routes/totale-voorraad";
import statistiekenPage from "#routes/statistieken";
import geschiedenisPage from "#routes/geschiedenis";
import profilePage from "#routes/profile";
import settingsPage from "#routes/settings";

//middleware
import { view } from "#utils/viewHelper";

//Auth
import { authenticateToken } from "#middleware/auth/authenticateToken";
import { getUserAuthorizationLevel } from "#middleware/auth/authorizeUser";
import { sanitizeIn } from "#middleware/validation/inputSanitizer";
import { sanitizeOut } from "#middleware/validation/outputSanitizer";
import { ROLE_AUTH_LEVEL } from "#utils/magicNumberFile";

const protect = (requiredLevel) => {
  return [
    authenticateToken,
    getUserAuthorizationLevel(requiredLevel), // Pass the level here!
  ];
};

import express from "express";
const mainServerRouter = express.Router();

//Proccess the file to only make the name(without .html) visible to the frontend
// --- PAGE ROUTES (The HTML) ---

mainServerRouter.use(sanitizeIn);
mainServerRouter.use(sanitizeOut);

// TODO NEED TO MAKE AN OPEN DATAVIEWER THAT JUST DISPLAYS DATA ON EACH ROUTE PROTECTED ROUTE,
//TODO Make the login screen redirect to dashboard if the user has a valid token
//login
mainServerRouter.get("/", view("inlog"));
mainServerRouter.get("/login", view("inlog"));

//dashboard
mainServerRouter.get(
  "/dashboard",
  protect(ROLE_AUTH_LEVEL.employee),
  view("dashboard"),
);

//aanvragen
mainServerRouter.get(
  "/aanvraag",
  protect(ROLE_AUTH_LEVEL.employee),
  view("aanvraag"),
);

//totale-voorraad
mainServerRouter.get(
  "/totale-voorraad",
  protect(ROLE_AUTH_LEVEL.employee),
  view("totale-voorraad"),
);

//statistieken
mainServerRouter.get(
  "/statistieken",
  protect(ROLE_AUTH_LEVEL.manager),
  view("statistieken"),
);

//geschiedenis
mainServerRouter.get(
  "/geschiedenis",
  protect(ROLE_AUTH_LEVEL.admin),
  view("geschiedenis"),
);

//profile
mainServerRouter.get(
  "/profile",
  protect(ROLE_AUTH_LEVEL.employee),
  view("profile"),
);

//settings
mainServerRouter.get(
  "/settings",
  protect(ROLE_AUTH_LEVEL.employee),
  view("settings"),
);

// * ============================================
//  API ROUTES
// ============================================

// login
mainServerRouter.use("/api/", rootApi);
mainServerRouter.use("/api/login", loginPage);

//dashboard
mainServerRouter.use(
  "/api/dashboard",
  protect(ROLE_AUTH_LEVEL.employee),
  dashboardPage,
);

//aanvraag
mainServerRouter.use(
  "/api/aanvragen",
  protect(ROLE_AUTH_LEVEL.employee),
  aanvragenPage,
);

//totale-voorraad
mainServerRouter.use(
  "/api/totale-voorraad",
  protect(ROLE_AUTH_LEVEL.employee),
  totaleVoorraadPage,
);

//statistieken
mainServerRouter.use(
  "/api/statistieken",
  protect(ROLE_AUTH_LEVEL.manager),
  statistiekenPage,
);

//geschiedenis
mainServerRouter.use(
  "/api/geschiedenis",
  protect(ROLE_AUTH_LEVEL.admin),
  geschiedenisPage,
);

//profile
mainServerRouter.use(
  "/api/profile",
  protect(ROLE_AUTH_LEVEL.employee),
  profilePage,
);

//settings
mainServerRouter.use(
  "/api/settings",
  protect(ROLE_AUTH_LEVEL.employee),
  settingsPage,
);

export default mainServerRouter;
