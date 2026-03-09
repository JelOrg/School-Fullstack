/**
 * This file is used for reaching each endpoint of the website
 */

import { fetchStatistiekenDisplayData } from "#controller/statistiekenController";
import { HTTP_STATUS } from "#utils/magicNumberFile";
import express from "express";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Welcome to the statistieken endpoint",
    user: req.tokenInformation,
  });
});

//fetch statistics data and top requested items for dashboard view
router.get("/fetch-display-data", fetchStatistiekenDisplayData);

export default router;
