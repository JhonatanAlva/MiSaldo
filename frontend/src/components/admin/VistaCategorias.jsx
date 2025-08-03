import React from 'react';

const VistaCategorias = () => {
  return (
    <div className="admin-card">
      <h1 className="admin-title">Gestión de Categorías</h1>
      <p className="admin-subtitle">
        Aquí puedes crear, editar o eliminar categorías de gastos para los usuarios.
      </p>

      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#eee" }}>Categorías disponibles</h3>
        <ul
          style={{
            listStyle: "disc inside",
            color: "#ccc",
            lineHeight: "1.8",
          }}
        >
          <li>Alimentación</li>
          <li>Transporte</li>
          <li>Salud</li>
          <li>Educación</li>
          <li>Entretenimiento</li>
        </ul>

        <button
          className="admin-logout"
          style={{ marginTop: "1.5rem", backgroundColor: "#2980b9" }}
        >
          + Añadir nueva categoría
        </button>
      </div>
    </div>
  );
};

export default VistaCategorias;
