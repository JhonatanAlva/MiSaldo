import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

const IngresosFijos = () => {
  const [ingresos, setIngresos] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [editandoId, setEditandoId] = useState(null);

  const [errorFormulario, setErrorFormulario] = useState("");

  const [historial, setHistorial] = useState([]);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const [nombreHistorial, setNombreHistorial] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    monto: "",
    frecuencia: "mensual",
    dia_pago: 1,
    dia_pago_secundario: 15,
    activo: true,
  });

  // ─────────────────────────────
  // Obtener ingresos
  // ─────────────────────────────
  const obtenerIngresos = async () => {
    try {
      const res = await api.get("/ingresos-fijos");

      setIngresos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerIngresos();
  }, []);

  // ─────────────────────────────
  // Inputs
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ─────────────────────────────
  // Limpiar
  // ─────────────────────────────
  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      monto: "",
      frecuencia: "mensual",
      dia_pago: 1,
      dia_pago_secundario: 15,
      activo: true,
    });

    setErrorFormulario("");

    setEditandoId(null);

    setMostrarModal(false);
  };

  // ─────────────────────────────
  // Guardar
  // ─────────────────────────────
  const guardarIngreso = async (e) => {
    e.preventDefault();

    setErrorFormulario("");

    if (!formulario.nombre.trim()) {
      return setErrorFormulario("Debes ingresar un nombre.");
    }

    if (!formulario.monto || Number(formulario.monto) <= 0) {
      return setErrorFormulario("Debes ingresar un monto válido.");
    }

    if (formulario.frecuencia === "mensual") {
      if (!formulario.dia_pago) {
        return setErrorFormulario("Debes ingresar el día de pago.");
      }
    }

    if (formulario.frecuencia === "quincenal") {
      if (!formulario.dia_pago || !formulario.dia_pago_secundario) {
        return setErrorFormulario("Debes ingresar ambos días de pago.");
      }
    }

    try {
      if (editandoId) {
        await api.put(`/ingresos-fijos/${editandoId}`, formulario);

        Swal.fire({
          icon: "success",
          title: "Ingreso actualizado",
          timer: 1500,
          showConfirmButton: false,
          background: "#1e1e1e",
          color: "#fff",
        });
      } else {
        await api.post("/ingresos-fijos", formulario);

        Swal.fire({
          icon: "success",
          title: "Ingreso agregado",
          timer: 1500,
          showConfirmButton: false,
          background: "#1e1e1e",
          color: "#fff",
        });
      }

      limpiarFormulario();

      obtenerIngresos();
    } catch (error) {
      console.error(error);

      setErrorFormulario("No se pudo guardar el ingreso.");
    }
  };

  // ─────────────────────────────
  // Editar
  // ─────────────────────────────
  const editarIngreso = (ingreso) => {
    setFormulario({
      nombre: ingreso.nombre,
      monto: ingreso.monto,
      frecuencia: ingreso.frecuencia,
      dia_pago: ingreso.dia_pago,
      dia_pago_secundario: ingreso.dia_pago_secundario || 15,
      activo: ingreso.activo,
    });

    setEditandoId(ingreso.id);

    setMostrarModal(true);
  };

  // ─────────────────────────────
  // Eliminar
  // ─────────────────────────────
  const eliminarIngreso = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar ingreso fijo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      background: "#1e1e1e",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/ingresos-fijos/${id}`);

      obtenerIngresos();
    } catch (error) {
      console.error(error);
    }
  };

  // ─────────────────────────────
  // Historial
  // ─────────────────────────────
  const verHistorial = async (id, nombre) => {
    try {
      const res = await api.get(`/ingresos-fijos/${id}/historial`);

      setHistorial(res.data);

      setNombreHistorial(nombre);

      setMostrarHistorial(true);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al obtener historial",
        background: "#1e1e1e",
        color: "#fff",
      });
    }
  };

  // ─────────────────────────────
  // Texto frecuencia
  // ─────────────────────────────
  const obtenerTextoFrecuencia = (ingreso) => {
    if (ingreso.frecuencia === "mensual") {
      return `
        Cada mes el día
        ${ingreso.dia_pago}
      `;
    }

    if (ingreso.frecuencia === "quincenal") {
      return `
        Días
        ${ingreso.dia_pago}
        y
        ${ingreso.dia_pago_secundario}
        de cada mes
      `;
    }

    if (ingreso.frecuencia === "semanal") {
      return "Cada semana";
    }

    return ingreso.frecuencia;
  };

  return (
    <div className="container-fluid py-4">
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
          <h2 className="fw-bold">💰 Ingresos Fijos</h2>

          <p className="text-muted mb-0">Gestiona ingresos automáticos</p>
        </div>

        <button
          className="
            btn
            btn-success
            rounded-pill
            px-4
            fw-semibold
          "
          onClick={() => setMostrarModal(true)}
        >
          + Agregar ingreso
        </button>
      </div>

      {/* Modal principal */}
      {mostrarModal && (
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
          onClick={limpiarFormulario}
        >
          <div
            className="
              text-white
              rounded-4
              shadow-lg
              p-4
              position-relative
            "
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(135deg,#111827,#1f2937)",
            }}
            onClick={(e) => e.stopPropagation()}
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
                {editandoId ? "✏️ Editar ingreso" : "💰 Nuevo ingreso"}
              </h3>

              <button
                className="
                  btn-close
                  btn-close-white
                "
                onClick={limpiarFormulario}
              />
            </div>

            {/* Error */}
            {errorFormulario && (
              <div
                className="
                  alert
                  alert-danger
                  py-2
                "
              >
                {errorFormulario}
              </div>
            )}

            {/* Form */}
            <form onSubmit={guardarIngreso}>
              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label">Nombre</label>

                <input
                  type="text"
                  className="
                    form-control
                    bg-dark
                    text-white
                  "
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                />
              </div>

              {/* Monto */}
              <div className="mb-3">
                <label className="form-label">Monto</label>

                <input
                  type="number"
                  className="
                    form-control
                    bg-dark
                    text-white
                  "
                  name="monto"
                  value={formulario.monto}
                  onChange={handleChange}
                />
              </div>

              {/* Frecuencia */}
              <div className="mb-3">
                <label className="form-label">Frecuencia</label>

                <select
                  className="
                    form-select
                    bg-dark
                    text-white
                  "
                  name="frecuencia"
                  value={formulario.frecuencia}
                  onChange={handleChange}
                >
                  <option value="mensual">Mensual</option>

                  <option value="quincenal">Quincenal</option>

                  <option value="semanal">Semanal</option>
                </select>
              </div>

              {/* Mensual */}
              {formulario.frecuencia === "mensual" && (
                <div className="mb-4">
                  <label className="form-label">Día de pago</label>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="
                      form-control
                      bg-dark
                      text-white
                    "
                    name="dia_pago"
                    value={formulario.dia_pago}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Quincenal */}
              {formulario.frecuencia === "quincenal" && (
                <div className="row">
                  <div className="col-6 mb-4">
                    <label className="form-label">Primer pago</label>

                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="
                        form-control
                        bg-dark
                        text-white
                      "
                      name="dia_pago"
                      value={formulario.dia_pago}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-6 mb-4">
                    <label className="form-label">Segundo pago</label>

                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="
                        form-control
                        bg-dark
                        text-white
                      "
                      name="dia_pago_secundario"
                      value={formulario.dia_pago_secundario}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Semanal */}
              {formulario.frecuencia === "semanal" && (
                <div
                  className="
                    alert
                    alert-info
                    border-0
                  "
                >
                  Este ingreso se registrará automáticamente cada semana.
                </div>
              )}

              {/* Botones */}
              <div
                className="
                  d-flex
                  gap-3
                  mt-4
                "
              >
                <button
                  type="button"
                  className="
                    btn
                    btn-secondary
                    flex-fill
                  "
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    btn
                    btn-success
                    flex-fill
                  "
                >
                  {editandoId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal historial */}
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
          onClick={() => setMostrarHistorial(false)}
        >
          <div
            className="
              text-white
              rounded-4
              shadow-lg
              p-4
            "
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(135deg,#111827,#1f2937)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
                d-flex
                justify-content-between
                align-items-center
                mb-4
              "
            >
              <h3 className="fw-bold">📜 Historial de {nombreHistorial}</h3>

              <button
                className="
                  btn-close
                  btn-close-white
                "
                onClick={() => setMostrarHistorial(false)}
              />
            </div>

            {historial.length === 0 ? (
              <div
                className="
                  alert
                  alert-secondary
                "
              >
                No hay historial todavía.
              </div>
            ) : (
              <>
                <div
                  className="
                    table-responsive
                  "
                >
                  <table
                    className="
                      table
                      table-dark
                      table-hover
                      align-middle
                    "
                  >
                    <thead>
                      <tr>
                        <th>Fecha</th>

                        <th>Monto</th>
                      </tr>
                    </thead>

                    <tbody>
                      {historial.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {new Date(item.fecha_pago).toLocaleDateString()}
                          </td>

                          <td>Q{item.monto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="
                    mt-3
                    text-end
                    fw-bold
                    fs-5
                    text-success
                  "
                >
                  Total recibido: Q
                  {historial
                    .reduce((acc, item) => acc + Number(item.monto), 0)
                    .toFixed(2)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="row g-4">
        {ingresos.map((ingreso) => (
          <div
            key={ingreso.id}
            className="
              col-md-6
              col-lg-4
            "
          >
            <div
              className="
                card
                border-0
                shadow-lg
                rounded-4
                h-100
              "
              style={{
                transition: "0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
              }}
            >
              <div className="card-body">
                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-start
                    mb-3
                  "
                >
                  <div>
                    <h3 className="fw-bold">{ingreso.nombre}</h3>

                    <p className="text-muted">
                      {obtenerTextoFrecuencia(ingreso)}
                    </p>
                  </div>

                  <span
                    className="
                      badge
                      bg-success
                      fs-6
                      px-3
                      py-2
                      rounded-pill
                    "
                  >
                    Q{ingreso.monto}
                  </span>
                </div>

                {/* Botones */}
                <div
                  className="
                    d-flex
                    gap-2
                    mt-4
                  "
                >
                  <button
                    className="
                      btn
                      btn-outline-success
                      flex-fill
                    "
                    onClick={() => editarIngreso(ingreso)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="
                      btn
                      btn-outline-danger
                      flex-fill
                    "
                    onClick={() => eliminarIngreso(ingreso.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                <button
                  className="
                    btn
                    btn-outline-dark
                    w-100
                    mt-3
                    rounded-pill
                  "
                  onClick={() => verHistorial(ingreso.id, ingreso.nombre)}
                >
                  📜 Ver historial
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngresosFijos;
