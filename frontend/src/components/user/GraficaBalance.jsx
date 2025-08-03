import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GraficaBalance = ({ datos, modoVista }) => {
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const temaActual = document.body.getAttribute("data-theme");
    setModoOscuro(temaActual === "dark");

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

  const colores = {
    fondo: modoOscuro ? "#121212" : "#ffffff",
    texto: modoOscuro ? "#e2e8f0" : "#1a1a1a",
    linea: modoOscuro ? "#444" : "#ccc",
    tooltip: modoOscuro ? "#2a2a2a" : "#ffffff",
  };

  const formatCurrency = (value) =>
    `Q ${Number(value).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
    })}`;

  const alturaGrafica = modoVista === "diario" ? 220 : 300;

  // Calcular barSize dinámico si hay pocos puntos
  const barSizeDinamico = datos.length <= 3 ? 80 : 28;

  return (
    <div
      style={{
        backgroundColor: colores.fondo,
        borderRadius: "12px",
        padding: "1rem",
        width: "100%",
        height: alturaGrafica + 30,
      }}
    >
      <ResponsiveContainer width="100%" height={alturaGrafica}>
        <BarChart
          data={datos}
          margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={colores.linea}
          />
          <XAxis
            dataKey="periodo"
            stroke={colores.texto}
            tick={{ fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke={colores.texto} tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value) => [formatCurrency(value), ""]}
            contentStyle={{
              backgroundColor: colores.tooltip,
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              color: colores.texto,
            }}
            labelStyle={{ color: colores.texto }}
            itemStyle={{ color: colores.texto }}
          />
          <Legend wrapperStyle={{ color: colores.texto }} />
          <Bar
            dataKey="ingresos"
            name="Ingresos"
            fill="#00c49f"
            radius={[4, 4, 0, 0]}
            barSize={barSizeDinamico}
          />
          <Bar
            dataKey="gastos"
            name="Gastos"
            fill="#ff8042"
            radius={[4, 4, 0, 0]}
            barSize={barSizeDinamico}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaBalance;