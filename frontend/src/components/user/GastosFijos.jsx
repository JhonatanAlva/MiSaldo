import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

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

        // VALIDACIONES
        if (!formData.nombre.trim()) {
            return Swal.fire({
                icon: "warning",
                title: "Nombre requerido",
                text: "Debes ingresar un nombre para el gasto fijo.",
                confirmButtonColor: "#10b981",
                background: "#1e1e1e",
                color: "#fff",
            });
        }

        if (!formData.monto || Number(formData.monto) <= 0) {
            return Swal.fire({
                icon: "warning",
                title: "Monto inválido",
                text: "Ingresa un monto válido.",
                confirmButtonColor: "#10b981",
                background: "#1e1e1e",
                color: "#fff",
            });
        }

        if (!formData.dia_cobro) {
            return Swal.fire({
                icon: "warning",
                title: "Día requerido",
                text: "Selecciona un día de cobro.",
                confirmButtonColor: "#10b981",
                background: "#1e1e1e",
                color: "#fff",
            });
        }

        if (!formData.categoria_id) {
            return Swal.fire({
                icon: "warning",
                title: "Categoría requerida",
                text: "Debes seleccionar una categoría.",
                confirmButtonColor: "#10b981",
                background: "#1e1e1e",
                color: "#fff",
            });
        }

        if (
            formData.tiene_cuotas &&
            (
                !formData.cuotas_total ||
                Number(formData.cuotas_total) <= 0
            )
        ) {
            return Swal.fire({
                icon: "warning",
                title: "Cuotas inválidas",
                text: "Ingresa el total de cuotas.",
                confirmButtonColor: "#10b981",
                background: "#1e1e1e",
                color: "#fff",
            });
        }

        try {

            const payload = {
                ...formData,

                monto: Number(formData.monto),

                dia_cobro: Number(formData.dia_cobro),

                categoria_id: Number(formData.categoria_id),

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

                Swal.fire({
                    icon: "success",
                    title: "Gasto actualizado",
                    text: "El gasto fijo fue actualizado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    background: "#1e1e1e",
                    color: "#fff",
                });

            } else {

                await api.post(
                    "/gastos-fijos",
                    payload
                );

                Swal.fire({
                    icon: "success",
                    title: "Gasto creado",
                    text: "El gasto fijo fue registrado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    background: "#1e1e1e",
                    color: "#fff",
                });

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

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar el gasto fijo.",
                confirmButtonColor: "#ef4444",
                background: "#1e1e1e",
                color: "#fff",
            });

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
    const eliminarGasto = async (gasto) => {

        const result = await Swal.fire({
            title: "¿Eliminar gasto fijo?",
            text: `Se eliminará "${gasto.nombre}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            background: "#1e1e1e",
            color: "#fff",
        });

        if (!result.isConfirmed) return;

        try {

            await api.delete(
                `/gastos-fijos/${gasto.id}`
            );

            Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El gasto fijo fue eliminado.",
                timer: 1800,
                showConfirmButton: false,
                background: "#1e1e1e",
                color: "#fff",
            });

            obtenerGastos();

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo eliminar el gasto.",
                confirmButtonColor: "#ef4444",
                background: "#1e1e1e",
                color: "#fff",
            });

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

            {/* Modal formulario */}
            {/* Modal */}
            {mostrarFormulario && (

                <div
                    className="
            position-fixed
            top-0
            start-0
            w-100
            h-100
            d-flex
            justify-content-center
            align-items-center
        "
                    style={{
                        background: "rgba(0,0,0,0.70)",
                        zIndex: 9999,
                        backdropFilter: "blur(5px)",
                        padding: "1rem",
                    }}
                    onClick={() => {
                        setMostrarFormulario(false);
                        setEditandoId(null);
                    }}
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                bg-dark
                text-white
                rounded-4
                shadow-lg
                p-4
                position-relative
            "
                        style={{
                            width: "100%",
                            maxWidth: "650px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >

                        {/* Header */}
                        <div
                            className="
                    d-flex
                    justify-content-between
                    align-items-center
                    mb-4
                "
                        >

                            <h3 className="fw-bold">

                                {editandoId
                                    ? "✏️ Editar gasto fijo"
                                    : "📌 Nuevo gasto fijo"}

                            </h3>

                            <button
                                className="
                        btn-close
                        btn-close-white
                    "
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setEditandoId(null);
                                }}
                            />

                        </div>

                        {/* Formulario */}
                        <div className="row g-3">

                            {/* Nombre */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    className="
                            form-control
                            bg-dark
                            text-white
                        "
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
                            <div className="col-md-6">

                                <label className="form-label">
                                    Monto
                                </label>

                                <input
                                    type="number"
                                    className="
                            form-control
                            bg-dark
                            text-white
                        "
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
                            <div className="col-md-6">

                                <label className="form-label">
                                    Día de cobro
                                </label>

                                <select
                                    className="
                            form-select
                            bg-dark
                            text-white
                        "
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
                            <div className="col-md-6">

                                <label className="form-label">
                                    Categoría
                                </label>

                                <select
                                    className="
                            form-select
                            bg-dark
                            text-white
                        "
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

                            {/* Cuotas */}
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

                                    <label className="form-check-label">
                                        Tiene cuotas
                                    </label>

                                </div>

                            </div>

                            {formData.tiene_cuotas && (

                                <div className="col-md-6">

                                    <label className="form-label">
                                        Total cuotas
                                    </label>

                                    <input
                                        type="number"
                                        className="
                                form-control
                                bg-dark
                                text-white
                            "
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

                                    <label className="form-check-label">
                                        Gasto activo
                                    </label>

                                </div>

                            </div>

                            {/* Botones */}
                            <div className="col-12">

                                <div className="d-flex gap-3 mt-3">

                                    <button
                                        className="
                                btn
                                btn-secondary
                                flex-fill
                            "
                                        onClick={() => {
                                            setMostrarFormulario(false);
                                            setEditandoId(null);
                                        }}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        className={`
                                btn
                                flex-fill
                                ${editandoId
                                                ? "btn-warning"
                                                : "btn-success"}
                            `}
                                        onClick={guardarGastoFijo}
                                    >

                                        {editandoId
                                            ? "Actualizar"
                                            : "Guardar"}

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
                                            onClick={() => eliminarGasto(gasto)}
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

        </div>
    );
};

export default GastosFijos;