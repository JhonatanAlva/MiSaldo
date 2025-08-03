import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, Tab, Button, Spinner } from "react-bootstrap";
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
import { Icon } from "@iconify/react";
import BotonesExportar from "../user/BotonesExportar";

const AnalisisFinanciero = () => {
  const [tabKey, setTabKey] = useState("resumen");
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1 // mes actual
  );
  const [tendenciaAhorro, setTendenciaAhorro] = useState([]);
  const isDarkMode = document.body.classList.contains("dark");
  const buttonVariant = isDarkMode ? "light" : "dark"; // No más outline

  const ahorroMensualPromedio = monthlyData.length
    ? monthlyData.reduce((acc, item) => acc + item.ahorro, 0) /
      monthlyData.length
    : 0;
  const [periodoProyeccion, setPeriodoProyeccion] = useState(12);

  const formatCurrency = (value) => `Q ${value.toLocaleString()}`;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setLoading(true);

        const resBalance = await axios.get(
          "http://localhost:5000/finanzas/balance?tipo=mensual",
          { withCredentials: true }
        );
        const resCategorias = await axios.get(
          "http://localhost:5000/finanzas/clasificacion-gastos",
          { withCredentials: true }
        );

        const datosBalance = resBalance.data.map((item) => ({
          name: item.mes || item.periodo,
          ingresos: item.ingresos,
          gastos: item.gastos,
          ahorro: item.ingresos - item.gastos,
        }));

        const categorias = resCategorias.data.map((item) => ({
          name: item.categoria,
          value: Number(item.total),
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        }));

        // console.log("Valores de categoría:", categorias);

        const ahorros = datosBalance.map(({ name, ahorro }) => ({
          name,
          ahorro,
        }));

        setMonthlyData(datosBalance);
        setCategoryData(categorias);
        setSavingsData(ahorros);
      } catch (error) {
        console.error("❌ Error al obtener datos del análisis:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
    obtenerTendenciaAhorro(mesSeleccionado);
  }, []);

  const obtenerTendenciaAhorro = async (mes) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/ahorro/tendencia?mes=${mes}`,
        {
          withCredentials: true,
        }
      );

      const datos = res.data.map((item) => ({
        fecha: item.dia,
        ahorro: item.total,
      }));

      setTendenciaAhorro(datos);
    } catch (err) {
      console.error("Error al obtener tendencia de ahorro", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando análisis financiero...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "var(--text)" }}>
          Análisis Financiero
        </h2>
        <BotonesExportar targetId="exportArea" isDarkMode={isDarkMode} />
      </div>

      <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-4">
        <Tab eventKey="resumen" title="Resumen">
          <div id="exportArea" className="pdf-export-container">
            {/* Ingresos vs Gastos */}
            <div className="grafica-bloque mb-4">
              <h5 style={{ color: "var(--text)" }}>
                Ingresos vs Gastos Mensuales
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} className="recharts-wrapper">
                  <CartesianGrid strokeDasharray="3 3" stroke="#6c757d" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text)" }} />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fill: "var(--text)" }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--grafica-bg)",
                      borderColor: "#495057",
                      color: "var(--text)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--text)" }} />
                  <Bar dataKey="ingresos" fill="#20c997" name="Ingresos" />
                  <Bar dataKey="gastos" fill="#dc3545" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
              <div className="only-pdf mt-2">
                <ul
                  style={{
                    color: "black",
                    fontSize: "0.9rem",
                    paddingLeft: 16,
                  }}
                >
                  {monthlyData.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.name}</strong>: Ingresos{" "}
                      {formatCurrency(item.ingresos)} — Gastos{" "}
                      {formatCurrency(item.gastos)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Page break */}
            <div className="only-pdf-pagebreak"></div>

            {/* Distribución de Gastos */}
            <div className="grafica-bloque mb-4">
              <h5 style={{ color: "var(--text)" }}>Distribución de Gastos</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart className="recharts-wrapper">
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--grafica-bg)",
                      borderColor: "#495057",
                    }}
                    labelStyle={{ color: "var(--text)" }}
                    itemStyle={{ color: "var(--text)" }}
                  />
                  <Legend wrapperStyle={{ color: "var(--text)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="only-pdf mt-3">
                <h6 style={{ color: "black" }}>Detalle de Categorías</h6>
                <ul className="legend-list">
                  {categoryData.map((entry, index) => (
                    <li
                      key={index}
                      className="d-flex align-items-center gap-2 mb-1"
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          backgroundColor: entry.color,
                          borderRadius: "50%",
                        }}
                      ></span>
                      <span style={{ color: "black" }}>
                        {entry.name}:{" "}
                        <strong>{formatCurrency(entry.value)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="only-pdf-pagebreak"></div>

            {/* Saldo mensual */}
            <div className="grafica-bloque mb-4">
              <h5 style={{ color: "var(--text)" }}>
                Saldo Mensual (Ingresos - Gastos)
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData} className="recharts-wrapper">
                  <CartesianGrid strokeDasharray="3 3" stroke="#6c757d" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text)" }} />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fill: "var(--text)" }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--grafica-bg)",
                      borderColor: "#495057",
                      color: "var(--text)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--text)" }} />
                  <Line
                    type="monotone"
                    dataKey="ahorro"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    name="Saldo"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="only-pdf mt-2">
                <ul
                  style={{
                    color: "black",
                    fontSize: "0.9rem",
                    paddingLeft: 16,
                  }}
                >
                  {monthlyData.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.name}</strong>: Saldo{" "}
                      {formatCurrency(item.ahorro)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="only-pdf-pagebreak"></div>

            {/* Tendencia de Ahorro */}
            <div className="grafica-bloque mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                {/* <Icon icon="mdi:trending-up" className="text-primary fs-5" /> */}
                <h5 className="mb-0" style={{ color: "var(--text)" }}>
                  Tendencia de Ahorro
                </h5>
              </div>
              <div className="graph-container">
                <div className="d-flex justify-content-end mb-2">
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
                        {new Date(0, i).toLocaleString("es-ES", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {tendenciaAhorro.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={tendenciaAhorro}
                      className="recharts-wrapper"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#6c757d" />
                      <XAxis
                        dataKey="fecha"
                        tickFormatter={(str) =>
                          new Date(str).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                        tick={{ fontSize: 12, fill: "var(--text)" }}
                      />
                      <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12, fill: "var(--text)" }}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) =>
                          `Fecha: ${new Date(label).toLocaleDateString(
                            "es-ES"
                          )}`
                        }
                        contentStyle={{
                          backgroundColor: "var(--grafica-bg)",
                          borderColor: "#495057",
                          color: "var(--text)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: "var(--text)" }}
                        verticalAlign="top"
                        height={36}
                      />
                      <Line
                        type="monotone"
                        dataKey="ahorro"
                        stroke="#0d6efd"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="text-center py-5 text-muted"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "0.5rem",
                    }}
                  >
                    No hay datos registrados para este mes.
                  </div>
                )}

                <div className="only-pdf mt-2">
                  <ul
                    style={{
                      color: "black",
                      fontSize: "0.9rem",
                      paddingLeft: 16,
                    }}
                  >
                    {tendenciaAhorro.map((item, idx) => (
                      <li key={idx}>
                        {new Date(item.fecha).toLocaleDateString("es-ES")}:
                        Ahorro {formatCurrency(item.ahorro)}
                      </li>
                    ))}
                  </ul>
                </div>

                {tendenciaAhorro.length > 0 && (
                  <p
                    className="text-end mt-2 mb-0 small fst-italic"
                    style={{ color: "var(--text)" }}
                  >
                    Último ahorro:{" "}
                    <strong>
                      {new Date(
                        tendenciaAhorro[tendenciaAhorro.length - 1].fecha
                      ).toLocaleDateString("es-ES")}
                    </strong>{" "}
                    — llevas{" "}
                    <strong>
                      {Math.floor(
                        (new Date() -
                          new Date(
                            tendenciaAhorro[tendenciaAhorro.length - 1].fecha
                          )) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </strong>{" "}
                    días sin ahorrar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="predicciones" title="Predicciones">
          <div className="container py-4">
            <div
              className="card shadow-sm mb-4"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text)",
              }}
            >
              <div className="card-body">
                <h5 className="card-title">Proyección de Ahorros</h5>
                <p className="card-text">
                  Basado en tus hábitos de ahorro actuales, podrías acumular
                  aproximadamente:
                </p>

                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div>
                    <h2 className="fw-bold text-success">
                      Q{" "}
                      {(
                        ahorroMensualPromedio *
                        (tabKey === "predicciones" && periodoProyeccion)
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="mb-0">
                      en los próximos {periodoProyeccion} meses
                    </p>
                  </div>
                  <div className="btn-group mt-3 mt-md-0">
                    {[3, 6, 12].map((meses) => (
                      <button
                        key={meses}
                        className={`btn btn-outline-secondary ${
                          periodoProyeccion === meses
                            ? "active btn-success"
                            : ""
                        }`}
                        onClick={() => setPeriodoProyeccion(meses)}
                      >
                        {meses === 12 ? "1 año" : `${meses} meses`}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-muted mt-3 small">
                  * Esta proyección asume que mantendrás un ahorro mensual
                  promedio similar al actual.
                </p>
              </div>
            </div>

            <div
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text)",
              }}
            >
              <div className="card-body">
                <h5 className="card-title">Recomendaciones Personalizadas</h5>
                <p className="text-muted">
                  Aquí se vera sugerencias basadas en tus hábitos financieros.
                  (pendiente IA)
                </p>

                <ul className="list-unstyled mt-3">
                  <li className="mb-3 d-flex align-items-start">
                    <span className="me-2 fs-5">💡</span>
                    <div>
                      <strong>Reduce gastos en Entretenimiento</strong>
                      <br />
                      <small className="text-muted">
                        Tus gastos han aumentado un 15% respecto al mes
                        anterior.
                      </small>
                    </div>
                  </li>

                  <li className="mb-3 d-flex align-items-start">
                    <span className="me-2 fs-5">🎯</span>
                    <div>
                      <strong>Meta de ahorro alcanzable</strong>
                      <br />
                      <small className="text-muted">
                        Con Q200 extra al mes podrías lograr tu meta 2 meses
                        antes.
                      </small>
                    </div>
                  </li>

                  <li className="d-flex align-items-start">
                    <span className="me-2 fs-5">🔁</span>
                    <div>
                      <strong>Atención a gastos recurrentes</strong>
                      <br />
                      <small className="text-muted">
                        Revisa tus suscripciones activas. Algunas podrían no ser
                        necesarias.
                      </small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Tab>

        {/* <Tab eventKey="reportes" title="Reportes">
          <div className="mt-3">
            <h5 style={{ color: "var(--text)" }}>Reportes Disponibles</h5>
            <ul style={{ color: "var(--text)" }}>
              <li>Resumen Mensual</li>
              <li>Análisis por Categorías</li>
              <li>Tendencias Anuales</li>
              <li>Progreso de Metas</li>
            </ul>
            <Button variant="primary" className="mt-3">
              <Icon icon="lucide:download" className="me-1" /> Descargar Todo
            </Button>
          </div>
        </Tab> */}
      </Tabs>
    </div>
  );
};

export default AnalisisFinanciero;
