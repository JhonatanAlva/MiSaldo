import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validarTokenRecuperacion, restablecerPassword } from "../services/authService";

const RestablecerContrasena = () => {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [validando, setValidando]   = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [errorToken, setErrorToken]   = useState("");

  const [nueva, setNueva]         = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState("");
  const [exito, setExito]         = useState(false);

  useEffect(() => {
    const validar = async () => {
      try {
        await validarTokenRecuperacion(token);
        setTokenValido(true);
      } catch (err) {
        setErrorToken(err.response?.data?.mensaje || "Enlace inválido o expirado");
      } finally {
        setValidando(false);
      }
    };
    validar();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    try {
      await restablecerPassword(token, nueva);
      setExito(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al restablecer la contraseña");
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

        {validando ? (
          <p className="text-center text-gray-500 text-sm">Validando enlace...</p>

        ) : !tokenValido ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Enlace inválido</h2>
            <p className="text-sm text-gray-500 mb-6">{errorToken}</p>
            <button
              onClick={() => (window.location.href = "/olvide-contrasena")}
              className="w-full py-2.5 rounded-lg bg-[#00c896] text-black text-sm font-bold
                         hover:bg-[#00b388] transition-all duration-200"
            >
              Solicitar nuevo enlace
            </button>
          </div>

        ) : exito ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#00c896]/15 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Contraseña actualizada</h2>
            <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
          </div>

        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight text-center">
              Nueva contraseña
            </h2>
            <p className="text-sm text-gray-500 mb-7 text-center">
              Ingresa tu nueva contraseña para continuar.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  className={`${inputClass} pr-14`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>

              <input
                type={showPass ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-1 py-2.5 rounded-lg bg-[#00c896] text-black text-sm font-bold
                           hover:bg-[#00b388] active:scale-[0.98] transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cargando ? "Guardando..." : "Restablecer contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RestablecerContrasena;