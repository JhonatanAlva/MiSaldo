import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/login/LoginForm";
import GoogleLoginButton from "../components/login/GoogleLoginButton";

const Login = () => {
  const location = useLocation();
  const [mensaje, setMensaje] = useState("");
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("confirmado") === "1") {
      setMensajeConfirmacion("Tu cuenta ha sido confirmada. Ya puedes iniciar sesión.");
    }
    if (params.get("error") === "cuenta_inactiva") {
      setMensaje("Tu cuenta está desactivada. Contacta al administrador.");
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setMensaje(""), 5000);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen w-screen bg-[#111318] flex items-stretch overflow-y-auto">

      {/* ── Panel izquierdo ───────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 px-12 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00c896]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#00c896]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <img src="..//logo.png" alt="MiSaldo" className="w-52 mb-8 drop-shadow-lg" />

          <blockquote className="text-lg text-gray-300 italic leading-relaxed border-l-2 border-[#00c896] pl-4 text-left">
            "Cada quetzal cuenta.<br />Organiza tu dinero con MiSaldo."
          </blockquote>

          <p className="mt-10 text-xs text-gray-600 tracking-widest uppercase">
            © 2025 MiSaldo · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* ── Divisor vertical ──────────────────────────────── */}
      <div className="hidden md:block w-px bg-white/5 my-12" />

      {/* ── Panel derecho (formulario) ────────────────────── */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">

        {/* Logo solo en móvil */}
        <img src="/logo.png" alt="MiSaldo" className="w-32 mb-8 md:hidden" />

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-gray-500 mb-7">Inicia sesión en tu cuenta</p>

          {/* Alertas */}
          {mensaje && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {mensaje}
            </div>
          )}
          {mensajeConfirmacion && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#00c896]/10 border border-[#00c896]/30 text-[#00c896] text-sm">
              {mensajeConfirmacion}
            </div>
          )}

          <LoginForm setError={setError} setMensajeConfirmacion={setMensajeConfirmacion} />

          {error && (
            <div className="mt-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-white/10" />
            <span className="text-xs text-gray-600 uppercase tracking-widest">o</span>
            <hr className="flex-1 border-white/10" />
          </div>

          <GoogleLoginButton />

          <button
            onClick={() => (window.location.href = "/registro")}
            className="w-full mt-3 py-2.5 rounded-lg border border-[#00c896]/40 text-[#00c896] text-sm font-medium
                       hover:bg-[#00c896]/10 transition-all duration-200"
          >
            Crear nueva cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;