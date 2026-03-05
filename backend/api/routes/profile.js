/**
 * This file is used for reaching each endpoint of the website
 */

import express from "express";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the statistieken endpoint",
    user: req.user,
  });
});

export default router;
