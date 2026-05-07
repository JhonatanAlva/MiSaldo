const gastosFijosService = require('../services/gastosFijosService');

const getGastosFijos = async (req, res) => {
  try {
    const data = await gastosFijosService.getGastosFijos(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener gastos fijos' });
  }
};

const crearGastoFijo = async (req, res) => {
  try {
    const data = await gastosFijosService.crearGastoFijo(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear gasto fijo' });
  }
};

const editarGastoFijo = async (req, res) => {
  try {
    const data = await gastosFijosService.editarGastoFijo(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ mensaje: 'Gasto fijo no encontrado' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al editar gasto fijo' });
  }
};

const eliminarGastoFijo = async (req, res) => {
  try {
    const ok = await gastosFijosService.eliminarGastoFijo(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ mensaje: 'Gasto fijo no encontrado' });
    res.json({ mensaje: 'Gasto fijo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar gasto fijo' });
  }
};

module.exports = { getGastosFijos, crearGastoFijo, editarGastoFijo, eliminarGastoFijo };