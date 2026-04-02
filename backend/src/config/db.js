const { Pool } = require('pg');

const hasConnectionString = Boolean(process.env.DATABASE_URL);

if (!hasConnectionString) {
  console.warn(
    'DATABASE_URL is not set. Falling back to default PG environment variables.'
  );
}

const pool = hasConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : new Pool();

module.exports = pool;
