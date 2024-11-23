const express = require("express");
const {db} = require("../db");

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
        created_at: new Date().toISOString(),
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

    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

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
