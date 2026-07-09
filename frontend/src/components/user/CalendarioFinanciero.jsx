import React, { useEffect, useState } from "react";
import api from "../../services/api";
import SpinnerCentrado from "../ui/SpinnerCentrado";
import EstadoVacio from "../ui/EstadoVacio";

const CalendarioFinanciero = () => {

    const [eventos, setEventos] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    // ─────────────────────────────
    // Obtener calendario
    // ─────────────────────────────
    const obtenerCalendario =
        async () => {

            try {

                const res =
                    await api.get(
                        "/gastos-fijos/calendario"
                    );

                setEventos(res.data);

            } catch (error) {

                console.error(
                    "Error calendario:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {

        obtenerCalendario();

    }, []);

    // ─────────────────────────────
    // Total comprometido
    // ─────────────────────────────
    const totalMensual =
        eventos.reduce(
            (acc, e) =>
                acc + Number(e.monto),
            0
        );

    // ─────────────────────────────
    // Días hasta próximo cobro
    // ─────────────────────────────
    const diasHasta = (diaCobro) => {
        const hoy = new Date();
        const diaHoy = hoy.getDate();
        const mesHoy = hoy.getMonth();
        const anioHoy = hoy.getFullYear();
        let proxPago = new Date(anioHoy, mesHoy, diaCobro);
        if (diaHoy > diaCobro) {
            proxPago = new Date(anioHoy, mesHoy + 1, diaCobro);
        }
        const base = new Date(anioHoy, mesHoy, diaHoy);
        return Math.round((proxPago - base) / (1000 * 60 * 60 * 24));
    };

    const getEtiqueta = (estado, diaCobro) => {
        if (estado === "PAGADO") return { texto: "Pagado este mes", color: "#10b981", badge: "bg-success" };
        const dias = diasHasta(diaCobro);
        if (dias === 0) return { texto: "Vence hoy",      color: "#ef4444", badge: "bg-danger" };
        if (dias === 1) return { texto: "Vence mañana",   color: "#f97316", badge: "bg-warning text-dark" };
        if (dias <= 7)  return { texto: `En ${dias} días`, color: "#f59e0b", badge: "bg-warning text-dark" };
        return              { texto: `En ${dias} días`, color: "#6b7280", badge: "bg-secondary" };
    };

    // ─────────────────────────────
    // Ordenar por urgencia
    // ─────────────────────────────
    const eventosOrdenados = [...eventos].sort((a, b) => {
        if (a.estado === "PAGADO" && b.estado !== "PAGADO") return 1;
        if (b.estado === "PAGADO" && a.estado !== "PAGADO") return -1;
        return diasHasta(a.dia_cobro) - diasHasta(b.dia_cobro);
    });

    return (
        <div className="container-fluid">

            {/* Header */}
            <div
                className="
          d-flex
          justify-content-between
          align-items-center
          flex-wrap
          gap-3
          mb-4
        "
            >

                <div>

                    <h3 className="fw-bold m-0">
                        📅 Calendario financiero
                    </h3>

                    <small className="text-muted">
                        Próximos pagos y gastos automáticos
                    </small>

                </div>

                <div
                    className="
            bg-primary
            text-white
            px-4
            py-3
            rounded-4
            shadow-sm
          "
                >

                    <div className="small opacity-75">
                        Total comprometido
                    </div>

                    <div className="fs-4 fw-bold">
                        Q{totalMensual.toFixed(2)}
                    </div>

                </div>

            </div>

            {loading ? (
                <SpinnerCentrado texto="Cargando calendario..." />

            ) : eventos.length === 0 ? (

                <EstadoVacio
                    icono="📅"
                    titulo="Sin gastos fijos activos"
                    descripcion="Agrega tus gastos fijos para verlos aquí."
                />

            ) : (

                <div className="row g-4">

                    {eventosOrdenados.map((evento) => {

                        const etiqueta = getEtiqueta(evento.estado, evento.dia_cobro);

                        return (

                            <div
                                key={evento.id}
                                className="col-12 col-md-6 col-xl-4"
                            >

                                <div
                                    className="card shadow-sm rounded-4 h-100"
                                    style={{
                                        border: "none",
                                        borderLeft: `4px solid ${etiqueta.color}`,
                                    }}
                                >

                                    <div className="card-body">

                                        {/* Header */}
                                        <div className="d-flex justify-content-between align-items-start mb-2">

                                            <div>
                                                <h5 className="fw-bold mb-0">{evento.nombre}</h5>
                                                <small className="text-muted">Día {evento.dia_cobro} de cada mes</small>
                                            </div>

                                            <span className="badge bg-danger px-3 py-2 rounded-pill fs-6">
                                                Q{evento.monto}
                                            </span>

                                        </div>

                                        {/* Días hasta el cobro — protagonista */}
                                        <div className="my-3">
                                            <span
                                                className="fw-bold"
                                                style={{ color: etiqueta.color, fontSize: "1.05rem" }}
                                            >
                                                {etiqueta.texto}
                                            </span>
                                        </div>

                                        {/* Categoría */}
                                        {evento.categoria_nombre && (
                                            <div className="mb-3">
                                                <span className="badge bg-light text-dark border">
                                                    📂 {evento.categoria_nombre}
                                                </span>
                                            </div>
                                        )}

                                        {/* Cuotas */}
                                        {evento.tiene_cuotas && (
                                            <div className="mt-2">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small>💳 Cuotas</small>
                                                    <small className="fw-bold">
                                                        {evento.cuotas_pagadas}/{evento.cuotas_total}
                                                    </small>
                                                </div>
                                                <div className="progress rounded-pill" style={{ height: "8px" }}>
                                                    <div
                                                        className="progress-bar bg-warning"
                                                        style={{
                                                            width: `${(evento.cuotas_pagadas / evento.cuotas_total) * 100}%`,
                                                        }}
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