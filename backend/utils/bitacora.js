const db = require("../config/db");

const registrarBitacora = (usuario_id, accion) => {
  console.log("📝 Insertando en bitácora:", usuario_id, accion); // <-- DEBUG

  db.query(
    "INSERT INTO bitacora (usuario_id, accion, fecha) VALUES (?, ?, NOW())",
    [usuario_id, accion],
    (err) => {
      if (err) {
        console.error("❌ Error al registrar en bitácora:", err);
      } else {
        console.log("✅ Bitácora guardada");
      }
    }
  );
};

module.exports = { registrarBitacora };