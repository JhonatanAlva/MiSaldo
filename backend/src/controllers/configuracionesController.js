const configuracionesService = require('../services/configuracionesService');

// ── Obtener configuración ─────────────────────────────────────
const getConfiguracion = async (req, res) => {
  try {
    const data = await configuracionesService.getConfiguracion(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ mensaje: 'Error al obtener configuración' });
  }
};

// ── Guardar configuración ─────────────────────────────────────
const guardarConfiguracion = async (req, res) => {
  try {
    await configuracionesService.guardarConfiguracion(req.usuario.id, req.body);
    res.json({ mensaje: 'Configuración actualizada correctamente' });
  } catch (err) {
    console.error('Error al guardar configuración:', err);
    res.status(500).json({ mensaje: 'Error al guardar configuración' });
  }
};

// ── Actualizar perfil ─────────────────────────────────────────
const actualizarPerfil = async (req, res) => {
  try {
    const data = await configuracionesService.actualizarPerfil(req.usuario.id, req.body);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.json({ mensaje: 'Perfil actualizado correctamente', usuario: data.usuario });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
};

// ── Cambiar contraseña ────────────────────────────────────────
const cambiarPassword = async (req, res) => {
  try {
    const data = await configuracionesService.cambiarPassword(req.usuario.id, req.body);
    if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ mensaje: 'Error al actualizar contraseña' });
  }
};

module.exports = {
  getConfiguracion,
  guardarConfiguracion,
  actualizarPerfil,
  cambiarPassword,
};