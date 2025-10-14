import React, { useState } from "react";

const AnalisisIA = ({ usuariosPorDatos, datosOperaciones, datosEvolucion }) => {
  const [analisis, setAnalisis] = useState("");
  const [loading, setLoading] = useState(false);

  const generarAnalisisIA = async () => {
    setLoading(true);
    setAnalisis("");

    try {
      const res = await fetch("http://localhost:5000/asistente/analizar", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuariosPorDatos, datosOperaciones, datosEvolucion }),
      });

      const data = await res.json();
      setAnalisis(data.respuesta || "No se recibió respuesta del asistente.");
    } catch (error) {
      console.error("Error al analizar:", error);
      setAnalisis("❌ Error al conectar con el servidor de IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card" style={{ marginTop: "2rem" }}>
      <h2 style={{ color: "#0f0" }}>Análisis de Inteligencia Artificial</h2>
      <p style={{ color: "#ccc" }}>
        Este módulo utiliza IA para analizar las gráficas estadísticas actuales
        del sistema.
      </p>

      <button
        onClick={generarAnalisisIA}
        disabled={loading}
        style={{
          backgroundColor: "#00b894",
          color: "#fff",
          border: "none",
          padding: "0.8rem 1.4rem",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Analizando..." : "🔎 Analizar con IA"}
      </button>

      {analisis && (
        <div
          style={{
            marginTop: "2rem",
            backgroundColor: "#1e1e1e",
            padding: "1rem",
            borderRadius: "8px",
            color: "#fff",
            whiteSpace: "pre-line",
          }}
        >
          {analisis}
        </div>
      )}
    </div>
  );
};

export default AnalisisIA;