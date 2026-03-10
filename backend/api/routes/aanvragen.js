/**
 * aanvragen.js — Route file
 * GET  /api/aanvragen                    → health check
 * GET  /api/aanvragen/fetch-display-data → SSE stream of user's aanvragen
 * POST /api/aanvragen                    → submit a normal supply request
 * GET  /api/aanvragen/send-normale-aanvraag → submit via controller
 */

//most of this should be in the controller

import { HTTP_STATUS } from "#utils/magicNumberFile";
import { getCurrentOrNextReqBatchId } from "#services/fetchDatabaseInfo";
import { postToRequestTable } from "#services/postInfoToDatabase";
import { sendNormaleAanvraag } from "#controller/aanvragenController";
import { fetchAanvragenDisplayData } from "#controller/aanvragenControllerWRONG";
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

//SSE endpoint — streams the user's aanvragen to the frontend in real-time
router.get("/fetch-display-data", fetchAanvragenDisplayData);

/**
 * POST /api/aanvragen
 * Body:   { itemId, amountRequested, departmentName, notes }
 * userId is read from the JWT token via req.tokenInformation (set by authenticateToken)
 */
router.post("/", async (req, res) => {
  const { itemId, amountRequested, departmentName } = req.body;

  //Read userId from the token, never from the body
  const userId = req.tokenInformation?.userId;

  if (!itemId || !amountRequested || !departmentName) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "itemId, amountRequested en departmentName zijn verplicht.",
    });
  }

  if (!userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Ongeldige sessie — log opnieuw in.",
    });
  }

  //Get the next batch ID (auto-increments from the highest existing batchId)
  const batchResult = await getCurrentOrNextReqBatchId(true).catch((err) => {
    console.error("[aanvragen POST] batch ID fout:", err);
    return null;
  });

  if (!batchResult?.succes) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Kon geen batch ID ophalen.",
    });
  }

  //Write to the request table
  const result = await postToRequestTable([
    {
      requestBatchId: batchResult.data,
      itemId: Number(itemId),
      requestedAmount: Number(amountRequested),
      userId,
    },
  ]).catch((err) => {
    console.error("[aanvragen POST] DB fout:", err);
    return { success: false, message: "DB fout bij opslaan aanvraag." };
  });

  if (!result.success) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Aanvraag succesvol verstuurd!",
    count: result.count,
  });
});

//Submit a normale aanvraag via the dedicated controller
router.get("/send-normale-aanvraag", sendNormaleAanvraag);

export default router;
