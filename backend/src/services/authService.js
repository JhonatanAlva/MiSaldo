const db = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { createHash } = require("crypto");

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const { sendEmail } = require("../utils/mailer");
const { generarToken } = require("../utils/jwt");
const { registrarBitacora } = require("../utils/bitacora");
const { BACKEND_URL, FRONTEND_URL } = require("../utils/urls");
const { generarEmailConfirmacion } = require("../utils/emailTemplates");
const { generarEmailRecuperacion } = require("../utils/emailTemplates");
const { notificarNuevoUsuario } = require('./notifAdminService');

// ── Control de intentos fallidos (en memoria) ─────────────────
// { [correo]: { count: number, lockedUntil: Date | null } }
const _intentos = new Map();
const LOCK_MS   = 15 * 60 * 1000; // 15 minutos de bloqueo

let _configIntentos   = { limite: 5,   ts: 0 };
let _configExpiracion = { valor: '2h', ts: 0 };
const CONFIG_TTL      = 30_000; // refrescar cada 30s

const getLimiteIntentos = async () => {
  const ahora = Date.now();
  if (ahora - _configIntentos.ts > CONFIG_TTL) {
    try {
      const { rows } = await db.query(
        "SELECT valor FROM configuracion_sistema WHERE clave = 'intentos_login'"
      );
      _configIntentos.limite = parseInt(rows[0]?.valor, 10) || 5;
      _configIntentos.ts     = ahora;
    } catch { /* mantener valor anterior si falla */ }
  }
  return _configIntentos.limite;
};

// "30m"→1800000, "1h"→3600000, "2h"→7200000, "8h"→28800000
const expiracionAMs = (str) => {
  const n = parseInt(str, 10);
  if (str.endsWith('m')) return n * 60 * 1000;
  if (str.endsWith('h')) return n * 60 * 60 * 1000;
  return 2 * 60 * 60 * 1000; // default 2h
};

const getExpiracionSesion = async () => {
  const ahora = Date.now();
  if (ahora - _configExpiracion.ts > CONFIG_TTL) {
    try {
      const { rows } = await db.query(
        "SELECT valor FROM configuracion_sistema WHERE clave = 'expiracion_sesion'"
      );
      _configExpiracion.valor = rows[0]?.valor || '2h';
      _configExpiracion.ts    = ahora;
    } catch { /* mantener valor anterior si falla */ }
  }
  return _configExpiracion.valor;
};

const registrarFallo  = (correo, limite) => {
  const est   = _intentos.get(correo) || { count: 0, lockedUntil: null };
  const count = est.count + 1;
  const bloqueado = count >= limite
    ? new Date(Date.now() + LOCK_MS)
    : null;
  _intentos.set(correo, { count, lockedUntil: bloqueado });
  return { count, bloqueado, restantes: Math.max(0, limite - count) };
};

const limpiarIntentos = (correo) => _intentos.delete(correo);

// ── Login ─────────────────────────────────────────────────────
const login = async (correo, contrasena) => {
  const limite = await getLimiteIntentos();
  const est    = _intentos.get(correo) || { count: 0, lockedUntil: null };

  // Verificar si está bloqueado
  if (est.lockedUntil && new Date() < est.lockedUntil) {
    const mins = Math.ceil((est.lockedUntil - Date.now()) / 60000);
    return {
      error: 429,
      mensaje: `Cuenta bloqueada por demasiados intentos. Intenta de nuevo en ${mins} minuto${mins !== 1 ? "s" : ""}.`,
    };
  }

  const result = await db.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

  if (result.rows.length === 0) {
    // No revelamos si el correo existe, pero tampoco rastreamos correos inexistentes
    return { error: 401, mensaje: "Datos incorrectos" };
  }

  const usuario = result.rows[0];

  if (!usuario.confirmado) {
    return { error: 403, mensaje: "Debes confirmar tu cuenta desde el correo" };
  }

  if (!usuario.activo) {
    return { error: 403, mensaje: "Tu cuenta está desactivada. Contacta al administrador." };
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!coincide) {
    const { restantes, bloqueado } = registrarFallo(correo, limite);
    if (bloqueado) {
      return {
        error: 429,
        mensaje: `Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.`,
      };
    }
    return {
      error: 401,
      mensaje: `Datos incorrectos. Te quedan ${restantes} intento${restantes !== 1 ? "s" : ""}.`,
    };
  }

  // Login exitoso → limpiar intentos
  limpiarIntentos(correo);

  const expiracion = await getExpiracionSesion();

  await registrarBitacora(usuario.id, "Inicio de sesión");
  const token = generarToken(usuario, expiracion);

  return {
    token,
    cookieMaxAge: expiracionAMs(expiracion),
    usuario: {
      nombres: usuario.nombres,
      correo: usuario.correo,
      rol: usuario.rol_id === 1 ? "Administrador" : "Usuario",
    },
  };
};

// ── Registro ──────────────────────────────────────────────────
const registro = async ({
  nombres,
  apellidos,
  correo,
  celular,
  contrasena,
}) => {
  const existe = await db.query("SELECT id FROM usuarios WHERE correo = $1", [
    correo,
  ]);

  if (existe.rows.length > 0) {
    return { error: 400, mensaje: "El correo ya está registrado" };
  }

  const hash = await bcrypt.hash(contrasena, 10);
  const token = uuidv4();

  await db.query(
    `INSERT INTO usuarios (nombres, apellidos, correo, celular, contrasena, rol_id, token_confirmacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [nombres, apellidos, correo, celular, hash, 2, token],
  );

  const url = `${BACKEND_URL}/auth/confirmar/${token}`;
  const html = generarEmailConfirmacion(nombres, url);

  await sendEmail(correo, "Confirma tu cuenta en SaldoGt", html);

  // Notificar al admin (sin bloquear el registro si falla)
  notificarNuevoUsuario({ nombres, apellidos, correo }).catch(() => {});

  return {
    mensaje: "Registro exitoso. Revisa tu correo para confirmar tu cuenta.",
  };
};

// ── Confirmar cuenta ──────────────────────────────────────────
const confirmarCuenta = async (token) => {
  const result = await db.query(
    "SELECT id FROM usuarios WHERE token_confirmacion = $1",
    [token],
  );

  if (result.rows.length === 0) {
    return { error: 400, mensaje: "Token inválido o expirado" };
  }

  const id = result.rows[0].id;
  await db.query(
    "UPDATE usuarios SET confirmado = TRUE, token_confirmacion = NULL WHERE id = $1",
    [id],
  );

  return { ok: true };
};

// ── Obtener usuario actual ────────────────────────────────────
const getUsuario = async (userId) => {
  const result = await db.query(
    "SELECT id, nombres, apellidos, correo, celular, rol_id FROM usuarios WHERE id = $1",
    [userId],
  );

  if (result.rows.length === 0) {
    return { error: 400, mensaje: "Usuario no encontrado" };
  }

  const u = result.rows[0];
  return {
    id: u.id,
    nombres: u.nombres,
    apellidos: u.apellidos,
    correo: u.correo,
    celular: u.celular,
    rol: u.rol_id === 1 ? "Administrador" : "Usuario",
  };
};

// ── Listar usuarios (admin) ───────────────────────────────────
const listarUsuarios = async () => {
  const result = await db.query(
    "SELECT id, nombres, apellidos, correo, celular, rol_id, confirmado FROM usuarios",
  );
  return result.rows;
};

// ── Google callback ───────────────────────────────────────────
const googleCallback = async (usuario) => {
  await registrarBitacora(usuario.id, "Inicio de sesión con Google");

  const token = generarToken(usuario);

  const destino =
    usuario.rol_id === 1 ? `${FRONTEND_URL}/admin` : `${FRONTEND_URL}/usuario`;

  return { token, destino };
};

// ── Solicitar recuperación de contraseña ───────────────────────
const solicitarRecuperacion = async (correo) => {
  const result = await db.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
 
  // Por seguridad, siempre respondemos lo mismo exista o no el correo
  // (evita que alguien pueda enumerar correos registrados)
  if (result.rows.length === 0) {
    return { mensaje: "Si el correo existe, recibirás un enlace para recuperar tu contraseña." };
  }
 
  const usuario = result.rows[0];
  const token   = uuidv4();
  const expira  = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  const url  = `${FRONTEND_URL}/restablecer/${token}`;
  const html = generarEmailRecuperacion(usuario.nombres, url);

  // Enviar primero: si falla, la BD no se toca y no queda estado inconsistente
  await sendEmail(correo, "Recupera tu contraseña en SaldoGt", html);

  await db.query(
    "UPDATE usuarios SET token_recuperacion = $1, token_recuperacion_expira = $2 WHERE id = $3",
    [hashToken(token), expira, usuario.id]
  );

  return { mensaje: "Si el correo existe, recibirás un enlace para recuperar tu contraseña." };
};
 
// ── Validar token de recuperación ──────────────────────────────
const validarTokenRecuperacion = async (token) => {
  const result = await db.query(
    "SELECT id, token_recuperacion_expira FROM usuarios WHERE token_recuperacion = $1",
    [hashToken(token)]
  );
 
  if (result.rows.length === 0) {
    return { error: 400, mensaje: "Token inválido o expirado." };
  }
 
  const usuario = result.rows[0];
  if (new Date(usuario.token_recuperacion_expira) < new Date()) {
    return { error: 400, mensaje: "El enlace ha expirado. Solicita uno nuevo." };
  }
 
  return { ok: true };
};
 
// ── Restablecer contraseña con token ───────────────────────────
const restablecerPassword = async (token, nuevaContrasena) => {
  const tokenHash = hashToken(token);
  const result = await db.query(
    "SELECT id, token_recuperacion_expira FROM usuarios WHERE token_recuperacion = $1",
    [tokenHash]
  );
 
  if (result.rows.length === 0) {
    return { error: 400, mensaje: "Token inválido o expirado." };
  }
 
  const usuario = result.rows[0];
  if (new Date(usuario.token_recuperacion_expira) < new Date()) {
    return { error: 400, mensaje: "El enlace ha expirado. Solicita uno nuevo." };
  }
 
  const hash = await bcrypt.hash(nuevaContrasena, 10);
  const update = await db.query(
    "UPDATE usuarios SET contrasena = $1, token_recuperacion = NULL, token_recuperacion_expira = NULL WHERE id = $2 AND token_recuperacion = $3",
    [hash, usuario.id, tokenHash]
  );

  if (update.rowCount === 0) {
    return { error: 400, mensaje: "Token inválido o expirado." };
  }

  return { ok: true, mensaje: "Contraseña actualizada correctamente." };
};


module.exports = {
  login,
  registro,
  confirmarCuenta,
  getUsuario,
  listarUsuarios,
  googleCallback,
  solicitarRecuperacion,
  validarTokenRecuperacion,
  restablecerPassword
};
