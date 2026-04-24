const notificacionesService = require("../services/notificacionesService");

async function getEstadoPresupuesto(req, res) {
  try {
    const resultado = await notificacionesService.obtenerEstadoPresupuesto(
      req.usuario.id
    );
    return res.json(resultado);
  } catch (error) {
    console.error("Error en getEstadoPresupuesto:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getTip(req, res) {
  try {
    const resultado = await notificacionesService.obtenerTip(req.usuario.id);
    return res.json(resultado);
  } catch (error) {
    console.error("Error en getTip:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { getEstadoPresupuesto, getTip };