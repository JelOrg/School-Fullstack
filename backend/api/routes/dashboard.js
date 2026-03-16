/**
 * This file is used for reaching each endpoint of the website
 */

import {
  fetchDashboardDisplayData,
  sendSpoedAanvraag,
} from "#controller/dashboardController";
import { fetchAllItems } from "#services/fetchItemInfo";
import express from "express";
const router = express.Router(); // Creates mini Express app

// The Routing Hub (inside your protected router file)
router.post("/send-spoed-aanvraag", sendSpoedAanvraag);

//Fetches all items, so that you can diplay them when searching for them
router.post("/fetch-all-items", fetchAllItems);

//Get the dispaly data for the frontend
router.get("/fetch-display-data", fetchDashboardDisplayData);

export default router; // Modern export
