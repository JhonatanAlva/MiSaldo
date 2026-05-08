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

          // ───────────────────────────
          // SYSTEM
          // ───────────────────────────
          {
            role: "system",

            content: `
Eres una IA especializada en análisis financiero visual.

Analiza imágenes como:
- facturas
- tickets
- estados de cuenta
- financiamientos
- capturas bancarias
- compras a cuotas

OBJETIVO:
Extraer movimientos financieros correctamente según el tipo de documento.

REGLAS IMPORTANTES:

1. Si la imagen es una FACTURA o TICKET:
- NO dividas cada producto como movimiento separado.
- Debes devolver UN SOLO movimiento financiero.
- Usa el TOTAL FINAL del ticket o factura.
- Detecta el nombre del comercio o empresa.
- Resume los productos comprados en una descripción breve.
- Guarda también la lista de productos detectados.

2. Si la imagen es un ESTADO DE CUENTA:
- sí puedes devolver múltiples movimientos.

3. Si detectas cuotas:
- agrega el campo "cuotas"

4. Ignora completamente:
- saldo disponible
- saldo actual
- banners
- navegación
- botones
- publicidad
- logos decorativos
- encabezados irrelevantes

5. Si detectas un financiamiento:
- usa tipo "gasto-fijo"

6. Si es una compra normal:
- usa tipo "gasto-normal"

RESPONDE ÚNICAMENTE JSON VÁLIDO.

NO uses markdown.
NO uses \`\`\`.
NO expliques nada.

Formato esperado:

[
  {
    "descripcion": "Compra en CELASA: lámparas, cables y bombillas",
    "empresa": "CELASA",
    "monto": 1212.08,
    "tipo": "gasto-normal",
    "productos": [
      "Lámpara ojo de buey",
      "Bombilla LED",
      "Cable THHN"
    ],
    "cuotas": null
  }
]

Si no detectas movimientos:
[]
`,
          },

          // ───────────────────────────
          // USER
          // ───────────────────────────
          {
            role: "user",

            content: [

              {
                type: "text",

                text: `
Analiza el documento financiero.

Si es una factura o ticket:
- devuelve un solo gasto
- usa el total final
- detecta la empresa
- resume los productos

Si es un estado de cuenta:
- devuelve múltiples movimientos.

Devuelve únicamente JSON válido.
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

        max_tokens: 1200,
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