import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/usuario")
      .then((res) => {
        const rol = res.data.rol;

        if (rol === "Administrador") {
          navigate("/admin");
        } else {
          navigate("/usuario");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  return <p>Iniciando sesión...</p>;
}