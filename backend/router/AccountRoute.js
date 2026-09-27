const { getRevenues } = require("../controller/AccountController");

const router = require("express").Router();

router.get("/revenues", getRevenues);

module.exports = router;