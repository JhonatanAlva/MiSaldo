const { generarRespuestaIA } = require("../utils/openaiService");

// --- Analiza gráficas con IA ---
const analizarGraficasIA = async (req, res) => {
  try {
    const { usuariosPorDatos, datosOperaciones, datosEvolucion } = req.body;

    const prompt = `
Eres un asistente financiero. Analiza los siguientes datos de estadísticas de un sistema de finanzas personales y genera un resumen con observaciones y recomendaciones breves.

Usuarios con más datos registrados:
${JSON.stringify(usuariosPorDatos, null, 2)}

Tipos de operaciones más comunes:
${JSON.stringify(datosOperaciones, null, 2)}

Evolución mensual de registros:
${JSON.stringify(datosEvolucion, null, 2)}

Proporciona el análisis de forma clara y en español.
    `;

    const respuesta = await generarRespuestaIA(prompt);
    res.json({ respuesta });
  } catch (error) {
    console.error("Error en analizarGraficasIA:", error);
    res.status(500).json({ error: "Error al analizar las gráficas" });
  }
};

module.exports = { analizarGraficasIA };
