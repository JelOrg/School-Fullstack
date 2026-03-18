// ! Imports
import express from "express";

const router = express.Router(); //

// 1. Just sending a static "Hello"
// This handles: http://localhost:5500/api/
router.get("/", (req, res) => {
  const routeMap = {
    status: "Online",
    version: "1.0.0",
    description: "Inventory Management System API Gateway",

    pages: [
      { method: "GET", path: "/", access: "Public", desc: "Inlogpagina" },
      { method: "GET", path: "/login", access: "Public", desc: "Inlogpagina" },
      {
        method: "GET",
        path: "/dashboard",
        access: "Employee+",
        desc: "Dashboard",
      },
      {
        method: "GET",
        path: "/aanvraag",
        access: "Employee+",
        desc: "Aanvragen overzicht",
      },
      {
        method: "GET",
        path: "/totale-voorraad",
        access: "Employee+",
        desc: "Voorraad overzicht",
      },
      {
        method: "GET",
        path: "/statistieken",
        access: "Manager+",
        desc: "Statistieken",
      },
      {
        method: "GET",
        path: "/geschiedenis",
        access: "Admin",
        desc: "Geschiedenis",
      },
      { method: "GET", path: "/profile", access: "Employee+", desc: "Profiel" },
      {
        method: "GET",
        path: "/settings",
        access: "Employee+",
        desc: "Instellingen",
      },
    ],

    api_endpoints: {
      auth: [
        {
          method: "POST",
          path: "/api/login/validation",
          desc: "Validate user credentials",
        },
      ],
      inventory: [
        {
          method: "GET",
          path: "/api/totale-voorraad/fetch-totale-voorraad",
          desc: "SSE: Real-time stock data",
        },
        {
          method: "POST",
          path: "/api/totale-voorraad/fetch-all-items",
          desc: "Searchable item list",
        },
      ],
      requests: [
        {
          method: "POST",
          path: "/api/aanvragen/send-normale-aanvraag",
          desc: "Submit standard request",
        },
        {
          method: "POST",
          path: "/api/aanvragen/send-spoed-aanvraag",
          desc: "Submit urgent request",
        },
      ],
      data_fetching: [
        {
          method: "GET",
          path: "/api/dashboard/fetch-display-data",
          desc: "Dashboard stats",
        },
        {
          method: "GET",
          path: "/api/statistieken/fetch-display-data",
          desc: "Managerial statistics",
        },
        {
          method: "GET",
          path: "/api/geschiedenis/fetch-geschiedenis-display-data",
          desc: "History logs",
        },
      ],
    },
  };

  res.status(200).json(routeMap);
});

export default router;
