const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// POST /api/orders - transactional checkout flow
router.post('/', async (req, res) => {
  const { customer, cartItems } = req.body;

  if (!customer || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Customer and cart items are required.' });
  }

  const { fullName, phoneNumber, deliveryAddress } = customer;

  if (!fullName || !phoneNumber || !deliveryAddress) {
    return res.status(400).json({
      error: 'fullName, phoneNumber, and deliveryAddress are required.',
    });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1) Find or create customer by phone number
    const existingCustomerResult = await client.query(
      'SELECT id FROM customers WHERE phone_number = $1 LIMIT 1',
      [phoneNumber]
    );

    let customerId;

    if (existingCustomerResult.rows.length > 0) {
      customerId = existingCustomerResult.rows[0].id;

      await client.query(
        `UPDATE customers
         SET full_name = $1,
             delivery_address = $2
         WHERE id = $3`,
        [fullName, deliveryAddress, customerId]
      );
    } else {
      const insertCustomerResult = await client.query(
        `INSERT INTO customers (full_name, phone_number, delivery_address)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [fullName, phoneNumber, deliveryAddress]
      );

      customerId = insertCustomerResult.rows[0].id;
    }

    // 2) Validate products and compute total from DB prices
    const productIds = [
      ...new Set(
        cartItems.map((item) => {
          const productId = Number(item.productId);
          if (!Number.isInteger(productId) || productId <= 0) {
            throw new Error('Invalid product id in cart items.');
          }
          return productId;
        })
      ),
    ];

    const productsResult = await client.query(
      `SELECT id, price, in_stock
       FROM products
       WHERE id = ANY($1::bigint[])`,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length) {
      throw new Error('Some products in cart are invalid.');
    }

    const productsMap = new Map();
    for (const product of productsResult.rows) {
      productsMap.set(Number(product.id), product);
    }

    let totalAmount = 0;

    for (const item of cartItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity in cart items.');
      }

      const product = productsMap.get(Number(item.productId));
      if (!product || !product.in_stock) {
        throw new Error('One or more selected products are out of stock.');
      }

      totalAmount += Number(product.price) * quantity;
    }

    // 3) Create order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, total_amount, order_status)
       VALUES ($1, $2, 'Pending')
       RETURNING id, customer_id, total_amount, order_status, created_at`,
      [customerId, totalAmount]
    );

    const order = orderResult.rows[0];

    // 4) Insert order items
    for (const item of cartItems) {
      const product = productsMap.get(Number(item.productId));
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time_of_order)
         VALUES ($1, $2, $3, $4)`,
        [order.id, Number(item.productId), Number(item.quantity), product.price]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully.',
      order,
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    const statusCode =
      error.message === 'Some products in cart are invalid.' ||
      error.message === 'Invalid quantity in cart items.' ||
      error.message === 'Invalid product id in cart items.' ||
      error.message === 'One or more selected products are out of stock.'
        ? 400
        : 500;

    return res.status(statusCode).json({
      error: error.message || 'Order creation failed.',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
