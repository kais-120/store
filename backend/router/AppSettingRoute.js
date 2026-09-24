
const router = require("express").Router();
const { getSettings, updateSettings } = require("../controller/AppSettingController");

router.get("/", getSettings);
router.put("/", updateSettings);
router.patch("/", updateSettings);

module.exports = router;