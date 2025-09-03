import React, { useState } from "react";
import "../../assets/Admin.css";
import { FaUser, FaChartBar, FaListAlt, FaRobot, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";

const SidebarAdmin = ({ seccionActiva, setSeccionActiva, cerrarSesion }) => {
  const [abierto, setAbierto] = useState(false);

  const toggleMenu = () => setAbierto(!abierto);

  return (
    <>
      {/* Botón hamburguesa (solo en móvil) */}
      <button className="menu-toggle" onClick={toggleMenu}>
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${abierto ? "abierto" : ""}`}>
        <h2 className="sidebar-title">Administrador</h2>
        <nav className="sidebar-nav">
          <button
            onClick={() => setSeccionActiva("usuarios")}
            className={`nav-button ${seccionActiva === "usuarios" ? "activo" : ""}`}
          >
            <FaUser style={{ marginRight: "8px" }} /> Usuarios
          </button>
          <button
            onClick={() => setSeccionActiva("estadisticas")}
            className={`nav-button ${seccionActiva === "estadisticas" ? "activo" : ""}`}
          >
            <FaChartBar style={{ marginRight: "8px" }} /> Estadísticas
          </button>
          <button
            onClick={() => setSeccionActiva("categorias")}
            className={`nav-button ${seccionActiva === "categorias" ? "activo" : ""}`}
          >
            <FaListAlt style={{ marginRight: "8px" }} /> Categorías
          </button>
          <button
            onClick={() => setSeccionActiva("ia")}
            className={`nav-button ${seccionActiva === "ia" ? "activo" : ""}`}
          >
            <FaRobot style={{ marginRight: "8px" }} /> IA
          </button>
          <button
            onClick={() => setSeccionActiva("configuracion")}
            className={`nav-button ${seccionActiva === "configuracion" ? "activo" : ""}`}
          >
            <FaCog style={{ marginRight: "8px" }} /> Configuración
          </button>
        </nav>
        <button onClick={cerrarSesion} className="admin-logout">
          <FaSignOutAlt style={{ marginRight: "8px" }} /> Cerrar sesión
        </button>
      </aside>
    </>
  );
};

export default SidebarAdmin;