const ahorroService = require("../services/ahorroService");

async function getTodos(req, res) {
  try {
    const planes = await ahorroService.obtenerTodos(req.usuario.id);
    res.json(planes);
  } catch {
    res.status(500).json({ mensaje: "Error al obtener los planes" });
  }
}

async function getPlan(req, res) {
  try {
    const plan = await ahorroService.obtenerPlan(req.usuario.id);
    if (!plan) return res.status(404).json({ mensaje: "Sin plan de ahorro" });
    res.json(plan);
  } catch {
    res.status(500).json({ mensaje: "Error al obtener el plan" });
  }
}

async function crearPlan(req, res) {
  try {
    const { meta, monto_diario, fecha_inicio, fecha_fin, descripcion } = req.body;
    await ahorroService.crearPlan(req.usuario.id, { meta, monto_diario, fecha_inicio, fecha_fin, descripcion });
    res.json({ mensaje: "Plan de ahorro guardado exitosamente" });
  } catch {
    res.status(500).json({ mensaje: "Error al guardar plan de ahorro" });
  }
}

async function editarPlan(req, res) {
  try {
    const { meta, monto_diario, fecha_inicio, fecha_fin, descripcion } = req.body;
    await ahorroService.editarPlan(req.params.id, req.usuario.id, { meta, monto_diario, fecha_inicio, fecha_fin, descripcion });
    res.json({ mensaje: "Plan actualizado correctamente" });
  } catch {
    res.status(500).json({ mensaje: "Error al actualizar plan de ahorro" });
  }
}

async function agregarAbono(req, res) {
  try {
    const { monto, plan_id } = req.body;
    if (!plan_id || !monto) {
      return res.status(400).json({ mensaje: "Faltan datos necesarios" });
    }
    await ahorroService.agregarAbono(req.usuario.id, plan_id, monto);
    res.json({ mensaje: "Abono guardado correctamente" });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ mensaje: error.message });
  }
}

async function eliminarPlan(req, res) {
  try {
    await ahorroService.eliminarPlan(req.params.id, req.usuario.id);
    res.json({ mensaje: "Plan eliminado correctamente" });
  } catch {
    res.status(500).json({ mensaje: "Error al eliminar el plan de ahorro" });
  }
}

async function getTotalAhorrado(req, res) {
  try {
    const total = await ahorroService.obtenerTotalAhorrado(req.usuario.id, req.params.planId);
    res.json({ total });
  } catch {
    res.status(500).json({ mensaje: "Error al obtener ahorro acumulado" });
  }
}

async function getTendencia(req, res) {
  try {
    const mesInt = parseInt(req.query.mes, 10);
    if (isNaN(mesInt) || mesInt < 1 || mesInt > 12) {
      return res.status(400).json({ mensaje: "Mes inválido" });
    }
    const tendencia = await ahorroService.obtenerTendencia(req.usuario.id, mesInt);
    res.json(tendencia);
  } catch {
    res.status(500).json({ mensaje: "Error al obtener tendencia de ahorro" });
  }
}

module.exports = { getTodos, getPlan, crearPlan, editarPlan, agregarAbono, eliminarPlan, getTotalAhorrado, getTendencia };