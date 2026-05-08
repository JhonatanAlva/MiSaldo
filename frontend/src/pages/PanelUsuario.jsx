import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ResumenDashboard from "../components/user/ResumenDashboard";
import AsistenteIA from "../components/user/AsistenteIA";
import SeccionAhorro from "../components/user/SeccionAhorro";
import CambioTema from "../components/user/CambioTema";
import TransaccionesUsuario from "../components/user/TransaccionesUsuario";
import AnalisisFinanciero from "../components/user/AnalisisFinanciero";
import ConfiguracionUsuario from "../components/user/ConfiguracionUsuario";
import GastosFijos from "../components/user/GastosFijos";
import Notificaciones from "../components/user/Notificaciones";
import CalendarioFinanciero from "../components/user/CalendarioFinanciero";
import IngresosFijos from "../components/user/IngresosFijos";
import EscanerIA from "../components/escaner/EscanerIA";
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

        <div className="d-flex gap-2 align-items-center">

          <Notificaciones />

          <CambioTema />

          <button
            className="btn btn-outline-danger"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </div>
      </div>

      {/* Navegación de vistas */}
      <div className="nav-mobile-scroll mb-4">
        {[
          { id: "resumen", label: "🏠 Resumen" },
          { id: "transacciones", label: "💳 Transacciones" },
          { id: "gastos-fijos", label: "📉 Gastos Fijos" },
          { id: "ingresos-fijos", label: "💰 Ingresos Fijos" },
          { id: "calendario", label: "📅 Calendario" },
          { id: "ia", label: "🤖 Asistente" },
          { id: "escaner", label: "📷 Escaner IA" },
          { id: "ahorro", label: "🪙 Ahorro" },
          { id: "analisis", label: "📊 Análisis" },
          { id: "configuracion", label: "⚙️ Configuración" },
        ].map((opcion) => (
          <button
            key={opcion.id}
            className={`nav-btn ${vista === opcion.id ? "nav-btn-active" : ""
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
        {vista === "gastos-fijos" && <GastosFijos />}
        {vista === "ingresos-fijos" && <IngresosFijos />}
        {vista === "calendario" && <CalendarioFinanciero />}
        {vista === "ia" && <AsistenteIA nombreUsuario={usuario?.nombres} />}
        {vista === "escaner" && <EscanerIA />}
        {vista === "ahorro" && <SeccionAhorro />}
        {vista === "analisis" && <AnalisisFinanciero />}
        {vista === "configuracion" && <ConfiguracionUsuario />}
      </div>
    </div>
  );
};

export default PanelUsuario;
