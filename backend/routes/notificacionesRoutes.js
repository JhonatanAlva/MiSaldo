const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken } = require("../utils/jwt");

// Helper: envolver db.query (callback) en una promesa
function q(sql, params = []) {
  return new Promise((resolve) => {
    db.query(sql, params, (err, rows) => {
      if (err) {
        console.error("SQL ERROR:", err.sqlMessage || err.message);
        return resolve({ err, rows: [] });
      }
      resolve({ rows });
    });
  });
}

// GET /notificaciones/estado-presupuesto
router.get("/estado-presupuesto", verificarToken, async (req, res) => {
  const userId = req.usuario.id;

  let pushOn = true;
  let presupuesto = 0;

  // 1) Leer configuración
  let rCfg = await q(
    `SELECT notif_push, presupuesto_mensual
     FROM configuraciones_usuario
     WHERE usuario_id = ?`,
    [userId]
  );

  if (rCfg.err && rCfg.err.code === "ER_BAD_FIELD_ERROR") {
    const rMin = await q(
      `SELECT notif_push FROM configuraciones_usuario WHERE usuario_id = ?`,
      [userId]
    );
    if (rMin.rows[0]) pushOn = !!rMin.rows[0].notif_push;
  } else if (rCfg.rows[0]) {
    const cfg = rCfg.rows[0];
    pushOn = cfg.notif_push !== undefined ? !!cfg.notif_push : true;
    presupuesto = Number(cfg.presupuesto_mensual || 0);
  }

  // 2) Gastos del mes actual
  const rG = await q(
    `SELECT COALESCE(SUM(monto),0) gastado
     FROM gastos
     WHERE usuario_id = ?
       AND MONTH(fecha) = MONTH(CURRENT_DATE())
       AND YEAR(fecha)  = YEAR(CURRENT_DATE())`,
    [userId]
  );
  const gastado = Number(rG.rows[0]?.gastado || 0);

  // 2.1) Ingresos del mes actual
  const rI = await q(
    `SELECT COALESCE(SUM(monto),0) ingresos
     FROM ingresos
     WHERE usuario_id = ?
       AND MONTH(fecha) = MONTH(CURRENT_DATE())
       AND YEAR(fecha)  = YEAR(CURRENT_DATE())`,
    [userId]
  );
  const ingresos = Number(rI.rows[0]?.ingresos || 0);

  // 3) Estado personalizado
  let estado = "SIN_DATOS";
  let saldo = null;

  if (ingresos > 0 || gastado > 0) {
    saldo = ingresos - gastado;

    if (saldo < 0) {
      estado = "EXCEDIDO";
    } else if (saldo <= 500) {
      estado = "CERCA";
    } else if (saldo > 1000) {
      estado = "OK";
    } else {
      estado = "CERCA";
    }
  }

  return res.json({ pushOn, presupuesto, gastado, ingresos, saldo, estado });
});

// GET /notificaciones/tip
const TIPS = [
  "Separa primero el 10% de tus ingresos como ahorro automático.",
  "Negocia servicios anuales (internet/teléfono) para obtener tarifas más bajas.",
  "Evita compras impulsivas: espera 24 horas antes de confirmar.",
  "Usa metas de ahorro con fecha y monto. Lo que no se mide, no mejora.",
  "Revisa tus suscripciones: cancela las que no usas al menos una vez al trimestre.",
  "Fija un tope semanal de gasto en ocio y apégate a él.",
  "Convierte gastos variables (comida fuera) en presupuestos fijos mensuales.",
  "Regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro/deuda.",
  "Compara precios por unidad, no por empaque.",
  "Planifica menús semanales para reducir gastos de supermercado.",
];

router.get("/tip", verificarToken, async (req, res) => {
  const userId = req.usuario.id;
  const r = await q(
    `SELECT COALESCE(notif_tips,1) notif_tips
     FROM configuraciones_usuario
     WHERE usuario_id = ?`,
    [userId]
  );
  const enabled = r.rows[0] ? !!r.rows[0].notif_tips : true;
  if (!enabled) return res.json({ enabled: false, tip: null });

  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return res.json({ enabled: true, tip });
});

module.exports = router;
