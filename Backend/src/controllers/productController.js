const express = require("express");
const {db} = require("../db");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const getProducts = async (req, res) => {
  try {
    const products = await db("products").where("stock", ">", 0);
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    // Only admin can create products
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required to create products" });
    }

    // Validate required fields
    if (!name || !price || !stock) {
      return res.status(400).json({ error: "Name, price, and stock are required" });
    }

    // Validate price and stock are positive numbers
    if (price <= 0 || stock < 0) {
      return res.status(400).json({ error: "Price must be positive and stock must be non-negative" });
    }

    const [newProduct] = await db("products")
      .insert({
        name,
        price,
        stock,
        last_modified_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning("*");

    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;
    
    // Only admin can update products
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required to update products" });
    }

    // Validate required fields
    if (!price && stock === undefined) {
      return res.status(400).json({ error: "Price or stock must be provided" });
    }

    // Validate price and stock if provided
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: "Price must be positive" });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: "Stock must be non-negative" });
    }

    const updateData = {
      ...price !== undefined && { price },
      ...stock !== undefined && { stock },
      last_modified_by: req.user.id,
      updated_at: new Date().toISOString()
    };

    const [updatedProduct] = await db("products")
      .where({ id })
      .update(updateData)
      .returning("*");

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
};
