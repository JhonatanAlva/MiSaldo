import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Guardar el token en cookie desde el frontend
    const isProduction = window.location.hostname !== "localhost";
    const cookieOptions = isProduction
      ? `token=${token}; path=/; max-age=7200; secure; samesite=None; domain=.misaldo.lat`
      : `token=${token}; path=/; max-age=7200`;

    document.cookie = cookieOptions;

    // Limpiar el token de la URL
    window.history.replaceState({}, "", "/oauth-success");

    // Verificar sesión
    api.get("/auth/usuario")
      .then((res) => {
        const rol = res.data.rol;
        navigate(rol === "Administrador" ? "/admin" : "/usuario");
      })
      .catch((err) => {
        console.error("Error oauth:", err.response?.status);
        navigate("/login");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111318]">
      <p className="text-gray-400 text-sm animate-pulse">Iniciando sesión...</p>
    </div>
  );
}