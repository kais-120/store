// validator for GET /products
const { query } = require("express-validator");

exports.getProductsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 200 }).toInt(),
  query("search").optional().isString().trim(),
  query("category").optional().isInt().toInt(),
  query("lowStock").optional().isBoolean().toBoolean(),
];