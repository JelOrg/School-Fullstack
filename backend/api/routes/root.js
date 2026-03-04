// ! Imports
import express from "express";

const router = express.Router(); //

// 1. Just sending a static "Hello"
// This handles: http://localhost:5500/api/
router.get("/", (req, res) => {
  // This logs in your VS Code terminal
  console.log("Ping received from Frontend!");

  // This is the "Full Package" the frontend will receive
  res.json({
    message: "Hello! The bridge is open.",
    time: new Date().toLocaleTimeString(),
    status: "Connected",
  });
});

export default router;
