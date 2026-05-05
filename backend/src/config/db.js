const { Pool } = require('pg');
require('dotenv').config();

console.log("🚀 Inicializando conexión a DB...");

const isProduction = process.env.NODE_ENV === 'production';

const pool = isProduction
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    });

// 👇 PROBAMOS CONEXIÓN REAL
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error de conexión a PostgreSQL:', err.message));

module.exports = pool;