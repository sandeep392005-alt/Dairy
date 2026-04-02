const express = require('express');
const pool = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// POST /api/auth/login - sync Google user into customers table
router.post('/login', verifyToken, async (req, res) => {
  const { email, fullName, googleId } = req.authUser;

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id, full_name, email, google_id, auth_provider, phone_number, delivery_address
       FROM customers
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    let customer;

    if (existing.rows.length > 0) {
      const existingCustomer = existing.rows[0];
      const updated = await client.query(
        `UPDATE customers
         SET full_name = COALESCE($1, full_name),
             google_id = COALESCE($2, google_id),
             auth_provider = 'google'
         WHERE id = $3
         RETURNING id, full_name, email, google_id, auth_provider, phone_number, delivery_address`,
        [fullName || null, googleId, existingCustomer.id]
      );
      customer = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO customers (full_name, email, google_id, auth_provider)
         VALUES ($1, $2, $3, 'google')
         RETURNING id, full_name, email, google_id, auth_provider, phone_number, delivery_address`,
        [fullName || 'Google User', email, googleId]
      );
      customer = inserted.rows[0];
    }

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Customer synced successfully.',
      customer,
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    return res.status(500).json({
      error: 'Failed to sync authenticated customer.',
      details: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
