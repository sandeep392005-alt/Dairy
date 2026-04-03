const { Pool } = require('pg');

const hasConnectionString = Boolean(process.env.DATABASE_URL);
const connectionString = process.env.DATABASE_URL?.replace(/([?&])sslmode=require(&)?/i, '$1').replace(/[?&]$/, '');
const isProduction = process.env.NODE_ENV === 'production';
const hasSslModeRequire = /sslmode=require/i.test(connectionString || '');
const ssl = isProduction || hasSslModeRequire ? { rejectUnauthorized: false } : false;

if (!hasConnectionString) {
  console.warn(
    'DATABASE_URL is not set. Falling back to default PG environment variables.'
  );
}

const pool = hasConnectionString
  ? new Pool({
      connectionString,
      ssl,
    })
  : new Pool();

module.exports = pool;
