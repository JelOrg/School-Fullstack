/**
 * This file is used for reaching each endpoint of the website
 */

// ! Imports
import express from "express";
import { validateLogin } from "#controller/loginController";

const router = express.Router(); // Creates mini Express app
// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login endpoint is ready",
  });
});

//login endpoint that creates and returns auth cookie token
router.post("/", validateLogin);

export default router; // Modern export
