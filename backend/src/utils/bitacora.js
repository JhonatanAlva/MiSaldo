const db = require('../config/db');
const logger = require('./logger');

const registrarBitacora = async (usuario_id, accion) => {
  try {
    await db.query(
      'INSERT INTO bitacora (usuario_id, accion, fecha) VALUES ($1, $2, NOW())',
      [usuario_id, accion]
    );
  } catch (err) {
    logger.error({ err }, 'Error al registrar en bitácora');
  }
};

module.exports = { registrarBitacora };