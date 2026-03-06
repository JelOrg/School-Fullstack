/**
 * This file is used for reaching each endpoint of the website
 */

// ! Imports
import express from "express";
import { validateLogin } from "#controller/loginController";
import { HTTP_STATUS } from "#utils/magicNumberFile";

const router = express.Router(); // Creates mini Express app
// ============================================
// MIDDLEWARE
// ============================================
router.get("/", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login endpoint is ready",
  });
});

//route to validate the login
router.post("/validation", validateLogin);

//login endpoint that creates and returns auth cookie token
router.post("/", validateLogin);

export default router; // Modern export
