const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const ssl = process.env.DB_SSL === "true";

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

// Agregar SSL solo si es necesario
if (ssl) {
  connectionConfig.ssl = {
    ca: fs.readFileSync("./ca-certificate.crt"), // Asegúrate que esté en la raíz del proyecto
  };
}

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL con mysql2");
});

module.exports = connection;
