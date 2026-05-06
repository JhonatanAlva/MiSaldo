const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    console.log("📨 Enviando correo a:", to);

    const response = await resend.emails.send({
      from: "SaldoGt <no-reply@misaldo.lat>",
      to,
      subject,
      html,
    });

    console.log("✅ Resend response:", response);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    throw error;
  }
};

module.exports = { sendEmail };