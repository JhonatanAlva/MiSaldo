import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = ({ setError, setMensajeConfirmacion }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();
  const { verificarUsuario } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { correo, contrasena },
        { withCredentials: true }
      );

      await verificarUsuario();
      const rol = res.data.usuario?.rol;

      if (rol === "Administrador") {
        navigate("/admin");
      } else {
        navigate("/usuario");
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        className="login-input"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <input
        type="password"
        className="login-input"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
      />
      <button type="submit" className="btn-acento w-100 mt-2">
        Ingresar
      </button>
    </form>
  );
};

export default LoginForm;