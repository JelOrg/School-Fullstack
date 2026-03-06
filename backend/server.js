// ! ============================================
// ! imports
// ! ============================================

//required items for server to work
import express from "express";
//cookie parser
import cookieParser from "cookie-parser";
//importing for pathing and url
import path from "path";
//removes the errors when trying from f12
import cors from "cors";

//
import "#utils/absoluteEnvPath";
import mainServerRouter from "./routingHub.js";
import { HTTP_STATUS } from "#utils/magicNumberFile";
// =============================================

// *=============================================
//Get the root file where this file is
const root = process.cwd();
const server = express();
const PORT = process.env.SERVER_PORT || 3000;
// =============================================

// ? ============================================
// MIDDLEWARE
// ============================================

// The server searches for the defined html, css, or css files
server.use(express.static(path.join(root, "..", "frontend")));
//make the server use cors
//! is prob a security issue, but to removing for looks for f12...
server.use(cors());
// Parse JSON request bodies
server.use(express.json());
// Parse cookie request bodies
server.use(cookieParser());

// * ============================================
//  PAGE ROUTER
// ============================================
//? Rate limiting?
server.use("/", mainServerRouter);

// ? ============================================
// ? ERROR HANDLING
// ? ============================================

// Global error handler
server.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
