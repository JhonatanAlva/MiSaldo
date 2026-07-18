const db     = require('../config/db');
const jwt    = require('jsonwebtoken');
const logger = require('../utils/logger');

// Cache en memoria — evita una query a la DB en cada request
let cache = { activo: false, ts: 0 };
const TTL = 30_000; // 30 segundos

async function verificarMantenimiento(req, res, next) {
  // Refrescar cache si expiró
  const ahora = Date.now();
  if (ahora - cache.ts > TTL) {
    try {
      const { rows } = await db.query(
        "SELECT valor FROM configuracion_sistema WHERE clave = 'modo_mantenimiento'"
      );
      cache.activo = rows[0]?.valor === 'true';
      cache.ts     = ahora;
    } catch (err) {
      logger.warn({ err }, 'No se pudo verificar modo mantenimiento — permitiendo acceso');
      return next();
    }
  }

  if (!cache.activo) return next();

  // Extraer token para saber si es admin
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token && req.cookies?.token) token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.rol_id === 1) return next(); // Admins pasan siempre
    } catch { /* token inválido → bloquear */ }
  }

  return res.status(503).json({
    mensaje: 'El sistema está en mantenimiento. Intenta de nuevo más tarde.',
    mantenimiento: true,
  });
}

// Invalida el cache inmediatamente (llamar después de guardar config)
function invalidarCacheMantenimiento() {
  cache.ts = 0;
}

module.exports = { verificarMantenimiento, invalidarCacheMantenimiento };
