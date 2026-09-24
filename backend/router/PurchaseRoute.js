const { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase } = require("../controller/PurchaseController");

const router = require("express").Router();

router.get("/", getPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);
router.put("/:id", updatePurchase);
router.patch("/:id", updatePurchase);
router.delete("/:id", deletePurchase);

module.exports = router;