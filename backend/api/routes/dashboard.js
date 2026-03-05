/**
 * This file is used for reaching each endpoint of the website
 */

import {
  fetchDashboardDisplayData,
  sendSpoedAanvraag,
} from "#controller/dashboardController";
import express from "express";
const router = express.Router(); // Creates mini Express app

// The Routing Hub (inside your protected router file)
router.post("/send-spoed-aanvraag", sendSpoedAanvraag);

//Get the dispaly data for the frontend
router.get("/fetch-display-data", fetchDashboardDisplayData);

export default router; // Modern export
