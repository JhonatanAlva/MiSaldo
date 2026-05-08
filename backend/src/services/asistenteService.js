const { generarRespuestaIA } = require("../utils/openaiService");

// ─────────────────────────────────────
// Chat del asistente
// ─────────────────────────────────────
const manejarMensaje = async ({
  mensaje,
  ingresos,
  gastos,
  ingresosFijos,
  gastosFijos,
}) => {

  const prompt = `
El usuario preguntó:
"${mensaje}"

Información financiera actual:

Ingresos:
${JSON.stringify((ingresos || []).slice(0, 10))}

Gastos:
${JSON.stringify((gastos || []).slice(0, 10))}

Ingresos fijos:
${JSON.stringify((ingresosFijos || []).slice(0, 10))}

Gastos fijos:
${JSON.stringify((gastosFijos || []).slice(0, 10))}

Reglas:
- responde usando solamente la información proporcionada
- si no existe información suficiente, indícalo
- máximo 120 palabras
- respuesta clara y directa
- sin markdown
`;

  return generarRespuestaIA(prompt);

};

// ─────────────────────────────────────
// Análisis de gráficas (admin)
// ─────────────────────────────────────
const analizarGraficas = async ({
  usuariosPorDatos,
  datosOperaciones,
  datosEvolucion,
}) => {

  const prompt = `
Analiza estas estadísticas financieras.

Reglas:
- máximo 3 observaciones
- máximo 2 recomendaciones
- máximo 120 palabras
- tono profesional
- sin markdown
- usa párrafos cortos
- evita repetir datos

Usuarios con más datos:
${JSON.stringify((usuariosPorDatos || []).slice(0, 10))}

Operaciones más comunes:
${JSON.stringify((datosOperaciones || []).slice(0, 10))}

Evolución mensual:
${JSON.stringify((datosEvolucion || []).slice(0, 12))}
`;

  return generarRespuestaIA(prompt);

};

// ─────────────────────────────────────
// Análisis financiero general
// ─────────────────────────────────────
const analizarDatos = async ({
  tipo,
  datos,
  nombre,
}) => {

  if (!datos || datos.length === 0) {

    return {
      resumen:
        `No se encontraron ${tipo} registrados para analizar.`,
    };

  }

  const prompt = `
Analiza los datos financieros del usuario ${nombre}.

Tipo:
${tipo}

Reglas:
- máximo 3 observaciones
- máximo 2 recomendaciones
- máximo 120 palabras
- tono profesional
- sin markdown
- usa lenguaje simple
- evita repetir números

Datos:
${JSON.stringify((datos || []).slice(0, 20))}
`;

  const resumen =
    await generarRespuestaIA(prompt);

  return { resumen };

};

// ─────────────────────────────────────
// IA gastos fijos
// ─────────────────────────────────────
const analizarGastosFijos = async ({
  gastosFijos,
  ingresos,
  nombre,
}) => {

  if (
    !gastosFijos ||
    gastosFijos.length === 0
  ) {

    return {
      resumen:
        "No tienes gastos fijos registrados actualmente.",
    };

  }

  const totalGastosFijos =
    (gastosFijos || []).reduce(
      (acc, g) =>
        acc + Number(g.monto),
      0
    );

  const totalIngresos =
    (ingresos || []).reduce(
      (acc, i) =>
        acc + Number(i.monto),
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

Información financiera:

Total gastos fijos:
Q${totalGastosFijos}

Total ingresos:
Q${totalIngresos}

Porcentaje comprometido:
${porcentaje}%

Gastos fijos:
${JSON.stringify((gastosFijos || []).slice(0, 20))}

Reglas:
- máximo 4 observaciones
- máximo 3 recomendaciones
- máximo 120 palabras
- tono profesional
- sin markdown
- usa párrafos cortos
- evita repetir información

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

// ─────────────────────────────────────
// IA ingresos + gastos fijos
// ─────────────────────────────────────
const analizarIngresosFijos = async ({
  ingresosFijos,
  gastosFijos,
  nombre,
}) => {

  if (
    !ingresosFijos ||
    ingresosFijos.length === 0
  ) {

    return {
      resumen:
        "No tienes ingresos fijos registrados actualmente.",
    };

  }

  const totalIngresosFijos =
    (ingresosFijos || []).reduce(
      (acc, i) =>
        acc + Number(i.monto),
      0
    );

  const totalGastosFijos =
    (gastosFijos || []).reduce(
      (acc, g) =>
        acc + Number(g.monto),
      0
    );

  const ahorroEstimado =
    totalIngresosFijos -
    totalGastosFijos;

  const porcentajeComprometido =
    totalIngresosFijos > 0
      ? (
        (totalGastosFijos /
          totalIngresosFijos) *
        100
      ).toFixed(1)
      : 0;

  const prompt = `
Analiza la estabilidad financiera del usuario ${nombre}.

Información financiera:

Ingresos fijos:
Q${totalIngresosFijos}

Gastos fijos:
Q${totalGastosFijos}

Capacidad estimada de ahorro:
Q${ahorroEstimado}

Porcentaje comprometido:
${porcentajeComprometido}%

Ingresos:
${JSON.stringify((ingresosFijos || []).slice(0, 20))}

Gastos:
${JSON.stringify((gastosFijos || []).slice(0, 20))}

Reglas:
- máximo 5 observaciones
- máximo 3 recomendaciones
- máximo 120 palabras
- tono profesional
- sin markdown
- usa párrafos cortos
- evita repetir información
- usa lenguaje simple

Debes analizar:
- estabilidad financiera
- capacidad de ahorro
- salud financiera
- riesgos financieros
- sostenibilidad de gastos
`;

  const resumen =
    await generarRespuestaIA(prompt);

  return {
    resumen,
    totalIngresosFijos,
    totalGastosFijos,
    ahorroEstimado,
    porcentajeComprometido,
  };

};

module.exports = {
  manejarMensaje,
  analizarGraficas,
  analizarDatos,
  analizarGastosFijos,
  analizarIngresosFijos,
};