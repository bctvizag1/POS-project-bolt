const express = require("express");
const { getProducts, createProduct, updateProduct } = require("../controllers/productController");
const { addSale, getDailySales, getTransactions } = require("../controllers/saleController");
const { login } = require("../controllers/authController");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Auth routes
router.post("/login", login);

// Product routes
router.get("/products", getProducts);
router.post("/products", authenticateToken, isAdmin, createProduct);
router.put("/products/:id", authenticateToken, isAdmin, updateProduct);

// Sales routes
router.post("/sales", addSale);
router.get("/daily-sales", getDailySales);
router.get("/transactions", getTransactions);

module.exports = router;
