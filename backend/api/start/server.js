// ============================================
// ============================================
// TODO: make this actually functional
const path = require("path");
require("dotenv").config({ path: path.resolve("..") });
// ============================================
// ============================================
// ============================================

//required items for server to work
const express = require("express");
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

//alias for page routes
const loginPage = require("../routes/login");
const dashboardPage = require("../routes/dashboard");
const aanvragenPage = require("../routes/aanvragen");
const totaleVoorraadPage = require("../routes/totale-voorraad");
const statistiekenPage = require("../routes/statistieken");
const geschiedenisPage = require("../routes/geschiedenis");

// ============================================
// ROUTES
// ============================================

// route for the login page
server.use("/api/login", loginPage);

// route for the dashbaord
server.use("/api/dashboard", dashboardPage);

// route for the aanvragen page
server.use("/api/aanvragen", aanvragenPage);

// route for the voorraad
server.use("/api/totale-voorraad", totaleVoorraadPage);

// route for the statistics
server.use("/api/statestieken", statistiekenPage);

// route for the history
server.use("/api/geschiedenis", geschiedenisPage);

// ============================================
// ERROR HANDLING
// ============================================

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
