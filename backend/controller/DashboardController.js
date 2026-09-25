// controllers/dashboardController.js
const { Op, fn, col } = require("sequelize");
const { timeAgo } = require("../utils/timeAgo");

const ActivityLog = require("../models/ActivityLog");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
// const Purchase = require("../models/Purchase"); // not needed yet, kept for later

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD', matches Sale.date (DATEONLY)
}

// GET /api/dashboard/stats
async function getStats(req, res) {
  try {
    const today = todayDateOnly();

    const [todaySalesTotal, invoiceCount, customerDebt, supplierDebt] = await Promise.all([
      Sale.sum("total_amount", { where: { date: today } }),
      Sale.count({ where: { date: today } }),
      Customer.sum("balance"),
      Supplier.sum("balance"),
    ]);

    res.json({
      todaySales: todaySalesTotal || 0,
      invoiceCount: invoiceCount || 0,
      // TODO: todayProfit needs per-sale line items (product qty × (price - purchase_price)).
      // Returning 0 until a SaleItem model exists. See note below.
      todayProfit: 0,
      // TODO: cashboxBalance needs a Cashbox model / ledger. Returning null for now.
      cashboxBalance: null,
      customerDebt: customerDebt || 0,
      supplierDebt: supplierDebt || 0,
    });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ error: "فشل في تحميل إحصائيات اللوحة" });
  }
}

// GET /api/dashboard/activity
async function getActivity(req, res) {
  try {
    const limit = Number(req.query.limit) || 5;

    const logs = await ActivityLog.findAll({
      order: [["createdAt", "DESC"]],
      limit,
    });

    const activity = logs.map((log) => ({
      id: `a${log.id}`,
      text: log.description,
      time: timeAgo(log.createdAt),
    }));

    res.json(activity);
  } catch (err) {
    console.error("getActivity error:", err);
    res.status(500).json({ error: "فشل في تحميل النشاط الأخير" });
  }
}

// GET /api/dashboard/sales-trend
async function getSalesTrend(req, res) {
  const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const from = sevenDaysAgo.toISOString().slice(0, 10);

    const rows = await Sale.findAll({
      attributes: ["date", [fn("SUM", col("total_amount")), "value"]],
      where: { date: { [Op.gte]: from } },
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    // Fill in any missing days with 0 so the chart always has 7 points
    const byDate = Object.fromEntries(rows.map((r) => [r.date, Number(r.value)]));
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend.push({ day: dayNames[d.getDay()], value: byDate[key] || 0 });
    }

    res.json(trend);
  } catch (err) {
    console.error("getSalesTrend error:", err);
    res.status(500).json({ error: "فشل في تحميل منحنى المبيعات" });
  }
}

// GET /api/dashboard/category-breakdown
// FALLBACK: % of product catalog per category (no sale-item data yet).
// Swap for revenue-based breakdown once a SaleItem model exists.
async function getCategoryBreakdown(req, res) {
  try {
    const rows = await Product.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      group: ["category"],
      raw: true,
    });

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    if (total === 0) return res.json([]);

    const breakdown = rows.map((r) => ({
      name: r.category,
      value: Math.round((Number(r.count) / total) * 100),
    }));

    res.json(breakdown);
  } catch (err) {
    console.error("getCategoryBreakdown error:", err);
    res.status(500).json({ error: "فشل في تحميل توزيع الفئات" });
  }
}

module.exports = {
  getStats,
  getActivity,
  getSalesTrend,
  getCategoryBreakdown,
};