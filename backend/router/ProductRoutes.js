
const router = require("express").Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controller/ProductController");


router.get("/",getProducts);
router.get("/:id",getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;