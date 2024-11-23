const {db} = require('../db');

const addSale = async (req, res) => {
  const { total, items } = req.body;
  // console.log(req.body);
  

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

       // Insert sale record and retrieve the inserted ID
       const saleId = await trx('sales').insert({ total }).returning('id');
      //  console.log('***', saleId);
       
       // Insert sale items and update stock
       for (const item of items) {
         await trx('sale_items').insert({
           sale_id: saleId[0].id, // Use the retrieved saleId
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        });

        // Decrease stock
        /*
        await trx('products')
           .where('id', item.productId)
           .decrement('stock', item.quantity);
        */

      }

      res.json({ saleId });
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: error.message });
  }
};

const getDailySales = async (req, res) => {
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
};

const getTransactions = async (req, res) => {
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
};

module.exports = {
  addSale,
  getDailySales,
  getTransactions
};