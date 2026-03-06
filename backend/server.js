// ! ============================================
// ! imports
// ! ============================================

import "#utils/absoluteEnvPath";
//required items for server to work
import express from "express";
import cookieParser from "cookie-parser";

//importing for pathing and url
import path from "path";
//removes the errors when trying from f12
import cors from "cors";

//imports and alias for page routes
import rootApi from "#routes/root";
import loginPage from "#routes/login";
import dashboardPage from "#routes/dashboard";
import aanvragenPage from "#routes/aanvragen";
import totaleVoorraadPage from "#routes/totale-voorraad";
import statistiekenPage from "#routes/statistieken";
import geschiedenisPage from "#routes/geschiedenis";

//middleware
import { view } from "#utils/viewHelper";
import { authenticateToken, requireGuest } from "#middleware/authenticatie";

// Sanitizers
import { sanitizeIn } from "#middleware/inputSanitizer";
import { sanitizeOut } from "#middleware/outputSanitizer";

// =============================================

const root = process.cwd();
const server = express();
const PORT = process.env.SERVER_PORT || 3000;

// ? ============================================
// MIDDLEWARE
// ============================================

server.use(express.static(path.join(root, "..", "frontend")));
server.use(cors());
server.use(express.json());
server.use(cookieParser());

// Sanitize all incoming data (body, query, params)
server.use(sanitizeIn);
// Sanitize all outgoing JSON responses
server.use(sanitizeOut);

// * ============================================
//  PAGE ROUTES
// ============================================

// TODO: RequireGuest might not be needed, check later
server.get("/", requireGuest, view("inlog"));
server.get("/login", requireGuest, view("inlog"));
server.get("/dashboard", authenticateToken, view("dashboard"));
server.get("/aanvragen", authenticateToken, view("aanvraag"));
server.get("/totale-voorraad", authenticateToken, view("totale-voorraad"));
server.get("/statistieken", authenticateToken, view("statistieken"));
server.get("/geschiedenis", authenticateToken, view("geschiedenis"));

// * ============================================
//  API ROUTES
// ============================================

server.use("/api/", rootApi);
server.use("/api/login", loginPage);
server.use("/api/dashboard", dashboardPage);
server.use("/api/aanvragen", aanvragenPage);
server.use("/api/totale-voorraad", totaleVoorraadPage);
server.use("/api/statistieken", statistiekenPage);
server.use("/api/geschiedenis", geschiedenisPage);

// ? ============================================
// ? ERROR HANDLING
// ? ============================================

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