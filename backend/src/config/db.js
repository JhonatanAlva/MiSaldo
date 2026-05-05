const { Pool } = require('pg');
require('dotenv').config();

console.log(" Inicializando conexión a DB...");

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: isProduction
    ? process.env.DATABASE_URL
    : undefined,

  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,

  ...(isProduction
    ? {}
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
      }),
});

// TEST DE CONEXIÓN
pool.connect()
  .then(() => console.log(' Conectado a PostgreSQL'))
  .catch(err => console.error(' Error DB:', err.message));

module.exports = pool;