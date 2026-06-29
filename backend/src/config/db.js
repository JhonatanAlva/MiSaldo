const { Pool } = require('pg');
require('dotenv').config();

console.log("Inicializando conexión a DB...");

const isProduction = process.env.NODE_ENV === 'production';

const sslConfig = {
  rejectUnauthorized: true,
  ...(process.env.DB_SSL_CERT && { ca: process.env.DB_SSL_CERT }),
};

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig,
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
      }
);

// TEST DE CONEXIÓN
pool.query('SELECT 1')
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error(' Error DB:', err));

module.exports = pool;