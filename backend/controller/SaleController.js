const { Op } = require("sequelize");
const { body, param, query, matchedData, validationResult } = require("express-validator");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const sequelize = require("../config/db");
const { SaleItem, Product } = require("../models");

const FIELDS = ["customer_id", "total_amount", "payment_method"];
const PAYMENT_METHODS = ["cash", "debt"];

// ---------- Validation helpers ----------
const required = (chain, msg) => chain.exists({ checkNull: true }).withMessage(msg);

const idRule = param("id").isString().trim().notEmpty().withMessage("id is required");

const validationError = (res, errors) =>
  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.map((e) => ({ field: e.path || e.field, message: e.msg || e.message })),
  });

// Shared rules for create / update (update = everything optional)
const saleRules = (isCreate) => {
  const req = (chain, msg) => (isCreate ? required(chain, msg) : chain.optional());

  return [
    req(body("items"), "items is required")
      .isArray({ min: 1 }).withMessage("items must be a non-empty array"),

    body("items.*.product_id")
      .exists().withMessage("product_id is required for each item")
      .isInt({ min: 1 }).withMessage("product_id must be a positive integer")
      .toInt(),

    body("items.*.quantity")
      .exists().withMessage("quantity is required for each item")
      .isFloat({ gt: 0 }).withMessage("quantity must be a number > 0")
      .toFloat(),

    req(body("payment_method"), "payment_method is required")
      .isIn(PAYMENT_METHODS).withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(", ")}`),

    // customer_id is nullable, but required when the sale is on debt
    body("customer_id")
      .optional({ nullable: true })
      .isInt({ min: 1 }).withMessage("customer_id must be a positive integer")
      .toInt(),

    body("discount")
      .optional()
      .isFloat({ min: 0 }).withMessage("discount must be a number >= 0")
      .toFloat(),
  ];
};

// ---------- GET /api/sales ----------
exports.getSales = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("customer_id").optional().isInt({ min: 1 }).toInt(),
  query("payment_method").optional().isIn(PAYMENT_METHODS).withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(", ")}`),
  query("from").optional().isISO8601().withMessage("from must be a valid date").toDate(),
  query("to").optional().isISO8601().withMessage("to must be a valid date").toDate(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const { page = 1, limit = 20, customer_id, payment_method, from, to } = matchedData(req, { locations: ["query"] });

    const where = {};
    if (customer_id) where.customer_id = customer_id;
    if (payment_method) where.payment_method = payment_method;
    if (from && to) where.date = { [Op.between]: [from, to] };
    else if (from) where.date = { [Op.gte]: from };
    else if (to) where.date = { [Op.lte]: to };

    const { rows, count } = await Sale.findAndCountAll({
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

// ---------- GET /api/sales/:id ----------
exports.getSaleById = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    res.json({ success: true, data: sale });
  },
];

// ---------- POST /api/sales ----------
exports.createSale = [
  ...saleRules(true),

  body("customer_id").custom((value, { req }) => {
    if (req.body.payment_method === "debt" && (value === undefined || value === null || value === "")) {
      throw new Error("customer_id is required when payment_method is debt");
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const data = matchedData(req, { locations: ["body"], includeOptionals: false });
      const { items, customer_id, payment_method, discount } = data;
      const appliedDiscount = discount || 0;

      if (!items || !items.length) {
        await t.rollback();
        return validationError(res, [{ path: "items", msg: "At least one item is required" }]);
      }

      let customer = null;
      if (customer_id) {
        customer = await Customer.findByPk(customer_id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!customer) {
          await t.rollback();
          return validationError(res, [{ path: "customer_id", msg: "Customer not found" }]);
        }
      }

      // Lock products, validate stock, build sale items, compute subtotal
      let subtotal = 0;
      const saleItemsData = [];

      for (const item of items) {
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!product) {
          await t.rollback();
          return validationError(res, [{ path: "items", msg: `Product ${item.product_id} not found` }]);
        }

        if (Number(product.stock) < Number(item.quantity)) {
          await t.rollback();
          return validationError(res, [
            { path: "items", msg: `Insufficient stock for ${product.name}` },
          ]);
        }

        const lineTotal = Number(product.price) * Number(item.quantity);
        subtotal += lineTotal;

        saleItemsData.push({
          product_id: product.id,
          quantity: item.quantity,
          unit_price: product.price,
          purchase_price: product.purchase_price,
        });

        await product.decrement("stock", { by: item.quantity, transaction: t });
      }

      if (appliedDiscount > subtotal) {
        await t.rollback();
        return validationError(res, [
          { path: "discount", msg: "discount cannot exceed the items subtotal" },
        ]);
      }

      const totalAmount = subtotal - appliedDiscount;

      const sale = await Sale.create(
        {
          customer_id: customer_id || null,
          payment_method,
          total_amount: totalAmount,
        },
        { transaction: t }
      );

      await SaleItem.bulkCreate(
        saleItemsData.map((si) => ({ ...si, sale_id: sale.id })),
        { transaction: t }
      );

      if (payment_method === "debt" && customer) {
        await customer.increment("balance", { by: totalAmount, transaction: t });
      }

      await t.commit();

      const fullSale = await Sale.findByPk(sale.id, {
        include: [{ model: SaleItem, as: "saleItem" }],
      });

      res.status(201).json({ success: true, data: fullSale });
    } catch (err) {
      await t.rollback();
      console.log(err);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  },
];
// ---------- PUT/PATCH /api/sales/:id ----------
exports.updateSale = [
  idRule,
  ...saleRules(false),
  body().custom((value) => {
    const updatable = FIELDS.filter((f) => f !== "id");
    if (!updatable.some((k) => value && value[k] !== undefined)) {
      throw new Error("Provide at least one field to update");
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    // Check the final state: a debt sale must still have a customer
    const finalMethod = data.payment_method ?? sale.payment_method;
    const finalCustomer = data.customer_id !== undefined ? data.customer_id : sale.customer_id;
    if (finalMethod === "debt" && !finalCustomer) {
      return validationError(res, [{ path: "customer_id", msg: "customer_id is required when payment_method is debt" }]);
    }

    if (data.customer_id && !(await Customer.findByPk(data.customer_id))) {
      return validationError(res, [{ path: "customer_id", msg: "Customer not found" }]);
    }

    await sale.update(data, { fields: FIELDS.filter((f) => f !== "id") });
    res.json({ success: true, data: sale });
  },
];

// ---------- DELETE /api/sales/:id ----------
exports.deleteSale = [
  idRule,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    await sale.destroy();
    res.json({ success: true, message: "Sale deleted" });
  },
];