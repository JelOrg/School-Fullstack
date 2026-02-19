/**
 * This file is used for reaching each endpoint of the website
 */

const express = require("express");
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.send("welcome to the login page");
});

module.exports = router; // Exports the router object
