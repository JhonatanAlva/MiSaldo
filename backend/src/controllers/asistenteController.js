const asistenteService = require('../services/asistenteService');

// ── Chat del asistente ────────────────────────────────────────
const manejarAsistente = async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje || mensaje.trim() === '') {
    return res.status(400).json({ error: 'Mensaje vacío' });
  }

  try {
    const respuesta = await asistenteService.manejarMensaje(mensaje);
    res.json({ respuesta });
  } catch (err) {
    console.error('Error al generar respuesta IA:', err);
    res.status(500).json({ error: 'Error al generar respuesta de IA' });
  }
};

// ── Análisis de finanzas ──────────────────────────────────────
const analizarFinanzas = async (req, res) => {
  try {
    const data = await asistenteService.analizarDatos(req.body);
    res.json(data);
  } catch (err) {
    console.error('Error al generar análisis con IA:', err.message);
    res.status(500).json({ resumen: 'Error al generar análisis con IA.' });
  }
};

module.exports = { manejarAsistente, analizarFinanzas };