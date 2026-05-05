const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: "MiSaldo <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("✅ Correo enviado correctamente");
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    throw error;
  }
};

module.exports = { sendEmail };