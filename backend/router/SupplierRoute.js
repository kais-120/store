const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, paySupplierDebt } = require("../controller/SupplierController");

const router = require("express").Router();

router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.post("/", createSupplier);
router.post("/debt", paySupplierDebt);
router.put("/:id", updateSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);


module.exports = router;