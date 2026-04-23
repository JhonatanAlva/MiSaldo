const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generarRespuestaIA = async (prompt) => {
  const response = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "Eres un asistente de finanzas personales" },
      { role: "user", content: prompt }
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.7
  });

  return response.choices[0].message.content;
};

module.exports = { generarRespuestaIA };
