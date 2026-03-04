/**
 * This file is used for reaching each endpoint of the website
 */

import express from "express";
import { authenticateToken } from "#middleware/authenticatie";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the dashboard endpoint",
    user: req.user,
  });
});

export default router; // Modern export
