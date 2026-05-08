const fs = require("fs");

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────
// Analizar imagen financiera
// ─────────────────────────────────────
const analizarImagenOpenAI = async (rutaImagen) => {

  try {

    // ─────────────────────────────────
    // Leer imagen
    // ─────────────────────────────────
    const imageBuffer =
      fs.readFileSync(rutaImagen);

    const base64Image =
      imageBuffer.toString("base64");

    // ─────────────────────────────────
    // OpenAI Vision
    // ─────────────────────────────────
    const response =
      await openai.chat.completions.create({

        model: "gpt-4o",

        messages: [
          {
            role: "system",

            content: `
Eres una IA especializada en análisis financiero visual.

Tu tarea es analizar imágenes financieras como:
- estados de cuenta
- financiamientos
- tickets
- capturas bancarias
- compras a cuotas

Debes extraer ÚNICAMENTE movimientos financieros relevantes.

Ignora completamente:
- saldos disponibles
- saldo actual
- encabezados
- banners
- botones
- navegación de apps
- logos
- elementos visuales del banco
- textos repetidos
- publicidad

Extrae solamente:
- descripcion
- monto
- cuotas (si existen)

Reglas:
- responde únicamente JSON válido
- no expliques nada
- no uses markdown
- no agregues texto adicional
- devuelve únicamente un array JSON

Formato esperado:

[
  {
    "descripcion": "Crocs Oakland Place Guatemala",
    "monto": 249.96,
    "cuotas": "3/6"
  }
]

Si no encuentras movimientos válidos:
[]
`,
          },

          {
            role: "user",

            content: [
              {
                type: "text",

                text: `
Extrae únicamente los movimientos financieros visibles en la imagen.
Ignora saldos generales y datos de interfaz.
`,
              },

              {
                type: "image_url",

                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],

        temperature: 0.1,

        max_tokens: 700,
      });

    // ─────────────────────────────────
    // Contenido IA
    // ─────────────────────────────────
    const contenido =
      response
        .choices[0]
        .message
        .content
        .trim();

    let resultado;

    // ─────────────────────────────────
    // Parsear JSON
    // ─────────────────────────────────
    try {

      resultado =
        JSON.parse(contenido);

    } catch (parseError) {

      console.error(
        "Error parseando JSON:",
        parseError
      );

      console.error(
        "Respuesta IA:",
        contenido
      );

      return [];
    }

    // ─────────────────────────────────
    // Si devuelve:
    // { movimientos: [] }
    // ─────────────────────────────────
    if (
      resultado.movimientos &&
      Array.isArray(resultado.movimientos)
    ) {

      return resultado.movimientos;

    }

    // ─────────────────────────────────
    // Si devuelve array directamente
    // ─────────────────────────────────
    if (Array.isArray(resultado)) {

      return resultado;

    }

    return [];

  } catch (error) {

    console.error(
      "ERROR OPENAI:",
      error.response?.data ||
      error.message ||
      error
    );

    return [];

  }

};

module.exports = {
  analizarImagenOpenAI,
};