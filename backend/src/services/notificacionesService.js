const pool = require("../config/db");

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

// Helper: ejecuta una query y devuelve las filas directamente
async function q(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function obtenerEstadoPresupuesto(userId) {
  let pushOn = true;
  let presupuesto = 0;

  // 1) Leer configuración
  const cfgRows = await q(
    `SELECT notif_push, presupuesto_mensual
     FROM configuraciones_usuario
     WHERE usuario_id = $1`,
    [userId]
  );

  if (cfgRows[0]) {
    const cfg = cfgRows[0];
    pushOn = cfg.notif_push !== undefined ? !!cfg.notif_push : true;
    presupuesto = Number(cfg.presupuesto_mensual || 0);
  }

  // 2) Gastos del mes actual
  const gastadoRows = await q(
    `SELECT COALESCE(SUM(monto), 0) AS gastado
     FROM gastos
     WHERE usuario_id = $1
       AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId]
  );
  const gastado = Number(gastadoRows[0]?.gastado || 0);

  // 3) Ingresos del mes actual
  const ingresosRows = await q(
    `SELECT COALESCE(SUM(monto), 0) AS ingresos
     FROM ingresos
     WHERE usuario_id = $1
       AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId]
  );
  const ingresos = Number(ingresosRows[0]?.ingresos || 0);

  // 4) Calcular estado
  let estado = "SIN_DATOS";
  let saldo = null;

  if (ingresos > 0 || gastado > 0) {
    saldo = ingresos - gastado;

    if (saldo < 0)        estado = "EXCEDIDO";
    else if (saldo <= 500) estado = "CERCA";
    else                   estado = "OK";
  }

  return { pushOn, presupuesto, gastado, ingresos, saldo, estado };
}

async function obtenerTip(userId) {
  const rows = await q(
    `SELECT COALESCE(notif_tips, true) AS notif_tips
     FROM configuraciones_usuario
     WHERE usuario_id = $1`,
    [userId]
  );

  const enabled = rows[0] ? !!rows[0].notif_tips : true;
  if (!enabled) return { enabled: false, tip: null };

  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return { enabled: true, tip };
}

module.exports = { obtenerEstadoPresupuesto, obtenerTip };