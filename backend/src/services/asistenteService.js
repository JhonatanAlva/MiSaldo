const OpenAI = require('openai');
const { generarRespuestaIA } = require('../utils/openaiService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Chat del asistente ────────────────────────────────────────
const manejarMensaje = async (mensaje) => {
  const prompt = `Actúa como un asistente de finanzas personales. El usuario escribe: "${mensaje}". Responde de forma clara y útil.`;
  return generarRespuestaIA(prompt);
};

// ── Análisis de gráficas (admin) ──────────────────────────────
const analizarGraficas = async ({ usuariosPorDatos, datosOperaciones, datosEvolucion }) => {
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

  return generarRespuestaIA(prompt);
};

// ── Análisis financiero personal ──────────────────────────────
const analizarDatos = async ({ tipo, datos, nombre }) => {
  if (!datos || datos.length === 0) {
    return { resumen: `No se encontraron ${tipo} registrados para analizar.` };
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

  const respuesta = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  return { resumen: respuesta.choices[0].message.content };
};

module.exports = { manejarMensaje, analizarGraficas, analizarDatos };