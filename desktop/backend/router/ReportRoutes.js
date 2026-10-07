const express = require('express');
const router = express.Router();
const { generateReport, getDashboardStats, getSalesTrend, getReport } = require('../controller/ReportController');

router.get('/dash/status', getDashboardStats);
router.get('/dash/sales-trend', getSalesTrend);
router.get('/dash/report/:type', getReport);

router.get('/:type', generateReport);


module.exports = router;