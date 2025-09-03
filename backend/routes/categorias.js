const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken, verificarAdmin } = require("../utils/jwt");

// Crear categoría (solo admin puede crear globales)
router.post("/", verificarAdmin, (req, res) => {
  const { nombre, descripcion, es_global } = req.body;
  const usuarioId = req.usuario.id;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }

  const sql = `
    INSERT INTO categorias (nombre, descripcion, creada_por, es_global)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [nombre, descripcion || null, usuarioId, es_global ? 1 : 0], (err, result) => {
    if (err) {
      console.error("❌ Error al crear categoría:", err);
      return res.status(500).json({ mensaje: "Error al crear categoría" });
    }
    res.json({ id: result.insertId, mensaje: "Categoría creada correctamente" });
  });
});

// Listar categorías (todos los usuarios)
router.get("/", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const sql = `
    SELECT id, nombre, descripcion, es_global
    FROM categorias
    WHERE es_global = 1 OR creada_por = ?
    ORDER BY nombre ASC
  `;
  db.query(sql, [usuarioId], (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener categorías:", err);
      return res.status(500).json({ mensaje: "Error al obtener categorías" });
    }
    res.json(resultados);
  });
});

// Editar categoría (solo admin)
router.put("/:id", verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, es_global } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }

  const sql = `
    UPDATE categorias
    SET nombre = ?, descripcion = ?, es_global = ?
    WHERE id = ?
  `;
  db.query(sql, [nombre, descripcion || null, es_global ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error("❌ Error al editar categoría:", err);
      return res.status(500).json({ mensaje: "Error al editar categoría" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }
    res.json({ mensaje: "Categoría actualizada correctamente" });
  });
});

// Eliminar categoría (solo admin)
router.delete("/:id", verificarAdmin, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categorias WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar categoría:", err);
      return res.status(500).json({ mensaje: "Error al eliminar categoría" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }
    res.json({ mensaje: "Categoría eliminada correctamente" });
  });
});

// 📊 Categorías más utilizadas por los usuarios
router.get("/uso", verificarAdmin, (req, res) => {
  const sql = `
    SELECT c.id, c.nombre, COUNT(g.id) AS usos
    FROM categorias c
    LEFT JOIN gastos g ON g.categoria_id = c.id
    GROUP BY c.id, c.nombre
    ORDER BY usos DESC
  `;

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener uso de categorías:", err);
      return res.status(500).json({ mensaje: "Error al obtener estadísticas" });
    }
    res.json(resultados);
  });
});


module.exports = router;