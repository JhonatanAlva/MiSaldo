const gastosFijosService = require('../services/gastosFijosService');
const notificacionesService = require('../services/notificacionesService');

// ─────────────────────────────────────────────
// Obtener gastos fijos
// ─────────────────────────────────────────────
const getGastosFijos = async (req, res) => {
  try {
    const data =
      await gastosFijosService.getGastosFijos(
        req.usuario.id
      );

    res.json(data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      mensaje: 'Error al obtener gastos fijos'
    });
  }
};

// ─────────────────────────────────────────────
// Crear gasto fijo
// ─────────────────────────────────────────────
const crearGastoFijo = async (req, res) => {
  try {

    const data =
      await gastosFijosService.crearGastoFijo(
        req.usuario.id,
        req.body
      );

    // ✅ Crear notificación
    await notificacionesService.crearNotificacion(
      req.usuario.id,
      `Se creó el gasto fijo "${data.nombre}".`
    );

    res.status(201).json(data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      mensaje: 'Error al crear gasto fijo'
    });
  }
};

// ─────────────────────────────────────────────
// Editar gasto fijo
// ─────────────────────────────────────────────
const editarGastoFijo = async (req, res) => {
  try {

    const data =
      await gastosFijosService.editarGastoFijo(
        req.params.id,
        req.usuario.id,
        req.body
      );

    if (!data) {
      return res.status(404).json({
        mensaje: 'Gasto fijo no encontrado'
      });
    }

    // ✅ Crear notificación
    await notificacionesService.crearNotificacion(
      req.usuario.id,
      `Se actualizó el gasto fijo "${data.nombre}".`
    );

    res.json(data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      mensaje: 'Error al editar gasto fijo'
    });
  }
};

// ─────────────────────────────────────────────
// Eliminar gasto fijo
// ─────────────────────────────────────────────
const eliminarGastoFijo = async (req, res) => {
  try {

    // Obtener gasto antes de eliminar
    const gastos =
      await gastosFijosService.getGastosFijos(
        req.usuario.id
      );

    const gasto = gastos.find(
      g => g.id == req.params.id
    );

    const ok =
      await gastosFijosService.eliminarGastoFijo(
        req.params.id,
        req.usuario.id
      );

    if (!ok) {
      return res.status(404).json({
        mensaje: 'Gasto fijo no encontrado'
      });
    }

    // ✅ Crear notificación
    if (gasto) {
      await notificacionesService.crearNotificacion(
        req.usuario.id,
        `Se eliminó el gasto fijo "${gasto.nombre}".`
      );
    }

    res.json({
      mensaje:
        'Gasto fijo eliminado correctamente'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      mensaje: 'Error al eliminar gasto fijo'
    });
  }
};

const obtenerHistorial = async (req, res) => {

  try {

    const data =
      await gastosFijosService.obtenerHistorial(
        req.params.id,
        req.usuario.id
      );

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      mensaje:
        'Error al obtener historial',
    });

  }
};

const obtenerCalendario =
  async (req, res) => {

    try {

      const data =
        await gastosFijosService.obtenerCalendarioFinanciero(
          req.usuario.id
        );

      res.json(data);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        mensaje:
          'Error al obtener calendario financiero',
      });

    }
  };

module.exports = {
  getGastosFijos,
  crearGastoFijo,
  editarGastoFijo,
  eliminarGastoFijo,
  obtenerHistorial,
  obtenerCalendario,
};