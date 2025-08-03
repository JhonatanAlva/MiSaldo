const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { verificarToken } = require("../utils/jwt");

// Obtener configuración actual del usuario
router.get("/", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  const sql = `
    SELECT notificaciones, idioma 
    FROM configuraciones_usuario 
    WHERE usuario_id = ?
  `;

  db.query(sql, [usuarioId], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener configuración" });

    // Si no hay registros, devolver configuración por defecto
    if (result.length === 0) {
      return res.json({
        notificaciones: true,
        idioma: "es", // Español como idioma predeterminado
      });
    }

    res.json(result[0]);
  });
});

// Actualizar configuración (notificaciones e idioma)
router.put("/", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { notificaciones, idioma } = req.body;

  const sql = `
    INSERT INTO configuraciones_usuario (usuario_id, notificaciones, idioma)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE notificaciones = ?, idioma = ?
  `;

  db.query(
    sql,
    [usuarioId, notificaciones, idioma, notificaciones, idioma],
    (err) => {
      if (err) return res.status(500).json({ mensaje: "Error al guardar configuración" });
      res.json({ mensaje: "Configuración actualizada correctamente" });
    }
  );
});

// Actualizar nombre y apellidos (sin modificar correo)
router.put("/usuario", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombres, apellidos, celular } = req.body;

  // Primero buscamos el valor actual del celular
  const obtenerSql = "SELECT celular FROM usuarios WHERE id = ?";
  db.query(obtenerSql, [usuarioId], (err, resultado) => {
    if (err) return res.status(500).json({ mensaje: "Error al consultar celular actual" });
    if (resultado.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const celularActual = resultado[0].celular;
    const nuevoCelular = celular === "" || celular === undefined ? celularActual : celular;

    const sql = `UPDATE usuarios SET nombres = ?, apellidos = ?, celular = ? WHERE id = ?`;
    db.query(sql, [nombres, apellidos, nuevoCelular, usuarioId], (err) => {
      if (err) return res.status(500).json({ mensaje: "Error al actualizar perfil" });
      res.json({ mensaje: "Perfil actualizado correctamente" });
    });
  });
});

// Cambiar contraseña del usuario
router.put("/password", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { actual, nueva } = req.body;

  const buscarSql = "SELECT contrasena FROM usuarios WHERE id = ?";
  db.query(buscarSql, [usuarioId], async (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ mensaje: "Usuario no encontrado" });

    const coincide = await bcrypt.compare(actual, result[0].contrasena);
    if (!coincide) return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });

    const nuevaHash = await bcrypt.hash(nueva, 10);
    const updateSql = "UPDATE usuarios SET contrasena = ? WHERE id = ?";
    db.query(updateSql, [nuevaHash, usuarioId], (err) => {
      if (err) return res.status(500).json({ mensaje: "Error al actualizar contraseña" });
      res.json({ mensaje: "Contraseña actualizada correctamente" });
    });
  });
});

module.exports = router;