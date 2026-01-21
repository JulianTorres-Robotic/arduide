const mariadb = require('mariadb');

let pool = null;

const initializePool = async () => {
  if (pool) return pool;

  pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    // Avoid issues with BigInt
    bigIntAsNumber: true
  });

  // Test connection
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();

  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool() first.');
  }
  return pool;
};

const query = async (sql, params = []) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query(sql, params);
    return result;
  } finally {
    conn.release();
  }
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = {
  initializePool,
  getPool,
  query,
  closePool
};
