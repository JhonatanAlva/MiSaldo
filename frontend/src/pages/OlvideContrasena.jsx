import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarRecuperacion } from "../services/authService";

const OlvideContrasena = () => {
  const navigate = useNavigate();
  const [correo, setCorreo]       = useState("");
  const [enviado, setEnviado]     = useState(false);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await solicitarRecuperacion(correo);
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al procesar la solicitud");
    } finally {
      setCargando(false);
    }
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-lg text-sm text-white
    bg-white/5 border border-white/10 placeholder-gray-500
    focus:outline-none focus:border-[#00c896]/60
    transition-all duration-200
  `;

  return (
    <div className="min-h-screen w-screen bg-[#111318] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="SaldoGt" className="w-24 mx-auto mb-8" />

        {!enviado ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight text-center">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-sm text-gray-500 mb-7 text-center">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={inputClass}
                required
              />
              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-1 py-2.5 rounded-lg bg-[#00c896] text-black text-sm font-bold
                           hover:bg-[#00b388] active:scale-[0.98] transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#00c896]/15 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Revisa tu correo</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Si el correo <strong className="text-gray-300">{correo}</strong> está registrado,
              recibirás un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-6 py-2.5 rounded-lg border border-[#00c896]/40 text-[#00c896] text-sm font-medium
                     hover:bg-[#00c896]/10 transition-all duration-200"
        >
          ← Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default OlvideContrasena;