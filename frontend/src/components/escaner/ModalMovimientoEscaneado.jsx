import React, { useEffect, useState } from "react";
import api from "../../services/api";

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

const ModalMovimientoEscaneado = ({
  abierto,
  onClose,
  movimiento,
  onChange,
  onGuardar,
}) => {

  // Gastos fijos usan /categorias, gastos normales usan /finanzas/categorias
  const [categoriasFijo,  setCategoriasFijo]  = useState([]);
  const [categoriasGasto, setCategoriasGasto] = useState([]);

  useEffect(() => {
    if (!abierto) return;

    const cargar = async () => {
      try {
        const [resFijo, resGasto] = await Promise.all([
          api.get("/categorias"),
          api.get("/finanzas/categorias"),
        ]);
        setCategoriasFijo(resFijo.data);
        setCategoriasGasto(resGasto.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };

    cargar();
  }, [abierto]);

  if (!abierto || !movimiento) return null;

  const esFijo = movimiento?.tipo === "gasto-fijo";

  // ── Parsear cuotas "pagadas/total" ─────────────────────
  const parseCuotas = (raw) => {
    if (!raw || raw === "") return { pagadas: 0, total: "" };
    const str = String(raw);
    if (str.includes("/")) {
      const [p, t] = str.split("/");
      return {
        pagadas: isNaN(Number(p)) ? 0 : Number(p),
        total:   t || "",
      };
    }
    return { pagadas: 0, total: str };
  };

  const { pagadas: cuotasPagadas, total: cuotasTotal } =
    parseCuotas(movimiento.cuotas);

  const tieneCuotas = esFijo && !!movimiento.cuotas && movimiento.cuotas !== "0/";

  const handleCuotasTotal = (valor) => {
    // Siempre reconstruir preservando las pagadas que ya venían de la IA
    onChange("cuotas", valor ? `${cuotasPagadas}/${valor}` : "");
  };

  const handleToggleCuotas = (checked) => {
    onChange("cuotas", checked ? `${cuotasPagadas}/` : "");
  };

  // Categorías según tipo
  const categoriasActuales = esFijo ? categoriasFijo : categoriasGasto;

  // Para gastos normales el campo es categoria_id para fijos, nombre para normales
  const handleCategoriaChange = (e) => {
    if (esFijo) {
      onChange("categoria_id", e.target.value);
    } else {
      // Guardar id Y nombre para que EscanerIA pueda usar cualquiera
      const cat = categoriasGasto.find(
        (c) => String(c.id) === String(e.target.value)
      );
      onChange("categoria_id",    e.target.value);
      onChange("categoriaNombre", cat ? cat.nombre : "");
    }
  };

  const categoriaValor = movimiento.categoria_id || "";

  // Estilos reutilizables
  const ctrlStyle = {
    background:  "#1a2035",
    color:       "#ffffff",
    border:      "1px solid rgba(255,255,255,0.12)",
  };

  const labelStyle = {
    color:         "rgba(255,255,255,0.5)",
    fontSize:      "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight:    600,
    marginBottom:  "0.4rem",
    display:       "block",
  };

  return (
    <div
      className="
        position-fixed top-0 start-0
        w-100 h-100
        d-flex justify-content-center align-items-center
      "
      style={{
        background:    "rgba(0,0,0,0.75)",
        zIndex:        9999,
        backdropFilter:"blur(6px)",
        padding:       "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-4 shadow-lg text-white"
        style={{
          width:      "100%",
          maxWidth:   "560px",
          maxHeight:  "90vh",
          overflowY:  "auto",
          background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
          border:     "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ──────────────────────────────────── */}
        <div
          className="d-flex justify-content-between align-items-center px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h5 className="fw-bold m-0">
            ✏️ Editar {esFijo ? "gasto fijo" : "movimiento"}
          </h5>
          <button onClick={onClose} className="btn-close btn-close-white" />
        </div>

        {/* ── Campos ──────────────────────────────────── */}
        <div className="p-4">
          <div className="row g-3">

            {/* Nombre */}
            <div className="col-12">
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                className="form-control rounded-3"
                style={ctrlStyle}
                value={movimiento.descripcion}
                onChange={(e) => onChange("descripcion", e.target.value)}
              />
            </div>

            {/* Monto */}
            <div className="col-12">
              <label style={labelStyle}>Monto</label>
              <input
                type="number"
                className="form-control rounded-3"
                style={ctrlStyle}
                value={movimiento.monto}
                onChange={(e) => onChange("monto", e.target.value)}
              />
            </div>

            {/* Tipo + Día de cobro */}
            <div className={esFijo ? "col-6" : "col-12"}>
              <label style={labelStyle}>Tipo</label>
              <select
                className="form-select rounded-3"
                style={ctrlStyle}
                value={movimiento.tipo}
                onChange={(e) => onChange("tipo", e.target.value)}
              >
                <option value="gasto">Gasto normal</option>
                <option value="gasto-fijo">Gasto fijo</option>
              </select>
            </div>

            {esFijo && (
              <div className="col-6">
                <label style={labelStyle}>Día de cobro</label>
                <select
                  className="form-select rounded-3"
                  style={ctrlStyle}
                  value={movimiento.diaCobro || ""}
                  onChange={(e) =>
                    onChange("diaCobro", Number(e.target.value))
                  }
                >
                  <option value="">Selecciona día</option>
                  {DIAS.map((d) => (
                    <option key={d} value={d}>Día {d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Categoría */}
            <div className="col-12">
              <label style={labelStyle}>Categoría</label>
              <select
                className="form-select rounded-3"
                style={ctrlStyle}
                value={categoriaValor}
                onChange={handleCategoriaChange}
              >
                <option value="">Selecciona categoría</option>
                {categoriasActuales.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Tiene cuotas */}
            {esFijo && (
              <div className="col-12">
                <div className="d-flex align-items-center gap-3">
                  <div className="form-check form-switch m-0 p-0">
                    <input
                      className="form-check-input m-0"
                      type="checkbox"
                      role="switch"
                      style={{
                        width:       "2.6rem",
                        height:      "1.35rem",
                        cursor:      "pointer",
                        background:  tieneCuotas
                          ? "#10b981"
                          : "rgba(255,255,255,0.2)",
                        borderColor: "transparent",
                      }}
                      checked={tieneCuotas}
                      onChange={(e) => handleToggleCuotas(e.target.checked)}
                    />
                  </div>
                  <span className="fw-medium" style={{ fontSize: "0.95rem" }}>
                    Tiene cuotas
                  </span>
                </div>
              </div>
            )}

            {/* Total cuotas — muestra las pagadas como info */}
            {esFijo && tieneCuotas && (
              <div className="col-12">
                <label style={labelStyle}>
                  Total cuotas
                  {cuotasPagadas > 0 && (
                    <span
                      className="ms-2 px-2 py-1 rounded-pill"
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        color:      "#10b981",
                        fontSize:   "0.68rem",
                        fontWeight: 600,
                      }}
                    >
                      {cuotasPagadas} pagadas
                    </span>
                  )}
                </label>

                {/* Progreso visual */}
                {cuotasPagadas > 0 && cuotasTotal && (
                  <div className="mb-2">
                    <div
                      className="rounded-pill overflow-hidden"
                      style={{
                        height:     "6px",
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="h-100 rounded-pill"
                        style={{
                          width:      `${Math.min(
                            (cuotasPagadas / Number(cuotasTotal)) * 100,
                            100
                          )}%`,
                          background: "#10b981",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <small style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>
                      {cuotasPagadas}/{cuotasTotal} —{" "}
                      {Math.round((cuotasPagadas / Number(cuotasTotal)) * 100)}% completado
                    </small>
                  </div>
                )}

                <input
                  type="number"
                  min="1"
                  className="form-control rounded-3"
                  style={ctrlStyle}
                  value={cuotasTotal}
                  onChange={(e) => handleCuotasTotal(e.target.value)}
                />
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div
          className="px-4 py-3 d-flex justify-content-end gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={onClose}
            className="btn px-4 py-2 rounded-3 fw-medium"
            style={{
              background: "rgba(255,255,255,0.1)",
              color:      "#fff",
              border:     "none",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            className="btn px-4 py-2 rounded-3 fw-bold"
            style={{
              background: "#10b981",
              color:      "#fff",
              border:     "none",
            }}
          >
            Actualizar
          </button>
        </div>

      </div>
    </div>
  );

};

export default ModalMovimientoEscaneado;