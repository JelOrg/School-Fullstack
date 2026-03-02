// ============================================
// ============================================
// find a way to get this to work
import "dotenv/config";
// ============================================
// ============================================
// ============================================

//required items for server to work
import express from "express";

const server = express();
const PORT = process.env.PORT || 443;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
server.use(express.json());

// ============================================
// ROUTES ALIAS
// ============================================

// ! imports and alias for page routes
import loginPage from "#routes/login.js";
import dashboardPage from "#routes/dashboard.js";
import aanvragenPage from "#routes/aanvragen.js";
import totaleVoorraadPage from "#routes/totale-voorraad.js";
import statistiekenPage from "#routes/statistieken.js";
import geschiedenisPage from "#routes/geschiedenis.js";

// ============================================
// * API ROUTES
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
