const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const ALLOWED_STATUSES = new Set(['Pending', 'Out for Delivery', 'Delivered']);

// GET /api/admin/orders - full order list with customer + items
router.get('/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         o.id AS order_id,
         o.total_amount,
         o.order_status,
         o.created_at,
         c.id AS customer_id,
         c.full_name,
         c.phone_number,
         c.delivery_address,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'product_id', p.id,
               'product_name', p.name,
               'quantity', oi.quantity,
               'price_at_time_of_order', oi.price_at_time_of_order,
               'line_total', (oi.quantity * oi.price_at_time_of_order)
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       GROUP BY o.id, c.id
       ORDER BY o.created_at DESC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin orders.' });
  }
});

// PATCH /api/admin/orders/:id/status - update order status
router.patch('/orders/:id/status', async (req, res) => {
  const orderId = Number(req.params.id);
  const { orderStatus } = req.body;

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'Invalid order id.' });
  }

  if (!ALLOWED_STATUSES.has(orderStatus)) {
    return res.status(400).json({
      error: 'Invalid order status. Use Pending, Out for Delivery, or Delivered.',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET order_status = $1
       WHERE id = $2
       RETURNING id, customer_id, total_amount, order_status, created_at`,
      [orderStatus, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.status(200).json({
      message: 'Order status updated successfully.',
      order: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;
