const { body, matchedData, validationResult } = require("express-validator");
const AppSetting = require("../models/AppSetting");

const FIELDS = ["shop_name", "currency", "low_stock_alert", "invoice_prefix"];

// ---------- Helpers ----------
const validationError = (res, errors) =>
  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errors.map((e) => ({ field: e.path, message: e.msg })),
  });

// The app has a single settings row: return it, or create it with the model defaults
const getOrCreateSettings = async () => {
  const existing = await AppSetting.findOne({ order: [["id", "ASC"]] });
  return existing || AppSetting.create({});
};

// ---------- GET /api/settings ----------
exports.getSettings = async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
};

// ---------- PUT/PATCH /api/settings ----------
exports.updateSettings = [
  body("shop_name")
    .optional()
    .isString().withMessage("shop_name must be a string")
    .trim().notEmpty().withMessage("shop_name cannot be empty")
    .isLength({ max: 255 }).withMessage("shop_name is too long"),

  body("currency")
    .optional()
    .isString().withMessage("currency must be a string")
    .trim().notEmpty().withMessage("currency cannot be empty")
    .isLength({ max: 10 }).withMessage("currency must be at most 10 characters"),

  body("low_stock_alert")
    .optional()
    .isFloat({ min: 0 }).withMessage("low_stock_alert must be a number >= 0")
    .toFloat(),

  body("invoice_prefix")
    .optional()
    .isString().withMessage("invoice_prefix must be a string")
    .trim().notEmpty().withMessage("invoice_prefix cannot be empty")
    .isLength({ max: 20 }).withMessage("invoice_prefix must be at most 20 characters"),

  body().custom((value) => {
    if (!FIELDS.some((k) => value && value[k] !== undefined)) {
      throw new Error("Provide at least one field to update");
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors.array());

    // matchedData keeps only validated fields (protects against mass assignment)
    const data = matchedData(req, { locations: ["body"], includeOptionals: false });

    const settings = await getOrCreateSettings();
    await settings.update(data, { fields: FIELDS });

    res.json({ success: true, data: settings });
  },
];