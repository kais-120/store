const { Op } = require("sequelize");
const Expense = require("../models/Expense");
const { body, validationResult, param, query, matchedData } = require("express-validator");
const { createActivityLog } = require("../utils/createActivityLog");

exports.getExpenses = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)
    const { search, category, dateFrom, dateTo } = req.query

    const where = {}
    if (search) where.label = { [Op.like]: `%${search}%` }
    if (category) where.category = category
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date[Op.gte] = dateFrom
      if (dateTo) where.date[Op.lte] = dateTo
    }

    const { count, rows } = await Expense.findAndCountAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    })

    const filteredTotal = (await Expense.sum('amount', { where })) || 0
    const total = (await Expense.sum('amount')) || 0

    res.json({
      data: rows,
      pagination: { total: count, page, limit, pages: Math.max(Math.ceil(count / limit), 1) },
      summary: { total, filteredTotal },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "المصروف غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المصروف",
    });
  }
};

exports.createExpense = [
    body("label")
    .trim()
    .notEmpty()
    .withMessage("اسم المصروف مطلوب")
    .isLength({ max: 255 })
    .withMessage("اسم المصروف طويل جدًا"),

  body("category")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("الفئة طويلة جدًا"),

  body("amount")
    .notEmpty()
    .withMessage("المبلغ مطلوب")
    .isDecimal()
    .withMessage("المبلغ يجب أن يكون رقمًا صالحًا")
    .custom((value) => Number(value) > 0)
    .withMessage("المبلغ يجب أن يكون أكبر من صفر"),

  body("date")
    .notEmpty()
    .withMessage("التاريخ مطلوب")
    .isISO8601()
    .withMessage("التاريخ غير صالح"),

  body("note")
    .optional({ nullable: true })
    .trim(),

async (req, res) => {
     const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  try {
    const {
      label,
      category,
      amount,
      date,
      note,
    } = req.body;

    const expense = await Expense.create({
      label,
      category,
      amount,
      date,
      note,
    });
    await createActivityLog(
  "create",
  "expense",
  expense.id,
  expense.label,
  `تمت إضافة مصروف جديد: ${expense.label} بقيمة ${Number(expense.amount).toFixed(3)} د.ت`
);

    res.status(201).json({
      success: true,
      message: "تمت إضافة المصروف بنجاح",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة المصروف",
    });
  }
}
]

exports.updateExpense = [

     param("id")
    .isInt({ min: 1 })
    .withMessage("معرف المصروف غير صالح"),

  body("label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("اسم المصروف لا يمكن أن يكون فارغًا"),

  body("category")
    .optional({ nullable: true })
    .trim(),

  body("amount")
    .optional()
    .isDecimal()
    .withMessage("المبلغ يجب أن يكون رقمًا صالحًا")
    .custom((value) => Number(value) > 0)
    .withMessage("المبلغ يجب أن يكون أكبر من صفر"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("التاريخ غير صالح"),

  body("note")
    .optional({ nullable: true })
    .trim(),

async (req, res) => {
     const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

 try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "المصروف غير موجود",
      });
    }

    const {
      label,
      category,
      amount,
      date,
      note,
    } = req.body;

    await expense.update({
      label,
      category,
      amount,
      date,
      note,
    });

    await createActivityLog(
  "update",
  "expense",
  expense.id,
  expense.label,
  `تم تعديل المصروف: ${expense.label}`
);

    res.status(200).json({
      success: true,
      message: "تم تحديث المصروف بنجاح",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث المصروف",
    });
  }
}
]

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "المصروف غير موجود",
      });
    }

    await expense.destroy();
    
    await createActivityLog(
  "delete",
  "expense",
  expense.id,
  expense.label,
  `تم حذف المصروف: ${expense.label}`
);

    res.status(200).json({
      success: true,
      message: "تم حذف المصروف بنجاح",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف المصروف",
    });
  }
};