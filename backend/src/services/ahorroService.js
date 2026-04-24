const pool = require("../config/db");

async function q(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function obtenerTodos(usuarioId) {
  return q(
    `SELECT p.*,
       (SELECT SUM(a.monto) FROM abonos_ahorro a WHERE a.plan_id = p.id AND a.usuario_id = $1) AS total_ahorrado
     FROM plan_ahorro p
     WHERE p.usuario_id = $2`,
    [usuarioId, usuarioId]
  );
}

async function obtenerPlan(usuarioId) {
  const rows = await q(
    `SELECT * FROM plan_ahorro WHERE usuario_id = $1 LIMIT 1`,
    [usuarioId]
  );
  return rows[0] || null;
}

async function crearPlan(usuarioId, { meta, monto_diario, fecha_inicio, fecha_fin, descripcion }) {
  await q(
    `INSERT INTO plan_ahorro (usuario_id, meta, monto_diario, fecha_inicio, fecha_fin, descripcion)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [usuarioId, meta, monto_diario, fecha_inicio, fecha_fin, descripcion]
  );
}

async function editarPlan(planId, usuarioId, { meta, monto_diario, fecha_inicio, fecha_fin, descripcion }) {
  await q(
    `UPDATE plan_ahorro SET
       meta = $1, monto_diario = $2, fecha_inicio = $3, fecha_fin = $4, descripcion = $5
     WHERE id = $6 AND usuario_id = $7`,
    [meta, monto_diario, fecha_inicio, fecha_fin, descripcion, planId, usuarioId]
  );
}

async function agregarAbono(usuarioId, planId, monto) {
  const planRows = await q(
    `SELECT id FROM plan_ahorro WHERE id = $1 AND usuario_id = $2 LIMIT 1`,
    [planId, usuarioId]
  );

  if (planRows.length === 0) {
    const error = new Error("Plan de ahorro no válido o no encontrado");
    error.status = 404;
    throw error;
  }

  await q(
    `INSERT INTO abonos_ahorro (usuario_id, plan_id, monto) VALUES ($1, $2, $3)`,
    [usuarioId, planId, monto]
  );
}

async function eliminarPlan(planId, usuarioId) {
  await q(`DELETE FROM abonos_ahorro WHERE plan_id = $1`, [planId]);
  await q(`DELETE FROM plan_ahorro WHERE id = $1 AND usuario_id = $2`, [planId, usuarioId]);
}

async function obtenerTotalAhorrado(usuarioId, planId) {
  const rows = await q(
    `SELECT COALESCE(SUM(monto), 0) AS total
     FROM abonos_ahorro
     WHERE usuario_id = $1 AND plan_id = $2`,
    [usuarioId, planId]
  );
  return Number(rows[0].total);
}

async function obtenerTendencia(usuarioId, mes) {
  return q(
    `SELECT DATE(fecha) AS dia, SUM(monto) AS total
     FROM abonos_ahorro
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM fecha) = $2
     GROUP BY DATE(fecha)
     ORDER BY dia ASC`,
    [usuarioId, mes]
  );
}

module.exports = {
  obtenerTodos,
  obtenerPlan,
  crearPlan,
  editarPlan,
  agregarAbono,
  eliminarPlan,
  obtenerTotalAhorrado,
  obtenerTendencia,
};