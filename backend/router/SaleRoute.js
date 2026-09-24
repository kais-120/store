const { deleteSale, updateSale, createSale, getSaleById, getSales } = require("../controller/SaleController");

const router = require("express").Router();

router.get("/", getSales);
router.get("/:id", getSaleById);
router.post("/", createSale);
router.put("/:id", updateSale);
router.patch("/:id", updateSale);
router.delete("/:id", deleteSale);

module.exports = router;