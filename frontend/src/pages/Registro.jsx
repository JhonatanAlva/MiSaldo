import React, { useState } from "react";
import RegistroForm from "../components/registro/RegistroForm";
import "../assets/registro.css";

const Registro = () => {
  const [mensaje, setMensaje] = useState("");

  return (
    <div className="registro-container d-flex">
      {/* Sección izquierda */}
      <div className="registro-info">
        <img src="/logo.png" alt="MiSaldo" className="registro-logo" />
        <blockquote className="mt-4">
          “Cada quetzal cuenta. Organiza tu dinero con MiSaldo.”
        </blockquote>
        <footer className="mt-5">
          © 2025 MiSaldo. Todos los derechos reservados.
        </footer>
      </div>

      {/* Sección derecha */}
      <div className="registro-box">
        <h2 className="mb-3">Crear cuenta</h2>

        <RegistroForm setMensaje={setMensaje} />

        {mensaje && <div className="mensaje">{mensaje}</div>}

        <button
          className="btn btn-outline-light mt-3 w-100"
          onClick={() => (window.location.href = "/login")}
        >
          ← Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default Registro;
