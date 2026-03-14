/**
 * totale-voorraad.js — Route file
 * GET /api/totale-voorraad                      → all items (with optional search/category filter)
 * GET /api/totale-voorraad/fetch-totale-voorraad → SSE stream of voorraad data
 */

import { HTTP_STATUS } from "#utils/magicNumberFile";
import { fetchAllItems } from "#services/fetchItemInfo";
import { fetchTotalVoorraadData } from "#controller/totaleVoorraadController";
import express from "express";

const router = express.Router();

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/totale-voorraad
 * Returns all items, optionally filtered by ?search= or ?category=
 */
//SSE endpoint — streams totale voorraad data to the frontend in real-time
router.get("/fetch-totale-voorraad", fetchTotalVoorraadData);

export default router;
