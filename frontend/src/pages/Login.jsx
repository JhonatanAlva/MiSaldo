import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/login/LoginForm";
import GoogleLoginButton from "../components/login/GoogleLoginButton";

import "../assets/login.css";

const Login = () => {
  const location = useLocation();
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("confirmado") === "1") {
      setMensajeConfirmacion("✅ Tu cuenta ha sido confirmada.");
    }
    if (params.get("error") === "cuenta_inactiva") {
      setMensaje("Tu cuenta está desactivada. Contacta al administrador.");
      const nuevaURL = window.location.pathname;
      window.history.replaceState({}, "", nuevaURL);
      setTimeout(() => setMensaje(""), 5000);
    }
  }, [location.search]);


  return (
    <div className="login-container">
      {/* Lado izquierdo: logo y mensaje */}
      <div className="login-info">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <blockquote className="mt-4">
          “Cada quetzal cuenta. Organiza tu dinero con MiSaldo.”
        </blockquote>
        <footer className="mt-5">© 2025 MiSaldo. Todos los derechos reservados.</footer>
      </div>

      {/* Lado derecho: formulario de login */}
      <div className="login-box tarjeta">
        <h2>Iniciar sesión</h2>

        {mensaje && <div className="alert alert-danger">{mensaje}</div>}
        {mensajeConfirmacion && (
          <div className="alert alert-success">{mensajeConfirmacion}</div>
        )}

        <LoginForm
          setError={setError}
          setMensajeConfirmacion={setMensajeConfirmacion}
        />

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {/* Separador visual */}
        <div className="my-4 d-flex align-items-center">
          <hr className="flex-grow-1" />
          <span className="px-2 text-muted"></span>
          <span className="px-2-text-muted">o</span>
          <span className="px-2 text-muted"></span>
          <hr className="flex-grow-1" />
        </div>

        <GoogleLoginButton />

        <button
          className="btn btn-outline-primary w-100 mt-3"
          onClick={() => (window.location.href = "/registro")}
        >
          Crear nueva cuenta
        </button>
      </div>
    </div>
  );
};

export default Login;
