const express = require('express');
const pool = require('../config/db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// POST /api/auth/login - sync authenticated Supabase/Google user into customers table
router.post('/login', verifyToken, async (req, res) => {
  const { email, fullName, googleId, provider } = req.authUser;
  const authProvider = provider === 'google' ? 'google' : 'local';
  const fallbackFullName = email ? email.split('@')[0] : 'Customer';
  const resolvedFullName = fullName || fallbackFullName;

  if (!email) {
    return res.status(400).json({ error: 'Authenticated user email is required.' });
  }

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
             auth_provider = $3
         WHERE id = $4
         RETURNING id, full_name, email, google_id, auth_provider, phone_number, delivery_address`,
        [resolvedFullName || null, googleId || null, authProvider, existingCustomer.id]
      );
      customer = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO customers (full_name, email, google_id, auth_provider)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, google_id, auth_provider, phone_number, delivery_address`,
        [resolvedFullName, email, googleId || null, authProvider]
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

    const dbErrorCode = error.code || 'UNKNOWN';

    if (dbErrorCode === '42703') {
      return res.status(500).json({
        error: 'Failed to sync authenticated customer. Database schema is missing expected customer auth columns.',
        details: error.message,
        code: dbErrorCode,
      });
    }

    if (dbErrorCode === '23502') {
      return res.status(500).json({
        error: 'Failed to sync authenticated customer. Database migration is incomplete for customers auth fields.',
        details: error.message,
        code: dbErrorCode,
      });
    }

    return res.status(500).json({
      error: 'Failed to sync authenticated customer.',
      details: error.message,
      code: dbErrorCode,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
