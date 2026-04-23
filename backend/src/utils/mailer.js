require('dotenv').config();

const nodemailer = require('nodemailer');

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log('Correo enviado exitosamente.');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw error;
    }
  };  

module.exports = { sendEmail };