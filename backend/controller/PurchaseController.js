const { Op } = require("sequelize");
const { body, param, query, matchedData, validationResult } = require("express-validator");
const Purchase = require("../models/purchase");
const Supplier = require("../models/Supplier");
const PurchaseItem = require("../models/PurchaseItem");
const Product = require("../models/Product");
const sequelize = require("../config/db");
const { SupplierTransaction } = require("../models");

const FIELDS = ["id", "supplier_id", "total_amount", "status", "date"];
const UPDATABLE = FIELDS.filter((f) => f !== "id");
const STATUSES = ["pending", "partially_paid", "paid"];

// ---------- Validation helpers ----------
const required = (chain, msg) => chain.exists({ checkNull: true }).withMessage(msg);

const idRule = param("id").isString().trim().notEmpty().withMessage("id is required");

const validationError = (res, errors) =>
  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.map((e) => ({ field: e.path, message: e.msg })),
  });

// Shared rules for create / update (update = everything optional)
const purchaseRules = (isCreate) => {
  const req = (chain, msg) => (isCreate ? required(chain, msg) : chain.optional());

  return [
    req(body("supplier_id"), "supplier_id is required")
      .isInt({ min: 1 }).withMessage("supplier_id must be a positive integer")
      .toInt(),

    req(body("total_amount"), "total_amount is required")
      .isFloat({ min: 0 }).withMessage("total_amount must be a number >= 0")
      .toFloat(),

    // status has a DB default (pending), so it is always optional
    body("status")
      .optional()
      .isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(", ")}`),

    body("date").optional().isISO8601().withMessage("date must be a valid ISO 8601 date").toDate(),
  ];
};

// ---------- GET /api/purchases ----------
exports.getPurchases = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("supplier_id").optional().isInt({ min: 1 }).toInt(),
  query("status").optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(", ")}`),
  query("from").optional().isISO8601().withMessage("from must be a valid date").toDate(),
  query("to").optional().isISO8601().withMessage("to must be a valid date").toDate(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const { page = 1, limit = 20, supplier_id, status, from, to } = matchedData(req, { locations: ["query"] });

    const where = {};
    if (supplier_id) where.supplier_id = supplier_id;
    if (status) where.status = status;
    if (from && to) where.date = { [Op.between]: [from, to] };
    else if (from) where.date = { [Op.gte]: from };
    else if (to) where.date = { [Op.lte]: to };

    const { rows, count } = await Purchase.findAndCountAll({
      include:[
        {
          model:Supplier,
          as:"supplier",
          attributes:["id","name"]
        }
      ],
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  },
];

// ---------- GET /api/purchases/:id ----------
exports.getPurchaseById = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    res.json({ success: true, data: purchase });
  },
];

// ---------- POST /api/purchases ----------
const createPurchaseRules = [

  body("supplier_id")
    .notEmpty().withMessage("supplier_id is required"),

  body("date")
    .notEmpty().withMessage("date is required")
    .isISO8601().withMessage("date must be a valid date"),

  body("status")
    .optional()
    .isIn(["paid", "debt", "pending"]).withMessage("invalid status"),

  body("items")
    .isArray({ min: 1 }).withMessage("items must be a non-empty array"),

  body("items.*.product_id")
    .notEmpty().withMessage("product_id is required for every item"),

  body("items.*.quantity")
    .isFloat({ gt: 0 }).withMessage("quantity must be greater than 0"),

  body("items.*.purchase_price")
    .isFloat({ gt: 0 }).withMessage("purchase_price must be greater than 0"),
];

exports.createPurchase = [
  ...createPurchaseRules,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    // Prevent duplicate products within the same purchase
    const productIds = data.items.map((item) => String(item.product_id));
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      return validationError(res, [{ path: "items", msg: "Duplicate product in items list" }]);
    }

    // Check all products exist
    const products = await Product.findAll({ where: { id: [...uniqueProductIds] } });
    if (products.length !== uniqueProductIds.size) {
      const foundIds = new Set(products.map((p) => String(p.id)));
      const missing = [...uniqueProductIds].filter((id) => !foundIds.has(id));
      return validationError(
        res,
        missing.map((id) => ({ path: "items", msg: `Product not found: ${id}` }))
      );
    }

    // Compute totals server-side (never trust client-sent totals)
    const itemsWithTotals = data.items.map((item) => {
      const quantity = Number(item.quantity);
      const purchase_price = Number(item.purchase_price);
      return {
        product_id: item.product_id,
        quantity,
        purchase_price,
        total: quantity * purchase_price,
      };
    });

    const totalAmount = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
    const status = data.status || "pending";

    const transaction = await sequelize.transaction();
    try {
      // Lock the supplier row for the duration of the transaction
      const supplier = await Supplier.findByPk(data.supplier_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!supplier) {
        await transaction.rollback();
        return validationError(res, [{ path: "supplier_id", msg: "Supplier not found" }]);
      }

      const purchase = await Purchase.create(
        {
          supplier_id: data.supplier_id,
          date: data.date,
          status,
          total_amount: totalAmount,
        },
        { transaction }
      );

      const createdItems = await PurchaseItem.bulkCreate(
        itemsWithTotals.map((item) => ({
          purchase_id: purchase.id,
          product_id: item.product_id,
          quantity: item.quantity,
          purchase_price: item.purchase_price,
          total: item.total,
        })),
        { transaction }
      );

      // Debt purchases increase what we owe the supplier
      if (status === "debt") {
        await SupplierTransaction.create(
          {
            supplier_id: data.supplier_id,
            type: "purchase",
            amount: totalAmount,
            date: data.date,
          },
          { transaction }
        );
        await supplier.increment("balance", { by: totalAmount, transaction });
      }

      await transaction.commit();

      return res.status(201).json({
        success: true,
        data: {
          ...purchase.toJSON(),
          items: createdItems,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("createPurchase error:", error);
      return res.status(500).json({ success: false, message: "Failed to create purchase" });
    }
  },
];

// ---------- PUT/PATCH /api/purchases/:id ----------
exports.updatePurchase = [
  idRule,
  ...purchaseRules(false),
  body().custom((value) => {
    if (!UPDATABLE.some((k) => value && value[k] !== undefined)) {
      throw new Error("Provide at least one field to update");
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    if (data.supplier_id && !(await Supplier.findByPk(data.supplier_id))) {
      return validationError(res, [{ path: "supplier_id", msg: "Supplier not found" }]);
    }

    await purchase.update(data, { fields: UPDATABLE });
    res.json({ success: true, data: purchase });
  },
];

// ---------- DELETE /api/purchases/:id ----------
exports.deletePurchase = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    try {
      await purchase.destroy();
    } catch (err) {
      // The purchase is still referenced by other records (payments, items...)
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Cannot delete a purchase that is linked to other records",
        });
      }
      throw err;
    }

    res.json({ success: true, message: "Purchase deleted" });
  },
];