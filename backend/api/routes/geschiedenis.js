/**
 * This file is used for reaching each endpoint of the website
 */

import { fetchGeschiedenisDisplayData } from "#controller/geschiedenisController";
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
    user: req.tokenInformation,
  });
});

//fetch top (default 10) recent request history data
router.get("/fetch-geschiedenis-display-data", fetchGeschiedenisDisplayData);

export default router; // Modern export
