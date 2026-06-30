const fs = require("fs");
const { OpenAI } = require("openai");
const logger = require("./logger");

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
- transferencias bancarias
- financiamientos
- capturas bancarias
- compras a cuotas
- comprobantes de pago

OBJETIVO:
Extraer movimientos financieros correctamente según el tipo de documento.

REGLAS IMPORTANTES:

━━━━━━━━━━━━━━━━━━━━━━
1. FACTURAS O TICKETS
━━━━━━━━━━━━━━━━━━━━━━

Si la imagen es una factura o ticket:

- NO dividas cada producto como movimiento separado.
- Debes devolver UN SOLO movimiento financiero.
- Usa el TOTAL FINAL del ticket.
- Detecta el nombre del comercio o empresa.
- Resume brevemente los productos.
- Guarda también la lista de productos detectados.

Ejemplo:
Compra en CELASA: lámparas, cables y bombillas

━━━━━━━━━━━━━━━━━━━━━━
2. ESTADOS DE CUENTA
━━━━━━━━━━━━━━━━━━━━━━

Si es un estado de cuenta:
- sí puedes devolver múltiples movimientos.

━━━━━━━━━━━━━━━━━━━━━━
3. TRANSFERENCIAS BANCARIAS
━━━━━━━━━━━━━━━━━━━━━━

Si detectas una transferencia bancaria:

- extrae:
  - banco
  - monto
  - destinatario
  - comentario
  - fecha si existe

- usa tipo:
  "transferencia"

Ejemplo:

{
  "descripcion": "Transferencia a Distribuidora de Material",
  "empresa": "Banco Industrial",
  "monto": 1120.00,
  "tipo": "transferencia"
}

━━━━━━━━━━━━━━━━━━━━━━
4. FINANCIAMIENTOS
━━━━━━━━━━━━━━━━━━━━━━

Si detectas cuotas o financiamiento:
- usa tipo "gasto-fijo"
- agrega campo "cuotas"

━━━━━━━━━━━━━━━━━━━━━━
5. COMPRAS NORMALES
━━━━━━━━━━━━━━━━━━━━━━

Si es una compra normal:
- usa tipo "gasto-normal"

━━━━━━━━━━━━━━━━━━━━━━
6. IGNORAR
━━━━━━━━━━━━━━━━━━━━━━

Ignora completamente:
- saldo disponible
- saldo actual
- banners
- navegación
- botones
- publicidad
- logos decorativos
- encabezados irrelevantes
- interfaz visual del banco

━━━━━━━━━━━━━━━━━━━━━━
7. RESPUESTA
━━━━━━━━━━━━━━━━━━━━━━

RESPONDE ÚNICAMENTE JSON VÁLIDO.

NO uses markdown.
NO uses \`\`\`.
NO expliques nada.
NO agregues texto fuera del JSON.

Formato esperado:

[
  {
    "descripcion": "Compra en CELASA: lámparas y cables",
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

Si no detectas movimientos financieros válidos:
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

REGLAS:

- Si es una factura:
  devuelve UN solo gasto total.

- Si es transferencia:
  detecta monto y destinatario.

- Si es estado de cuenta:
  devuelve múltiples movimientos.

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

        max_tokens: 1400,
      });

    // ─────────────────────────────────
    // Contenido IA
    // ─────────────────────────────────
    let contenido =
      response
        .choices[0]
        .message
        .content
        .trim();

    // ─────────────────────────────────
    // Limpiar markdown si OpenAI responde
    // con ```json
    // ─────────────────────────────────
    contenido = contenido
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let resultado;

    // ─────────────────────────────────
    // Parsear JSON
    // ─────────────────────────────────
    try {

      resultado =
        JSON.parse(contenido);

    } catch (parseError) {

      logger.error({ err: parseError, raw: contenido }, "Error parseando JSON de OpenAI");

      return [];
    }

    // ─────────────────────────────────
    // { movimientos: [] }
    // ─────────────────────────────────
    if (
      resultado.movimientos &&
      Array.isArray(resultado.movimientos)
    ) {

      return resultado.movimientos;

    }

    // ─────────────────────────────────
    // Array directo
    // ─────────────────────────────────
    if (Array.isArray(resultado)) {

      return resultado;

    }

    return [];

  } catch (error) {

    logger.error({ err: error }, "Error llamando a OpenAI");

    return [];

  }

};

module.exports = {
  analizarImagenOpenAI,
};