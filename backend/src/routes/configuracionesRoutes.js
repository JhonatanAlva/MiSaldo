const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { verificarToken } = require("../utils/jwt");

// GET /configuraciones  -> trae switches + formato
router.get("/", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  const sql = `
    SELECT notif_email, notif_push, notif_weekly, notif_monthly, notif_tips, formato
    FROM configuraciones_usuario
    WHERE usuario_id = ?
  `;

  db.query(sql, [usuarioId], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener configuración" });

    if (result.length === 0) {
      // defaults si aún no hay fila
      return res.json({
        notificaciones: { email: true, push: true, weekly: true, monthly: true, tips: false },
        formato: "pdf",
      });
    }

    const r = result[0];
    res.json({
      notificaciones: {
        email: !!r.notif_email,
        push: !!r.notif_push,
        weekly: !!r.notif_weekly,
        monthly: !!r.notif_monthly,
        tips: !!r.notif_tips,
      },
      formato: r.formato || "pdf",
    });
  });
});

// PUT /configuraciones  -> guarda switches + formato
router.put('/', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { notificaciones = {}, formato = 'pdf' } = req.body;

  const allowedFormatos = new Set(['pdf','excel','html']);
  const finalFormato = allowedFormatos.has((formato||'').toLowerCase()) ? formato.toLowerCase() : 'pdf';

  const email   = notificaciones.email   ? 1 : 0;
  const push    = notificaciones.push    ? 1 : 0;
  const weekly  = notificaciones.weekly  ? 1 : 0;
  const monthly = notificaciones.monthly ? 1 : 0;
  const tips    = notificaciones.tips    ? 1 : 0;

  const sql = `
    INSERT INTO configuraciones_usuario
      (usuario_id, notif_email, notif_push, notif_weekly, notif_monthly, notif_tips, formato)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      notif_email = VALUES(notif_email),
      notif_push = VALUES(notif_push),
      notif_weekly = VALUES(notif_weekly),
      notif_monthly = VALUES(notif_monthly),
      notif_tips = VALUES(notif_tips),
      formato = VALUES(formato)
  `;
  db.query(sql, [usuarioId, email, push, weekly, monthly, tips, finalFormato], (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al guardar configuración' });
    res.json({ mensaje: 'Configuración actualizada correctamente' });
  });
});

// PUT /configuraciones/usuario
router.put("/usuario", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombres, apellidos, celular } = req.body;

  const obtenerSql = "SELECT celular FROM usuarios WHERE id = ?";
  db.query(obtenerSql, [usuarioId], (err, resultado) => {
    if (err) return res.status(500).json({ mensaje: "Error al consultar celular actual" });
    if (resultado.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const celularActual = resultado[0].celular;
    const nuevoCelular = (celular === "" || celular === undefined) ? celularActual : celular;

    const sql = `UPDATE usuarios SET nombres = ?, apellidos = ?, celular = ? WHERE id = ?`;
    db.query(sql, [nombres, apellidos, nuevoCelular, usuarioId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al actualizar perfil" });

      // Devuelve el perfil actualizado
      db.query(
        "SELECT id, nombres, apellidos, correo, celular FROM usuarios WHERE id = ?",
        [usuarioId],
        (err3, r) => {
          if (err3 || r.length === 0) return res.status(500).json({ mensaje: "Error al leer perfil actualizado" });
          res.json({
            mensaje: "Perfil actualizado correctamente",
            usuario: r[0],
          });
        }
      );
    });
  });
});


// PUT /configuraciones/password  -> cambia contraseña
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
