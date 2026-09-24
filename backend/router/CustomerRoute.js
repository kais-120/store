const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require("../controller/CustomerController");

const router = require("express").Router();

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.patch("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;