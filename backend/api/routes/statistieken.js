/**
 * This file is used for reaching each endpoint of the website
 */

import express from "express";
import { authenticateToken } from "#middleware/authenticatie";
import { authorizeByLevelAndDepartment } from "#middleware/authorisatie";
const router = express.Router(); // Creates mini Express app

// ============================================
// MIDDLEWARE
// ============================================
router.get(
  "/",
  authenticateToken,
  authorizeByLevelAndDepartment(3),
  (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the statistieken endpoint",
    user: req.user,
  });
  },
);

export default router;
