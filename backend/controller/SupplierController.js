const { Op, Sequelize } = require("sequelize");
const { body, param, query, matchedData, validationResult } = require("express-validator");
const Supplier = require("../models/Supplier");
const { SupplierTransaction } = require("../models");
const sequelize = require("../config/db");

const FIELDS = ["name", "phone"];

// ---------- Validation helpers ----------
const required = (chain, msg) => chain.exists({ checkNull: true }).withMessage(msg);

const idRule = param("id").isInt({ min: 1 }).withMessage("id must be a positive integer").toInt();

const validationError = (res, errors) =>
  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.map((e) => ({ field: e.path, message: e.msg })),
  });

// Shared rules for create / update (update = everything optional)
const supplierRules = (isCreate) => {
  const req = (chain, msg) => (isCreate ? required(chain, msg) : chain.optional());

  return [
    req(body("name"), "name is required")
      .isString().withMessage("name must be a string")
      .trim().notEmpty().withMessage("name cannot be empty")
      .isLength({ max: 255 }).withMessage("name is too long"),

    // phone is STRING(8) in the model -> exactly 8 digits
    req(body("phone"), "phone is required")
      .isString().withMessage("phone must be a string")
      .trim()
      .matches(/^\d{8}$/).withMessage("phone must be exactly 8 digits"),
  ];
};

// ---------- GET /api/suppliers?page=1&limit=20&search=ali ----------
exports.getSuppliers = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const { page = 1, limit = 20, search } = matchedData(req, { locations: ["query"] });

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Supplier.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COALESCE(SUM(total_amount), 0) FROM purchases
              WHERE purchases.supplier_id = suppliers.id
            )`),
            "totalPurchases",
          ],
        ],
      },
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  },
];

// ---------- GET /api/suppliers/:id ----------
exports.getSupplierById = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

    res.json({ success: true, data: supplier });
  },
];

// ---------- POST /api/suppliers ----------
exports.createSupplier = [
  ...supplierRules(true),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    // matchedData keeps only validated fields (protects against mass assignment)
    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    const supplier = await Supplier.create(data, { fields: FIELDS });
    res.status(201).json({ success: true, data: supplier });
  },
];

// ---------- PUT/PATCH /api/suppliers/:id ----------
exports.updateSupplier = [
  idRule,
  ...supplierRules(false),
  body().custom((value) => {
    if (!FIELDS.some((k) => value && value[k] !== undefined)) {
      throw new Error("Provide at least one field to update");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

    const data = matchedData(req, { locations: ["body"], includeOptionals: false });
    await supplier.update(data, { fields: FIELDS });

    res.json({ success: true, data: supplier });
  },
];

// ---------- DELETE /api/suppliers/:id ----------
exports.deleteSupplier = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

    try {
      await supplier.destroy();
    } catch (err) {
      // The supplier is still referenced by other records
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Cannot delete a supplier that is linked to other records",
        });
      }
      throw err;
    }

    res.json({ success: true, message: "Supplier deleted" });
  },
];
exports.paySupplierDebt = [
  body("supplier_id").isInt({ min: 1 }).toInt(),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("note").optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const { supplier_id, amount, note } = matchedData(req, { locations: ["body"] });

    const t = await sequelize.transaction();
    try {
      const supplier = await Supplier.findByPk(supplier_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!supplier) {
        await t.rollback();
        return res.status(404).json({ success: false, message: "Supplier not found" });
      }

      if (amount > supplier.balance) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Payment exceeds remaining debt (${Number(supplier.balance).toFixed(3)})`,
        });
      }

      const payment = await SupplierTransaction.create(
        { supplier_id, type: "payment", amount, note },
        { transaction: t }
      );

      await supplier.decrement("balance", { by: amount, transaction: t });
      await supplier.reload({ transaction: t });

      await t.commit();

      res.status(201).json({
        success: true,
        data: payment,
        remainingDebt: supplier.balance,
      });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ success: false, message: "Failed to register payment" });
    }
  },
];