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

    // Borrar el token de la URL de inmediato
    window.history.replaceState({}, "", "/oauth-success");

    // Enviar token como Bearer header: el backend lo verifica, setea la httpOnly cookie
    // y devuelve los datos del usuario — todo en una sola llamada
    api.get("/auth/usuario", {
      headers: { Authorization: `Bearer ${token}` },
    })
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
