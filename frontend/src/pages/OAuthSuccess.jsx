import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/usuario")
      .then((res) => {
        const rol = res.data.rol;
        navigate(rol === "Administrador" ? "/admin" : "/usuario");
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111318]">
      <p className="text-gray-400 text-sm animate-pulse">Iniciando sesión...</p>
    </div>
  );
}
