import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const ejecutarLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        return navigate("/login");
      }

      // ✅ Guardar token
      localStorage.setItem("token", token);

      try {
        // 🔥 IMPORTANTE: enviar token manualmente (evita errores del interceptor)
        const res = await api.get("/auth/usuario", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const rol = res.data.rol;

        if (rol === "Administrador") {
          navigate("/admin");
        } else {
          navigate("/usuario");
        }

      } catch (error) {
        console.error("Error validando usuario:", error);
        navigate("/login");
      }
    };

    ejecutarLogin();
  }, []);

  return <p>Iniciando sesión...</p>;
}