const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = require("../controller/SupplierController");

const router = require("express").Router();

router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;