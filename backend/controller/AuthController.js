const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { createActivityLog } = require("../utils/createActivityLog");

exports.login = [
  body("username")
    .notEmpty()
    .withMessage("username required")
    .isEmail("filed should be email"),
  body("password").notEmpty().withMessage("password required"),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array().map((err) => err.msg) });
    }
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
      if (user.status === "delete") {
        return res.status(404).json({ message: "user not found" });
      }
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      await createActivityLog(
  "login",
  "user",
  user.id,
  user.username,
  `تم تسجيل دخول المستخدم: ${user.username}`
);
     
      return res.json({ message: "Valid credentials" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "server error" });
    }
  },
];

exports.getProfile = async (req,res) =>{
    try {
      const user = await User.findOne({ where: { username : "admin"},
      attributes:{exclude:["password"]}
     });
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
     
      return res.json({ user });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "server error" });
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ message: "الاسم الكامل مطلوب" });
    }

    const user = await User.findOne({
      where: { id: req.user.id, status: "active" },
    });

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    await user.update({ full_name: full_name.trim() });

    return res.json({
      data: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};