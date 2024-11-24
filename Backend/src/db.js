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
  // Create users table if it doesn't exist
  const hasUsersTable = await db.schema.hasTable('users');
  if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.boolean('is_admin').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // Create products table if it doesn't exist
  const hasProductsTable = await db.schema.hasTable('products');
  if (!hasProductsTable) {
    await db.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('stock').notNullable();
      table.integer('last_modified_by').references('id').inTable('users');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }

  // Create sales table if it doesn't exist
  const hasSalesTable = await db.schema.hasTable('sales');
  if (!hasSalesTable) {
    await db.schema.createTable('sales', (table) => {
      table.increments('id').primary();
      table.decimal('total', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // Create sale_items table if it doesn't exist
  const hasSaleItemsTable = await db.schema.hasTable('sale_items');
  if (!hasSaleItemsTable) {
    await db.schema.createTable('sale_items', (table) => {
      table.increments('id').primary();
      table.integer('sale_id').references('id').inTable('sales');
      table.integer('product_id').references('id').inTable('products');
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
    });
  }

  // Seed initial data if products table is empty
  const productCount = await db('products').count('id as count').first();
  if (productCount && productCount.count === 0) {
    // Create default admin user if it doesn't exist
    const adminExists = await db('users').where({ username: 'admin' }).first();
    if (!adminExists) {
      const [adminUser] = await db('users').insert({
        username: 'admin',
        password: 'admin@123', // We'll update this with proper hashing
        is_admin: true
      }).returning('id');

      // Insert products with the admin user as last_modified_by
      await db('products').insert([
        { name: 'Coffee', price: 3.50, stock: 100, last_modified_by: adminUser.id },
        { name: 'Tea', price: 2.50, stock: 100, last_modified_by: adminUser.id },
        { name: 'Sandwich', price: 6.99, stock: 50, last_modified_by: adminUser.id },
        { name: 'Cake', price: 4.99, stock: 30, last_modified_by: adminUser.id },
        { name: 'Cookie', price: 1.99, stock: 200, last_modified_by: adminUser.id }
      ]);
    }
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