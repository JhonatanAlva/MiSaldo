const generarEmailConfirmacion = (nombre, url) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#0f172a; padding:40px;">
    
    <div style="max-width:500px; margin:auto; background:#111827; padding:30px; border-radius:12px; text-align:center;">

      <h1 style="color:#00c896; margin-bottom:10px;">SaldoGt</h1>

      <h2 style="color:#ffffff;">Hola ${nombre},</h2>

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

module.exports = {
  generarEmailConfirmacion,
};