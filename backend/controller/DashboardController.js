// controllers/dashboardController.js
const { Op, fn, col, literal } = require("sequelize");
const { timeAgo } = require("../utils/timeAgo");

const ActivityLog = require("../models/ActivityLog");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const sequelize = require("../config/db");
const SaleItem = require("../models/SaleItem");
const { CustomerPayment } = require("../models");
const Category = require("../models/Category");
// const Purchase = require("../models/Purchase"); // not needed yet, kept for later

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD', matches Sale.date (DATEONLY)
}

// GET /api/dashboard/stats
async function getStats(req, res) {
  try {
    const today = todayDateOnly();

    const [
      todaySalesTotal,
      invoiceCount,
      customerDebt,
      supplierDebt,
      cashSalesTotal,
      customerPaymentsTotal, // NEW: cash collected from debt payments
      todayProfitRow,
    ] = await Promise.all([
      Sale.sum("total_amount", { where: { date: today } }),
      Sale.count(),
      Customer.sum("balance"),
      Supplier.sum("balance"),

      Sale.sum("total_amount", { where: { payment_method: "cash" } }),
      CustomerPayment.sum("amount"), // NEW

      SaleItem.findOne({
        attributes: [
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("(sale_items.unit_price - products.purchase_price) * sale_items.quantity")
            ),
            "todayProfit",
          ],
        ],
        include: [
          { model: Sale, as: "sale", where: { date: today }, attributes: [] },
          { model: Product, as: "products", attributes: [] },
        ],
        raw: true,
      }),
    ]);

    const cashboxBalance = (cashSalesTotal || 0) + (customerPaymentsTotal || 0);

    res.json({
      todaySales: todaySalesTotal || 0,
      invoiceCount: invoiceCount || 0,
      todayProfit: Number(todayProfitRow?.todayProfit) || 0,
      cashboxBalance,
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

async function getFacture(req, res) {
  try {
    const limit = Number(req.query.limit) || 5;

    const facs = await Sale.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      include:[
        {
          model:Customer,
          as:"customer",
          attributes:["name"]
        }
      ]
    });

    const factures = facs.map((fac) => ({
      id: `F-${fac.id}`,
      customer: fac?.customer?.name || "حريف عابر",
      payment_method:fac.payment_method,
      amount:fac.total_amount,
      time: fac.createdAt,
    }));

    res.json(factures);
  } catch (err) {
    console.error("getActivity error:", err);
    res.status(500).json({ error: "فشل في تحميل النشاط الأخير" });
  }
}

async function getCategoryBreakdown(req, res) {
  try {
    const counts = await Product.findAll({
      attributes: ["category_id", [fn("COUNT", col("id")), "count"]],
      group: ["category_id"],
      raw: true,
    });

    if (counts.length === 0) return res.json([]);

    const categories = await Category.findAll({
      where: {
        id: counts.map((c) => c.category_id),
        status: "active",
      },
      attributes: ["id", "name"],
      raw: true,
    });

    const nameById = new Map(categories.map((c) => [String(c.id), c.name]));

    const rows = counts
      .filter((c) => nameById.has(String(c.category_id)))
      .map((c) => ({
        name: nameById.get(String(c.category_id)),
        count: Number(c.count),
      }));

    const total = rows.reduce((sum, r) => sum + r.count, 0);
    if (total === 0) return res.json([]);

    const breakdown = rows.map((r) => ({
      name: r.name,
      value: Math.round((r.count / total) * 100),
    }));

    res.json(breakdown);
  } catch (err) {
    console.error("getCategoryBreakdown error:", err.message);
    console.error("SQL:", err.sql || err.original?.sql);
    console.error(err.stack);
    res.status(500).json({ error: "فشل في تحميل توزيع الفئات" });
  }
}

const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: sequelize.col("min_stock"),
        },
      },
      attributes: ["id", "name", "stock", "unit", "min_stock"],
      order: [["stock", "ASC"]],
    });

    const result = lowStockProducts.map((product) => ({
      name: product.name,
      stock: product.stock,
      unit: product.unit,
      status: "كمية منخفضة",
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المنتجات ذات الكمية المنخفضة",
    });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const rows = await SaleItem.findAll({
      attributes: [
        "product_id",
        [fn("SUM", col("quantity")), "total_quantity"],
        [fn("SUM", literal("quantity * unit_price")), "total_revenue"],
        [
          fn("SUM", literal("quantity * (unit_price - purchase_price)")),
          "total_profit",
        ],
      ],
      group: ["product_id"],
      order: [[literal("total_quantity"), "DESC"]],
      limit,
      raw: true,
    });

    const products = await Product.findAll({
      where: { id: rows.map((r) => r.product_id) },
      raw: true,
    });
    const productMap = new Map(products.map((p) => [String(p.id), p]));

    const result = rows.map((r) => ({
      product: productMap.get(String(r.product_id)) || null,
      total_quantity: Number(r.total_quantity),
      total_revenue: Number(r.total_revenue),
      total_profit: Number(r.total_profit),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top products" });
  }
};

module.exports = {
  getStats,
  getActivity,
  getSalesTrend,
  getCategoryBreakdown,
  getFacture,
  getLowStockProducts,
  getTopProducts
};