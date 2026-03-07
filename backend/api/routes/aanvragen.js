/**
 * aanvragen.js — Route file
 * GET  /api/aanvragen  → health check
 * POST /api/aanvragen  → submit a normal supply request
 */

import { HTTP_STATUS } from "#utils/magicNumberFile";

import { getCurrentOrNextReqBatchId } from "#services/fetchDatabaseInfo";
import { postToRequestTable } from "#services/postInfoToDatabase";
import express from "express";

import { sendNormaleAanvraag } from "#controller/aanvragenDashboard";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the aanvragen endpoint",
  });
});

/**
 * POST /api/aanvragen
 * Body:   { itemId, itemName, amountRequested, departmentName, urgency, notes }
 * userId: read from JWT token via req.tokenInformation (set by authenticateToken)
 */
router.post("/", async (req, res) => {
  const { itemId, amountRequested, departmentName, notes } = req.body;

  // ALWAYS read userId from the token, never from the body
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

  // Get the next batch ID
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

  // Optionally save notes to reqDescirptions table
  // if (notes) {
  //   await postRequestDescription(notes).catch(() =>
  //     console.warn("Kon aanvraag notities niet opslaan."),
  //   );
  // }

  // Write to request table — only fields the schema has
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

/**
 * POST /api/aanvragen
 * Body:   { itemId, itemName, amountRequested, departmentName, urgency, notes }
 * userId: read from JWT token via req.tokenInformation (set by authenticateToken)
 * We have a controller that handles posting, we just need a filter
 */
router.post("/", async (req, res) => {
  const { itemId, amountRequested, departmentName, notes } = req.body;

  // ALWAYS read userId from the token, never from the body
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

  // Get the next batch ID
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

  // Optionally save notes to reqDescirptions table
  if (notes) {
    await postRequestDescription(notes).catch(() =>
      console.warn("Kon aanvraag notities niet opslaan."),
    );
  }

  // Write to request table — only fields the schema has
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

router.get("/send-normale-aanvraag", sendNormaleAanvraag);
export default router;
