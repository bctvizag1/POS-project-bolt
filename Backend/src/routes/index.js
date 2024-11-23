const express = require("express");
const { getProducts, createProduct, updateProduct } = require("../controllers/productController");

const { addSale, getDailySales, getTransactions } = require("../controllers/saleController");

const router = express.Router();

router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.post("/sales", addSale);
router.get("/daily-sales", getDailySales);
router.get("/transactions", getTransactions);

module.exports = router;
