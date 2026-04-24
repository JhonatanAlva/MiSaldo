const db     = require('../config/db');
const bcrypt = require('bcrypt');

const FORMATOS_PERMITIDOS = new Set(['pdf', 'excel', 'html']);

// ── Obtener configuración ─────────────────────────────────────
const getConfiguracion = async (usuarioId) => {
  const result = await db.query(
    `SELECT notif_email, notif_push, notif_weekly, notif_monthly, notif_tips, formato
     FROM configuraciones_usuario WHERE usuario_id = $1`,
    [usuarioId]
  );

  if (result.rows.length === 0) {
    return {
      notificaciones: { email: true, push: true, weekly: true, monthly: true, tips: false },
      formato: 'pdf',
    };
  }

  const r = result.rows[0];
  return {
    notificaciones: {
      email:   !!r.notif_email,
      push:    !!r.notif_push,
      weekly:  !!r.notif_weekly,
      monthly: !!r.notif_monthly,
      tips:    !!r.notif_tips,
    },
    formato: r.formato || 'pdf',
  };
};

// ── Guardar configuración ─────────────────────────────────────
// ON DUPLICATE KEY UPDATE de MySQL → INSERT ... ON CONFLICT en PostgreSQL
const guardarConfiguracion = async (usuarioId, { notificaciones = {}, formato = 'pdf' }) => {
  const finalFormato = FORMATOS_PERMITIDOS.has((formato || '').toLowerCase())
    ? formato.toLowerCase()
    : 'pdf';

  const email   = !!notificaciones.email;
  const push    = !!notificaciones.push;
  const weekly  = !!notificaciones.weekly;
  const monthly = !!notificaciones.monthly;
  const tips    = !!notificaciones.tips;

  await db.query(
    `INSERT INTO configuraciones_usuario
       (usuario_id, notif_email, notif_push, notif_weekly, notif_monthly, notif_tips, formato)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (usuario_id) DO UPDATE SET
       notif_email   = EXCLUDED.notif_email,
       notif_push    = EXCLUDED.notif_push,
       notif_weekly  = EXCLUDED.notif_weekly,
       notif_monthly = EXCLUDED.notif_monthly,
       notif_tips    = EXCLUDED.notif_tips,
       formato       = EXCLUDED.formato`,
    [usuarioId, email, push, weekly, monthly, tips, finalFormato]
  );
};

// ── Actualizar perfil del usuario ─────────────────────────────
const actualizarPerfil = async (usuarioId, { nombres, apellidos, celular }) => {
  // Mantener celular actual si viene vacío
  const actual = await db.query(
    'SELECT celular FROM usuarios WHERE id = $1',
    [usuarioId]
  );

  if (actual.rows.length === 0) return { error: 404, mensaje: 'Usuario no encontrado' };

  const nuevoCelular = (!celular || celular === '')
    ? actual.rows[0].celular
    : celular;

  await db.query(
    'UPDATE usuarios SET nombres = $1, apellidos = $2, celular = $3 WHERE id = $4',
    [nombres, apellidos, nuevoCelular, usuarioId]
  );

  const updated = await db.query(
    'SELECT id, nombres, apellidos, correo, celular FROM usuarios WHERE id = $1',
    [usuarioId]
  );

  return { usuario: updated.rows[0] };
};

// ── Cambiar contraseña ────────────────────────────────────────
const cambiarPassword = async (usuarioId, { actual, nueva }) => {
  const result = await db.query(
    'SELECT contrasena FROM usuarios WHERE id = $1',
    [usuarioId]
  );

  if (result.rows.length === 0) return { error: 400, mensaje: 'Usuario no encontrado' };

  const coincide = await bcrypt.compare(actual, result.rows[0].contrasena);
  if (!coincide) return { error: 401, mensaje: 'Contraseña actual incorrecta' };

  const hash = await bcrypt.hash(nueva, 10);
  await db.query('UPDATE usuarios SET contrasena = $1 WHERE id = $2', [hash, usuarioId]);

  return { ok: true };
};

module.exports = {
  getConfiguracion,
  guardarConfiguracion,
  actualizarPerfil,
  cambiarPassword,
};