import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ResumenDashboard from "../components/user/ResumenDashboard";
import AsistenteIA from "../components/user/AsistenteIA";
import SeccionAhorro from "../components/user/SeccionAhorro";
import CambioTema from "../components/user/CambioTema";
import TransaccionesUsuario from "../components/user/TransaccionesUsuario";
import AnalisisFinanciero from "../components/user/AnalisisFinanciero";
import ConfiguracionUsuario from "../components/user/ConfiguracionUsuario";
import "../assets/usuario.css";

const PanelUsuario = () => {
  const [vista, setVista] = useState("resumen");
  const { cerrarSesion, usuario } = useContext(AuthContext);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const tema = document.body.getAttribute("data-theme");
    setModoOscuro(tema === "dark");

    const observer = new MutationObserver(() => {
      const nuevoTema = document.body.getAttribute("data-theme");
      setModoOscuro(nuevoTema === "dark");
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const claseFondo = "usuario-panel text-body";

  return (
    <div
      className={`usuario-panel container-fluid min-vh-100 ${claseFondo}`}
      style={{ padding: "2rem 1rem", overflowX: "hidden" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        {usuario?.nombres && (
          <div className="text-success fw-semibold fs-5">
            <span className="saludo-animado">👋</span> Hola, {usuario.nombres}{" "}
            {usuario.apellidos}
          </div>
        )}

        <div className="d-flex gap-2">
          <CambioTema />
          <button className="btn btn-outline-danger" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Navegación de vistas */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {[
          { id: "resumen", label: "Resumen" },
          { id: "transacciones", label: "Transacciones" },
          { id: "ia", label: "Asitente" },
          { id: "ahorro", label: "Ahorro" },
          { id: "analisis", label: "Análisis" },
          { id: "configuracion", label: "Configuración" },
        ].map((opcion) => (
          <button
            key={opcion.id}
            className={`btn ${
              vista === opcion.id ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setVista(opcion.id)}
          >
            {opcion.label}
          </button>
        ))}
      </div>

      {/* Contenido dinámico */}
      <div className="vista-contenido">
        {vista === "resumen" && <ResumenDashboard setVista={setVista} />}
        {vista === "transacciones" && <TransaccionesUsuario />}
        {vista === "ia" && <AsistenteIA />}
        {vista === "ahorro" && <SeccionAhorro />}
        {vista === "analisis" && <AnalisisFinanciero />}
        {vista === "configuracion" && <ConfiguracionUsuario />}
      </div>
    </div>
  );
};

export default PanelUsuario;
