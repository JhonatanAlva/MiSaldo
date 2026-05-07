const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generarRespuestaIA = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",

    messages: [
      {
        role: "system",
        content:
          "Eres un asistente financiero breve, claro y útil. Responde en español con mensajes cortos, sin markdown, sin títulos largos y sin usar símbolos como # o **.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.5,
    max_tokens: 120,
  });

  return response.choices[0].message.content;
};

module.exports = { generarRespuestaIA };