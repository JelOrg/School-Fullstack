/**
 * totale-voorraad.js — Route file
 * GET /api/totale-voorraad            → all items
 * GET /api/totale-voorraad?search=x   → filtered items (used by dashboard & aanvraag autocomplete)
 * GET /api/totale-voorraad?category=x → filter by category
 */

import express from "express";
import { authenticateToken } from "#middleware/authenticatie";
import { authorizeByLevelAndDepartment } from "#middleware/authorisatie";
import { fetchTotalVoorraadData } from "#controller/totaleVoorraadController";
const router = express.Router(); // Creates mini Express app

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

router.get("/fetch-totale-voorraad", fetchTotalVoorraadData);

export default router;
