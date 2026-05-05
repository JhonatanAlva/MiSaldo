import React, { useState } from "react";
import RegistroForm from "../components/registro/RegistroForm";

const Registro = () => {
  const [mensaje, setMensaje] = useState("");
  const esExito = mensaje.includes("✅");

  return (
    <div className="min-h-screen w-screen bg-[#111318] flex items-stretch overflow-y-auto">

      {/* ── Panel izquierdo ───────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 px-12 relative overflow-hidden">
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

      {/* ── Divisor ───────────────────────────────────────── */}
      <div className="hidden md:block w-px bg-white/5 my-12" />

      {/* ── Panel derecho ─────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">

        <img src="/logo.png" alt="MiSaldo" className="w-32 mb-8 md:hidden" />

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Crear cuenta
          </h2>
          <p className="text-sm text-gray-500 mb-7">Completa tus datos para registrarte</p>

          <RegistroForm setMensaje={setMensaje} />

          {mensaje && (
            <div className={`mt-4 px-4 py-3 rounded-lg text-sm border ${
              esExito
                ? "bg-[#00c896]/10 border-[#00c896]/30 text-[#00c896]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {mensaje}
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full mt-4 py-2.5 rounded-lg border border-[#00c896]/40 text-[#00c896] text-sm font-medium
                       hover:bg-[#00c896]/10 transition-all duration-200"
          >
            ← Volver a iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registro;