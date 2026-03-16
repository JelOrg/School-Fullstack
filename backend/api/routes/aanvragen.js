/**
 * aanvragen.js — Route file
 * GET  /api/aanvragen                    → health check
 * GET  /api/aanvragen/fetch-display-data → SSE stream of user's aanvragen
 * POST /api/aanvragen                    → submit a normal supply request
 * GET  /api/aanvragen/send-normale-aanvraag → submit via controller
 */

//most of this should be in the controller

import { HTTP_STATUS } from "#utils/magicNumberFile";
import { sendNormaleAanvraag } from "#controller/aanvragenController";
import express from "express";

const router = express.Router();

// ============================================
// ROUTES
// ============================================

//Health check — confirms the aanvragen endpoint is reachable
router.get("/", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Welcome to the aanvragen endpoint",
  });
});

/**
 * POST /api/aanvragen
 * Body:   { itemId, amountRequested, departmentName, notes }
 * userId is read from the JWT token via req.tokenInformation (set by authenticateToken)
 */

//Submit a normale aanvraag via the dedicated controller
router.post("/send-normale-aanvraag", sendNormaleAanvraag);

export default router;
