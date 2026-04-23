const { generarRespuestaIA } = require("../utils/openaiService");

const manejarAsistente = async (req, res) => {
  const { mensaje } = req.body;

  try {
    if (!mensaje || mensaje.trim() === "") {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    const prompt = `Actúa como un asistente de finanzas personales. El usuario escribe: "${mensaje}". Responde de forma clara y útil.`;
    const respuesta = await generarRespuestaIA(prompt);

    res.json({ respuesta });
  } catch (error) {
    console.error("Error al generar respuesta IA:", error);
    res.status(500).json({ error: "Error al generar respuesta de IA" });
  }
};

module.exports = { manejarAsistente };
