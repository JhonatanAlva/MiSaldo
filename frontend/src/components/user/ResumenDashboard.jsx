import React, { useEffect, useState } from "react";
import axios from "axios";
import { ProgressBar, Button } from "react-bootstrap";
import GraficaBalance from "./GraficaBalance";
import { FaShoppingBag, FaCreditCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ResumenDashboard = ({ setVista }) => {
  const [resumenMensual, setResumenMensual] = useState([]);
  const [resumenTotal, setResumenTotal] = useState([]);
  const [movimientos, setMovimientos] = useState({ ingresos: [], gastos: [] });
  const [categorias, setCategorias] = useState([]);
  const [balanceDatos, setBalanceDatos] = useState([]);
  const [tipoVista, setTipoVista] = useState("mensual");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [metas, setMetas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const tema = document.body.getAttribute("data-theme");
    setModoOscuro(tema === "dark");

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

  useEffect(() => {
    obtenerResumenCompleto();
    obtenerResumen();
    obtenerMovimientos();
    obtenerCategorias();
    obtenerBalance();
    obtenerMetas();
  }, [tipoVista, fechaInicio, fechaFin]);

  const obtenerResumenCompleto = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/finanzas/resumen?tipo=mensual",
        { withCredentials: true }
      );
      setResumenTotal(res.data);
    } catch (err) {
      console.error("Error al obtener resumen total", err);
    }
  };

  const obtenerResumen = async () => {
    try {
      if (tipoVista === "personalizado" && (!fechaInicio || !fechaFin)) return;
      let url = `http://localhost:5000/finanzas/resumen?tipo=${tipoVista}`;
      if (tipoVista === "personalizado") {
        url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
      }
      const res = await axios.get(url, { withCredentials: true });
      setResumenMensual(res.data);
    } catch (err) {
      console.error("Error al obtener resumen financiero", err);
    }
  };

  const obtenerMovimientos = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/finanzas/movimientos-recientes",
        { withCredentials: true }
      );
      setMovimientos(res.data);
    } catch (err) {
      console.error("Error al obtener movimientos recientes", err);
    }
  };

  const obtenerCategorias = async () => {
    try {
      let url = `http://localhost:5000/finanzas/clasificacion-gastos?tipo=${tipoVista}`;
      if (tipoVista === "personalizado" && fechaInicio && fechaFin) {
        url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
      }
      const res = await axios.get(url, { withCredentials: true });
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al obtener clasificación de gastos", err);
    }
  };

  const obtenerBalance = async () => {
    try {
      let url = `http://localhost:5000/finanzas/balance?tipo=${tipoVista}`;

      if (tipoVista === "personalizado" && fechaInicio && fechaFin) {
        url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
      }

      const res = await axios.get(url, { withCredentials: true });

      // Función para dar formato legible a los períodos
      const formatearPeriodo = (periodo) => {
        if (!periodo) return "";

        // Mensual: "2025-04" → "Abr 2025"
        if (/^\d{4}-\d{2}$/.test(periodo)) {
          const [anio, mes] = periodo.split("-");
          const fecha = new Date(anio, mes - 1);
          return fecha.toLocaleString("es-ES", {
            month: "short",
            year: "numeric",
          });
        }

        // Diario: "2025-05-15" → "15 mayo"
        if (/^\d{4}-\d{2}-\d{2}$/.test(periodo)) {
          const fecha = new Date(periodo);
          return fecha.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          });
        }

        // Trimestral: "2025-T2" → "T2 2025"
        if (periodo.includes("-T")) {
          const [anio, trim] = periodo.split("-T");
          return `T${trim} ${anio}`;
        }

        // Semanal: "2025-S18" → "S18 2025"
        if (periodo.includes("-S")) {
          const [anio, semana] = periodo.split("-S");
          return `S${semana} ${anio}`;
        }

        return periodo;
      };

      const datosFormateados = res.data.map((item) => ({
        ...item,
        periodo: formatearPeriodo(item.mes || item.periodo || item.fecha),
      }));

      setBalanceDatos(datosFormateados);
    } catch (error) {
      console.error("Error al obtener balance", error);
    }
  };

  const obtenerMetas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/ahorro/todos", {
        withCredentials: true,
      });

      const metasConTotales = await Promise.all(
        res.data.map(async (plan) => {
          const totalRes = await axios.get(
            `http://localhost:5000/ahorro/total-ahorrado/${plan.id}`,
            {
              withCredentials: true,
            }
          );
          return { ...plan, total_ahorrado: totalRes.data.total };
        })
      );

      setMetas(metasConTotales);
    } catch (err) {
      console.error("Error al obtener metas de ahorro", err);
    }
  };

  const totalGastos = categorias.reduce(
    (sum, c) => sum + Number(c.total || 0),
    0
  );
  const calcularPorcentaje = (valor) =>
    totalGastos ? Math.round((valor / totalGastos) * 100) : 0;

  const saldoTotalDisponible = resumenTotal.reduce(
    (sum, r) => sum + (r.saldo || 0),
    0
  );

  const handleTipoVistaChange = (e) => {
    setTipoVista(e.target.value);
    setFechaInicio("");
    setFechaFin("");
  };

  const tarjetaBase = modoOscuro ? "card bg-dark text-light" : "card";
  const textoMuted = modoOscuro ? "text-secondary" : "text-muted";

  return (
    <div
      className="w-100 px-3 pb-1"
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      {/* Fila con tarjeta de saldo + tarjetas de meses con scroll horizontal */}
      <div className="mb-3 resumen-scroll-responsive">
        {/* Tarjeta de saldo disponible */}
        <div className={`card resumen-card`}>
          <div className="card-body text-center">
            <h6 className="card-title">🪙 Saldo Disponible Total</h6>
            <h4 className="fw-bold">Q {saldoTotalDisponible.toFixed(2)}</h4>
            <small className={textoMuted}>Suma de todos los saldos</small>

            {/* Mensaje si el saldo es negativo */}
            {saldoTotalDisponible < 0 && (
              <div className="alerta-negativa mt-3">
                ⚠️ Has excedido tu presupuesto. Revisa tus gastos para recuperar
                el control.
              </div>
            )}

            {/* Mensaje si el saldo es exactamente cero */}
            {saldoTotalDisponible === 0 && (
              <div className="alerta-cero mt-3">
                ⚠️ Tu saldo está en cero. Asegúrate de registrar tus ingresos y
                gastos.
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas mensuales dinámicas */}
        {(tipoVista === "mensual" || tipoVista === "trimestral") &&
          resumenMensual.map((mes, i) => (
            <div className="card resumen-item" key={i}>
              <div className="card-body text-center">
                <h6 className="card-title">{mes.periodo}</h6>
                <p className="mb-1 text-success fw-bold">
                  Ingresos: Q {mes.ingresos.toFixed(2)}
                </p>
                <p className="mb-1 text-danger fw-bold">
                  Gastos: Q {mes.gastos.toFixed(2)}
                </p>
                <p className="mb-0 fw-bold">
                  Balance: Q {mes.saldo.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Gráfica + Categorías */}
      <div className="row g-3">
        <div className="col-lg-8 d-flex flex-column">
          <div className={tarjetaBase + " flex-fill"}>
            <div className="card-body d-flex flex-column">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h5 className="mb-0 me-3">Balance Financiero</h5>
                <select
                  className="form-select w-auto"
                  value={tipoVista}
                  onChange={handleTipoVistaChange}
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="personalizado">Personalizado</option>
                </select>
                {tipoVista === "personalizado" && (
                  <>
                    <input
                      type="date"
                      className="form-control"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </>
                )}
              </div>
              <GraficaBalance datos={balanceDatos} modoVista={tipoVista} />
            </div>
          </div>
        </div>

        {/* Categorías con scroll vertical */}
        <div className="col-lg-4 d-flex flex-column">
          <div className={tarjetaBase + " flex-fill"}>
            <div
              className="card-body d-flex flex-column"
              style={{ height: "100%" }}
            >
              <h5 className="mb-3">Categorías de Gastos</h5>
              <div
                style={{
                  overflowY: "auto",
                  flexGrow: 1,
                  maxHeight: "300px",
                  paddingRight: "6px",
                }}
              >
                {categorias.map((cat, index) => (
                  <div key={index}>
                    <p className="mb-1">
                      {cat.categoria}
                      <span className="float-end">
                        Q {(Number(cat.total) || 0).toFixed(2)}
                      </span>
                    </p>
                    <ProgressBar
                      now={calcularPorcentaje(cat.total)}
                      className="mb-2"
                      variant={index % 2 === 0 ? "info" : "secondary"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meta de ahorro */}
        <div className="col-md-6">
          <div className={tarjetaBase}>
            <div
              className="card-body d-flex flex-column"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              <div className="d-flex justify-content-between mb-3">
                <h5>Meta de Ahorro</h5>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => setVista("ahorro")}
                >
                  + Nueva Meta
                </Button>
              </div>
              {metas.length === 0 ? (
                <small className={textoMuted}>
                  No tienes metas de ahorro activas.
                </small>
              ) : (
                metas.map((meta, i) => {
                  const porcentaje = calcularPorcentaje(meta.total_ahorrado);
                  return (
                    <div key={i} className="mb-3">
                      <p className="mb-1">
                        {meta.descripcion}{" "}
                        <span className="float-end">
                          Q {Number(meta.total_ahorrado).toFixed(2)} / Q{" "}
                          {Number(meta.meta).toFixed(2)}
                        </span>
                      </p>
                      <ProgressBar
                        now={(meta.total_ahorrado / meta.meta) * 100}
                        className="mb-1"
                        variant="primary"
                      />
                      <small className={textoMuted}>
                        {((meta.total_ahorrado / meta.meta) * 100).toFixed(0)}%
                        completado
                      </small>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Transacciones recientes */}
        <div className="col-md-6">
          <div className={tarjetaBase}>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <h5>Transacciones Recientes</h5>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => setVista("transacciones")}
                >
                  Ver todas
                </Button>
              </div>

              {/* 🔽 Agregamos scroll a este div */}
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
              >
                <ul className="list-unstyled">
                  {movimientos.gastos.map((gasto, i) => (
                    <li
                      key={`gasto-${i}`}
                      className="d-flex justify-content-between mb-2"
                    >
                      <div>
                        <FaShoppingBag className="me-2 text-danger" />{" "}
                        {gasto.descripcion}
                      </div>
                      <span className="text-danger">-Q {gasto.monto}</span>
                    </li>
                  ))}
                  {movimientos.ingresos.map((ingreso, i) => (
                    <li
                      key={`ingreso-${i}`}
                      className="d-flex justify-content-between mb-2"
                    >
                      <div>
                        <FaCreditCard className="me-2 text-success" />{" "}
                        {ingreso.fuente}
                      </div>
                      <span className="text-success">+Q {ingreso.monto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenDashboard;
