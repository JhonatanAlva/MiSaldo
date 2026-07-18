import React, { useEffect, useState } from "react";
import api from "../../services/api";
import SpinnerCentrado from "../ui/SpinnerCentrado";
import EstadoVacio from "../ui/EstadoVacio";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// ─── Días hasta próximo cobro (por día del mes) ──────────────
const diasHasta = (diaCobro) => {
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const mesHoy = hoy.getMonth();
  const anioHoy = hoy.getFullYear();
  let proxPago = new Date(anioHoy, mesHoy, diaCobro);
  if (diaHoy > diaCobro) proxPago = new Date(anioHoy, mesHoy + 1, diaCobro);
  const base = new Date(anioHoy, mesHoy, diaHoy);
  return Math.round((proxPago - base) / (1000 * 60 * 60 * 24));
};

// ─── Días hasta próximo ingreso (soporta quincenal/semanal) ──
const diasHastaIngreso = (ingreso) => {
  if (ingreso.frecuencia === "mensual") {
    return diasHasta(ingreso.dia_pago);
  }
  if (ingreso.frecuencia === "quincenal") {
    const d1 = diasHasta(ingreso.dia_pago);
    const d2 = ingreso.dia_pago_secundario != null ? diasHasta(ingreso.dia_pago_secundario) : 999;
    return Math.min(d1, d2);
  }
  if (ingreso.frecuencia === "semanal") {
    const diaTarget = Number(ingreso.dia_pago);
    const diaActual = new Date().getDay();
    let diff = diaTarget - diaActual;
    if (diff < 0) diff += 7;
    return diff;
  }
  return 999;
};

// ─── Label de frecuencia ──────────────────────────────────────
const frecuenciaLabel = (ingreso) => {
  if (ingreso.frecuencia === "mensual") return `Día ${ingreso.dia_pago} de cada mes`;
  if (ingreso.frecuencia === "quincenal") {
    return `Días ${ingreso.dia_pago} y ${ingreso.dia_pago_secundario} de cada mes`;
  }
  if (ingreso.frecuencia === "semanal") {
    return `Todos los ${DIAS_SEMANA[ingreso.dia_pago] || ""}`;
  }
  return "";
};

// ─── Equivalente mensual de un ingreso fijo ───────────────────
const montoMensual = (ingreso) => {
  if (ingreso.frecuencia === "quincenal") return Number(ingreso.monto) * 2;
  if (ingreso.frecuencia === "semanal") return Number(ingreso.monto) * 4;
  return Number(ingreso.monto);
};

// ─── Etiquetas para gastos fijos ─────────────────────────────
const getEtiquetaGasto = (estado, diaCobro) => {
  if (estado === "PAGADO") return { texto: "Pagado este mes", color: "#10b981" };
  const dias = diasHasta(diaCobro);
  if (dias === 0) return { texto: "Vence hoy",      color: "#ef4444" };
  if (dias === 1) return { texto: "Vence mañana",   color: "#f97316" };
  if (dias <= 7)  return { texto: `En ${dias} días`, color: "#f59e0b" };
  return              { texto: `En ${dias} días`, color: "#6b7280" };
};

// ─── Etiquetas para ingresos fijos ───────────────────────────
const getEtiquetaIngreso = (dias) => {
  if (dias === 0) return { texto: "Cobras hoy",     color: "#10b981" };
  if (dias === 1) return { texto: "Cobras mañana",  color: "#34d399" };
  if (dias <= 7)  return { texto: `En ${dias} días`, color: "#10b981" };
  return              { texto: `En ${dias} días`, color: "#6b7280" };
};

const CalendarioFinanciero = () => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [resGastos, resIngresos] = await Promise.all([
          api.get("/gastos-fijos/calendario"),
          api.get("/ingresos-fijos"),
        ]);
        setGastos(resGastos.data);
        setIngresos(resIngresos.data.filter((i) => i.activo));
      } catch (error) {
        console.error("Error calendario:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerDatos();
  }, []);

  const totalGastos = gastos.reduce((acc, e) => acc + Number(e.monto), 0);
  const totalIngresos = ingresos.reduce((acc, i) => acc + montoMensual(i), 0);

  // ─── Unificar y ordenar por urgencia ─────────────────────
  const gastosConDias = gastos.map((g) => ({
    ...g,
    _tipo: "gasto",
    _dias: g.estado === "PAGADO" ? 9999 : diasHasta(g.dia_cobro),
  }));

  const ingresosConDias = ingresos.map((i) => ({
    ...i,
    _tipo: "ingreso",
    _dias: diasHastaIngreso(i),
  }));

  const todos = [...gastosConDias, ...ingresosConDias].sort((a, b) => a._dias - b._dias);

  const visibles =
    filtro === "gastos" ? gastosConDias.sort((a, b) => a._dias - b._dias) :
    filtro === "ingresos" ? ingresosConDias.sort((a, b) => a._dias - b._dias) :
    todos;

  const sinDatos = gastos.length === 0 && ingresos.length === 0;

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0">📅 Calendario financiero</h3>
          <small className="text-muted">Próximos cobros y pagos automáticos</small>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <div className="text-white px-4 py-3 rounded-4 shadow-sm" style={{ background: "#ef4444" }}>
            <div className="small opacity-75">Gastos / mes</div>
            <div className="fs-5 fw-bold">Q{totalGastos.toFixed(2)}</div>
          </div>
          <div className="text-white px-4 py-3 rounded-4 shadow-sm" style={{ background: "#10b981" }}>
            <div className="small opacity-75">Ingresos / mes</div>
            <div className="fs-5 fw-bold">Q{totalIngresos.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filtro tabs */}
      <div className="d-flex gap-2 mb-4">
        {[
          { id: "todos",    label: "Todos" },
          { id: "gastos",   label: `Gastos (${gastos.length})` },
          { id: "ingresos", label: `Ingresos (${ingresos.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltro(tab.id)}
            className={`btn btn-sm rounded-pill px-3 ${
              filtro === tab.id ? "btn-dark" : "btn-outline-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SpinnerCentrado texto="Cargando calendario..." />

      ) : sinDatos ? (
        <EstadoVacio
          icono="📅"
          titulo="Sin elementos fijos activos"
          descripcion="Agrega gastos o ingresos fijos para verlos aquí."
        />

      ) : visibles.length === 0 ? (
        <EstadoVacio
          icono="🔍"
          titulo="Sin resultados"
          descripcion="No hay elementos en esta categoría."
        />

      ) : (
        <div className="row g-4">
          {visibles.map((item) => {
            const esGasto = item._tipo === "gasto";

            const etiqueta = esGasto
              ? getEtiquetaGasto(item.estado, item.dia_cobro)
              : getEtiquetaIngreso(item._dias);

            return (
              <div key={`${item._tipo}-${item.id}`} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card shadow-sm rounded-4 h-100"
                  style={{ border: "none", borderLeft: `4px solid ${etiqueta.color}` }}
                >
                  <div className="card-body">

                    {/* Header de tarjeta */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h5 className="fw-bold mb-0">{item.nombre}</h5>
                          <span
                            className="badge rounded-pill px-2"
                            style={{
                              fontSize: "0.7rem",
                              background: esGasto ? "#fef2f2" : "#f0fdf4",
                              color: esGasto ? "#ef4444" : "#10b981",
                              border: `1px solid ${esGasto ? "#fca5a5" : "#86efac"}`,
                            }}
                          >
                            {esGasto ? "Gasto fijo" : "Ingreso fijo"}
                          </span>
                        </div>
                        <small className="text-muted">
                          {esGasto
                            ? `Día ${item.dia_cobro} de cada mes`
                            : frecuenciaLabel(item)}
                        </small>
                      </div>

                      <span
                        className="badge px-3 py-2 rounded-pill fs-6"
                        style={{
                          background: esGasto ? "#ef4444" : "#10b981",
                          color: "white",
                        }}
                      >
                        {esGasto ? "-" : "+"}Q{Number(item.monto).toFixed(2)}
                      </span>
                    </div>

                    {/* Días hasta cobro — protagonista */}
                    <div className="my-3">
                      <span className="fw-bold" style={{ color: etiqueta.color, fontSize: "1.05rem" }}>
                        {etiqueta.texto}
                      </span>
                    </div>

                    {/* Categoría (solo gastos) */}
                    {esGasto && item.categoria_nombre && (
                      <div className="mb-3">
                        <span className="badge bg-light text-dark border">
                          📂 {item.categoria_nombre}
                        </span>
                      </div>
                    )}

                    {/* Frecuencia mensual equivalente (solo ingresos no-mensual) */}
                    {!esGasto && item.frecuencia !== "mensual" && (
                      <div className="mb-2">
                        <small className="text-muted">
                          ≈ Q{montoMensual(item).toFixed(2)} / mes
                        </small>
                      </div>
                    )}

                    {/* Cuotas (solo gastos) */}
                    {esGasto && item.tiene_cuotas && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between mb-1">
                          <small>💳 Cuotas</small>
                          <small className="fw-bold">
                            {item.cuotas_pagadas}/{item.cuotas_total}
                          </small>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: `${(item.cuotas_pagadas / item.cuotas_total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarioFinanciero;
