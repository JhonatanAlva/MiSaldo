import React, { useEffect, useState } from "react";
import api from "../../services/api";

const GastosFijos = () => {
    const [gastos, setGastos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [historiales, setHistoriales] =
        useState({});

    const [mostrarHistorial, setMostrarHistorial] =
        useState({});

    const [mostrarFormulario, setMostrarFormulario] =
        useState(false);

    const [editandoId, setEditandoId] =
        useState(null);

    const [mensaje, setMensaje] = useState("");

    const [mostrarModalEliminar, setMostrarModalEliminar] =
        useState(false);

    const [gastoEliminar, setGastoEliminar] =
        useState(null);

    const [formData, setFormData] = useState({
        nombre: "",
        monto: "",
        dia_cobro: "",
        categoria_id: "",
        tiene_cuotas: false,
        cuotas_total: "",
        cuotas_pagadas: "",
        activo: true,
    });

    // ─────────────────────────────────────────────
    // Obtener gastos
    // ─────────────────────────────────────────────
    const obtenerGastos = async () => {
        try {
            const res = await api.get("/gastos-fijos");

            setGastos(res.data);
        } catch (error) {
            console.error(
                "Error al obtener gastos fijos:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const obtenerHistorial = async (gastoId) => {

        try {

            const res = await api.get(
                `/gastos-fijos/${gastoId}/historial`
            );

            setHistoriales((prev) => ({
                ...prev,
                [gastoId]: res.data,
            }));

        } catch (error) {

            console.error(
                "Error obteniendo historial:",
                error
            );

        }
    };

    // ─────────────────────────────────────────────
    // Obtener categorías
    // ─────────────────────────────────────────────
    const obtenerCategorias = async () => {
        try {
            const res = await api.get("/categorias");

            setCategorias(res.data);
        } catch (error) {
            console.error(
                "Error al obtener categorías:",
                error
            );
        }
    };

    // ─────────────────────────────────────────────
    // Guardar / Editar
    // ─────────────────────────────────────────────
    const guardarGastoFijo = async () => {
        try {
            const payload = {
                ...formData,

                monto: Number(formData.monto),

                dia_cobro: Number(formData.dia_cobro),

                categoria_id: formData.categoria_id
                    ? Number(formData.categoria_id)
                    : null,

                cuotas_total: formData.tiene_cuotas
                    ? Number(formData.cuotas_total)
                    : null,

                cuotas_pagadas: 0,
            };

            if (editandoId) {
                await api.put(
                    `/gastos-fijos/${editandoId}`,
                    payload
                );

                setMensaje(
                    "✅ Gasto fijo actualizado correctamente"
                );
            } else {
                await api.post(
                    "/gastos-fijos",
                    payload
                );

                setMensaje(
                    "✅ Gasto fijo creado correctamente"
                );
            }

            setFormData({
                nombre: "",
                monto: "",
                dia_cobro: "",
                categoria_id: "",
                tiene_cuotas: false,
                cuotas_total: "",
                cuotas_pagadas: "",
                activo: true,
            });

            setEditandoId(null);

            setMostrarFormulario(false);

            obtenerGastos();

            setTimeout(() => {
                setMensaje("");
            }, 3000);

        } catch (error) {
            console.error(error);

            setMensaje(
                "❌ Error al guardar gasto fijo"
            );
        }
    };

    // ─────────────────────────────────────────────
    // Editar
    // ─────────────────────────────────────────────
    const editarGasto = (gasto) => {
        setFormData({
            nombre: gasto.nombre,
            monto: gasto.monto,
            dia_cobro: gasto.dia_cobro,
            categoria_id:
                gasto.categoria_id || "",

            tiene_cuotas:
                gasto.tiene_cuotas,

            cuotas_total:
                gasto.cuotas_total || "",

            cuotas_pagadas: "",

            activo: gasto.activo,
        });

        setEditandoId(gasto.id);

        setMostrarFormulario(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ─────────────────────────────────────────────
    // Eliminar
    // ─────────────────────────────────────────────
    const eliminarGasto = async () => {
        if (!gastoEliminar) return;

        try {
            await api.delete(
                `/gastos-fijos/${gastoEliminar.id}`
            );

            setMensaje(
                "🗑️ Gasto fijo eliminado"
            );

            setMostrarModalEliminar(false);

            setGastoEliminar(null);

            obtenerGastos();

            setTimeout(() => {
                setMensaje("");
            }, 3000);

        } catch (error) {
            console.error(error);

            setMensaje(
                "❌ Error al eliminar"
            );
        }
    };

    useEffect(() => {
        obtenerGastos();

        obtenerCategorias();
    }, []);

    return (
        <div className="container-fluid">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

                <h3 className="fw-bold m-0">
                    📌 Gastos Fijos
                </h3>

                <button
                    className="btn btn-success rounded-pill px-4 fw-semibold shadow-sm"
                    onClick={() => {
                        setMostrarFormulario(
                            !mostrarFormulario
                        );

                        if (mostrarFormulario) {
                            setEditandoId(null);

                            setFormData({
                                nombre: "",
                                monto: "",
                                dia_cobro: "",
                                categoria_id: "",
                                tiene_cuotas: false,
                                cuotas_total: "",
                                cuotas_pagadas: "",
                                activo: true,
                            });
                        }
                    }}
                >
                    + Agregar gasto fijo
                </button>
            </div>

            {/* Alertas */}
            {mensaje && (
                <div className="alert alert-info shadow-sm border-0 rounded-4">
                    {mensaje}
                </div>
            )}

            {/* Formulario */}
            {mostrarFormulario && (
                <div className="card border-0 shadow-lg rounded-4 mb-4">

                    <div className="card-body p-4">

                        <div className="row g-3">

                            {/* Nombre */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Netflix"
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nombre: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Monto */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">
                                    Monto mensual
                                </label>

                                <input
                                    type="number"
                                    className="form-control rounded-3"
                                    placeholder="50"
                                    value={formData.monto}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            monto: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Día */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">
                                    Día de cobro
                                </label>

                                <select
                                    className="form-select rounded-3"
                                    value={formData.dia_cobro}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dia_cobro:
                                                e.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Selecciona un día
                                    </option>

                                    {Array.from(
                                        { length: 31 },
                                        (_, i) => (
                                            <option
                                                key={i + 1}
                                                value={i + 1}
                                            >
                                                Día {i + 1}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Categoría */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">
                                    Categoría
                                </label>

                                <select
                                    className="form-select rounded-3"
                                    value={formData.categoria_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            categoria_id:
                                                e.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Selecciona categoría
                                    </option>

                                    {categorias.map((cat) => (
                                        <option
                                            key={cat.id}
                                            value={cat.id}
                                        >
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tiene cuotas */}
                            <div className="col-12">
                                <div className="form-check form-switch">

                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={
                                            formData.tiene_cuotas
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                tiene_cuotas:
                                                    e.target.checked,
                                            })
                                        }
                                    />

                                    <label className="form-check-label fw-semibold">
                                        Tiene cuotas
                                    </label>
                                </div>
                            </div>

                            {/* Total cuotas */}
                            {formData.tiene_cuotas && (
                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        Total de cuotas
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control rounded-3"
                                        placeholder="12"
                                        value={
                                            formData.cuotas_total
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                cuotas_total:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {/* Activo */}
                            <div className="col-12">
                                <div className="form-check form-switch">

                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={formData.activo}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                activo:
                                                    e.target.checked,
                                            })
                                        }
                                    />

                                    <label className="form-check-label fw-semibold">
                                        Gasto activo
                                    </label>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="col-12">
                                <div className="d-flex gap-2">

                                    {/* Guardar / Actualizar */}
                                    <button
                                        className={`btn flex-fill rounded-3 py-2 fw-semibold shadow-sm ${editandoId
                                            ? "btn-warning"
                                            : "btn-success"
                                            }`}
                                        onClick={guardarGastoFijo}
                                    >
                                        {editandoId
                                            ? "Actualizar gasto fijo"
                                            : "Guardar gasto fijo"}
                                    </button>

                                    {/* Cancelar */}
                                    <button
                                        className="btn btn-outline-secondary rounded-3 px-4 fw-semibold"
                                        onClick={() => {

                                            setMostrarFormulario(false);

                                            setEditandoId(null);

                                            setFormData({
                                                nombre: "",
                                                monto: "",
                                                dia_cobro: "",
                                                categoria_id: "",
                                                tiene_cuotas: false,
                                                cuotas_total: "",
                                                cuotas_pagadas: "",
                                                activo: true,
                                            });
                                        }}
                                    >
                                        Cancelar
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Lista */}
            {loading ? (
                <p>Cargando gastos fijos...</p>
            ) : gastos.length === 0 ? (
                <div className="alert alert-info rounded-4 shadow-sm border-0">
                    No tienes gastos fijos registrados.
                </div>
            ) : (
                <div className="row g-4">

                    {gastos.map((gasto) => (
                        <div
                            className="col-12 col-md-6 col-lg-4"
                            key={gasto.id}
                        >
                            <div className="card border-0 shadow-lg rounded-4 h-100">

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between align-items-start mb-3">

                                        <div>
                                            <h5 className="fw-bold mb-1">
                                                {gasto.nombre}
                                            </h5>

                                            <small className="text-muted">
                                                Cobro cada día{" "}
                                                {gasto.dia_cobro}
                                            </small>
                                        </div>

                                        <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
                                            Q{gasto.monto}
                                        </span>
                                    </div>

                                    {gasto.categoria_nombre && (
                                        <div className="mb-3">
                                            <span className="badge bg-light text-dark border">
                                                📂{" "}
                                                {
                                                    gasto.categoria_nombre
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {gasto.tiene_cuotas && (
                                        <div className="mb-3">

                                            {/* Texto cuotas */}
                                            <div className="d-flex justify-content-between align-items-center mb-2">

                                                <span className="fw-semibold small">
                                                    💳 Cuotas
                                                </span>

                                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                                                    {gasto.cuotas_pagadas}/
                                                    {gasto.cuotas_total}
                                                </span>

                                            </div>

                                            {/* Barra progreso */}
                                            <div
                                                className="progress rounded-pill"
                                                style={{
                                                    height: "10px",
                                                }}
                                            >

                                                <div
                                                    className={`
                progress-bar
                ${gasto.cuotas_pagadas ===
                                                            gasto.cuotas_total
                                                            ? "bg-success"
                                                            : "bg-warning"
                                                        }
            `}
                                                    role="progressbar"
                                                    style={{
                                                        width: `${(gasto.cuotas_pagadas /
                                                            gasto.cuotas_total) *
                                                            100
                                                            }%`,
                                                    }}
                                                ></div>

                                            </div>

                                            {/* Porcentaje */}
                                            <small className="text-muted">

                                                {Math.round(
                                                    (gasto.cuotas_pagadas /
                                                        gasto.cuotas_total) *
                                                    100
                                                )}
                                                % completado

                                            </small>

                                        </div>
                                    )}

                                    {!gasto.activo && (
                                        <div className="mb-3">
                                            <span className="badge bg-secondary rounded-pill">
                                                Inactivo
                                            </span>
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mt-4">

                                        <button
                                            className="btn btn-outline-primary rounded-pill flex-fill"
                                            onClick={() =>
                                                editarGasto(gasto)
                                            }
                                        >
                                            ✏️ Editar
                                        </button>

                                        <button
                                            className="btn btn-outline-danger rounded-pill flex-fill"
                                            onClick={() => {
                                                setGastoEliminar(gasto);

                                                setMostrarModalEliminar(true);
                                            }}
                                        >
                                            🗑️ Eliminar
                                        </button>

                                    </div>

                                    {/* Botón historial */}
                                    <button
                                        className="btn btn-outline-dark w-100 mt-3 rounded-pill"
                                        onClick={async () => {

                                            const abierto =
                                                mostrarHistorial[gasto.id];

                                            setMostrarHistorial((prev) => ({
                                                ...prev,
                                                [gasto.id]: !abierto,
                                            }));

                                            if (!abierto) {
                                                await obtenerHistorial(gasto.id);
                                            }
                                        }}
                                    >
                                        {mostrarHistorial[gasto.id]
                                            ? "📕 Ocultar historial"
                                            : "📜 Ver historial"}
                                    </button>

                                    {/* Historial */}
                                    {mostrarHistorial[gasto.id] && (

                                        <div className="mt-3 border-top pt-3">

                                            <h6 className="fw-bold mb-3">
                                                📜 Historial de pagos
                                            </h6>

                                            {!historiales[gasto.id] ||
                                                historiales[gasto.id].length === 0 ? (

                                                <div className="text-muted small">
                                                    No hay historial todavía
                                                </div>

                                            ) : (

                                                historiales[gasto.id].map((h) => (

                                                    <div
                                                        key={h.id}
                                                        className="
                        small
                        border
                        rounded-4
                        p-3
                        mb-2
                        bg-light
                        shadow-sm
                    "
                                                    >

                                                        <div className="fw-bold">
                                                            💰 Q{h.monto}
                                                        </div>

                                                        {h.cuota_numero && (
                                                            <div className="mt-1">
                                                                💳 Cuota #{h.cuota_numero}
                                                            </div>
                                                        )}

                                                        <div className="text-muted mt-1">
                                                            🕒{" "}
                                                            {new Date(
                                                                h.fecha_pago
                                                            ).toLocaleString()}
                                                        </div>

                                                    </div>

                                                ))

                                            )}

                                        </div>

                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal eliminar */}
            {mostrarModalEliminar && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.6)",

                        backdropFilter:
                            "blur(4px)",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content border-0 shadow-lg rounded-4">

                            <div className="modal-header border-0">

                                <h5 className="modal-title fw-bold">
                                    🗑️ Eliminar gasto fijo
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setMostrarModalEliminar(
                                            false
                                        );

                                        setGastoEliminar(
                                            null
                                        );
                                    }}
                                ></button>
                            </div>

                            <div className="modal-body">

                                <p className="mb-1 text-muted">
                                    Vas a eliminar:
                                </p>

                                <h5 className="fw-bold">
                                    {
                                        gastoEliminar?.nombre
                                    }
                                </h5>

                                <p className="text-danger small mb-0">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>

                            <div className="modal-footer border-0">

                                <button
                                    className="btn btn-light rounded-pill px-4"
                                    onClick={() => {
                                        setMostrarModalEliminar(
                                            false
                                        );

                                        setGastoEliminar(
                                            null
                                        );
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn btn-danger rounded-pill px-4"
                                    onClick={
                                        eliminarGasto
                                    }
                                >
                                    Eliminar
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GastosFijos;