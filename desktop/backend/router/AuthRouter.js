const express = require("express");
const { login, getProfile, updateProfile } = require("../controller/AuthController");
const router = express.Router()

router.post("/login",login);
router.get("/profile",getProfile);
router.put("/profile",updateProfile);



module.exports = router;