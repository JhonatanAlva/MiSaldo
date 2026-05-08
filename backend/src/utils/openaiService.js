const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generarRespuestaIA = async (prompt) => {

  const response =
    await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",

          content: `
Eres un asistente financiero profesional.

Reglas:
- responde en español
- respuestas cortas y útiles
- máximo 120 palabras
- usa máximo 2 párrafos
- evita repetir información
- no uses markdown
- no uses títulos
- no uses símbolos como # o **
- sé directo y profesional
`,
        },

        {
          role: "user",

          content: prompt,
        },
      ],

      temperature: 0.4,

      max_tokens: 180,
    });

  return response
    .choices[0]
    .message
    .content;

};

module.exports = {
  generarRespuestaIA,
};