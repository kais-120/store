const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcrypt")

exports.login = [
  body("email")
    .notEmpty()
    .withMessage("email required")
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
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
      if (user.status === "supprimé") {
        return res.status(404).json({ message: "user not found" });
      }
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { sub: user.id, iss: "galaxygym.com", aud: "Galaxy Gym" },
        process.env.JWTKEY,
      );
      await ActivityLog.create({
        action: "login",
        description: `${user.name} s'est connecté`,
        user_name: user.name,
        user_role: user.role,
        user_id: user.id,
      });
      return res.json({ message: "Valid credentials", token });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "server error" });
    }
  },
];
