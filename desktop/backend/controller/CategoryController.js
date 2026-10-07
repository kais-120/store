const { validationResult, body } = require("express-validator");
const Category = require("../models/Category");
const { createActivityLog } = require("../utils/createActivityLog");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        status: "active",
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({data:categories});
  } catch (error) {
    console.error("getCategories error:", error);

    return res.status(500).json({
      message: "حدث خطأ أثناء جلب التصنيفات",
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id,
        status: "active",
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "التصنيف غير موجود",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("getCategoryById error:", error);

    return res.status(500).json({
      message: "حدث خطأ أثناء جلب التصنيف",
    });
  }
};

exports.createCategory = [
body("name")
    .trim()
    .notEmpty()
    .withMessage("اسم التصنيف مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم التصنيف يجب أن يكون بين 2 و100 حرف"),
async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name } = req.body;

    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        status: "active",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "هذا التصنيف موجود بالفعل",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      status: "active",
    });
    await createActivityLog(
  "create",
  "category",
  category.id,
  category.name,
  `تمت إضافة تصنيف جديد: ${category.name}`
);

    return res.status(201).json({
      message: "تمت إضافة التصنيف بنجاح",
      category,
    });
  } catch (error) {
    console.error("createCategory error:", error);

    return res.status(500).json({
      message: "حدث خطأ أثناء إضافة التصنيف",
    });
  }
}
]

exports.updateCategory = [
body("name")
    .trim()
    .notEmpty()
    .withMessage("اسم التصنيف مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("اسم التصنيف يجب أن يكون بين 2 و100 حرف"),
async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findOne({
      where: {
        id,
        status: "active",
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "التصنيف غير موجود",
      });
    }

    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        status: "active",
      },
    });

    if (existingCategory && String(existingCategory.id) !== String(id)) {
      return res.status(409).json({
        message: "هذا التصنيف موجود بالفعل",
      });
    }

    await category.update({
      name: name.trim(),
    });
await createActivityLog(
  "update",
  "category",
  category.id,
  category.name,
  `تم تعديل التصنيف: ${category.name}`
);
    return res.status(200).json({
      message: "تم تعديل التصنيف بنجاح",
      category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);

    return res.status(500).json({
      message: "حدث خطأ أثناء تعديل التصنيف",
    });
  }
}
]

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id,
        status: "active",
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "التصنيف غير موجود",
      });
    }

    // Soft delete
    await category.update({
      status: "delete",
    });
    await createActivityLog(
  "delete",
  "category",
  category.id,
  category.name,
  `تم حذف التصنيف: ${category.name}`
);

    return res.status(200).json({
      message: "تم حذف التصنيف بنجاح",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);

    return res.status(500).json({
      message: "حدث خطأ أثناء حذف التصنيف",
    });
  }
};