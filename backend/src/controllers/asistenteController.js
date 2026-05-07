const asistenteService = require('../services/asistenteService');

const manejarAsistente = async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje || mensaje.trim() === '') {
    return res.status(400).json({
      error: 'Mensaje vacío',
    });
  }

  try {

    const respuesta =
      await asistenteService.manejarMensaje(
        mensaje
      );

    res.json({ respuesta });

  } catch (err) {

    console.error(
      'Error al generar respuesta IA:',
      err
    );

    res.status(500).json({
      error:
        'Error al generar respuesta de IA',
    });

  }
};

// ─────────────────────────────────────
// Análisis normal
// ─────────────────────────────────────
const analizarFinanzas = async (
  req,
  res
) => {

  try {

    const data =
      await asistenteService.analizarDatos(
        req.body
      );

    res.json(data);

  } catch (err) {

    console.error(
      'Error al generar análisis IA:',
      err.message
    );

    res.status(500).json({
      resumen:
        'Error al generar análisis.',
    });

  }
};

// ─────────────────────────────────────
// NUEVO → Gastos fijos
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

      console.error(
        'Error IA gastos fijos:',
        err
      );

      res.status(500).json({
        resumen:
          'Error al analizar gastos fijos.',
      });

    }
  };

module.exports = {
  manejarAsistente,
  analizarFinanzas,
  analizarGastosFijos,
};