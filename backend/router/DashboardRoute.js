// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/DashboardController");

router.get("/stats", dashboardController.getStats);
router.get("/activity", dashboardController.getActivity);
router.get("/sales-trend", dashboardController.getSalesTrend);
router.get("/category-breakdown", dashboardController.getCategoryBreakdown);
router.get("/last-sale", dashboardController.getFacture);
router.get("/low-stock-products", dashboardController.getLowStockProducts);



module.exports = router;
