const knex = require('knex');
const dotenv = require('dotenv');

dotenv.config();

const db = knex({
  client: 'mssql',
  connection: {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,      
      enableArithAbort: true
    }
  },
  pool: {
    min: 2,
    max: 10,
  },
});

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

const checkDatabaseConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  db,
  initDB,
  checkDatabaseConnection
};