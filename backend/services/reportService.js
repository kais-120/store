/**
 * services/reportService.js
 * One function per report type. Each returns the raw data + totals needed
 * by templates/reportTemplates.js. Pure data access — no HTML/PDF here.
 */

const { Op } = require('sequelize');
const {
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  Product,
  Customer,
  CustomerPayment,
  Supplier,
  SupplierTransaction,
} = require('../models');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const AppSetting = require('../models/AppSetting');

async function getShopSettings() {
  const settings = await AppSetting.findOne();
  return {
    shopName: settings?.shop_name || 'سوبرات محمد علي',
    currency: settings?.currency || 'د.ت',
  };
}

const num = (v) => Number(v || 0);

// ---------- تقرير المبيعات ----------
async function getSalesReport({ start, end }) {
  const sales = await Sale.findAll({
    where: { date: { [Op.between]: [start, end] } },
    include: [{ model: Customer, as: 'customer', attributes: ['id', 'name'] }],
    order: [['date', 'ASC']],
  });

  const totals = sales.reduce(
    (acc, s) => {
      acc.totalAmount += num(s.total_amount);
      if (s.payment_method === 'cash') acc.cashAmount += num(s.total_amount);
      else acc.debtAmount += num(s.total_amount);
      return acc;
    },
    { totalAmount: 0, cashAmount: 0, debtAmount: 0 }
  );

  return { sales, totals, count: sales.length };
}

// ---------- تقرير الأرباح ----------
async function getProfitReport({ start, end }) {
  const saleItems = await SaleItem.findAll({
    include: [
      {
        model: Sale,
        as: 'sale',
        where: { date: { [Op.between]: [start, end] } },
        attributes: ['id', 'date', 'payment_method'],
        required: true,
      },
      {
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'category_id'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
    order: [[{ model: Sale, as: 'sale' }, 'date', 'ASC']],
  });

  const byProduct = new Map();
  const totals = { revenue: 0, cost: 0, profit: 0, quantity: 0 };

  for (const item of saleItems) {
    const qty = num(item.quantity);
    const revenue = num(item.unit_price) * qty;
    const cost = num(item.purchase_price) * qty;
    const profit = revenue - cost;

    totals.revenue += revenue;
    totals.cost += cost;
    totals.profit += profit;
    totals.quantity += qty;

    const key = item.products?.id || 'unknown';
    if (!byProduct.has(key)) {
      byProduct.set(key, {
        name: item.products?.name || 'منتج محذوف',
        category: item.products?.category?.name || '-',
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      });
    }
    const row = byProduct.get(key);
    row.quantity += qty;
    row.revenue += revenue;
    row.cost += cost;
    row.profit += profit;
  }

  const rows = Array.from(byProduct.values()).sort((a, b) => b.profit - a.profit);
  return { rows, totals };
}

// ---------- تقرير المشتريات ----------
async function getPurchasesReport({ start, end }) {
  const purchases = await Purchase.findAll({
    where: { date: { [Op.between]: [start, end] } },
    include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
    order: [['date', 'ASC']],
  });

  const totals = purchases.reduce(
    (acc, p) => {
      acc.totalAmount += num(p.total_amount);
      acc.byStatus[p.status] = (acc.byStatus[p.status] || 0) + num(p.total_amount);
      return acc;
    },
    { totalAmount: 0, byStatus: {} }
  );

  return { purchases, totals, count: purchases.length };
}

// ---------- تقرير المصاريف ----------
async function getExpensesReport({ start, end }) {
  const expenses = await Expense.findAll({
    where: { date: { [Op.between]: [start, end] } },
    order: [['date', 'ASC']],
  });

  const totalAmount = expenses.reduce((sum, e) => sum + num(e.amount), 0);

  const byCategory = new Map();
  for (const e of expenses) {
    const key = e.category || 'غير مصنّف';
    byCategory.set(key, (byCategory.get(key) || 0) + num(e.amount));
  }

  return {
    expenses,
    totals: { totalAmount, count: expenses.length },
    byCategory: Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount })),
  };
}

// ---------- تقرير المخزون ----------
// Snapshot of current stock — not date-filtered, since stock is a live value.
async function getInventoryReport() {
  const products = await Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [
      [{ model: Category, as: 'category' }, 'name', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  const rows = products.map((p) => ({
    name: p.name,
    category: p.category?.name || '-',
    unit: p.unit,
    stock: num(p.stock),
    minStock: num(p.min_stock),
    purchasePrice: num(p.purchase_price),
    price: num(p.price),
    stockValue: num(p.stock) * num(p.purchase_price),
    lowStock: num(p.stock) <= num(p.min_stock),
  }));

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalStockValue += r.stockValue;
      if (r.lowStock) acc.lowStockCount += 1;
      return acc;
    },
    { totalStockValue: 0, lowStockCount: 0 }
  );

  return { rows, totals, count: rows.length };
}

// ---------- تقرير الديون ----------
// "Debts" = money owed *to* the shop by customers, and money the shop owes
// *to* suppliers. Balances are live snapshots; the period is used to show
// which payments/new debts moved during that window for context.
async function getDebtsReport({ start, end }) {
  const [customersOwing, suppliersOwed, customerPayments, newCustomerDebts, supplierTransactions] =
    await Promise.all([
      Customer.findAll({ where: { balance: { [Op.gt]: 0 } }, order: [['balance', 'DESC']] }),
      Supplier.findAll({ where: { balance: { [Op.gt]: 0 } }, order: [['balance', 'DESC']] }),
      CustomerPayment.findAll({
        where: { date: { [Op.between]: [start, end] } },
        include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
        order: [['date', 'ASC']],
      }),
      Sale.findAll({
        where: { date: { [Op.between]: [start, end] }, payment_method: 'debt' },
        include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
        order: [['date', 'ASC']],
      }),
      SupplierTransaction.findAll({
        where: { date: { [Op.between]: [start, end] } },
        include: [{ model: Supplier, as: 'suppliers', attributes: ['name'] }],
        order: [['date', 'ASC']],
      }),
    ]);

  const totalCustomerDebt = customersOwing.reduce((sum, c) => sum + num(c.balance), 0);
  const totalSupplierDebt = suppliersOwed.reduce((sum, s) => sum + num(s.balance), 0);
  const periodPaymentsIn = customerPayments.reduce((sum, p) => sum + num(p.amount), 0);
  const periodNewDebt = newCustomerDebts.reduce((sum, s) => sum + num(s.total_amount), 0);

  return {
    customersOwing,
    suppliersOwed,
    customerPayments,
    newCustomerDebts,
    supplierTransactions,
    totals: { totalCustomerDebt, totalSupplierDebt, periodPaymentsIn, periodNewDebt },
  };
}

module.exports = {
  getShopSettings,
  getSalesReport,
  getProfitReport,
  getPurchasesReport,
  getExpensesReport,
  getInventoryReport,
  getDebtsReport,
};