import React, {
    useEffect,
    useState,
} from "react";

import api from "../../services/api";

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
    // Colores estado
    // ─────────────────────────────
    const getEstadoClase =
        (estado) => {

            switch (estado) {

                case "HOY":
                    return {
                        badge:
                            "bg-danger",
                        texto:
                            "🔴 Vence hoy",
                    };

                case "PAGADO":
                    return {
                        badge:
                            "bg-success",
                        texto:
                            "🟢 Pagado",
                    };

                default:
                    return {
                        badge:
                            "bg-warning text-dark",
                        texto:
                            "🟡 Próximo",
                    };
            }
        };

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

            {/* Loading */}
            {loading ? (

                <div className="text-center py-5">
                    Cargando calendario...
                </div>

            ) : eventos.length === 0 ? (

                <div className="alert alert-info rounded-4">
                    No tienes gastos fijos activos.
                </div>

            ) : (

                <div className="row g-4">

                    {eventos.map((evento) => {

                        const estado =
                            getEstadoClase(
                                evento.estado
                            );

                        return (

                            <div
                                key={evento.id}
                                className="
                  col-12
                  col-md-6
                  col-xl-4
                "
                            >

                                <div
                                    className="
                    card
                    border-0
                    shadow-sm
                    rounded-4
                    h-100
                  "
                                >

                                    <div className="card-body">

                                        {/* Header */}
                                        <div
                                            className="
                        d-flex
                        justify-content-between
                        align-items-start
                        mb-3
                      "
                                        >

                                            <div>

                                                <h5 className="fw-bold mb-1">
                                                    {evento.nombre}
                                                </h5>

                                                <small className="text-muted">
                                                    Día {evento.dia_cobro}
                                                </small>

                                            </div>

                                            <div
                                                className="
                          badge
                          bg-danger
                          px-3
                          py-2
                          rounded-pill
                          fs-6
                        "
                                            >
                                                Q{evento.monto}
                                            </div>

                                        </div>

                                        {/* Categoría */}
                                        {evento.categoria_nombre && (

                                            <div className="mb-3">

                                                <span
                                                    className="
                            badge
                            bg-light
                            text-dark
                            border
                          "
                                                >
                                                    📂{" "}
                                                    {
                                                        evento.categoria_nombre
                                                    }
                                                </span>

                                            </div>

                                        )}

                                        {/* Estado */}
                                        <div className="mb-3">

                                            <span
                                                className={`
                          badge
                          ${estado.badge}
                          px-3
                          py-2
                          rounded-pill
                        `}
                                            >
                                                {estado.texto}
                                            </span>

                                        </div>

                                        {/* Cuotas */}
                                        {evento.tiene_cuotas && (

                                            <div>

                                                <div
                                                    className="
                            d-flex
                            justify-content-between
                            mb-2
                          "
                                                >

                                                    <small>
                                                        💳 Cuotas
                                                    </small>

                                                    <small className="fw-bold">
                                                        {
                                                            evento.cuotas_pagadas
                                                        }
                                                        /
                                                        {
                                                            evento.cuotas_total
                                                        }
                                                    </small>

                                                </div>

                                                <div className="progress rounded-pill">

                                                    <div
                                                        className="
                              progress-bar
                              bg-warning
                            "
                                                        style={{
                                                            width: `${(
                                                                evento.cuotas_pagadas /
                                                                evento.cuotas_total
                                                            ) * 100
                                                                }%`,
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