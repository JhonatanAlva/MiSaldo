const db      = require('../config/db');
const { sendEmail } = require('../utils/mailer');
const { generarEmailNuevoUsuario, generarEmailErrorCritico } = require('../utils/emailTemplates');
const logger  = require('../utils/logger');

const CONFIG_TTL = 30_000;
let _cache = { ts: 0, notif_nuevo_usuario: true, notif_errores: true };

const refreshConfig = async () => {
  const ahora = Date.now();
  if (ahora - _cache.ts > CONFIG_TTL) {
    try {
      const { rows } = await db.query(
        "SELECT clave, valor FROM configuracion_sistema WHERE clave IN ('notif_nuevo_usuario','notif_errores')"
      );
      for (const r of rows) _cache[r.clave] = r.valor === 'true';
      _cache.ts = ahora;
    } catch { /* mantener valores anteriores */ }
  }
};

const getAdminEmails = async () => {
  const { rows } = await db.query(
    "SELECT correo FROM usuarios WHERE rol_id = 1 AND activo = TRUE"
  );
  return rows.map(r => r.correo);
};

// ── Notificar nuevo registro ───────────────────────────────────
const notificarNuevoUsuario = async (nuevoUsuario) => {
  try {
    await refreshConfig();
    if (!_cache.notif_nuevo_usuario) return;

    const admins = await getAdminEmails();
    if (!admins.length) return;

    const html = generarEmailNuevoUsuario(nuevoUsuario);
    await Promise.all(
      admins.map(correo =>
        sendEmail(correo, 'Nuevo usuario registrado — SaldoGt', html)
      )
    );
  } catch (err) {
    logger.warn({ err }, 'No se pudo enviar notif de nuevo usuario');
  }
};

// ── Notificar error crítico (con cooldown de 5 min) ───────────
let _ultimoError = 0;
const ERROR_COOLDOWN = 5 * 60 * 1000;

const notificarErrorCritico = async (mensaje, ruta) => {
  try {
    const ahora = Date.now();
    if (ahora - _ultimoError < ERROR_COOLDOWN) return; // evitar spam

    await refreshConfig();
    if (!_cache.notif_errores) return;

    const admins = await getAdminEmails();
    if (!admins.length) return;

    _ultimoError = ahora;
    const html   = generarEmailErrorCritico(mensaje, ruta);
    await Promise.all(
      admins.map(correo =>
        sendEmail(correo, 'Error crítico en el servidor — SaldoGt', html)
      )
    );
  } catch (err) {
    logger.warn({ err }, 'No se pudo enviar notif de error crítico');
  }
};

module.exports = { notificarNuevoUsuario, notificarErrorCritico };
