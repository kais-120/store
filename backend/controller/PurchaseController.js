const { Op } = require("sequelize");
const { body, param, query, matchedData, validationResult } = require("express-validator");
const Purchase = require("../models/purchase");
const Supplier = require("../models/Supplier");

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
exports.createPurchase = [
  // id is a STRING primary key (no auto-increment), so the client must send it
  required(body("id"), "id is required")
    .isString().withMessage("id must be a string")
    .trim().notEmpty().withMessage("id cannot be empty")
    .isLength({ max: 255 }).withMessage("id is too long"),

  ...purchaseRules(true),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    // matchedData keeps only validated fields (protects against mass assignment)
    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    if (await Purchase.findByPk(data.id)) {
      return res.status(409).json({ success: false, message: "A purchase with this id already exists" });
    }

    if (!(await Supplier.findByPk(data.supplier_id))) {
      return validationError(res, [{ path: "supplier_id", msg: "Supplier not found" }]);
    }

    const purchase = await Purchase.create(data, { fields: FIELDS });
    res.status(201).json({ success: true, data: purchase });
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