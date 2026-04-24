const db = require('../config/db');

const registrarBitacora = async (usuario_id, accion) => {
  console.log('Insertando en bitácora:', usuario_id, accion);

  try {
    await db.query(
      'INSERT INTO bitacora (usuario_id, accion, fecha) VALUES ($1, $2, NOW())',
      [usuario_id, accion]
    );
    console.log('Bitácora guardada');
  } catch (err) {
    console.error('Error al registrar en bitácora:', err);
  }
};

module.exports = { registrarBitacora };