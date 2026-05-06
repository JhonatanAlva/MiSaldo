import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = ({ setError }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { verificarUsuario } = useContext(AuthContext); // obtener función

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(correo, contrasena); // establece la cookie

      await verificarUsuario(); // sincroniza el contexto con el backend

      const res = await import("../../services/authService")
        .then(m => m.getUsuario());
      const rol = res.data?.rol;

      navigate(rol === "Administrador" ? "/admin" : "/usuario");

    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesión");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        className={inputClass}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
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
        {cargando ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
};

export default LoginForm;