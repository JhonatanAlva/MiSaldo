const db = require("../config/db");

// ─────────────────────────────────────
// Obtener ingresos fijos
// ─────────────────────────────────────
const getIngresosFijos = async (usuarioId) => {
  const res = await db.query(
    `
    SELECT *
    FROM ingresos_fijos
    WHERE usuario_id = $1
    ORDER BY creado_en DESC
    `,
    [usuarioId],
  );

  return res.rows;
};

// ─────────────────────────────────────
// Crear ingreso fijo
// ─────────────────────────────────────
const crearIngresoFijo = async (usuarioId, data) => {
  const { nombre, monto, frecuencia, dia_pago, dia_pago_secundario, activo } =
    data;

  const res = await db.query(
    `
    INSERT INTO ingresos_fijos
    (
      usuario_id,
      nombre,
      monto,
      frecuencia,
      dia_pago,
      dia_pago_secundario,
      activo
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [
      usuarioId,
      nombre,
      monto,
      frecuencia,
      dia_pago,
      dia_pago_secundario || null,
      activo ?? true,
    ],
  );

  return res.rows[0];
};

// ─────────────────────────────────────
// Editar ingreso fijo
// ─────────────────────────────────────
const editarIngresoFijo = async (id, usuarioId, data) => {
  const { nombre, monto, frecuencia, dia_pago, dia_pago_secundario, activo } =
    data;

  const res = await db.query(
    `
    UPDATE ingresos_fijos
    SET
      nombre = $1,
      monto = $2,
      frecuencia = $3,
      dia_pago = $4,
      dia_pago_secundario = $5,
      activo = $6
    WHERE id = $7
    AND usuario_id = $8
    RETURNING *
    `,
    [
      nombre,
      monto,
      frecuencia,
      dia_pago,
      dia_pago_secundario || null,
      activo,
      id,
      usuarioId,
    ],
  );

  return res.rows[0];
};

// ─────────────────────────────────────
// Eliminar ingreso fijo
// ─────────────────────────────────────
const eliminarIngresoFijo = async (id, usuarioId) => {
  const res = await db.query(
    `
    DELETE FROM ingresos_fijos
    WHERE id = $1
    AND usuario_id = $2
    `,
    [id, usuarioId],
  );

  return res.rowCount > 0;
};

// ─────────────────────────────────────
// Obtener ingresos a cobrar
// ─────────────────────────────────────
const obtenerIngresosPorCobrar = async () => {
  const hoy = new Date();

  const dia = hoy.getDate();

  const diaSemana = hoy.getDay();

  const res = await db.query(
    `
      SELECT *
      FROM ingresos_fijos
      WHERE activo = TRUE
      `,
  );

  return res.rows.filter((i) => {
    // mensual
    if (i.frecuencia === "mensual") {
      return i.dia_pago === dia;
    }

    // quincenal
    if (i.frecuencia === "quincenal") {
      return (
        dia === Number(i.dia_pago) || dia === Number(i.dia_pago_secundario)
      );
    }

    // semanal
    if (i.frecuencia === "semanal") {
      return i.dia_pago === diaSemana;
    }

    return false;
  });
};

// ─────────────────────────────────────
// Obtener historial
// ─────────────────────────────────────
const obtenerHistorial = async (ingresoId, usuarioId) => {
  const res = await db.query(
    `
        SELECT *
        FROM historial_ingresos_fijos
        WHERE ingreso_fijo_id = $1
        AND usuario_id = $2
        ORDER BY fecha_pago DESC
        `,
    [ingresoId, usuarioId],
  );

  return res.rows;
};

module.exports = {
  getIngresosFijos,
  crearIngresoFijo,
  editarIngresoFijo,
  eliminarIngresoFijo,
  obtenerIngresosPorCobrar,
  obtenerHistorial,
};
