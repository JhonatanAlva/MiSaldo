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

      const usuarioId =
        req.usuario.id;

      // ─────────────────────────────────
      // Obtener ingresos
      // ─────────────────────────────────
      const ingresosRes =
        await db.query(
          `
          SELECT descripcion, monto
          FROM ingresos
          WHERE usuario_id = $1
          ORDER BY fecha DESC
          LIMIT 10
          `,
          [usuarioId]
        );

      // ─────────────────────────────────
      // Obtener gastos
      // ─────────────────────────────────
      const gastosRes =
        await db.query(
          `
          SELECT descripcion, monto
          FROM gastos
          WHERE usuario_id = $1
          ORDER BY fecha DESC
          LIMIT 10
          `,
          [usuarioId]
        );

      // ─────────────────────────────────
      // Obtener ingresos fijos
      // ─────────────────────────────────
      const ingresosFijosRes =
        await db.query(
          `
          SELECT nombre, monto
          FROM ingresos_fijos
          WHERE usuario_id = $1
          `,
          [usuarioId]
        );

      // ─────────────────────────────────
      // Obtener gastos fijos
      // ─────────────────────────────────
      const gastosFijosRes =
        await db.query(
          `
          SELECT nombre, monto
          FROM gastos_fijos
          WHERE usuario_id = $1
          `,
          [usuarioId]
        );

      // ─────────────────────────────────
      // Generar respuesta IA
      // ─────────────────────────────────
      const respuesta =
        await asistenteService.manejarMensaje({

          mensaje,

          ingresos:
            ingresosRes.rows,

          gastos:
            gastosRes.rows,

          ingresosFijos:
            ingresosFijosRes.rows,

          gastosFijos:
            gastosFijosRes.rows,

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