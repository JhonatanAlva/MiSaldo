const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken, verificarAdmin } = require("../utils/jwt");
const { sendEmail } = require("../utils/mailer");
const bcrypt = require("bcrypt");

// ✅ Obtener todos los usuarios
router.get("/usuarios", verificarToken, verificarAdmin, (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      console.error("❌ Error al obtener usuarios:", err);
      return res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }

    const usuarios = result.map((u) => ({
      ...u,
      activo: Number(u.activo),
    }));

    res.json(usuarios);
  });
});


// ✅ Actualizar un usuario
router.put("/usuarios/:id", verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, celular, rol_id } = req.body;

  const sql = `
    UPDATE usuarios 
    SET nombres = ?, apellidos = ?, celular = ?, rol_id = ?
    WHERE id = ?
  `;
  const valores = [nombres, apellidos, celular, rol_id, id];

  db.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error("Error al actualizar usuario:", err);
      return res.status(500).json({ mensaje: "Error al actualizar usuario" });
    }

    res.json({ mensaje: "Usuario actualizado correctamente" });
  });
});

// ✅ Eliminar un usuario
// ✅ Eliminar un usuario y sus datos relacionados
router.delete("/usuarios/:id", verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;

  // Paso 1: Eliminar abonos ligados a planes del usuario
  const eliminarAbonos = `DELETE FROM abonos_ahorro WHERE usuario_id = ?`;
  db.query(eliminarAbonos, [id], (err) => {
    if (err) {
      console.error("Error al eliminar abonos:", err);
      return res.status(500).json({ mensaje: "Error al eliminar abonos relacionados" });
    }

    // Paso 2: Eliminar planes de ahorro del usuario
    const eliminarPlanes = `DELETE FROM plan_ahorro WHERE usuario_id = ?`;
    db.query(eliminarPlanes, [id], (err) => {
      if (err) {
        console.error("Error al eliminar planes:", err);
        return res.status(500).json({ mensaje: "Error al eliminar planes relacionados" });
      }

      // Paso 3: Eliminar el usuario
      const eliminarUsuario = `DELETE FROM usuarios WHERE id = ?`;
      db.query(eliminarUsuario, [id], (err, resultado) => {
        if (err) {
          console.error("Error al eliminar usuario:", err);
          return res.status(500).json({ mensaje: "Error al eliminar usuario" });
        }

        res.json({ mensaje: "Usuario y datos relacionados eliminados correctamente" });
      });
    });
  });
});


// ✅ Cambiar contraseña de un usuario
router.put(
  "/usuarios/:id/contrasena",
  verificarToken,
  verificarAdmin,
  (req, res) => {
    const { id } = req.params;
    const { contrasena } = req.body;

    const contrasenaHash = bcrypt.hashSync(contrasena, 10);

    const sql = "UPDATE usuarios SET contrasena = ? WHERE id = ?";
    db.query(sql, [contrasenaHash, id], (err) => {
      if (err) {
        console.error("Error al cambiar contraseña:", err);
        return res.status(500).json({ mensaje: "Error al cambiar contraseña" });
      }

      res.json({ mensaje: "Contraseña actualizada correctamente" });
    });
  }
);

// ✅ Reenviar correo de confirmación
router.post(
  "/usuarios/:id/reenviar-confirmacion",
  verificarToken,
  verificarAdmin,
  (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM usuarios WHERE id = ?";
    db.query(sql, [id], async (err, resultados) => {
      if (err || resultados.length === 0) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      const usuario = resultados[0];
      let token = usuario.token_confirmacion;

      // Si no tiene token, generamos uno nuevo
      if (!token) {
        token = uuidv4();
        const actualizarSQL =
          "UPDATE usuarios SET token_confirmacion = ? WHERE id = ?";
        db.query(actualizarSQL, [token, id], (errUpdate) => {
          if (errUpdate)
            return res
              .status(500)
              .json({ mensaje: "Error al actualizar token" });
        });
      }

      const url = `http://localhost:5000/auth/confirmar/${token}`;

      const html = `
      <h2>Hola ${usuario.nombres},</h2>
      <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
      <a href="${url}">${url}</a>
    `;

      try {
        await sendEmail(
          usuario.correo,
          "Reenvío de confirmación de cuenta",
          html
        );
        res.json({ mensaje: "Correo de confirmación reenviado correctamente" });
      } catch (error) {
        console.error("Error al enviar correo:", error);
        res.status(500).json({ mensaje: "Error al enviar correo" });
      }
    });
  }
);

// Estado de usuario
router.put(
  "/usuarios/:id/estado",
  verificarToken,
  verificarAdmin,
  (req, res) => {
    const { id } = req.params;
    let { activo } = req.body;

    const activoInt = Number(activo);

    console.log(
      `🔄 Actualizando estado del usuario con ID ${id} a ${activoInt} (tipo: ${typeof activoInt})`
    );

    db.query(
      "UPDATE usuarios SET activo = ? WHERE id = ?",
      [activoInt, id],
      (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar el estado del usuario:", err);
          return res
            .status(500)
            .json({ mensaje: "Error al actualizar el estado" });
        }

        console.log(`✅ Estado actualizado correctamente para ID ${id}`);
        res.json({ mensaje: "Estado actualizado correctamente" });
      }
    );
  }
);

// ✅ Obtener bitácora de un usuario
router.get('/usuarios/:id/bitacora', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT tipo, descripcion, fecha FROM bitacora WHERE usuario_id = ? ORDER BY fecha DESC",
    [id],
    (err, resultados) => {
      if (err) {
        console.error("❌ Error al obtener bitácora:", err);
        return res.status(500).json({ mensaje: "Error al obtener actividad" });
      }
      res.json(resultados);
    }
  );
});

// Graficar actividad de un usuario
router.get('/actividad/general', verificarToken, verificarAdmin, (req, res) => {
  db.query(
    `SELECT u.nombres, COUNT(b.id) as total 
     FROM bitacora b 
     JOIN usuarios u ON u.id = b.usuario_id 
     GROUP BY b.usuario_id`,
    (err, resultados) => {
      if (err) {
        console.error("❌ Error al obtener resumen de actividad:", err);
        return res.status(500).json({ mensaje: "Error al obtener resumen" });
      }
      res.json(resultados);
    }
  );
});

router.get("/actividad", verificarToken, verificarAdmin, (req, res) => {
  const query = `
    SELECT u.nombres AS usuario, COUNT(b.id) AS acciones
    FROM bitacora b
    JOIN usuarios u ON b.usuario_id = u.id
    GROUP BY b.usuario_id
    ORDER BY acciones DESC
    LIMIT 10
  `;

  db.query(query, (err, resultados) => {
    if (err) {
      console.error("Error al obtener actividad:", err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    res.json(resultados);
  });
});

//Grafica de actividad de datos
router.get("/actividad-datos", verificarToken, verificarAdmin, (req, res) => {
  const usuarioId = req.query.usuario_id;

  let query = "";
  let params = [];

  if (usuarioId) {
    query = `
      SELECT 
        u.id,
        CONCAT(u.nombres, ' ', u.apellidos) AS usuario,
        (
          SELECT COUNT(*) FROM ingresos WHERE usuario_id = u.id
        ) +
        (
          SELECT COUNT(*) FROM gastos WHERE usuario_id = u.id
        ) +
        (
          SELECT COUNT(*) FROM plan_ahorro WHERE usuario_id = u.id
        ) AS acciones
      FROM usuarios u
      WHERE u.id = ?
    `;
    params = [usuarioId];
  } else {
    query = `
      SELECT 
        u.id,
        CONCAT(u.nombres, ' ', u.apellidos) AS usuario,
        (
          SELECT COUNT(*) FROM ingresos WHERE usuario_id = u.id
        ) +
        (
          SELECT COUNT(*) FROM gastos WHERE usuario_id = u.id
        ) +
        (
          SELECT COUNT(*) FROM plan_ahorro WHERE usuario_id = u.id
        ) AS acciones
      FROM usuarios u
      WHERE u.rol_id != 1
      ORDER BY acciones DESC
      LIMIT 10
    `;
  }

  db.query(query, params, (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener actividad de datos:", err);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }

    res.json(resultados);
  });
});


//Grafica por operaciones
router.get("/estadisticas/operaciones", verificarToken, verificarAdmin, (req, res) => {
  const usuarioId = req.query.usuario_id;

  const query = usuarioId
    ? `
      SELECT tipo, COUNT(*) AS cantidad
      FROM (
        SELECT 'Ingreso' AS tipo FROM ingresos WHERE usuario_id = ?
        UNION ALL
        SELECT 'Gasto' AS tipo FROM gastos WHERE usuario_id = ?
        UNION ALL
        SELECT 'Ahorro' AS tipo FROM plan_ahorro WHERE usuario_id = ?
      ) AS operaciones
      GROUP BY tipo;
    `
    : `
      SELECT tipo, COUNT(*) AS cantidad
      FROM (
        SELECT 'Ingreso' AS tipo FROM ingresos
        UNION ALL
        SELECT 'Gasto' AS tipo FROM gastos
        UNION ALL
        SELECT 'Ahorro' AS tipo FROM plan_ahorro
      ) AS operaciones
      GROUP BY tipo;
    `;

  const params = usuarioId ? [usuarioId, usuarioId, usuarioId] : [];

  db.query(query, params, (err, resultados) => {
    if (err) {
      console.error("Error al obtener estadísticas de operaciones:", err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    res.json(resultados);
  });
});


//Evolución mensual
router.get("/estadisticas/evolucion-mensual", verificarToken, verificarAdmin, (req, res) => {
  const usuarioId = req.query.usuario_id;

  const query = usuarioId
    ? `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        'Ingreso' AS tipo,
        COUNT(*) AS cantidad
      FROM ingresos
      WHERE usuario_id = ?
      GROUP BY mes
      UNION
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        'Gasto' AS tipo,
        COUNT(*) AS cantidad
      FROM gastos
      WHERE usuario_id = ?
      GROUP BY mes
      UNION
      SELECT
        DATE_FORMAT(fecha_inicio, '%Y-%m') AS mes,
        'Ahorro' AS tipo,
        COUNT(*) AS cantidad
      FROM plan_ahorro
      WHERE usuario_id = ?
      GROUP BY mes
      ORDER BY mes ASC;
    `
    : `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        'Ingreso' AS tipo,
        COUNT(*) AS cantidad
      FROM ingresos
      GROUP BY mes
      UNION
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        'Gasto' AS tipo,
        COUNT(*) AS cantidad
      FROM gastos
      GROUP BY mes
      UNION
      SELECT
        DATE_FORMAT(fecha_inicio, '%Y-%m') AS mes,
        'Ahorro' AS tipo,
        COUNT(*) AS cantidad
      FROM plan_ahorro
      GROUP BY mes
      ORDER BY mes ASC;
    `;

  const params = usuarioId ? [usuarioId, usuarioId, usuarioId] : [];

  db.query(query, params, (err, resultados) => {
    if (err) {
      console.error("Error al obtener evolución mensual:", err);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }

    res.json(resultados);
  });
});


module.exports = router;