const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken } = require("../utils/jwt");

// ---------------- Agregar ingreso----------------
router.post("/ingresos", verificarToken, (req, res) => {
  const { monto, fuente, fecha } = req.body;
  const usuarioId = req.usuario.id;

  const sql =
    "INSERT INTO ingresos (usuario_id, monto, fuente, fecha) VALUES (?, ?, ?, ?)";
  db.query(sql, [usuarioId, monto, fuente, fecha], (err, result) => {
    if (err)
      return res.status(500).json({ mensaje: "Error al guardar ingreso" });
    res.json({ mensaje: "Ingreso registrado correctamente" });
  });
});

// ---------------- Agregar gasto (requiere categoria_id ya existente) ----------------
router.post("/gastos", verificarToken, (req, res) => {
  const { monto, descripcion, fecha, categoria_id } = req.body;
  const usuarioId = req.usuario.id;

  if (!categoria_id) {
    return res.status(400).json({ mensaje: "La categoría es obligatoria" });
  }

  const sql = `
      INSERT INTO gastos (usuario_id, categoria_id, monto, descripcion, fecha)
      VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [usuarioId, categoria_id, monto, descripcion, fecha],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ mensaje: "Error al guardar gasto", detalle: err });
      res.json({ mensaje: "Gasto registrado correctamente" });
    }
  );
});

// ---------------- Obtener ingresos del usuario ----------------
router.get("/ingresos", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  db.query(
    "SELECT * FROM ingresos WHERE usuario_id = ?",
    [usuarioId],
    (err, resultados) => {
      if (err)
        return res.status(500).json({ mensaje: "Error al obtener ingresos" });
      res.json(resultados);
    }
  );
});

// ---------------- Obtener gastos del usuario ----------------
router.get("/gastos", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  db.query(
    "SELECT * FROM gastos WHERE usuario_id = ?",
    [usuarioId],
    (err, resultados) => {
      if (err)
        return res.status(500).json({ mensaje: "Error al obtener gastos" });
      res.json(resultados);
    }
  );
});

// ---------------- Resumen financiero (ingresos y gastos) ----------------
router.get("/resumen", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { tipo, inicio, fin } = req.query;

  let where = "1=1";
  const params = [usuarioId, usuarioId];
  let agrupacion = "";

  if (tipo === "mensual") {
    agrupacion = "DATE_FORMAT(fecha, '%Y-%m')";
  } else if (tipo === "trimestral") {
    agrupacion = "CONCAT(YEAR(fecha), '-T', QUARTER(fecha))";
  } else if (tipo === "diario") {
    agrupacion = "DATE(fecha)";
  } else if (tipo === "semanal") {
    agrupacion = "YEARWEEK(fecha, 1)";
  } else if (tipo === "personalizado" && inicio && fin) {
    where += " AND fecha BETWEEN ? AND ?";
    params.push(inicio, fin);
    agrupacion = "DATE_FORMAT(fecha, '%Y-%m')";
  }

  if (!agrupacion) {
    return res.status(400).json({ mensaje: "Tipo no válido" });
  }

  const sql = `
    SELECT 
      ${agrupacion} AS periodo,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
      SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS gastos
    FROM (
      SELECT fecha, monto, 'ingreso' AS tipo FROM ingresos WHERE usuario_id = ?
      UNION ALL
      SELECT fecha, monto, 'gasto' AS tipo FROM gastos WHERE usuario_id = ?
    ) AS movimientos
    WHERE ${where}
    GROUP BY periodo
    ORDER BY periodo DESC
  `;

  db.query(sql, params, (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener resumen financiero:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    const respuesta = resultados.map((r) => ({
      periodo: r.periodo,
      ingresos: Number(r.ingresos),
      gastos: Number(r.gastos),
      saldo: Number(r.ingresos) - Number(r.gastos),
    }));

    res.json(respuesta);
  });
});

// ---------------- Movimientos recientes (ultimos 5 ingresos y gastos) ----------------
router.get("/movimientos-recientes", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const movimientos = {};

  db.query(
    "SELECT * FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 5",
    [usuarioId],
    (err, ingresos) => {
      if (err)
        return res
          .status(500)
          .json({ mensaje: "Error al obtener ingresos recientes" });
      movimientos.ingresos = ingresos;

      db.query(
        "SELECT * FROM gastos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 5",
        [usuarioId],
        (err, gastos) => {
          if (err)
            return res
              .status(500)
              .json({ mensaje: "Error al obtener gastos recientes" });
          movimientos.gastos = gastos;

          res.json(movimientos);
        }
      );
    }
  );
});

// Crear nueva categoría si no existe
router.post("/categoria", verificarToken, (req, res) => {
  const { nombre } = req.body;
  const usuarioId = req.usuario.id;

  if (!nombre || nombre.trim() === "") {
    return res
      .status(400)
      .json({ mensaje: "Nombre de categoría es requerido" });
  }

  db.query(
    "SELECT id FROM categorias WHERE nombre = ?",
    [nombre],
    (err, resultados) => {
      if (err)
        return res.status(500).json({ mensaje: "Error al buscar categoría" });

      if (resultados.length > 0) {
        return res.json({ id: resultados[0].id }); // Ya existe
      }

      const sql =
        "INSERT INTO categorias (nombre, creada_por, es_global) VALUES (?, ?, false)";
      db.query(sql, [nombre, usuarioId], (err, result) => {
        if (err)
          return res.status(500).json({ mensaje: "Error al crear categoría" });
        return res.json({ id: result.insertId });
      });
    }
  );
});

// Obtener categorías del usuario
router.get("/categorias", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const sql = `
      SELECT id, nombre 
      FROM categorias 
      WHERE es_global = true OR creada_por = ?
      ORDER BY nombre ASC
    `;

  db.query(sql, [usuarioId], (err, resultados) => {
    if (err)
      return res.status(500).json({ mensaje: "Error al obtener categorías" });
    res.json(resultados);
  });
});

// Clasificacion de gastos por categoría
router.get("/clasificacion-gastos", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  console.log("📊 Obteniendo clasificación de gastos para usuario:", usuarioId);

  const sql = `
    SELECT c.nombre AS categoria, SUM(g.monto) AS total
    FROM gastos g
    JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = ?
    GROUP BY g.categoria_id
    ORDER BY total DESC
  `;

  console.log("📝 SQL:", sql);

  db.query(sql, [usuarioId], (err, resultados) => {
    if (err) {
      console.error("❌ Error en clasificacion-gastos:", err);
      return res.status(500).json({ mensaje: "Error al clasificar gastos" });
    }

    console.log("✅ Resultados:", resultados);
    res.json(resultados);
  });
});

// Clasificación de ingresos por fuente
router.get("/clasificacion-ingresos", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const sql = `
    SELECT fuente AS fuente, SUM(monto) AS total
    FROM ingresos
    WHERE usuario_id = ?
    GROUP BY fuente
    ORDER BY total DESC
  `;
  db.query(sql, [usuarioId], (err, resultados) => {
    if (err)
      return res.status(500).json({ mensaje: "Error al clasificar ingresos" });
    res.json(resultados);
  });
});

// Ruta principal de balance agrupado por tipo (ahora incluye personalizado)
router.get("/balance", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const tipo = req.query.tipo || "mensual";
  const fechaInicio = req.query.inicio;
  const fechaFin = req.query.fin;

  let agrupacion = "";
  let label = "";

  switch (tipo) {
    case "diario":
      agrupacion = "DATE(fecha)";
      label = "DATE_FORMAT(fecha, '%Y-%m-%d')";
      break;
    case "semanal":
      agrupacion = "YEARWEEK(fecha, 1)";
      label = "CONCAT(YEAR(fecha), '-S', LPAD(WEEK(fecha, 1), 2, '0'))";
      break;
    case "trimestral":
      agrupacion = "CONCAT(YEAR(fecha), '-T', QUARTER(fecha))";
      label = agrupacion;
      break;
    case "personalizado":
      agrupacion = "DATE(fecha)";
      label = "DATE_FORMAT(fecha, '%Y-%m-%d')";
      break;
    case "mensual":
    default:
      agrupacion = "DATE_FORMAT(fecha, '%Y-%m')";
      label = agrupacion;
  }

  let condiciones = "usuario_id = ?";
  let condicionesConFechas = condiciones;
  const params = [];

  if (tipo === "personalizado" && fechaInicio && fechaFin) {
    condicionesConFechas += " AND fecha BETWEEN ? AND ?";
    params.push(
      usuarioId,
      fechaInicio,
      fechaFin,
      usuarioId,
      fechaInicio,
      fechaFin
    );
  } else {
    params.push(usuarioId, usuarioId);
  }

  const sql = `
SELECT 'Ingreso' AS tipo, ${label} AS periodo, SUM(monto) AS total
FROM ingresos
WHERE ${tipo === "personalizado" ? condicionesConFechas : condiciones}
GROUP BY periodo

UNION

SELECT 'Gasto' AS tipo, ${label} AS periodo, SUM(monto) AS total
FROM gastos
WHERE ${tipo === "personalizado" ? condicionesConFechas : condiciones}
GROUP BY periodo
ORDER BY periodo, tipo;
`;

  db.query(sql, params, (err, resultados) => {
    if (err) {
      return res
        .status(500)
        .json({ mensaje: "Error al obtener balance", detalle: err });
    }

    const datosAgrupados = {};

    resultados.forEach((fila) => {
      if (!datosAgrupados[fila.periodo]) {
        datosAgrupados[fila.periodo] = {
          mes: fila.periodo,
          ingresos: 0,
          gastos: 0,
        };
      }

      if (fila.tipo === "Ingreso") {
        datosAgrupados[fila.periodo].ingresos = parseFloat(fila.total);
      } else {
        datosAgrupados[fila.periodo].gastos = parseFloat(fila.total);
      }
    });

    const datos = Object.values(datosAgrupados);
    res.json(datos);
  });
});

// ---------------- Historial de movimientos (ingresos y gastos) ----------------
router.get("/historial", verificarToken, (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  const usuarioId = req.usuario.id;

  const sql = `
    SELECT id, 'Ingreso' AS tipo, fuente AS descripcion, monto, fecha
    FROM ingresos
    WHERE usuario_id = ? ${
      fechaInicio && fechaFin ? "AND fecha BETWEEN ? AND ?" : ""
    }
    UNION
    SELECT id, 'Gasto' AS tipo, descripcion, monto, fecha
    FROM gastos
    WHERE usuario_id = ? ${
      fechaInicio && fechaFin ? "AND fecha BETWEEN ? AND ?" : ""
    }
    ORDER BY fecha DESC
  `;

  const params =
    fechaInicio && fechaFin
      ? [usuarioId, fechaInicio, fechaFin, usuarioId, fechaInicio, fechaFin]
      : [usuarioId, usuarioId];

  db.query(sql, params, (err, resultados) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al obtener historial", detalle: err });
    }
    res.json(resultados);
  });
});

//Eliminar movimiento (ingreso o gasto)
router.delete("/movimiento/:tipo/:id", verificarToken, (req, res) => {
  const { tipo, id } = req.params;

  let tabla = "";
  if (tipo === "ingreso") tabla = "ingresos";
  else if (tipo === "gasto") tabla = "gastos";
  else return res.status(400).json({ mensaje: "Tipo inválido" });

  const sql = `DELETE FROM ${tabla} WHERE id = ?`;

  db.query(sql, [id], (err, resultado) => {
    if (err) {
      return res
        .status(500)
        .json({ mensaje: "Error al eliminar movimiento", detalle: err });
    }

    if (resultado.affectedRows === 0) {
      return res
        .status(404)
        .json({ mensaje: "Movimiento no encontrado o ya eliminado" });
    }

    res.json({ mensaje: "Movimiento eliminado correctamente" });
  });
});

//EDITAR MOVIMIENTO
router.put("/movimiento/:tipo/:id", verificarToken, (req, res) => {
  const { tipo, id } = req.params;
  const { monto, fuente, descripcion, fecha, categoria_id } = req.body;

  // Convertir fecha ISO a formato YYYY-MM-DD
  const fechaFormateada = new Date(fecha).toISOString().split("T")[0];

  let tabla = "";
  let sql = "";
  let valores = [];

  if (tipo === "ingreso") {
    tabla = "ingresos";
    sql = `UPDATE ${tabla} SET monto = ?, fuente = ?, fecha = ? WHERE id = ?`;
    valores = [monto, fuente, fechaFormateada, id];
  } else if (tipo === "gasto") {
    tabla = "gastos";
    sql = `UPDATE ${tabla} SET monto = ?, descripcion = ?, fecha = ?, categoria_id = ? WHERE id = ?`;
    valores = [monto, descripcion, fechaFormateada, categoria_id, id];
  } else {
    return res.status(400).json({ mensaje: "Tipo inválido" });
  }

  db.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ mensaje: "Error al actualizar movimiento" });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Movimiento no encontrado" });
    }

    res.json({ mensaje: "Movimiento actualizado correctamente" });
  });
});

module.exports = router;
