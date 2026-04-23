const express = require("express");
const router = express.Router();
const { manejarAsistente } = require("../controllers/asistenteController");
const { analizarGraficasIA } = require("../controllers/asistenteControlleradmin");
const { verificarToken } = require("../utils/jwt");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", verificarToken, manejarAsistente);
router.post("/analizar", verificarToken, analizarGraficasIA);

router.post("/analisis", verificarToken, async (req, res) => {
  const { tipo, datos, nombre } = req.body;

  if (!datos || datos.length === 0) {
    return res.json({
      resumen: `No se encontraron ${tipo} registrados para analizar.`,
    });
  }

  const prompt = `
  Analiza los siguientes datos financieros del usuario ${nombre}.
  Tipo: ${tipo.toUpperCase()}
  Datos JSON: ${JSON.stringify(datos, null, 2)}

  Por favor, entrega un resumen claro y estructurado con:
  1. Observaciones principales
  2. Patrones o anomalías detectadas
  3. Recomendaciones prácticas de mejora financiera
  `;

  try {
    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const resumen = respuesta.choices[0].message.content;
    res.json({ resumen });
  } catch (error) {
    console.error("❌ Error al generar análisis con IA:", error.message);
    res.status(500).json({ resumen: "Error al generar análisis con IA." });
  }
});

module.exports = router;
