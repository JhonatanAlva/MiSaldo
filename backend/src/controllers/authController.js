const authService = require('../services/authService');

// ── Google callback ───────────────────────────────────────────
const googleCallback = async (req, res) => {
  if (!req.user.activo) {
    return res.redirect('http://localhost:5173/login?error=cuenta_inactiva');
  }

  const { token, destino } = await authService.googleCallback(req.user);

  res.cookie('token', token, {
    httpOnly: true,
    secure:   true,
    maxAge:   2 * 60 * 60 * 1000,
  });

  res.redirect(destino);
};

// ── Obtener usuario actual ────────────────────────────────────
const getUsuario = async (req, res) => {
  try {
    const data = await authService.getUsuario(req.usuario.id);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const data = await authService.login(correo, contrasena);

    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });

    const isProduction = process.env.NODE_ENV === 'production';

    res
      .cookie('token', data.token, {
        httpOnly: true,
        secure:   isProduction,
        sameSite: 'lax',
        maxAge:   2 * 60 * 60 * 1000,
      })
      .json({ mensaje: 'Inicio de sesión exitoso', usuario: data.usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// ── Logout ────────────────────────────────────────────────────
const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.clearCookie('connect.sid');
    res.clearCookie('token');
    res.status(200).json({ mensaje: 'Sesión cerrada' });
  });
};

// ── Confirmar cuenta ──────────────────────────────────────────
const confirmarCuenta = async (req, res) => {
  try {
    const data = await authService.confirmarCuenta(req.params.token);
    if (data.error) return res.status(data.error).send(data.mensaje);
    res.redirect('http://localhost:5173/login?confirmado=1');
  } catch (err) {
    res.status(500).send('Error al confirmar cuenta');
  }
};

// ── Registro ──────────────────────────────────────────────────
const registro = async (req, res) => {
  try {
    const data = await authService.registro(req.body);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.status(201).json({ mensaje: data.mensaje });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al procesar el registro' });
  }
};

// ── Listar usuarios (admin) ───────────────────────────────────
const listarUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol_id !== 1) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado' });
    }
    const usuarios = await authService.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
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
};