import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // Puedes ajustar esto según rol después
      navigate("/usuario");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Iniciando sesión...</p>;
}