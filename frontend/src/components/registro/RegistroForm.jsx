import React, { useState } from "react";
import { registro } from "../../services/authService";

const RegistroForm = ({ setMensaje }) => {
  const [formulario, setFormulario] = useState({
    nombres: "", apellidos: "", correo: "", celular: "", contrasena: "",
  });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) =>
    setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await registro(formulario);
      setMensaje("✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      setFormulario({ nombres: "", apellidos: "", correo: "", celular: "", contrasena: "" });
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al registrar usuario");
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

  const campos = [
    { name: "nombres", type: "text", placeholder: "Nombres" },
    { name: "apellidos", type: "text", placeholder: "Apellidos" },
    { name: "correo", type: "email", placeholder: "Correo electrónico" },
    { name: "celular", type: "text", placeholder: "Celular" },
    { name: "contrasena", type: "password", placeholder: "Contraseña" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {campos.map(({ name, type, placeholder }) => (
        <input
          key={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={formulario[name]}
          onChange={handleChange}
          className={inputClass}
          required
        />
      ))}
      <button
        type="submit"
        disabled={cargando}
        className="w-full mt-1 py-2.5 rounded-lg bg-[#00c896] text-black text-sm font-bold
                   hover:bg-[#00b388] active:scale-[0.98] transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {cargando ? "Registrando..." : "Crear cuenta"}
      </button>
    </form>
  );
};

export default RegistroForm;