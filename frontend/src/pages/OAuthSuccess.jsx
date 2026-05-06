import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            return navigate("/login");
        }

        // 1. Guardar token
        localStorage.setItem("token", token);

        // 2. Esperar un tick para asegurar interceptor
        setTimeout(() => {
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
        }, 100);

    }, []);

    return <p>Iniciando sesión...</p>;
}