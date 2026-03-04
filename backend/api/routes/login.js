/**
 * This file is used for reaching each endpoint of the website
 */

// ! Imports
import express from "express";
import { validateLogin } from "#controller/loginController";

const router = express.Router(); // Creates mini Express app

//route to validate the login
router.post("/validation", validateLogin);

export default router; // Modern export
