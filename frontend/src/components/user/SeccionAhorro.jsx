import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

const SeccionAhorro = () => {
  const [planes, setPlanes] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showDeposito, setShowDeposito] = useState(false);
  const [abono, setAbono] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const [nuevaMeta, setNuevaMeta] = useState({
    meta: "",
    monto_diario: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
  });

  useEffect(() => {
    obtenerPlanes();

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

  const obtenerPlanes = async () => {
    try {
      const res = await api.get("/ahorro/todos");

      const planesConTotales = await Promise.all(
        res.data.map(async (plan) => {
          try {
            const respuesta = await api.get(`/ahorro/total-ahorrado/${plan.id}`);
            return { ...plan, total_ahorrado: respuesta.data.total };
          } catch (error) {
            console.error("Error al obtener total ahorrado:", error);
            return { ...plan, total_ahorrado: 0 };
          }
        })
      );

      setPlanes(planesConTotales);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  const calcularProgreso = (plan) => {
    const total = parseFloat(plan.total_ahorrado || 0);
    const meta = parseFloat(plan.meta || 0);
    const porcentaje = meta > 0 ? (total / meta) * 100 : 0;
    return porcentaje.toFixed(0);
  };

  const handleGuardarMeta = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (modoEdicion && metaSeleccionada) {
        await api.put(`/ahorro/${metaSeleccionada}`, nuevaMeta);
      } else {
        await api.post("/ahorro", nuevaMeta, { headers: { "X-Idempotency-Key": idempotencyKey } });
      }
      toast.success(modoEdicion ? "Meta actualizada" : "Meta guardada");
      setShowModal(false);
      resetFormulario();
      obtenerPlanes();
    } catch (err) {
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMeta = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar meta de ahorro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1e1e1e",
      color: "#fff",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/ahorro/${id}`);
      obtenerPlanes();
      toast.success("Meta eliminada");
    } catch (err) {
    }
  };

  const resetFormulario = () => {
    setNuevaMeta({
      meta: "",
      monto_diario: "",
      fecha_inicio: "",
      fecha_fin: "",
      descripcion: "",
    });
    setModoEdicion(false);
    setMetaSeleccionada(null);
  };

  const abrirEdicion = (plan) => {
    setNuevaMeta({
      meta: plan.meta,
      monto_diario: plan.monto_diario,
      fecha_inicio: plan.fecha_inicio.split("T")[0],
      fecha_fin: plan.fecha_fin.split("T")[0],
      descripcion: plan.descripcion,
    });
    setModoEdicion(true);
    setMetaSeleccionada(plan.id);
    setShowModal(true);
  };

  const abrirDeposito = (plan) => {
    setMetaSeleccionada(plan.id);
    setIdempotencyKey(crypto.randomUUID());
    setShowDeposito(true);
    setAbono(0);
  };

  const realizarDeposito = async () => {
    try {
      await api.post("/ahorro/abono", {
        plan_id: metaSeleccionada,
        monto: parseFloat(abono),
      }, { headers: { "X-Idempotency-Key": idempotencyKey } });
      toast.success("Depósito realizado");
      setShowDeposito(false);
      setAbono(0);
      obtenerPlanes();
    } catch (err) {
    }
  };

  const tarjetaEstilo = modoOscuro
    ? "bg-dark text-light border-secondary"
    : "bg-white text-dark";

  return (
    <div
      className={`container-fluid min-vh-100 py-4 px-3 ${modoOscuro ? "bg-black text-light" : "bg-light text-dark"
        }`}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1
            className="fw-bold mb-1"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-1px",
            }}
          >
            Metas de ahorro
          </h1>

          <p
            className={`mb-0 ${modoOscuro
                ? "text-secondary"
                : "text-muted"
              }`}
          >
            Administra tus metas y controla
            tu progreso financiero
          </p>
        </div>

        <Button
          variant="success"
          className="rounded-pill px-4 py-2 fw-semibold shadow"
          onClick={() => { setIdempotencyKey(crypto.randomUUID()); setShowModal(true); }}
        >
          <Icon
            icon="mdi:plus"
            className="me-2"
          />
          Nueva meta
        </Button>
      </div>

      {/* SIN METAS */}
      {planes.length === 0 && (
        <div
          className={`text-center p-5 rounded-4 shadow-sm ${modoOscuro
              ? "bg-dark border border-secondary"
              : "bg-white"
            }`}
        >
          <Icon
            icon="mdi:piggy-bank-outline"
            style={{
              fontSize: "70px",
              color: "#10b981",
            }}
          />

          <h4 className="fw-bold mt-3">
            No tienes metas de ahorro
          </h4>

          <p
            className={
              modoOscuro
                ? "text-secondary"
                : "text-muted"
            }
          >
            Crea tu primera meta y comienza
            a ahorrar
          </p>
        </div>
      )}

      {/* GRID */}
      <div className="row g-4">
        {planes.map((plan) => {
          const progreso =
            calcularProgreso(plan);

          return (
            <div
              className="col-12 col-lg-6"
              key={plan.id}
            >
              <div
                className={`rounded-4 p-4 h-100 position-relative overflow-hidden ${modoOscuro
                    ? "bg-dark border border-secondary"
                    : "bg-white border"
                  }`}
                style={{
                  boxShadow:
                    modoOscuro
                      ? "0 10px 40px rgba(0,0,0,.45)"
                      : "0 10px 30px rgba(0,0,0,.08)",
                }}
              >
                {/* TOP */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-4 mb-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        background:
                          "rgba(16,185,129,.15)",
                        color: "#10b981",
                        fontSize: "28px",
                      }}
                    >
                      <Icon icon="mdi:target" />
                    </div>

                    <h3 className="fw-bold mb-1">
                      {plan.descripcion}
                    </h3>

                    <p
                      className={`mb-0 ${modoOscuro
                          ? "text-secondary"
                          : "text-muted"
                        }`}
                    >
                      Fecha límite:{" "}
                      {plan.fecha_fin?.split(
                        "T"
                      )[0]}
                    </p>
                  </div>

                  <div className="text-end">
                    <h2
                      className="fw-bold mb-0"
                      style={{
                        color: "#10b981",
                      }}
                    >
                      Q{" "}
                      {Number(
                        plan.total_ahorrado || 0
                      ).toFixed(2)}
                    </h2>

                    <small
                      className={
                        modoOscuro
                          ? "text-secondary"
                          : "text-muted"
                      }
                    >
                      de Q{" "}
                      {Number(
                        plan.meta
                      ).toFixed(2)}
                    </small>
                  </div>
                </div>

                {/* PROGRESS */}
                <div
                  className={`progress rounded-pill mb-2 ${modoOscuro
                      ? "bg-secondary"
                      : ""
                    }`}
                  style={{
                    height: "12px",
                  }}
                >
                  <div
                    className="progress-bar rounded-pill"
                    style={{
                      width: `${progreso}%`,
                      background:
                        "linear-gradient(90deg,#10b981,#34d399)",
                    }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between mb-4">
                  <small className="fw-semibold">
                    {progreso}% completado
                  </small>

                  <small className="fw-semibold">
                    Q{" "}
                    {plan.monto_diario ||
                      0}
                    / día
                  </small>
                </div>

                {/* BOTONES */}
                <div className="row g-2">
                  <div className="col-md-4">
                    <Button
                      variant={
                        modoOscuro
                          ? "outline-primary"
                          : "outline-primary"
                      }
                      className="w-100 rounded-4 fw-semibold py-2"
                      onClick={() =>
                        abrirEdicion(plan)
                      }
                    >
                      <Icon
                        icon="mdi:pencil-outline"
                        className="me-2"
                      />
                      Editar
                    </Button>
                  </div>

                  <div className="col-md-4">
                    <Button
                      variant="success"
                      className="w-100 rounded-4 fw-semibold py-2"
                      onClick={() =>
                        abrirDeposito(plan)
                      }
                    >
                      <Icon
                        icon="mdi:cash-plus"
                        className="me-2"
                      />
                      Depositar
                    </Button>
                  </div>

                  <div className="col-md-4">
                    <Button
                      variant="danger"
                      className="w-100 rounded-4 fw-semibold py-2"
                      onClick={() => eliminarMeta(plan.id)}
                    >
                      <Icon
                        icon="mdi:trash-can-outline"
                        className="me-2"
                      />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR */}
      <Modal
        show={showModal}
        centered
        size="lg"
        onHide={() =>
          setShowModal(false)
        }
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {modoEdicion
              ? "Editar meta"
              : "Nueva meta"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className={
            modoOscuro
              ? "bg-dark text-light"
              : ""
          }
        >
          <Form
            onSubmit={handleGuardarMeta}
          >
            <Form.Group className="mb-3">
              <Form.Label>
                Descripción
              </Form.Label>

              <Form.Control
                type="text"
                required
                value={
                  nuevaMeta.descripcion
                }
                onChange={(e) =>
                  setNuevaMeta({
                    ...nuevaMeta,
                    descripcion:
                      e.target.value,
                  })
                }
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>
                  Meta total
                </Form.Label>

                <Form.Control
                  type="number"
                  required
                  value={nuevaMeta.meta}
                  onChange={(e) =>
                    setNuevaMeta({
                      ...nuevaMeta,
                      meta: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>
                  Monto diario
                </Form.Label>

                <Form.Control
                  type="number"
                  required
                  value={
                    nuevaMeta.monto_diario
                  }
                  onChange={(e) =>
                    setNuevaMeta({
                      ...nuevaMeta,
                      monto_diario:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>
                  Fecha inicio
                </Form.Label>

                <Form.Control
                  type="date"
                  required
                  value={
                    nuevaMeta.fecha_inicio
                  }
                  onChange={(e) =>
                    setNuevaMeta({
                      ...nuevaMeta,
                      fecha_inicio:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>
                  Fecha fin
                </Form.Label>

                <Form.Control
                  type="date"
                  required
                  value={
                    nuevaMeta.fecha_fin
                  }
                  onChange={(e) =>
                    setNuevaMeta({
                      ...nuevaMeta,
                      fecha_fin:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="success"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL DEPOSITO */}
      <Modal
        show={showDeposito}
        centered
        onHide={() =>
          setShowDeposito(false)
        }
      >
        <Modal.Body
          className={`p-4 rounded-4 ${modoOscuro
              ? "bg-dark text-light"
              : ""
            }`}
        >
          <h3 className="fw-bold mb-3">
            Depositar ahorro
          </h3>

          <Form.Group>
            <Form.Label>
              Monto a depositar
            </Form.Label>

            <Form.Control
              type="number"
              value={abono}
              onChange={(e) =>
                setAbono(
                  e.target.value
                )
              }
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() =>
                setShowDeposito(false)
              }
            >
              Cancelar
            </Button>

            <Button
              variant="success"
              onClick={
                realizarDeposito
              }
            >
              Depositar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SeccionAhorro;