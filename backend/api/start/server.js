//required items for server to work
const express = require("express");
const server = express();
const PORT = 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
server.use(express.json());

// ============================================
// ROUTES ALIAS
// ============================================

//alias for login screen
const loginPage = require("../routes/login");

// ============================================
// ROUTES
// ============================================

// route for the login page
server.use("/api/login", loginPage);

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
