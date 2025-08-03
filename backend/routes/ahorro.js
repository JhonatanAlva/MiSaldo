const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken } = require("../utils/jwt");
const moment = require("moment");

// Obtener todos los planes de ahorro con el total ahorrado incluido
router.get("/todos", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  const sql = `
    SELECT p.*, 
      (SELECT SUM(a.monto) FROM abonos_ahorro a WHERE a.plan_id = p.id AND a.usuario_id = ?) AS total_ahorrado
    FROM plan_ahorro p
    WHERE p.usuario_id = ?
  `;

  db.query(sql, [usuarioId, usuarioId], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener los planes" });
    res.json(resultados);
  });
});

// Obtener plan único (no se modifica aquí)
router.get("/plan", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const sql = `SELECT * FROM plan_ahorro WHERE usuario_id = ? LIMIT 1`;

  db.query(sql, [usuarioId], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener el plan" });
    if (resultados.length === 0) return res.status(404).json({ mensaje: "Sin plan de ahorro" });

    res.json(resultados[0]);
  });
});

// Crear nueva meta
router.post("/", verificarToken, (req, res) => {
  const { meta, monto_diario, fecha_inicio, fecha_fin, descripcion } = req.body;
  const sql = `
    INSERT INTO plan_ahorro (usuario_id, meta, monto_diario, fecha_inicio, fecha_fin, descripcion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [req.usuario.id, meta, monto_diario, fecha_inicio, fecha_fin, descripcion],
    (err) => {
      if (err) {
        console.error("ERROR en DB:", err);
        return res.status(500).json({ mensaje: "Error al guardar plan de ahorro" });
      }
      res.json({ mensaje: "Plan de ahorro guardado exitosamente" });
    }
  );
});

// Editar plan existente
router.put("/:id", verificarToken, (req, res) => {
  const planId = req.params.id;
  const usuarioId = req.usuario.id;
  const { meta, monto_diario, fecha_inicio, fecha_fin, descripcion } = req.body;

  const sql = `
    UPDATE plan_ahorro SET
      meta = ?,
      monto_diario = ?,
      fecha_inicio = ?,
      fecha_fin = ?,
      descripcion = ?
    WHERE id = ? AND usuario_id = ?
  `;

  db.query(sql, [meta, monto_diario, fecha_inicio, fecha_fin, descripcion, planId, usuarioId], (err) => {
    if (err) {
      console.error("ERROR al actualizar plan:", err);
      return res.status(500).json({ mensaje: "Error al actualizar plan de ahorro" });
    }
    res.json({ mensaje: "Plan actualizado correctamente" });
  });
});

// Agregar abono al plan de ahorro
router.post("/abono", verificarToken, (req, res) => {
  const { monto, plan_id } = req.body;
  const usuarioId = req.usuario.id;

  if (!plan_id || !monto) {
    return res.status(400).json({ mensaje: "Faltan datos necesarios" });
  }

  const verificarPlan = `SELECT id FROM plan_ahorro WHERE id = ? AND usuario_id = ? LIMIT 1`;
  db.query(verificarPlan, [plan_id, usuarioId], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.status(404).json({ mensaje: "Plan de ahorro no válido o no encontrado" });
    }

    const sql = `INSERT INTO abonos_ahorro (usuario_id, plan_id, monto) VALUES (?, ?, ?)`;
    db.query(sql, [usuarioId, plan_id, monto], (err) => {
      if (err) return res.status(500).json({ mensaje: "Error al guardar el abono" });
      res.json({ mensaje: "Abono guardado correctamente" });
    });
  });
});

// Eliminar plan y sus abonos
router.delete("/:id", verificarToken, (req, res) => {
  const planId = req.params.id;
  const usuarioId = req.usuario.id;

  const eliminarAbonos = `DELETE FROM abonos_ahorro WHERE plan_id = ?`;
  db.query(eliminarAbonos, [planId], (err) => {
    if (err) {
      console.error("Error al eliminar abonos:", err);
      return res.status(500).json({ mensaje: "Error al eliminar los abonos del plan" });
    }

    const eliminarPlan = `DELETE FROM plan_ahorro WHERE id = ? AND usuario_id = ?`;
    db.query(eliminarPlan, [planId, usuarioId], (err) => {
      if (err) {
        console.error("Error al eliminar el plan:", err);
        return res.status(500).json({ mensaje: "Error al eliminar el plan de ahorro" });
      }
      res.json({ mensaje: "Plan eliminado correctamente" });
    });
  });
});

// Obtener total ahorrado por plan específico
router.get("/total-ahorrado/:planId", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const planId = req.params.planId;

  const sql = `
    SELECT SUM(monto) AS total
    FROM abonos_ahorro
    WHERE usuario_id = ? AND plan_id = ?
  `;

  db.query(sql, [usuarioId, planId], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener ahorro acumulado" });
    res.json({ total: resultados[0].total || 0 });
  });
});

// Obtener tendencia de ahorro
router.get("/tendencia", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const mes = req.query.mes;

  // Validar que mes sea un número entre 1 y 12
  const mesInt = parseInt(mes, 10);
  if (isNaN(mesInt) || mesInt < 1 || mesInt > 12) {
    return res.status(400).json({ mensaje: "Mes inválido" });
  }

  const sql = `
    SELECT DATE(fecha) AS dia, SUM(monto) AS total
    FROM abonos_ahorro
    WHERE usuario_id = ? AND MONTH(fecha) = ?
    GROUP BY DATE(fecha)
    ORDER BY dia ASC
  `;

  db.query(sql, [usuarioId, mesInt], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener tendencia de ahorro" });

    res.json(resultados);
  });
});

module.exports = router;