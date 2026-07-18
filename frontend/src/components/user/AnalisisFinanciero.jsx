import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import SpinnerCentrado from "../ui/SpinnerCentrado";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import exportarReporteFinanciero from "../../utils/exportarReporteFinanciero";

const COLORES_PIE = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#84cc16", "#6366f1",
];

const EmptyChart = ({ icono, texto }) => (
  <div style={{
    height: 320,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    gap: 8,
  }}>
    <span style={{ fontSize: "2rem" }}>{icono}</span>
    <span>{texto}</span>
  </div>
);

const AnalisisFinanciero = () => {
  const [tabKey, setTabKey] = useState("resumen");
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [tendenciaAhorro, setTendenciaAhorro] = useState([]);
  const [periodoProyeccion, setPeriodoProyeccion] = useState(12);
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const actualizarTema = () => {
      setIsDarkMode(document.body.getAttribute("data-theme") === "dark");
    };
    actualizarTema();
    const observer = new MutationObserver(actualizarTema);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const ahorroMensualPromedio = monthlyData.length
    ? monthlyData.reduce((acc, item) => acc + item.ahorro, 0) / monthlyData.length
    : 0;

  const recomendaciones = useMemo(() => {
    const items = [];

    if (monthlyData.length >= 2) {
      const ultimo = monthlyData[monthlyData.length - 1];
      const anterior = monthlyData[monthlyData.length - 2];
      const diff = ultimo.gastos - anterior.gastos;
      const pct = anterior.gastos > 0 ? Math.round((diff / anterior.gastos) * 100) : 0;
      if (diff > 0) {
        items.push({
          icono: "📈",
          titulo: `Gastos aumentaron un ${pct}% en ${ultimo.name}`,
          detalle: `Pasaste de Q ${anterior.gastos.toLocaleString(undefined, { minimumFractionDigits: 2 })} a Q ${ultimo.gastos.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
        });
      } else if (diff < 0) {
        items.push({
          icono: "📉",
          titulo: `¡Bajaste gastos un ${Math.abs(pct)}% en ${ultimo.name}!`,
          detalle: `Ahorraste Q ${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2 })} respecto al mes anterior.`,
        });
      }
    }

    if (categoryData.length > 0) {
      const top = [...categoryData].sort((a, b) => b.value - a.value)[0];
      items.push({
        icono: "🏷️",
        titulo: `Mayor gasto: ${top.name}`,
        detalle: `Has gastado Q ${top.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} en esta categoría.`,
      });
    }

    if (ahorroMensualPromedio > 0) {
      items.push({
        icono: "🎯",
        titulo: "Proyección positiva",
        detalle: `Con tu ahorro promedio de Q ${ahorroMensualPromedio.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mes, en 12 meses acumularías Q ${(ahorroMensualPromedio * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      });
    } else if (monthlyData.length > 0) {
      items.push({
        icono: "⚠️",
        titulo: "Gastos superan ingresos en promedio",
        detalle: "Revisa tus gastos recurrentes para mejorar tu balance mensual.",
      });
    }

    if (items.length === 0) {
      items.push({
        icono: "📊",
        titulo: "Sin suficientes datos aún",
        detalle: "Registra más transacciones para obtener recomendaciones personalizadas.",
      });
    }

    return items;
  }, [monthlyData, categoryData, ahorroMensualPromedio]);

  const formatCurrency = (value) =>
    `Q ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const resBalance = await api.get("/finanzas/balance?tipo=mensual");
        const resCategorias = await api.get("/finanzas/clasificacion-gastos");

        const datosBalance = resBalance.data.map((item) => ({
          name: item.mes || item.periodo,
          ingresos: item.ingresos,
          gastos: item.gastos,
          ahorro: item.ingresos - item.gastos,
        }));

        const categorias = resCategorias.data.map((item, i) => ({
          name: item.categoria,
          value: Number(item.total),
          color: COLORES_PIE[i % COLORES_PIE.length],
        }));

        setMonthlyData(datosBalance);
        setCategoryData(categorias);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
    obtenerTendenciaAhorro(mesSeleccionado);
  }, []);

  const obtenerTendenciaAhorro = async (mes) => {
    try {
      const res = await api.get(`/ahorro/tendencia?mes=${mes}`);
      setTendenciaAhorro(res.data.map((item) => ({ fecha: item.dia, ahorro: item.total })));
    } catch (err) {
      console.error(err);
    }
  };

  const gridColor = isDarkMode ? "#1e293b" : "#d1d5db";
  const tickColor = isDarkMode ? "#fff" : "#111";
  const tooltipStyle = {
    borderRadius: "14px",
    border: "none",
    backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    color: isDarkMode ? "#fff" : "#111",
  };

  if (loading) return <SpinnerCentrado texto="Cargando análisis financiero..." />;

  return (
    <>
      <style>{`
        .analisis-container { min-height:100vh; padding:30px; transition:.3s; }

        .analisis-dark { background:#000000; color:#ffffff; }
        .analisis-dark .analisis-subtitle { color:#9ca3af; }
        .analisis-dark .nav-tabs { border-color:rgba(255,255,255,.08)!important; }
        .analisis-dark .analisis-card { background:#0a0a0a; border:1px solid rgba(255,255,255,.08); box-shadow:0 10px 30px rgba(0,0,0,.55); }
        .analisis-dark .card-title-custom { color:#ffffff; }
        .analisis-dark .recommendation-item { background:#111111; border:1px solid rgba(255,255,255,.05); color:#ffffff; }
        .analisis-dark .form-select { background:#0a0a0a; color:#ffffff; border:1px solid rgba(255,255,255,.08); }
        .analisis-dark .form-select:focus { box-shadow:none; border-color:#10b981; }
        .analisis-dark .recharts-cartesian-axis-tick-value { fill:#d1d5db !important; }
        .analisis-dark .recharts-legend-item-text { color:#ffffff !important; }

        .analisis-light { background:#f4f7fb; color:#111827; }
        .analisis-light .analisis-card { background:white; border:1px solid #e5e7eb; box-shadow:0 10px 30px rgba(0,0,0,.06); }
        .analisis-light .btn-periodo:not(.active) { background:#e5e7eb; color:#111827; }
        .analisis-light .recommendation-item { background:#f9fafb; }

        .analisis-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; margin-bottom:30px; }
        .analisis-title { font-size:2.5rem; font-weight:800; margin-bottom:5px; }
        .analisis-subtitle { opacity:.7; margin:0; }

        .custom-tabs .nav-link { border:none!important; border-radius:12px!important; padding:10px 20px!important; font-weight:600; margin-right:10px; color:#9ca3af!important; background:transparent!important; transition:.3s; }
        .custom-tabs .nav-link.active { background:linear-gradient(135deg,#10b981,#06b6d4)!important; color:white!important; box-shadow:0 10px 25px rgba(16,185,129,.35); }

        .analisis-card { border-radius:24px; padding:24px; margin-bottom:24px; transition:.3s; }
        .card-title-custom { font-size:1.1rem; font-weight:700; margin-bottom:20px; }
        .recommendation-item { border-radius:12px; padding:16px; margin-bottom:12px; }

        .prediction-card { border-radius:24px; overflow:hidden; }
        .prediction-amount { font-size:3rem; font-weight:800; color:#10b981; }
        .prediction-negative { font-size:1.1rem; font-weight:600; color:#ef4444; margin-top:8px; }

        .btn-periodo { border:none; border-radius:12px; padding:10px 18px; font-weight:600; transition:.3s; }
        .btn-periodo.active { background:linear-gradient(135deg,#10b981,#06b6d4); color:white; box-shadow:0 10px 20px rgba(16,185,129,.3); }
        .btn-periodo:not(.active) { background:#111111; color:white; border:1px solid rgba(255,255,255,.08); }

        @media(max-width:768px){
          .analisis-container { padding:16px; }
          .analisis-title { font-size:2rem; }
          .prediction-amount { font-size:2.2rem; }
          .analisis-card { padding:18px; }
        }
      `}</style>

      <div className={`analisis-container ${isDarkMode ? "analisis-dark" : "analisis-light"}`}>

        {/* HEADER */}
        <div className="analisis-header">
          <div>
            <h1 className="analisis-title">Análisis Financiero</h1>
            <p className="analisis-subtitle">Visualiza estadísticas y tendencias financieras</p>
          </div>
          <button
            className="btn btn-dark rounded-4 px-4 py-2"
            onClick={() => exportarReporteFinanciero({ monthlyData, categoryData, tendenciaAhorro, periodoProyeccion })}
          >
            📄 Exportar PDF
          </button>
        </div>

        {/* TABS */}
        <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-4 custom-tabs">

          {/* RESUMEN */}
          <Tab eventKey="resumen" title="Resumen">
            <div id="exportArea">

              {/* INGRESOS VS GASTOS */}
              <div className="analisis-card" id="pdf-ingresos-gastos">
                <h5 className="card-title-custom">Ingresos vs Gastos Mensuales</h5>
                {monthlyData.length === 0 ? (
                  <EmptyChart icono="📊" texto="Sin datos mensuales aún" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="4 4" stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fill: tickColor }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fill: tickColor }} />
                      <Tooltip formatter={formatCurrency} contentStyle={tooltipStyle} />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#10b981" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="gastos" fill="#ef4444" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* PIE */}
              <div className="analisis-card" id="pdf-distribucion">
                <h5 className="card-title-custom">Distribución de Gastos</h5>
                {categoryData.length === 0 ? (
                  <EmptyChart icono="🥧" texto="Sin gastos por categoría aún" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={categoryData} outerRadius={110} dataKey="value" label={({ name }) => name}>
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatCurrency} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* SALDO */}
              <div className="analisis-card" id="pdf-saldo">
                <h5 className="card-title-custom">Saldo Mensual</h5>
                {monthlyData.length === 0 ? (
                  <EmptyChart icono="📉" texto="Sin datos de saldo aún" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="4 4" stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fill: tickColor }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fill: tickColor }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="ahorro" name="Saldo" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* TENDENCIA */}
              <div className="analisis-card" id="pdf-tendencia">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <h5 className="card-title-custom m-0">Tendencia de Ahorro</h5>
                  <select
                    className="form-select w-auto"
                    value={mesSeleccionado}
                    onChange={(e) => {
                      const mes = parseInt(e.target.value);
                      setMesSeleccionado(mes);
                      obtenerTendenciaAhorro(mes);
                    }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("es-ES", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                {tendenciaAhorro.length === 0 ? (
                  <EmptyChart icono="📅" texto="Sin movimientos de ahorro en este mes" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={tendenciaAhorro}>
                      <CartesianGrid strokeDasharray="4 4" stroke={gridColor} />
                      <XAxis dataKey="fecha" tick={{ fill: tickColor }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fill: tickColor }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="ahorro" stroke="#06b6d4" strokeWidth={4} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          </Tab>

          {/* PREDICCIONES */}
          <Tab eventKey="predicciones" title="Predicciones">
            <div className="py-2">

              {/* PROYECCION */}
              <div className="analisis-card prediction-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
                  <div>
                    <h5 className="card-title-custom">Proyección de Ahorros</h5>
                    <p className="mb-4 opacity-75">Basado en tu historial financiero real</p>
                    {ahorroMensualPromedio > 0 ? (
                      <>
                        <div className="prediction-amount">
                          Q {(ahorroMensualPromedio * periodoProyeccion).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="mt-2 opacity-75">en los próximos {periodoProyeccion} meses</p>
                      </>
                    ) : monthlyData.length === 0 ? (
                      <p className="opacity-75">Sin datos suficientes para proyectar.</p>
                    ) : (
                      <p className="prediction-negative">
                        Tus gastos superan tus ingresos en promedio.<br />
                        Reduce gastos para tener una proyección positiva.
                      </p>
                    )}
                  </div>
                  {ahorroMensualPromedio > 0 && (
                    <div className="d-flex gap-2">
                      {[3, 6, 12].map((meses) => (
                        <button
                          key={meses}
                          onClick={() => setPeriodoProyeccion(meses)}
                          className={`btn-periodo ${periodoProyeccion === meses ? "active" : ""}`}
                        >
                          {meses === 12 ? "1 año" : `${meses} meses`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RECOMENDACIONES */}
              <div className="analisis-card">
                <h5 className="card-title-custom">Recomendaciones</h5>
                {recomendaciones.map((item, i) => (
                  <div key={i} className="recommendation-item">
                    <div className="d-flex gap-3">
                      <div>{item.icono}</div>
                      <div>
                        <strong>{item.titulo}</strong>
                        <div className="opacity-75 small mt-1">{item.detalle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default AnalisisFinanciero;
