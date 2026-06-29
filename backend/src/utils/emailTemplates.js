const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const generarEmailConfirmacion = (nombre, url) => {
  const nombreSeguro = escapeHtml(nombre);
  return `
  <div style="font-family: Arial, sans-serif; background:#0f172a; padding:40px;">

    <div style="max-width:500px; margin:auto; background:#111827; padding:30px; border-radius:12px; text-align:center;">

      <h1 style="color:#00c896; margin-bottom:10px;">SaldoGt</h1>

      <h2 style="color:#ffffff;">Hola ${nombreSeguro},</h2>

      <p style="color:#9ca3af; font-size:14px;">
        Gracias por registrarte. Para activar tu cuenta, confirma tu correo haciendo clic en el botón.
      </p>

      <a href="${url}" 
         style="display:inline-block; margin-top:20px; padding:12px 25px; background:#00c896; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">
         Confirmar cuenta
      </a>

      <p style="margin-top:25px; font-size:12px; color:#6b7280;">
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </p>

    </div>

    <p style="text-align:center; margin-top:20px; font-size:11px; color:#6b7280;">
      © ${new Date().getFullYear()} SaldoGt. Todos los derechos reservados.
    </p>

  </div>
  `;
};

const generarEmailRecuperacion = (nombres, url) => {
  const nombresSeguro = escapeHtml(nombres);
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#f5f7fb;">
    <div style="background:#ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <h2 style="color:#111318; margin-bottom: 8px;">Hola, ${nombresSeguro} 👋</h2>
      <p style="color:#555; font-size: 15px; line-height: 1.6;">
        Recibimos una solicitud para restablecer tu contraseña en <strong>SaldoGt</strong>.
        Si fuiste tú, haz clic en el siguiente botón para continuar:
      </p>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${url}"
           style="background:#00c896; color:#000; text-decoration:none; font-weight:bold;
                  padding: 12px 28px; border-radius: 10px; display:inline-block; font-size: 14px;">
          Restablecer contraseña
        </a>
      </div>
      <p style="color:#999; font-size: 13px; line-height: 1.5;">
        Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo
        y tu contraseña seguirá igual.
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin: 24px 0;">
      <p style="color:#bbb; font-size: 11px; text-align:center;">
        © 2025 SaldoGt · Todos los derechos reservados
      </p>
    </div>
  </div>
`;
};

module.exports = {
  generarEmailConfirmacion,
  generarEmailRecuperacion,
};