const authService = require("../services/authService");
const { FRONTEND_URL } = require("../utils/urls");

// Helper para no repetir lógica
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction, // en local false
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".misaldo.lat" : undefined,
    maxAge: 2 * 60 * 60 * 1000,
  };
};

// ── Google callback ───────────────────────────────────────────
const googleCallback = async (req, res) => {
  if (!req.user.activo) {
    return res.redirect(`${FRONTEND_URL}/login?error=cuenta_inactiva`);
  }

  const { token } = await authService.googleCallback(req.user);

  return res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
};

// ── Obtener usuario actual ────────────────────────────────────
const getUsuario = async (req, res) => {
  try {
    const data = await authService.getUsuario(req.usuario.id);
    if (data.error)
      return res.status(data.error).json({ mensaje: data.mensaje });

    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const data = await authService.login(correo, contrasena);

    if (data.error)
      return res.status(data.error).json({ mensaje: data.mensaje });

    const isProduction = process.env.NODE_ENV === "production";

    //limpiar cualquier sesión anterior
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? ".misaldo.lat" : undefined,
    });

    // crear nueva sesión
    res.cookie("token", data.token, getCookieOptions());

    res.json({
      mensaje: "Inicio de sesión exitoso",
      usuario: data.usuario,
    });

  } catch (err) {
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// ── Logout ────────────────────────────────────────────────────
const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? ".misaldo.lat" : undefined,
    });

    res.status(200).json({ mensaje: "Sesión cerrada" });
  });
};

// ── Confirmar cuenta ──────────────────────────────────────────
const confirmarCuenta = async (req, res) => {
  try {
    const data = await authService.confirmarCuenta(req.params.token);
    if (data.error) return res.status(data.error).send(data.mensaje);

    res.redirect(`${FRONTEND_URL}/login?confirmado=1`);
  } catch (err) {
    res.status(500).send("Error al confirmar cuenta");
  }
};

// ── Registro ──────────────────────────────────────────────────
const registro = async (req, res) => {
  try {
    const data = await authService.registro(req.body);
    if (data.error)
      return res.status(data.error).json({ mensaje: data.mensaje });

    res.status(201).json({ mensaje: data.mensaje });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al procesar el registro" });
  }
};

// ── Listar usuarios (admin) ───────────────────────────────────
const listarUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol_id !== 1) {
      return res.status(403).json({ mensaje: "Acceso no autorizado" });
    }

    const usuarios = await authService.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
};

// ── Solicitar recuperación ─────────────────────────────────────
const solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ mensaje: "El correo es obligatorio" });
 
    const data = await authService.solicitarRecuperacion(correo);
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
};
 
// ── Validar token (para mostrar el form solo si es válido) ────
const validarTokenRecuperacion = async (req, res) => {
  try {
    const data = await authService.validarTokenRecuperacion(req.params.token);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al validar el token" });
  }
};
 
// ── Restablecer contraseña ─────────────────────────────────────
const restablecerPassword = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;
    if (!token || !nuevaContrasena) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
    }
 
    const data = await authService.restablecerPassword(token, nuevaContrasena);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.json({ mensaje: data.mensaje });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al restablecer la contraseña" });
  }
};

module.exports = {
  googleCallback,
  getUsuario,
  login,
  logout,
  confirmarCuenta,
  registro,
  listarUsuarios,
  solicitarRecuperacion,
  validarTokenRecuperacion,
  restablecerPassword,
};