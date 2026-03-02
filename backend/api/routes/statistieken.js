/**
 * This file is used for reaching each endpoint of the website
 */

import express from "express";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.send("welcome to the login page");
});

export default router;
