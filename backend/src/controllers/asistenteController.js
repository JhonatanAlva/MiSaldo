const asistenteService = require("../services/asistenteService");
const db = require("../config/db");
const logger = require("../utils/logger");

// ─────────────────────────────────────
// Chat IA
// ─────────────────────────────────────
const manejarAsistente =
  async (req, res) => {

    const { mensaje } = req.body;

    if (
      !mensaje ||
      mensaje.trim() === ""
    ) {

      return res.status(400).json({
        error: "Mensaje vacío",
      });

    }

    try {

      const usuarioId = req.usuario.id;
      const ahora = new Date();
      const mesActual = ahora.getMonth() + 1;
      const anioActual = ahora.getFullYear();

      // ─────────────────────────────────
      // Totales exactos del mes actual
      // ─────────────────────────────────
      const resumenMesRes = await db.query(
        `SELECT
           COALESCE((SELECT SUM(monto) FROM ingresos
             WHERE usuario_id = $1
               AND EXTRACT(MONTH FROM fecha) = $2
               AND EXTRACT(YEAR  FROM fecha) = $3), 0) AS total_ingresos,
           COALESCE((SELECT SUM(monto) FROM gastos
             WHERE usuario_id = $1
               AND EXTRACT(MONTH FROM fecha) = $2
               AND EXTRACT(YEAR  FROM fecha) = $3), 0) AS total_gastos`,
        [usuarioId, mesActual, anioActual]
      );

      // ─────────────────────────────────
      // Transacciones recientes con fecha
      // ─────────────────────────────────
      const ingresosRes = await db.query(
        `SELECT fuente AS descripcion, monto,
                TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha
         FROM ingresos
         WHERE usuario_id = $1
         ORDER BY fecha DESC
         LIMIT 20`,
        [usuarioId]
      );

      const gastosRes = await db.query(
        `SELECT g.descripcion, g.monto,
                TO_CHAR(g.fecha, 'YYYY-MM-DD') AS fecha,
                c.nombre AS categoria
         FROM gastos g
         LEFT JOIN categorias c ON c.id = g.categoria_id
         WHERE g.usuario_id = $1
         ORDER BY g.fecha DESC
         LIMIT 20`,
        [usuarioId]
      );

      // ─────────────────────────────────
      // Fijos activos
      // ─────────────────────────────────
      const ingresosFijosRes = await db.query(
        `SELECT nombre, monto, frecuencia
         FROM ingresos_fijos
         WHERE usuario_id = $1 AND activo = true`,
        [usuarioId]
      );

      const gastosFijosRes = await db.query(
        `SELECT nombre, monto, dia_cobro
         FROM gastos_fijos
         WHERE usuario_id = $1 AND activo = true`,
        [usuarioId]
      );

      // ─────────────────────────────────
      // Generar respuesta IA
      // ─────────────────────────────────
      const respuesta = await asistenteService.manejarMensaje({
        mensaje,
        ingresos:      ingresosRes.rows,
        gastos:        gastosRes.rows,
        ingresosFijos: ingresosFijosRes.rows,
        gastosFijos:   gastosFijosRes.rows,
        resumenMes:    resumenMesRes.rows[0],
        mesActual,
        anioActual,
      });

      res.json({
        respuesta,
      });

    } catch (err) {

      logger.error({ err }, "Error al generar respuesta IA");

      res.status(500).json({
        error:
          "Error al generar respuesta de IA",
      });

    }

  };

// ─────────────────────────────────────
// Análisis normal
// ─────────────────────────────────────
const analizarFinanzas =
  async (req, res) => {

    try {

      const data =
        await asistenteService.analizarDatos(
          req.body
        );

      res.json(data);

    } catch (err) {

      logger.error({ err }, "Error al generar análisis IA");

      res.status(500).json({
        resumen:
          "Error al generar análisis.",
      });

    }

  };

// ─────────────────────────────────────
// Gastos fijos IA
// ─────────────────────────────────────
const analizarGastosFijos =
  async (req, res) => {

    try {

      const data =
        await asistenteService.analizarGastosFijos(
          req.body
        );

      res.json(data);

    } catch (err) {

      logger.error({ err }, "Error IA gastos fijos");

      res.status(500).json({
        resumen:
          "Error al analizar gastos fijos.",
      });

    }

  };

// ─────────────────────────────────────
// Ingresos fijos IA
// ─────────────────────────────────────
const analizarIngresosFijos =
  async (req, res) => {

    try {

      const data =
        await asistenteService.analizarIngresosFijos(
          req.body
        );

      res.json(data);

    } catch (err) {

      logger.error({ err }, "Error IA ingresos fijos");

      res.status(500).json({
        resumen:
          "Error al analizar ingresos fijos.",
      });

    }

  };

module.exports = {
  manejarAsistente,
  analizarFinanzas,
  analizarGastosFijos,
  analizarIngresosFijos,
};