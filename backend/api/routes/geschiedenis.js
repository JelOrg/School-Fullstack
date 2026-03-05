/**
 * This file is used for reaching each endpoint of the website
 */

import { HTTP_STATUS } from "#utils/magicNumberFile";
import express from "express";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Welcome to the geschiedenis endpoint",
    user: req.user,
  });
});

export default router; // Modern export
