const db = require('../config/db');

// ── Crear categoría ───────────────────────────────────────────
const crearCategoria = async (usuarioId, { nombre, descripcion, es_global }) => {
  const result = await db.query(
    `INSERT INTO categorias (nombre, descripcion, creada_por, es_global)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [nombre, descripcion || null, usuarioId, es_global ? true : false]
  );
  return result.rows[0].id;
};

// ── Listar categorías (globales + propias del usuario) ────────
const listarCategorias = async (usuarioId) => {
  const result = await db.query(
    `SELECT id, nombre, descripcion, es_global
     FROM categorias
     WHERE es_global = TRUE OR creada_por = $1
     ORDER BY nombre ASC`,
    [usuarioId]
  );
  return result.rows;
};

// ── Editar categoría ──────────────────────────────────────────
const editarCategoria = async (id, { nombre, descripcion, es_global }) => {
  const result = await db.query(
    `UPDATE categorias SET nombre = $1, descripcion = $2, es_global = $3 WHERE id = $4`,
    [nombre, descripcion || null, es_global ? true : false, id]
  );
  return result.rowCount;
};

// ── Eliminar categoría ────────────────────────────────────────
const eliminarCategoria = async (id) => {
  const result = await db.query('DELETE FROM categorias WHERE id = $1', [id]);
  return result.rowCount;
};

// ── Uso de categorías ─────────────────────────────────────────
const getUsoCategorias = async () => {
  const result = await db.query(`
    SELECT c.id, c.nombre, COUNT(g.id) AS usos
    FROM categorias c
    LEFT JOIN gastos g ON g.categoria_id = c.id
    GROUP BY c.id, c.nombre
    ORDER BY usos DESC
  `);
  return result.rows;
};

module.exports = {
  crearCategoria,
  listarCategorias,
  editarCategoria,
  eliminarCategoria,
  getUsoCategorias,
};