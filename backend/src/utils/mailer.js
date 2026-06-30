const { Resend } = require("resend");
const logger = require("./logger");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    logger.info({ to }, "Enviando correo");

    const response = await resend.emails.send({
      from: "SaldoGt <no-reply@misaldo.lat>",
      to,
      subject,
      html,
    });

    logger.info({ id: response.id }, "Correo enviado");
  } catch (error) {
    logger.error({ err: error }, "Error al enviar correo");
    throw error;
  }
};

module.exports = { sendEmail };