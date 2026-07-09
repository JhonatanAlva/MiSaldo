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
  resumenMes,
  mesActual,
  anioActual,
}) => {

  const nombreMes = new Date(anioActual, mesActual - 1, 1)
    .toLocaleString("es-GT", { month: "long" });

  const totalIngresos = Number(resumenMes?.total_ingresos || 0);
  const totalGastos   = Number(resumenMes?.total_gastos   || 0);
  const balance       = totalIngresos - totalGastos;

  const mesStr = `${anioActual}-${String(mesActual).padStart(2, "0")}`;
  const ingresosMes = (ingresos || []).filter(i => String(i.fecha || "").startsWith(mesStr));
  const gastosMes   = (gastos   || []).filter(g => String(g.fecha || "").startsWith(mesStr));
  const ingresosAnt = (ingresos || []).filter(i => !String(i.fecha || "").startsWith(mesStr)).slice(0, 5);
  const gastosAnt   = (gastos   || []).filter(g => !String(g.fecha || "").startsWith(mesStr)).slice(0, 5);

  const hoy = new Date().toLocaleDateString("es-GT", {
    year: "numeric", month: "long", day: "numeric",
  });

  const prompt = `
Eres un asistente financiero personal. Hoy es ${hoy}.

El usuario preguntó: "${mensaje}"

━━ TOTALES EXACTOS DE ${nombreMes.toUpperCase()} ${anioActual} ━━
Total ingresos este mes: Q${totalIngresos.toFixed(2)}
Total gastos este mes:   Q${totalGastos.toFixed(2)}
Balance este mes:        Q${balance.toFixed(2)}

━━ TRANSACCIONES DE ESTE MES ━━
Ingresos:
${ingresosMes.length > 0 ? JSON.stringify(ingresosMes) : "Ninguno registrado este mes"}

Gastos:
${gastosMes.length > 0 ? JSON.stringify(gastosMes) : "Ninguno registrado este mes"}

━━ TRANSACCIONES DE MESES ANTERIORES ━━
Ingresos anteriores (últimos 5):
${ingresosAnt.length > 0 ? JSON.stringify(ingresosAnt) : "Ninguno"}

Gastos anteriores (últimos 5):
${gastosAnt.length > 0 ? JSON.stringify(gastosAnt) : "Ninguno"}

━━ CONFIGURACIONES FIJAS (no son transacciones reales) ━━
Ingresos fijos activos:
${ingresosFijos?.length > 0 ? JSON.stringify(ingresosFijos) : "Ninguno"}

Gastos fijos activos:
${gastosFijos?.length > 0 ? JSON.stringify(gastosFijos) : "Ninguno"}

REGLAS ESTRICTAS:
- Usa ÚNICAMENTE los datos proporcionados. Nunca inventes ni estimes cifras.
- Si el usuario pregunta por "este mes", usa los TOTALES EXACTOS de ${nombreMes} ${anioActual}.
- Los ingresos/gastos fijos son configuraciones, no son transacciones reales del mes.
- Si no hay datos para responder, dilo claramente.
- Máximo 100 palabras. Respuesta directa, sin markdown, en español.
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