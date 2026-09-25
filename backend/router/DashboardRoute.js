// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/DashboardController");

router.get("/stats", dashboardController.getStats);
router.get("/activity", dashboardController.getActivity);
router.get("/sales-trend", dashboardController.getSalesTrend);
router.get("/category-breakdown", dashboardController.getCategoryBreakdown);

module.exports = router;
