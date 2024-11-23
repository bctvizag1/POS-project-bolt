import initSqlJs from 'sql.js';
import { useEffect, useState } from 'react';
import { Sale, SaleItem } from '../types';

let SQL: any;
let db: any;

export const initDB = async () => {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
  }
  
  if (!db) {
    db = new SQL.Database();
    
    // Initialize database tables
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // Seed initial data if table is empty
    const result = db.exec('SELECT COUNT(*) FROM products');
    if (result[0].values[0][0] === 0) {
      const initialProducts = [
        ['Coffee', 3.50, 100],
        ['Tea', 2.50, 100],
        ['Sandwich', 6.99, 50],
        ['Cake', 4.99, 30],
        ['Cookie', 1.99, 200]
      ];

      const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
      initialProducts.forEach(([name, price, stock]) => {
        stmt.run([name, price, stock]);
      });
      stmt.free();
    }
  }

  return db;
};

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setIsReady(true));
  }, []);

  return isReady;
};

export const getProducts = () => {
  if (!db) return [];
  const result = db.exec('SELECT * FROM products WHERE stock > 0');
  if (result.length === 0) return [];
  
  return result[0].values.map((row: any[]) => ({
    id: row[0],
    name: row[1],
    price: Number(row[2]),
    stock: Number(row[3]),
    created_at: row[4]
  }));
};

export const addSale = (total: number, items: Array<{productId: number, quantity: number, price: number}>) => {
  if (!db) throw new Error('Database not initialized');
  if (!items.length) throw new Error('No items in sale');
  if (total <= 0) throw new Error('Invalid total amount');

  try {
    db.run('BEGIN TRANSACTION');

    // Validate all items before processing
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        throw new Error('Invalid item data');
      }

      const stockStmt = db.prepare('SELECT stock FROM products WHERE id = ? AND stock >= ?');
      const stockResult = stockStmt.get([item.productId, item.quantity]);
      stockStmt.free();

      if (!stockResult) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Insert sale record
    const saleStmt = db.prepare('INSERT INTO sales (total) VALUES (?)');
    saleStmt.run([total]);
    const saleId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    saleStmt.free();

    // Insert sale items and update stock
    const insertItemStmt = db.prepare(
      'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    );
    const updateStockStmt = db.prepare(
      'UPDATE products SET stock = stock - ? WHERE id = ?'
    );

    for (const item of items) {
      insertItemStmt.run([saleId, item.productId, item.quantity, item.price]);
      updateStockStmt.run([item.quantity, item.productId]);
    }

    insertItemStmt.free();
    updateStockStmt.free();

    db.run('COMMIT');
    return saleId;
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
};

export const getDailySales = () => {
  if (!db) return [];
  
  const result = db.exec(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_transactions,
      ROUND(SUM(total), 2) as total_amount
    FROM sales
    WHERE DATE(created_at) = DATE('now')
    GROUP BY DATE(created_at)
  `);

  if (result.length === 0) return [];

  return result[0].values.map((row: any[]) => ({
    date: row[0],
    total_transactions: Number(row[1]),
    total_amount: Number(row[2])
  }));
};

export const getTransactions = () => {
  if (!db) return [];

  const result = db.exec(`
    SELECT 
      s.id,
      s.total,
      s.created_at,
      si.id as item_id,
      si.quantity,
      si.price,
      si.product_id,
      p.name as product_name
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.id
    ORDER BY s.created_at DESC
  `);

  if (result.length === 0) return [];

  const sales = new Map<number, Sale>();

  result[0].values.forEach((row: any[]) => {
    const saleId = row[0];
    
    if (!sales.has(saleId)) {
      sales.set(saleId, {
        id: saleId,
        total: Number(row[1]),
        created_at: row[2],
        items: []
      });
    }

    const sale = sales.get(saleId)!;
    
    sale.items.push({
      id: row[3],
      sale_id: saleId,
      product_id: row[6],
      product_name: row[7],
      quantity: Number(row[4]),
      price: Number(row[5])
    });
  });

  return Array.from(sales.values());
};