const db = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/mailer");
const { generarToken } = require("../utils/jwt");
const { registrarBitacora } = require("../utils/bitacora");
const { BACKEND_URL, FRONTEND_URL } = require("../utils/urls");
const { generarEmailConfirmacion } = require("../utils/emailTemplates");

// ── Login ─────────────────────────────────────────────────────
const login = async (correo, contrasena) => {
  const result = await db.query("SELECT * FROM usuarios WHERE correo = $1", [
    correo,
  ]);

  if (result.rows.length === 0) {
    return { error: 401, mensaje: "Datos incorrectos" };
  }

  const usuario = result.rows[0];

  if (!usuario.confirmado) {
    return { error: 403, mensaje: "Debes confirmar tu cuenta desde el correo" };
  }

  if (!usuario.activo) {
    return {
      error: 403,
      mensaje: "Tu cuenta está desactivada. Contacta al administrador.",
    };
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!coincide) {
    return { error: 401, mensaje: "Datos incorrectos" };
  }

  await registrarBitacora(usuario.id, "Inicio de sesión");
  const token = generarToken(usuario);

  return {
    token,
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

module.exports = {
  login,
  registro,
  confirmarCuenta,
  getUsuario,
  listarUsuarios,
  googleCallback,
};
