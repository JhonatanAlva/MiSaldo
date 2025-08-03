import React from "react";
import "../../assets/Admin.css";

const SidebarAdmin = ({ seccionActiva, setSeccionActiva, cerrarSesion }) => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Administrador</h2>
      <nav className="sidebar-nav">
        <button
          onClick={() => setSeccionActiva("usuarios")}
          className={`nav-button ${seccionActiva === "usuarios" ? "activo" : ""}`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setSeccionActiva("estadisticas")}
          className={`nav-button ${seccionActiva === "estadisticas" ? "activo" : ""}`}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setSeccionActiva("categorias")}
          className={`nav-button ${seccionActiva === "categorias" ? "activo" : ""}`}
        >
          Categorías
        </button>
        <button
          onClick={() => setSeccionActiva("ia")}
          className={`nav-button ${seccionActiva === "ia" ? "activo" : ""}`}
        >
          IA
        </button>
        <button
          onClick={() => setSeccionActiva("configuracion")}
          className={`nav-button ${seccionActiva === "configuracion" ? "activo" : ""}`}
        >
          Configuración
        </button>
      </nav>
      <button onClick={cerrarSesion} className="admin-logout">
        Cerrar sesión
      </button>
    </aside>
  );
};

export default SidebarAdmin;