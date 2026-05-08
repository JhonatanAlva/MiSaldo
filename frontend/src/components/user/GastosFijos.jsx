import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const GastosFijos = () => {

    const [gastos, setGastos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [historial, setHistorial] = useState([]);
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [nombreHistorial, setNombreHistorial] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [editandoId, setEditandoId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: "",
        monto: "",
        dia_cobro: "",
        categoria_id: "",
        tiene_cuotas: false,
        cuotas_total: "",
        cuotas_pagadas: 0,
        activo: true,
    });

    // ─────────────────────────────
    // Obtener gastos
    // ─────────────────────────────
    const obtenerGastos = async () => {

        try {

            const res =
                await api.get("/gastos-fijos");

            setGastos(res.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    // ─────────────────────────────
    // Obtener categorías
    // ─────────────────────────────
    const obtenerCategorias = async () => {

        try {

            const res =
                await api.get("/categorias");

            setCategorias(res.data);

        } catch (error) {

            console.error(error);

        }

    };

    // ─────────────────────────────
    // Historial modal
    // ─────────────────────────────
    const abrirHistorial = async (gasto) => {

        try {

            const res =
                await api.get(
                    `/gastos-fijos/${gasto.id}/historial`
                );

            setHistorial(res.data);

            setNombreHistorial(gasto.nombre);

            setMostrarHistorial(true);

        } catch (error) {

            console.error(error);

        }

    };

    // ─────────────────────────────
    // Guardar
    // ─────────────────────────────
    const guardarGastoFijo = async () => {

        if (!formData.nombre.trim()) {

            return Swal.fire({
                icon: "warning",
                title: "Nombre requerido",
                text: "Debes ingresar un nombre.",
                background: "#1e1e1e",
                color: "#fff",
            });

        }

        if (!formData.categoria_id) {

            return Swal.fire({
                icon: "warning",
                title: "Categoría requerida",
                text: "Selecciona una categoría.",
                background: "#1e1e1e",
                color: "#fff",
            });

        }

        try {

            const payload = {
                ...formData,

                monto:
                    Number(formData.monto),

                dia_cobro:
                    Number(formData.dia_cobro),

                categoria_id:
                    Number(formData.categoria_id),

                cuotas_total:
                    formData.tiene_cuotas
                        ? Number(formData.cuotas_total)
                        : null,

                cuotas_pagadas:
                    formData.tiene_cuotas
                        ? Number(formData.cuotas_pagadas)
                        : null,
            };

            if (editandoId) {

                await api.put(
                    `/gastos-fijos/${editandoId}`,
                    payload
                );

                Swal.fire({
                    icon: "success",
                    title: "Actualizado",
                    text: "Gasto actualizado.",
                    timer: 1800,
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
                    title: "Creado",
                    text: "Gasto creado.",
                    timer: 1800,
                    showConfirmButton: false,
                    background: "#1e1e1e",
                    color: "#fff",
                });

            }

            setMostrarFormulario(false);

            setEditandoId(null);

            setFormData({
                nombre: "",
                monto: "",
                dia_cobro: "",
                categoria_id: "",
                tiene_cuotas: false,
                cuotas_total: "",
                cuotas_pagadas: 0,
                activo: true,
            });

            obtenerGastos();

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar.",
                background: "#1e1e1e",
                color: "#fff",
            });

        }

    };

    // ─────────────────────────────
    // EDITAR FUNCIONAL
    // ─────────────────────────────
    const editarGasto = (gasto) => {

        setMostrarHistorial(false);

        setFormData({
            nombre: gasto.nombre,
            monto: gasto.monto,
            dia_cobro: gasto.dia_cobro,
            categoria_id: gasto.categoria_id || "",
            tiene_cuotas: gasto.tiene_cuotas,
            cuotas_total: gasto.cuotas_total || "",
            cuotas_pagadas: gasto.cuotas_pagadas ?? 0,
            activo: gasto.activo,
        });

        setEditandoId(gasto.id);

        setMostrarFormulario(true);

    };

    // ─────────────────────────────
    // Eliminar
    // ─────────────────────────────
    const eliminarGasto = async (gasto) => {

        const result =
            await Swal.fire({
                title: "¿Eliminar?",
                text: gasto.nombre,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#6b7280",
                background: "#1e1e1e",
                color: "#fff",
            });

        if (!result.isConfirmed) return;

        try {

            await api.delete(
                `/gastos-fijos/${gasto.id}`
            );

            obtenerGastos();

            Swal.fire({
                icon: "success",
                title: "Eliminado",
                timer: 1500,
                showConfirmButton: false,
                background: "#1e1e1e",
                color: "#fff",
            });

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        obtenerGastos();

        obtenerCategorias();

    }, []);

    return (

        <div className="container-fluid">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <h3 className="fw-bold">
                    📌 Gastos Fijos
                </h3>

                <button
                    className="
                        btn
                        btn-success
                        rounded-pill
                        px-4
                    "
                    onClick={() => {

                        setMostrarFormulario(true);

                        setEditandoId(null);

                    }}
                >
                    + Agregar gasto fijo
                </button>

            </div>

            {/* Cards */}
            <div className="row g-4">

                {gastos.map((gasto) => (

                    <div
                        className="col-12 col-md-6 col-lg-4"
                        key={gasto.id}
                    >

                        <div className="
                            card
                            border-0
                            rounded-4
                            shadow-lg
                            h-100
                        ">

                            <div className="card-body p-4">

                                <div className="
                                    d-flex
                                    justify-content-between
                                    align-items-start
                                    mb-3
                                ">

                                    <div>

                                        <h5 className="fw-bold">
                                            {gasto.nombre}
                                        </h5>

                                        <small className="text-muted">
                                            Cobro cada día {gasto.dia_cobro}
                                        </small>

                                    </div>

                                    <span className="
                                        badge
                                        bg-danger
                                        rounded-pill
                                        fs-6
                                        px-3
                                        py-2
                                    ">
                                        Q{gasto.monto}
                                    </span>

                                </div>

                                {gasto.categoria_nombre && (

                                    <div className="mb-3">

                                        <span className="
                                            badge
                                            bg-light
                                            text-dark
                                            border
                                        ">
                                            📂 {gasto.categoria_nombre}
                                        </span>

                                    </div>

                                )}

                                {gasto.tiene_cuotas && (

                                    <div className="mb-4">

                                        <div className="
                                            d-flex
                                            justify-content-between
                                            mb-2
                                        ">

                                            <span>
                                                💳 Cuotas
                                            </span>

                                            <span className="
                                                badge
                                                bg-warning
                                                text-dark
                                                rounded-pill
                                            ">
                                                {gasto.cuotas_pagadas}/
                                                {gasto.cuotas_total}
                                            </span>

                                        </div>

                                        <div
                                            className="progress rounded-pill"
                                            style={{
                                                height: "10px",
                                            }}
                                        >

                                            <div
                                                className="
                                                    progress-bar
                                                    bg-warning
                                                "
                                                style={{
                                                    width:
                                                        `${(gasto.cuotas_pagadas /
                                                            gasto.cuotas_total) * 100}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                )}

                                {/* Botones */}
                                <div className="d-flex gap-2">

                                    <button
                                        className="
                                            btn
                                            btn-outline-primary
                                            rounded-pill
                                            flex-fill
                                        "
                                        onClick={() =>
                                            editarGasto(gasto)
                                        }
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button
                                        className="
                                            btn
                                            btn-outline-danger
                                            rounded-pill
                                            flex-fill
                                        "
                                        onClick={() =>
                                            eliminarGasto(gasto)
                                        }
                                    >
                                        🗑️ Eliminar
                                    </button>

                                </div>

                                {/* Historial */}
                                <button
                                    className="
                                        btn
                                        btn-outline-dark
                                        rounded-pill
                                        w-100
                                        mt-3
                                    "
                                    onClick={() =>
                                        abrirHistorial(gasto)
                                    }
                                >
                                    📜 Ver historial
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            {/* MODAL FORMULARIO */}
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
                        zIndex: 10000,
                        backdropFilter: "blur(5px)",
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
        position-relative
    "
                        style={{
                            width: "100%",
                            maxWidth: "650px",

                            // ✅ responsive
                            maxHeight: "92vh",
                            overflowY: "auto",

                            // ✅ menos padding en móvil
                            padding: window.innerWidth < 768 ? "1.2rem" : "2rem",

                            // ✅ márgenes laterales
                            margin: "0.5rem",

                            // ✅ evita que toque bordes
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >

                        <div className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-4
                        ">

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

                        <div className="row g-3">

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
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nombre: e.target.value,
                                        })
                                    }
                                />

                            </div>

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
                                    value={formData.monto}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            monto: e.target.value,
                                        })
                                    }
                                />

                            </div>

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
                                            dia_cobro: e.target.value,
                                        })
                                    }
                                >

                                    <option value="">
                                        Selecciona
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
                                        Selecciona
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

                            {/* cuotas */}
                            <div className="col-12">

                                <div className="
                                    form-check
                                    form-switch
                                ">

                                    <input
                                        className="
                                            form-check-input
                                        "
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

                                    <label className="
                                        form-check-label
                                    ">
                                        Tiene cuotas
                                    </label>

                                </div>

                            </div>

                            {formData.tiene_cuotas && (

                                <>
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
                                            value={formData.cuotas_total}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    cuotas_total:
                                                        e.target.value,
                                                })
                                            }
                                        />

                                    </div>

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Cuotas pagadas
                                        </label>

                                        <input
                                            type="number"
                                            className="
                                                form-control
                                                bg-dark
                                                text-white
                                            "
                                            value={formData.cuotas_pagadas}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    cuotas_pagadas:
                                                        e.target.value,
                                                })
                                            }
                                        />

                                    </div>
                                </>

                            )}

                            <div className="col-12">

                                <div className="
                                    d-flex
                                    gap-3
                                    mt-3
                                ">

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

            {/* MODAL HISTORIAL */}
            {mostrarHistorial && (

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
                    onClick={() =>
                        setMostrarHistorial(false)
                    }
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
        bg-dark
        text-white
        rounded-4
        shadow-lg
        position-relative
    "
                        style={{
                            width: "100%",
                            maxWidth: "650px",

                            // ✅ responsive
                            maxHeight: "92vh",
                            overflowY: "auto",

                            // ✅ menos padding en móvil
                            padding: window.innerWidth < 768 ? "1.2rem" : "2rem",

                            // ✅ márgenes laterales
                            margin: "0.5rem",

                            // ✅ evita que toque bordes
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >

                        <div className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-4
                        ">

                            <h3 className="fw-bold">
                                📜 Historial de {nombreHistorial}
                            </h3>

                            <button
                                className="
                                    btn-close
                                    btn-close-white
                                "
                                onClick={() =>
                                    setMostrarHistorial(false)
                                }
                            />

                        </div>

                        {historial.length === 0 ? (

                            <div className="
                                alert
                                alert-secondary
                            ">
                                No hay historial todavía.
                            </div>

                        ) : (

                            historial.map((item) => (

                                <div
                                    key={item.id}
                                    className="
                                        bg-dark
                                        rounded-4
                                        p-3
                                        mb-3
                                    "
                                >

                                    <div className="fw-bold">
                                        💰 Q{item.monto}
                                    </div>

                                    <div className="small text-muted">
                                        {new Date(
                                            item.fecha_pago
                                        ).toLocaleString()}
                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            )}

        </div>

    );

};

export default GastosFijos;