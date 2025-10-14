import React, { useState, useEffect } from "react";
import AnalisisIA from "./AnalisisIA";

const VistaIA = () => {
  const [usuariosPorDatos, setUsuariosPorDatos] = useState([]);
  const [datosOperaciones, setDatosOperaciones] = useState([]);
  const [datosEvolucion, setDatosEvolucion] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {

        // 🔹 1. Usuarios con más datos registrados
        const resUsuarios = await fetch(
          "http://localhost:5000/admin/actividad-datos",
          {
            credentials: "include",
          }
        );
        const dataUsuarios = await resUsuarios.json();

        // 🔹 2. Tipos de operaciones
        const resOperaciones = await fetch(
          "http://localhost:5000/admin/estadisticas/operaciones",
          {
            credentials: "include",
          }
        );
        const dataOperaciones = await resOperaciones.json();

        // 🔹 3. Evolución mensual
        const resEvolucion = await fetch(
          "http://localhost:5000/admin/estadisticas/evolucion-mensual",
          {
            credentials: "include",
          }
        );
        const dataEvolucion = await resEvolucion.json();

        setUsuariosPorDatos(dataUsuarios);
        setDatosOperaciones(dataOperaciones);
        setDatosEvolucion(dataEvolucion);
      } catch (error) {
        console.error("❌ Error al cargar datos de IA:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="admin-container">

      {cargando ? (
        <p style={{ color: "#ccc", marginTop: "1rem" }}>Cargando datos...</p>
      ) : (
        <AnalisisIA
          usuariosPorDatos={usuariosPorDatos}
          datosOperaciones={datosOperaciones}
          datosEvolucion={datosEvolucion}
        />
      )}
    </div>
  );
};

export default VistaIA;
