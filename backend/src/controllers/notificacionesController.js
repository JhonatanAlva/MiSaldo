const notificacionesService = require('../services/notificacionesService');
const logger = require('../utils/logger');

// ── Existentes ────────────────────────────────────────────────
const getEstadoPresupuesto = async (req, res) => {
  try {
    const data = await notificacionesService.getEstadoPresupuesto(req.usuario.id);
    res.json(data);
  } catch (err) {
    logger.error({ err }, 'Error al obtener estado de presupuesto');
    res.status(500).json({ mensaje: 'Error al obtener estado de presupuesto' });
  }
};

const getTip = async (req, res) => {
  try {
    const data = await notificacionesService.getTip(req.usuario.id);
    res.json(data);
  } catch (err) {
    logger.error({ err }, 'Error al obtener tip');
    res.status(500).json({ mensaje: 'Error al obtener tip' });
  }
};

// ── Nuevas — notificaciones en app ────────────────────────────
const getNotificaciones = async (req, res) => {
  try {
    const data = await notificacionesService.getNotificaciones(req.usuario.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
  }
};

const marcarLeida = async (req, res) => {
  try {
    await notificacionesService.marcarLeida(req.params.id, req.usuario.id);
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al marcar notificación' });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await notificacionesService.marcarTodasLeidas(req.usuario.id);
    res.json({ mensaje: 'Todas marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al marcar notificaciones' });
  }
};

const contarNoLeidas = async (req, res) => {
  try {
    const count = await notificacionesService.contarNoLeidas(req.usuario.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al contar notificaciones' });
  }
};

module.exports = {
  // existentes
  getEstadoPresupuesto,
  getTip,
  // nuevas
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};