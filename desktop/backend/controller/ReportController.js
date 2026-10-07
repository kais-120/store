/**
 * controllers/reportController.js
 * GET /api/reports/:type?period=today|week|month|custom&date=YYYY-MM-DD&startDate=&endDate=
 *
 * :type is one of: sales | profit | purchases | expenses | inventory | debts
 * (matches the ids in your reportTypes array on the frontend)
 */

const { getDateRange } = require('../utils/dateRange');
const { generatePdfBuffer } = require('../utils/pdfGenerator');
const reportService = require('../services/reportService');
const templates = require('../templates/reportTemplates');
const { Sale, Purchase, Product } = require('../models');
const { Op, fn, col } = require('sequelize');
const Expense = require('../models/Expense');
const AppSetting = require('../models/AppSetting');

const REPORT_LABELS = {
  sales: 'تقرير المبيعات',
  profit: 'تقرير الأرباح',
  purchases: 'تقرير المشتريات',
  expenses: 'تقرير المصاريف',
  inventory: 'تقرير المخزون',
  debts: 'تقرير الديون',
};

// inventory ignores the date range (it's a live stock snapshot), so its
// period is only used for the header label, not for filtering.
const VALID_TYPES = Object.keys(REPORT_LABELS);

exports.generateReport = async (req, res) => {
  const { type } = req.params;
  const { period, date, startDate, endDate } = req.query;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      message: `نوع التقرير غير صالح. القيم المسموحة: ${Object.keys(REPORT_LABELS).join(', ')}`,
    });
  }

  let range;
  try {
    range = getDateRange({ period, date, startDate, endDate });
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  try {
    const setting = await AppSetting.findOne({ raw: true })
    const invoice_prefix = setting?.invoice_prefix
    const { shopName, currency } = await reportService.getShopSettings();
    const buildTemplate = {
      sales: () => reportService.getSalesReport(range).then((data) =>
        templates.buildSalesReport({ shopName, currency, periodLabel: range.label, data,invoice_prefix })
      ),
      profit: () => reportService.getProfitReport(range).then((data) =>
        templates.buildProfitReport({ shopName, currency, periodLabel: range.label, data })
      ),
      purchases: () => reportService.getPurchasesReport(range).then((data) =>
        templates.buildPurchasesReport({ shopName, currency, periodLabel: range.label, data })
      ),
      expenses: () => reportService.getExpensesReport(range).then((data) =>
        templates.buildExpensesReport({ shopName, currency, periodLabel: range.label, data })
      ),
      inventory: () => reportService.getInventoryReport().then((data) =>
        templates.buildInventoryReport({ shopName, currency, periodLabel: range.label, data })
      ),
      debts: () => reportService.getDebtsReport(range).then((data) =>
        templates.buildDebtsReport({ shopName, currency, periodLabel: range.label, data })
      ),
    };

    const html = await buildTemplate[type]();
    const pdfBuffer = await generatePdfBuffer(html, { footerText: REPORT_LABELS[type] });

    const fileName = `${type}-report-${Date.now()}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('generateReport error:', err);
    return res.status(500).json({ message: 'حدث خطأ أثناء توليد التقرير', error: err.message });
  }
}

const toDateOnly = (d) => {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = "today", startDate, endDate } = req.query;
 
    const { start, end } = getDateRange({period, startDate, endDate});
    const startDateOnly = toDateOnly(start);
    const endDateOnly = toDateOnly(end);
 
    // ---- Sales (total_amount, date = DATEONLY) ----
    const salesStats = await Sale.findOne({
      where: { date: { [Op.between]: [startDateOnly, endDateOnly] } },
      attributes: [
        [fn("COALESCE", fn("SUM", col("total_amount")), 0), "totalSales"],
        [fn("COUNT", col("id")), "salesCount"],
      ],
      raw: true,
    });
 
    const totalSales = parseFloat(salesStats.totalSales) || 0;
    const salesCount = parseInt(salesStats.salesCount, 10) || 0;
    const averageInvoice = salesCount > 0 ? totalSales / salesCount : 0;
 
    // ---- Purchases (total_amount, date = DATE with time) ----
    const totalPurchases =
      (await Purchase.sum("total_amount", {
        where: { date: { [Op.between]: [start, end] } },
      })) || 0;
 
    // ---- Expenses (amount, date = DATEONLY) ----
    const totalExpenses =
      (await Expense.sum("amount", {
        where: { date: { [Op.between]: [startDateOnly, endDateOnly] } },
      })) || 0;
 
    // ---- Products (not period-based: current full catalog count) ----
    const productsCount = await Product.count();
 
    return res.status(200).json({
      period,
      range: { start: startDateOnly, end: endDateOnly },
      totalSales,
      salesCount,
      averageInvoice,
      totalPurchases,
      totalExpenses,
      productsCount,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const { period = "week", startDate, endDate } = req.query;
    const { start, end } = getDateRange({period, startDate, endDate});
 
    if (period === "today") {
      // Hourly buckets need the real timestamp (createdAt), since `date` is DATEONLY
      const sales = await Sale.findAll({
        where: { createdAt: { [Op.between]: [start, end] } },
        attributes: ["total_amount", "createdAt"],
        raw: true,
      });
 
      const buckets = Array.from({ length: 24 }, (_, hour) => ({
        label: `${String(hour).padStart(2, "0")}:00`,
        totalSales: 0,
        salesCount: 0,
      }));
 
      for (const sale of sales) {
        const hour = new Date(sale.createdAt).getHours();
        buckets[hour].totalSales += parseFloat(sale.total_amount);
        buckets[hour].salesCount += 1;
      }
 
      return res.status(200).json({ period, unit: "hour", trend: buckets });
    }
 
    // week / month / custom -> daily buckets
    const sales = await Sale.findAll({
      where: { date: { [Op.between]: [toDateOnly(start), toDateOnly(end)] } },
      attributes: ["total_amount", "date"],
      raw: true,
    });
 
    const dayMap = new Map();
    const cursor = new Date(start);
    while (cursor <= end) {
      dayMap.set(toDateOnly(cursor), { label: toDateOnly(cursor), totalSales: 0, salesCount: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
 
    for (const sale of sales) {
      const key = sale.date; // already "YYYY-MM-DD" from a DATEONLY column
      if (dayMap.has(key)) {
        const bucket = dayMap.get(key);
        bucket.totalSales += parseFloat(sale.total_amount);
        bucket.salesCount += 1;
      }
    }
 
    return res.status(200).json({
      period,
      unit: "day",
      trend: Array.from(dayMap.values()),
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Failed to fetch sales trend",
    });
  }
};

const REPORT_HANDLERS = {
  sales: reportService.getSalesReport,
  profit: reportService.getProfitReport,
  purchases: reportService.getPurchasesReport,
  expenses: reportService.getExpensesReport,
  inventory: reportService.getInventoryReport,
  debts: reportService.getDebtsReport,
};
 
// inventory is a live snapshot, not date-filtered
const PERIOD_LESS_REPORTS = new Set(["inventory"]);
 
/**
 * GET /api/v1/report/:type?period=today|week|month|custom&startDate=&endDate=
 */
exports.getReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { period = "month", startDate, endDate } = req.query;

    const handler = REPORT_HANDLERS[type];
    if (!handler) {
      return res.status(400).json({
        message: `Unknown report type "${type}". Valid types: ${Object.keys(REPORT_HANDLERS).join(", ")}`,
      });
    }

    const shopSettings = await reportService.getShopSettings();

    let data;
    let range = null;

    if (PERIOD_LESS_REPORTS.has(type)) {
      data = await handler();
    } else {
      const { start, end } = getDateRange({ period, startDate, endDate });
      range = { start, end };
      data = await handler({ start, end });
    }

    return res.status(200).json({
      type,
      period,
      range,
      shopSettings,
      ...data,
    });
  } catch (error) {
    console.error(`getReport(${req.params.type}) error:`, error.message);
    console.error("SQL:", error.sql || error.original?.sql);
    console.error(error.stack);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to generate report",
    });
  }
};
 

// module.exports = {  REPORT_LABELS };