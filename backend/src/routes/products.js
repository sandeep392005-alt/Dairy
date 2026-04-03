const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/products - fetch all available products
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, price, unit, in_stock, image_url
       FROM public.products
       WHERE in_stock = TRUE
       ORDER BY id ASC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('GET /api/products failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });

    if (error.code === '42P01') {
      return res.status(500).json({
        error: 'Products table not found. Run backend/sql/supabase_full_schema.sql in Supabase SQL Editor.',
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch products.',
      code: error.code || 'UNKNOWN',
    });
  }
});

module.exports = router;
