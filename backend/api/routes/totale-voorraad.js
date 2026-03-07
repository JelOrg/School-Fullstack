/**
 * totale-voorraad.js — Route file
 * GET /api/totale-voorraad            → all items
 * GET /api/totale-voorraad?search=x   → filtered items (used by dashboard & aanvraag autocomplete)
 * GET /api/totale-voorraad?category=x → filter by category
 */

import { HTTP_STATUS } from "#utils/magicNumberFile";

import { fetchAllItems } from "#services/fetchItemInfo";
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const { search, category } = req.query;

  const result = await fetchAllItems().catch((err) => {
    console.error("[totale-voorraad GET] fout:", err);
    return { success: false, data: [] };
  });

import express from "express";

const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Welcome to the totale-voorraad endpoint",
    user: req.user,
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
        i.categoryName.toLowerCase().includes(term)
    );
  }

  // Filter by category
  if (category) {
    items = items.filter(
      (i) => i.categoryName.toLowerCase() === category.toLowerCase()
    );
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    count: items.length,
    data: items,
  });
});

export default router;
