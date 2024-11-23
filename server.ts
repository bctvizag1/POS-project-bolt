import express from 'express';
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const db = knex({
  client: 'mssql',
  connection: {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      enableArithAbort: true
    }
  }
});

// Initialize database tables
const initDB = async () => {
  await db.schema.createTableIfNotExists('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').notNullable();
    table.timestamp('created_at').defaultTo(db.fn.now());
  });

  await db.schema.createTableIfNotExists('sales', (table) => {
    table.increments('id').primary();
    table.decimal('total', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(db.fn.now());
  });

  await db.schema.createTableIfNotExists('sale_items', (table) => {
    table.increments('id').primary();
    table.integer('sale_id').references('id').inTable('sales');
    table.integer('product_id').references('id').inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('price', 10, 2).notNullable();
  });

  // Seed initial data if products table is empty
  const productCount = await db('products').count('id as count').first();
  if (productCount && productCount.count === 0) {
    await db('products').insert([
      { name: 'Coffee', price: 3.50, stock: 100 },
      { name: 'Tea', price: 2.50, stock: 100 },
      { name: 'Sandwich', price: 6.99, stock: 50 },
      { name: 'Cake', price: 4.99, stock: 30 },
      { name: 'Cookie', price: 1.99, stock: 200 }
    ]);
  }
};

initDB().catch(console.error);

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await db('products').where('stock', '>', 0);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/sales', async (req, res) => {
  const { total, items } = req.body;

  if (!items || !items.length || total <= 0) {
    return res.status(400).json({ error: 'Invalid sale data' });
  }

  try {
    await db.transaction(async (trx) => {
      // Validate all items before processing
      for (const item of items) {
        const product = await trx('products')
          .where('id', item.productId)
          .where('stock', '>=', item.quantity)
          .first();

        if (!product) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      // Insert sale record
      const [saleId] = await trx('sales').insert({ total });

      // Insert sale items and update stock
      for (const item of items) {
        await trx('sale_items').insert({
          sale_id: saleId,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        });

        await trx('products')
          .where('id', item.productId)
          .decrement('stock', item.quantity);
      }

      res.json({ saleId });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/daily-sales', async (req, res) => {
  try {
    const dailySales = await db('sales')
      .select(db.raw('CONVERT(date, created_at) as date'))
      .count('* as total_transactions')
      .sum('total as total_amount')
      .where(db.raw('CONVERT(date, created_at) = CONVERT(date, GETDATE())'))
      .groupBy(db.raw('CONVERT(date, created_at)'));

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db('sales')
      .select(
        'sales.id',
        'sales.total',
        'sales.created_at',
        'sale_items.id as item_id',
        'sale_items.quantity',
        'sale_items.price',
        'sale_items.product_id',
        'products.name as product_name'
      )
      .leftJoin('sale_items', 'sales.id', 'sale_items.sale_id')
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .orderBy('sales.created_at', 'desc');

    const formattedTransactions = transactions.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          total: row.total,
          created_at: row.created_at,
          items: []
        };
      }

      acc[row.id].items.push({
        id: row.item_id,
        sale_id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });

      return acc;
    }, {});

    res.json(Object.values(formattedTransactions));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default Component;