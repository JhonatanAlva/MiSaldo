const db = require('../config/db');

const getGastosFijos = async (usuarioId) => {
  const res = await db.query(
    `SELECT gf.*, c.nombre AS categoria_nombre
     FROM gastos_fijos gf
     LEFT JOIN categorias c ON gf.categoria_id = c.id
     WHERE gf.usuario_id = $1
     ORDER BY gf.dia_cobro ASC`,
    [usuarioId]
  );
  return res.rows;
};

const crearGastoFijo = async (usuarioId, { nombre, monto, dia_cobro, categoria_id, tiene_cuotas, cuotas_total }) => {
  const res = await db.query(
    `INSERT INTO gastos_fijos 
      (usuario_id, nombre, monto, dia_cobro, categoria_id, tiene_cuotas, cuotas_total)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [usuarioId, nombre, monto, dia_cobro, categoria_id || null,
     tiene_cuotas || false, tiene_cuotas ? cuotas_total : null]
  );
  return res.rows[0];
};

const editarGastoFijo = async (id, usuarioId, datos) => {
  const { nombre, monto, dia_cobro, categoria_id, tiene_cuotas, cuotas_total, activo } = datos;
  const res = await db.query(
    `UPDATE gastos_fijos SET
       nombre=$1, monto=$2, dia_cobro=$3, categoria_id=$4,
       tiene_cuotas=$5, cuotas_total=$6, activo=$7
     WHERE id=$8 AND usuario_id=$9
     RETURNING *`,
    [nombre, monto, dia_cobro, categoria_id || null,
     tiene_cuotas || false, tiene_cuotas ? cuotas_total : null,
     activo ?? true, id, usuarioId]
  );
  return res.rows[0];
};

const eliminarGastoFijo = async (id, usuarioId) => {
  const res = await db.query(
    'DELETE FROM gastos_fijos WHERE id=$1 AND usuario_id=$2',
    [id, usuarioId]
  );
  return res.rowCount > 0;
};

module.exports = { getGastosFijos, crearGastoFijo, editarGastoFijo, eliminarGastoFijo };