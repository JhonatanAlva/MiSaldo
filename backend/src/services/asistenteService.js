const { generarRespuestaIA } = require("../utils/openaiService");

// ── Chat del asistente ────────────────────────────────────────
const manejarMensaje = async (mensaje) => {
  const prompt = `
El usuario escribió:
"${mensaje}"

Responde de forma breve, clara y útil.
Máximo 60 palabras.
`;

  return generarRespuestaIA(prompt);
};

// ── Análisis de gráficas (admin) ──────────────────────────────
const analizarGraficas = async ({
  usuariosPorDatos,
  datosOperaciones,
  datosEvolucion,
}) => {
  const prompt = `
Analiza estas estadísticas financieras.

Genera:
- máximo 3 observaciones
- máximo 2 recomendaciones
- respuesta corta
- sin markdown
- máximo 100 palabras

Usuarios con más datos:
${JSON.stringify(usuariosPorDatos)}

Operaciones más comunes:
${JSON.stringify(datosOperaciones)}

Evolución mensual:
${JSON.stringify(datosEvolucion)}
`;

  return generarRespuestaIA(prompt);
};

// ── Análisis financiero personal ──────────────────────────────
const analizarDatos = async ({ tipo, datos, nombre }) => {
  if (!datos || datos.length === 0) {
    return {
      resumen: `No se encontraron ${tipo} registrados para analizar.`,
    };
  }

  const prompt = `
Analiza los datos financieros del usuario ${nombre}.

Tipo:
${tipo}

Reglas:
- máximo 3 observaciones
- máximo 2 recomendaciones
- respuesta breve
- sin markdown
- máximo 120 palabras

Datos:
${JSON.stringify(datos)}
`;

  const resumen = await generarRespuestaIA(prompt);

  return { resumen };
};

// ── IA de gastos fijos ──────────────────────────────
const analizarGastosFijos = async ({
  gastosFijos,
  ingresos,
  nombre,
}) => {

  if (!gastosFijos || gastosFijos.length === 0) {
    return {
      resumen:
        "No tienes gastos fijos registrados actualmente.",
    };
  }

  const totalGastosFijos =
    gastosFijos.reduce(
      (acc, g) => acc + Number(g.monto),
      0
    );

  const totalIngresos =
    ingresos.reduce(
      (acc, i) => acc + Number(i.monto),
      0
    );

  const porcentaje =
    totalIngresos > 0
      ? (
        (totalGastosFijos /
          totalIngresos) *
        100
      ).toFixed(1)
      : 0;

  const prompt = `
Analiza la salud financiera del usuario ${nombre}.

Información:

Total gastos fijos:
Q${totalGastosFijos}

Total ingresos:
Q${totalIngresos}

Porcentaje comprometido:
${porcentaje}%

Gastos fijos:
${JSON.stringify(gastosFijos)}

Reglas:
- máximo 4 observaciones
- máximo 3 recomendaciones
- respuesta corta
- tono profesional
- sin markdown
- máximo 150 palabras

Debes mencionar:
- si el porcentaje es saludable
- posibles riesgos
- recomendaciones financieras
`;

  const resumen =
    await generarRespuestaIA(prompt);

  return {
    resumen,
    porcentaje,
    totalGastosFijos,
    totalIngresos,
  };
};

module.exports = {
  manejarMensaje,
  analizarGraficas,
  analizarDatos,
  analizarGastosFijos,
};