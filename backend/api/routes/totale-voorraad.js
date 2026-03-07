/**
 * totale-voorraad.js — Route file
 * GET /api/totale-voorraad            → all items
 * GET /api/totale-voorraad?search=x   → filtered items (used by dashboard & aanvraag autocomplete)
 * GET /api/totale-voorraad?category=x → filter by category
 */

import { HTTP_STATUS } from "#utils/magicNumberFile";

import { fetchAllItems } from "#services/fetchItemInfo";
import express from "express";
import { fetchTotalVoorraadData } from "#controller/totaleVoorraadController";

const router = express.Router();

router.get("/", async (req, res) => {
  const { search, category } = req.query;

  const result = await fetchAllItems().catch((err) => {
    console.error("[totale-voorraad GET] fout:", err);
    return { success: false, data: [] };
  });

  // ============================================
  // MIDDLEWARE
  // ============================================
  //?Whaaat??
  router.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  });

  if (!result.success) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Kon items niet ophalen.",
      data: [],
    });
  }

  let items = result.data;

  // Filter by search term (itemName or categoryName)
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.itemName.toLowerCase().includes(term) ||
        i.categoryName.toLowerCase().includes(term),
    );
  }

  // Filter by category
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

router.get("/fetch-totale-voorraad", fetchTotalVoorraadData);

export default router;
