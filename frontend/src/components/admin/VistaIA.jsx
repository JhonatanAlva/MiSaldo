import React from "react";

const VistaIA = () => {
  return (
    <div className="admin-container">
      <h1 className="admin-title">Inteligencia Artificial</h1>
      <p className="admin-subtitle">
        Aquí se podrá integrar y configurar funcionalidades de IA como
        clasificación automática de gastos, recomendaciones y más.
      </p>
      <p
        className="admin-subtitle"
        style={{ marginTop: "1.5rem", color: "#ccc" }}
      >
        Aún no hay módulos de inteligencia artificial activos. Aquí se
        mostrarán herramientas una vez implementadas.
      </p>
    </div>
  );
};

export default VistaIA;