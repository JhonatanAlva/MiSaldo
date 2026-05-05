const db = require('../config/db');

const TIPS = [
  'Separa primero el 10% de tus ingresos como ahorro automático.',
  'Negocia servicios anuales (internet/teléfono) para obtener tarifas más bajas.',
  'Evita compras impulsivas: espera 24 horas antes de confirmar.',
  'Usa metas de ahorro con fecha y monto. Lo que no se mide, no mejora.',
  'Revisa tus suscripciones: cancela las que no usas al menos una vez al trimestre.',
  'Fija un tope semanal de gasto en ocio y apégate a él.',
  'Convierte gastos variables (comida fuera) en presupuestos fijos mensuales.',
  'Regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro/deuda.',
  'Compara precios por unidad, no por empaque.',
  'Planifica menús semanales para reducir gastos de supermercado.',
];

// ── Estado de presupuesto ─────────────────────────────────────
const getEstadoPresupuesto = async (userId) => {
  const rCfg = await db.query(
    `SELECT notif_push, presupuesto_mensual
     FROM configuraciones_usuario
     WHERE usuario_id = $1`,
    [userId]
  );

  let pushOn = true;
  let presupuesto = 0;

  if (rCfg.rows[0]) {
    const cfg = rCfg.rows[0];
    pushOn = cfg.notif_push !== undefined ? !!cfg.notif_push : true;
    presupuesto = Number(cfg.presupuesto_mensual || 0);
  }

  // MySQL: MONTH()/YEAR() → PostgreSQL: EXTRACT(MONTH/YEAR FROM fecha)
  const rG = await db.query(
    `SELECT COALESCE(SUM(monto), 0) AS gastado
     FROM gastos
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR  FROM fecha) = EXTRACT(YEAR  FROM CURRENT_DATE)`,
    [userId]
  );
  const gastado = Number(rG.rows[0]?.gastado || 0);

  const rI = await db.query(
    `SELECT COALESCE(SUM(monto), 0) AS ingresos
     FROM ingresos
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR  FROM fecha) = EXTRACT(YEAR  FROM CURRENT_DATE)`,
    [userId]
  );
  const ingresos = Number(rI.rows[0]?.ingresos || 0);

  let estado = 'SIN_DATOS';
  let saldo = null;

  if (ingresos > 0 || gastado > 0) {
    saldo = ingresos - gastado;
    if (saldo < 0) estado = 'EXCEDIDO';
    else if (saldo <= 500) estado = 'CERCA';
    else estado = 'OK';
  }

  return { pushOn, presupuesto, gastado, ingresos, saldo, estado };
};

// ── Tip financiero ────────────────────────────────────────────
const getTip = async (userId) => {
  const result = await db.query(
    `SELECT COALESCE(notif_tips, TRUE) AS notif_tips
     FROM configuraciones_usuario
     WHERE usuario_id = $1`,
    [userId]
  );

  const enabled = result.rows[0] ? !!result.rows[0].notif_tips : true;
  if (!enabled) return { enabled: false, tip: null };

  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return { enabled: true, tip };
};

module.exports = { getEstadoPresupuesto, getTip };