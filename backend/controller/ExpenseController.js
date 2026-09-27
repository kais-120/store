const { Op } = require("sequelize");
const Expense = require("../models/Expense");
const { body, validationResult, param } = require("express-validator");

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: endDate,
      };
    }

    if (category) {
      where.category = category;
    }

    const expenses = await Expense.findAll({
      where,
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المصاريف",
    });
  }
};

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