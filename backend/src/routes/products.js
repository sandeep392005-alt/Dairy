const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/products - fetch all available products
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, price, unit, in_stock, image_url
       FROM products
       WHERE in_stock = TRUE
       ORDER BY id ASC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

module.exports = router;
