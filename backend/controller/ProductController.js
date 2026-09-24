const { Op, col } = require("sequelize");
const { matchedData, validationResult, body } = require("express-validator");
const Product = require("../models/Product");

const FIELDS = ["name", "category", "price", "purchase_price", "unit", "stock", "min_stock", "step"];

exports.getProducts = async (req, res) => {
  const { page = 1, limit = 20, search, category, lowStock } = matchedData(req, { locations: ["query"] });

  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (category) where.category = category;
  if (lowStock) where.stock = { [Op.lte]: col("min_stock") };

  const { rows, count } = await Product.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]],
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, data: product });
};

// POST /api/products
exports.createProduct = [
   body("name")
      .notEmpty()
      .withMessage("name is required")
      .isString().withMessage("name must be a string")
      .trim().notEmpty().withMessage("name cannot be empty")
      .isLength({ max: 255 }).withMessage("name is too long"),
 
      body("category")
      .notEmpty()
      .withMessage("category is required")
      .isString().withMessage("category must be a string")
      .trim().notEmpty().withMessage("category cannot be empty")
      .isLength({ max: 255 }),
 
    body("price")
      .notEmpty()
      .withMessage("price is required")
      
      .isFloat({ min: 0 }).withMessage("price must be a number >= 0")
      .toFloat(),
 
    body("purchase_price")
    .notEmpty()
      .withMessage("purchase_price is required")
      
      .isFloat({ min: 0 }).withMessage("purchase_price must be a number >= 0")
      .toFloat(),
 
    body("unit")
    .notEmpty()
      .withMessage("unit is required")
      .isString().withMessage("unit must be a string")
      .trim().notEmpty().withMessage("unit cannot be empty")
      .isLength({ max: 50 }),
 
    // These have DB defaults, so always optional
    body("stock").optional().isFloat({ min: 0 }).withMessage("stock must be a number >= 0").toFloat(),
    body("min_stock").optional().isFloat({ min: 0 }).withMessage("minStock must be a number >= 0").toFloat(),
    body("step").optional().isFloat({ gt: 0 }).withMessage("step must be a number > 0").toFloat(),
  async (req, res) => {
      const errors = validationResult(req);
  if (!errors.isEmpty()){
  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}
  // matchedData keeps only validated fields (protects against mass assignment)
  const data = matchedData(req, { locations: ["body"], includeOptionals: false });

  const product = await Product.create(data, { fields: FIELDS });
  res.status(201).json({ success: true, data: product });
}
]

exports.updateProduct = [
 body("name")
      .notEmpty()
      .withMessage("name is required")
      .isString().withMessage("name must be a string")
      .trim().notEmpty().withMessage("name cannot be empty")
      .isLength({ max: 255 }).withMessage("name is too long"),
 
      body("category")
      .notEmpty()
      .withMessage("category is required")
      .isString().withMessage("category must be a string")
      .trim().notEmpty().withMessage("category cannot be empty")
      .isLength({ max: 255 }),
 
    body("price")
      .notEmpty()
      .withMessage("price is required")
      
      .isFloat({ min: 0 }).withMessage("price must be a number >= 0")
      .toFloat(),
 
    body("purchase_price")
    .notEmpty()
      .withMessage("purchase_price is required")
      
      .isFloat({ min: 0 }).withMessage("purchase_price must be a number >= 0")
      .toFloat(),
 
    body("unit")
    .notEmpty()
      .withMessage("unit is required")
      .isString().withMessage("unit must be a string")
      .trim().notEmpty().withMessage("unit cannot be empty")
      .isLength({ max: 50 }),
 
    // These have DB defaults, so always optional
    body("stock").optional().isFloat({ min: 0 }).withMessage("stock must be a number >= 0").toFloat(),
    body("minStock").optional().isFloat({ min: 0 }).withMessage("minStock must be a number >= 0").toFloat(),
    body("step").optional().isFloat({ gt: 0 }).withMessage("step must be a number > 0").toFloat(),
    async (req, res) => {
        const errors = validationResult(req);
  if (!errors.isEmpty()){
  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const data = matchedData(req, { locations: ["body"], includeOptionals: false });
  await product.update(data, { fields: FIELDS });

  res.json({ success: true, data: product });
}]

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  await product.destroy();
  res.json({ success: true, message: "Product deleted" });
};