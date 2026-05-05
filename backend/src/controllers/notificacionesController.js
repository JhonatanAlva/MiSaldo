const notificacionesService = require('../services/notificacionesService');

const getEstadoPresupuesto = async (req, res) => {
  try {
    const data = await notificacionesService.getEstadoPresupuesto(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error('Error al obtener estado de presupuesto:', err);
    res.status(500).json({ mensaje: 'Error al obtener estado de presupuesto' });
  }
};

const getTip = async (req, res) => {
  try {
    const data = await notificacionesService.getTip(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error('Error al obtener tip:', err);
    res.status(500).json({ mensaje: 'Error al obtener tip' });
  }
};

module.exports = { getEstadoPresupuesto, getTip };