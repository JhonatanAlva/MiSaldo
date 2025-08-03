import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#ff6384", "#36a2eb", "#ffce56", "#00c49f",
  "#ff9f43", "#845ec2", "#f9a825", "#8e24aa",
  "#43a047", "#f4511e", "#5c6bc0", "#00838f"
];

const GraficaCategorias = () => {
  const [datos, setDatos] = useState([]);
  const [temaActual, setTemaActual] = useState("light");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/finanzas/clasificacion-gastos", {
          withCredentials: true,
        });

        const datosConvertidos = res.data.map(d => ({
          ...d,
          total: parseFloat(d.total),
        }));

        setDatos(datosConvertidos);
      } catch (err) {
        console.error("Error al obtener clasificación de gastos:", err);
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    const actualizarTema = () => {
      const tema = document.body.getAttribute("data-theme") || "light";
      setTemaActual(tema);
    };

    actualizarTema(); // inicial

    const observer = new MutationObserver(actualizarTema);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const isDark = temaActual === "dark";
  const fondoCard = getComputedStyle(document.body).getPropertyValue('--card') || "#fff";
  const textoCard = getComputedStyle(document.body).getPropertyValue('--text') || "#000";

  return (
    <div
      className="card"
      style={{
        backgroundColor: fondoCard,
        color: textoCard,
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <h5 className="mb-3">Distribución de Gastos por Categoría</h5>
      {datos.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={datos}
              dataKey="total"
              nameKey="categoria"
              outerRadius={100}
              label={({ categoria }) => categoria}
            >
              {datos.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: fondoCard,
                color: textoCard,
                borderRadius: "0.5rem",
                border: isDark ? "1px solid #444" : "1px solid #ccc"
              }}
              formatter={(v) => `Q ${parseFloat(v).toFixed(2)}`}
            />
            <Legend
              wrapperStyle={{
                color: textoCard,
                fontWeight: 500,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted">No hay datos disponibles.</p>
      )}
    </div>
  );
};

export default GraficaCategorias;
