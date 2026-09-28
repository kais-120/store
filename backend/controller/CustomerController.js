const { Op, Sequelize } = require("sequelize");
const { body, param, query, matchedData, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const sequelize = require("../config/db");
const { Sale, CustomerPayment } = require("../models");
const { createActivityLog } = require("../utils/createActivityLog");

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
const customerRules = (isCreate) => {
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

// ---------- GET /api/customers?page=1&limit=20&search=ali ----------
exports.getCustomers = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    try {
      const { page = 1, limit = 20, search } = matchedData(req, { locations: ["query"] });

      const where = { is_deleted: false };
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const total = await Customer.count({ where });

      const rows = await Customer.findAll({
        where,
        attributes: {
          include: [
            [
              Sequelize.literal(`(
                SELECT COALESCE(SUM(s.total_amount), 0)
                FROM sales s
                WHERE s.customer_id = "customers"."id"
                  AND s.is_deleted = false
              )`),
              "totalPurchases",
            ],
            [
              Sequelize.literal(`(
                SELECT MAX(s.date)
                FROM sales s
                WHERE s.customer_id = "customers"."id"
                  AND s.is_deleted = false
              )`),
              "lastSale",
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
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error(err.parent?.message || err.message, err.sql);
      res.status(500).json({ success: false, message: "Failed to fetch customers" });
    }
  },
];

// ---------- GET /api/customers/:id ----------
exports.getCustomerById = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    res.json({ success: true, data: customer });
  },
];

// ---------- POST /api/customers ----------
exports.createCustomer = [
  ...customerRules(true),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    // matchedData keeps only validated fields (protects against mass assignment)
    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    const customer = await Customer.create(data, { fields: FIELDS });
    await createActivityLog(
  "create",
  "customer",
  customer.id,
  customer.name,
  `تمت إضافة حريف جديد: ${customer.name}`
);
    res.status(201).json({ success: true, data: customer });
  },
];

// ---------- PUT/PATCH /api/customers/:id ----------
exports.updateCustomer = [
  idRule,
  ...customerRules(false),
  body().custom((value) => {
    if (!FIELDS.some((k) => value && value[k] !== undefined)) {
      throw new Error("Provide at least one field to update");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const data = matchedData(req, { locations: ["body"], includeOptionals: false });
    await customer.update(data, { fields: FIELDS });
    await createActivityLog(
  "update",
  "customer",
  customer.id,
  customer.name,
  `تم تعديل بيانات الحريف: ${customer.name}`
);

    res.json({ success: true, data: customer });
  },
];

// ---------- DELETE /api/customers/:id ----------
exports.deleteCustomer = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    try {
      await customer.update({is_deleted:true});
    } catch (err) {
      // The customer still has sales pointing at it
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Cannot delete a customer that has sales",
        });
      }
      throw err;
    }
    await createActivityLog(
  "delete",
  "customer",
  customer.id,
  customer.name,
  `تم حذف الحريف: ${customer.name}`
);

    res.json({ success: true, message: "Customer deleted" });
  },
];

exports.payDebt = [
  body("customer_id").isInt({ min: 1 }).toInt(),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("note").optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const { customer_id, amount, note } = matchedData(req, { locations: ["body"] });

    const t = await sequelize.transaction();
    try {
      const customer = await Customer.findByPk(customer_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!customer) {
        await t.rollback();
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      if (amount > customer.balance) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Payment exceeds remaining debt (${Number(customer.balance).toFixed(3)})`,
        });
      }

      const payment = await CustomerPayment.create({ customer_id, amount, note }, { transaction: t });
      await customer.decrement("balance", { by: amount, transaction: t });
      await customer.reload({ transaction: t });

      await t.commit();
      await createActivityLog(
  "payment",
  "customer",
  customer.id,
  customer.name,
  `تم تسجيل دفعة بقيمة ${Number(amount).toFixed(3)} د.ت للحريف: ${customer.name}`
);

      res.status(201).json({
        success: true,
        data: payment,
        remainingDebt: customer.balance,
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
];