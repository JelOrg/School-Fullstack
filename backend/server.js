// ! ============================================
// ! imports
// ! ============================================

// TODO find a way to get this to work
import "dotenv/config";

//required items for server to work
import express from "express";

//importing for pathing and url
import path from "path";

//imports and alias for page routes
import loginPage from "#routes/login";
import dashboardPage from "#routes/dashboard";
import aanvragenPage from "#routes/aanvragen";
import totaleVoorraadPage from "#routes/totale-voorraad";
import statistiekenPage from "#routes/statistieken";
import geschiedenisPage from "#routes/geschiedenis";

//middleware
import { view } from "#utils/viewHelper.js";
// =============================================

// *=============================================
//Get the root file where this file is
const root = process.cwd();

const server = express();
const PORT = process.env.PORT || 443;
// =============================================

// ? ============================================
// MIDDLEWARE
// ============================================

// The server searches for the defined html, css, or css files
server.use(express.static(path.join(root, "..", "frontend")));
// Parse JSON request bodies
server.use(express.json());

// * ============================================
//  PAGE EXPLORER
// ============================================
//Proccess the file to only make the name(without .html) visible to the frontend
// --- PAGE ROUTES (The HTML) ---
// TODO NEED TO FIX CSS NOT SHOWING
server.get("/", view("inlog"));
server.get("/login", view("inlog"));
server.get("/dashboard", view("dashboard"));
server.get("/aanvragen", view("aanvraag"));
server.get("/totale-voorraad", view("totale-voorraad"));
server.get("/statistieken", view("statistieken"));
server.get("/geschiedenis", view("geschiedenis"));

// * ============================================
//  API ROUTES
// ============================================
server.use("/api/login", loginPage);
server.use("/api/dashboard", dashboardPage);
server.use("/api/aanvragen", aanvragenPage);
server.use("/api/totale-voorraad", totaleVoorraadPage);
server.use("/api/statestieken", statistiekenPage);
server.use("/api/geschiedenis", geschiedenisPage);

// ? ============================================
// ? ERROR HANDLING
// ? ============================================

// Global error handler
server.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
