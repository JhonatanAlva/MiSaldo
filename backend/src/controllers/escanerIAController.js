const fs = require("fs");

const escanerIAService =
  require("../services/escanerIAService");

// ─────────────────────────────────────
// Analizar imagen
// ─────────────────────────────────────
const analizarImagen =
  async (req, res) => {

    try {

      // ─────────────────────────────────
      // Validar archivo
      // ─────────────────────────────────
      if (!req.file) {

        return res.status(400).json({
          mensaje:
            "No se recibió ninguna imagen",
        });

      }

      // ─────────────────────────────────
      // Ruta imagen
      // ─────────────────────────────────
      const rutaImagen =
        req.file.path;

      console.log(
        "Imagen recibida:",
        rutaImagen
      );

      // ─────────────────────────────────
      // Analizar IA
      // ─────────────────────────────────
      const resultado =
        await escanerIAService.analizarImagen(
          rutaImagen
        );

      // ─────────────────────────────────
      // Eliminar imagen temporal
      // ─────────────────────────────────
      if (
        fs.existsSync(rutaImagen)
      ) {

        fs.unlinkSync(rutaImagen);

      }

      // ─────────────────────────────────
      // Respuesta
      // ─────────────────────────────────
      res.json(resultado);

    } catch (error) {

      console.error(
        "Error escáner IA:",
        error
      );

      // ─────────────────────────────────
      // Eliminar imagen si falla
      // ─────────────────────────────────
      if (
        req.file &&
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {

        fs.unlinkSync(req.file.path);

      }

      res.status(500).json({
        mensaje:
          "Error al analizar imagen",
      });

    }

  };

module.exports = {
  analizarImagen,
};