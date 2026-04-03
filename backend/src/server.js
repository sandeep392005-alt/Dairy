require('dotenv').config();

const cors = require('cors');
const express = require('express');
const pool = require('./config/db');

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/verifyToken');
const isAdmin = require('./middleware/isAdmin');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  // Centralized fallback error handler
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection established.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to PostgreSQL. Check DATABASE_URL and credentials.');
    console.error(error.message);
    process.exit(1);
  }
}

if (process.env.VERCEL !== '1') {
  startServer();
}
