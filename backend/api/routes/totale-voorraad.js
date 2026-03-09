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
router.get("/", async (req, res) => {
  const { search, category } = req.query;

  const result = await fetchAllItems().catch((err) => {
    console.error("[totale-voorraad GET] fout:", err);
    return { success: false, data: [] };
  });

  if (!result.success) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Kon items niet ophalen.",
      data: [],
    });
  }

  let items = result.data;

  //Filter by search term (matches on itemName or categoryName)
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.itemName.toLowerCase().includes(term) ||
        i.categoryName.toLowerCase().includes(term),
    );
  }

  //Filter by exact category name
  if (category) {
    items = items.filter(
      (i) => i.categoryName.toLowerCase() === category.toLowerCase(),
    );
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    count: items.length,
    data: items,
  });
});

//SSE endpoint — streams totale voorraad data to the frontend in real-time
router.get("/fetch-totale-voorraad", fetchTotalVoorraadData);

export default router;
