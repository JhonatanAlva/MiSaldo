import React, { useState } from "react";

const VistaConfiguracion = () => {
  const [intentosLogin, setIntentosLogin] = useState(3);
  const [registroUsuarios, setRegistroUsuarios] = useState("on");
  const [expiracionSesion, setExpiracionSesion] = useState("2h");
  const [mensaje, setMensaje] = useState("");

  const manejarGuardar = (e) => {
    e.preventDefault();

    // Simulación de guardado
    console.log("✅ Configuración guardada:", {
      intentosLogin,
      registroUsuarios,
      expiracionSesion,
    });

    setMensaje("Cambios guardados correctamente ✔️");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="admin-card">
      <h2 className="admin-title">Configuración</h2>
      <p className="admin-subtitle">Opciones generales de usuarios.</p>

      <form onSubmit={manejarGuardar}>
        {/* Intentos de login */}
        <label htmlFor="intentos">Intentos fallidos permitidos:</label>
        <select
          id="intentos"
          className="admin-search"
          value={intentosLogin}
          onChange={(e) => setIntentosLogin(parseInt(e.target.value))}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>

        {/* Registro de usuarios */}
        <label htmlFor="registro">Registro de nuevos usuarios:</label>
        <select
          id="registro"
          className="admin-search"
          value={registroUsuarios}
          onChange={(e) => setRegistroUsuarios(e.target.value)}
        >
          <option value="on">Permitido</option>
          <option value="off">Restringido</option>
        </select>

        {/* Expiración de sesión */}
        <label htmlFor="expiracion">Expiración de sesión:</label>
        <select
          id="expiracion"
          className="admin-search"
          value={expiracionSesion}
          onChange={(e) => setExpiracionSesion(e.target.value)}
        >
          <option value="30m">30 minutos</option>
          <option value="1h">1 hora</option>
          <option value="2h">2 horas</option>
        </select>

        <button type="submit" className="btn-guardar" style={{ marginTop: "1rem" }}>
          Guardar cambios
        </button>
      </form>

      {mensaje && <p style={{ color: "#27ae60", marginTop: "1rem" }}>{mensaje}</p>}
    </div>
  );
};

export default VistaConfiguracion;
