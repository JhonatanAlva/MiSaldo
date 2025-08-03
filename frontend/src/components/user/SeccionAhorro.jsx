import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

const SeccionAhorro = () => {
  const [planes, setPlanes] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [showEliminar, setShowEliminar] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showDeposito, setShowDeposito] = useState(false);
  const [abono, setAbono] = useState(0);

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

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };

  const obtenerPlanes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/ahorro/todos", {
        withCredentials: true,
      });

      const planesConTotales = await Promise.all(
        res.data.map(async (plan) => {
          try {
            const respuesta = await axios.get(`http://localhost:5000/ahorro/total-ahorrado/${plan.id}`, {
              withCredentials: true,
            });
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
    try {
      if (modoEdicion && metaSeleccionada) {
        await axios.put(`http://localhost:5000/ahorro/${metaSeleccionada}`, nuevaMeta, {
          withCredentials: true,
        });
      } else {
        await axios.post("http://localhost:5000/ahorro", nuevaMeta, {
          withCredentials: true,
        });
      }
      mostrarAlerta(modoEdicion ? "Meta actualizada" : "Meta guardada correctamente");
      setShowModal(false);
      resetFormulario();
      obtenerPlanes();
    } catch (err) {
      console.error("Error al guardar meta:", err);
      mostrarAlerta("Error al guardar meta", "danger");
    }
  };

  const eliminarMeta = async () => {
    try {
      await axios.delete(`http://localhost:5000/ahorro/${metaSeleccionada}`, {
        withCredentials: true,
      });
      mostrarAlerta("Meta eliminada correctamente");
      setShowEliminar(false);
      setMetaSeleccionada(null);
      obtenerPlanes();
    } catch (err) {
      console.error("Error al eliminar meta:", err);
      mostrarAlerta("Error al eliminar meta", "danger");
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
    setShowDeposito(true);
    setAbono(0);
  };

  const realizarDeposito = async () => {
    try {
      await axios.post("http://localhost:5000/ahorro/abono", {
        plan_id: metaSeleccionada,
        monto: parseFloat(abono),
      }, {
        withCredentials: true,
      });
      mostrarAlerta("Depósito realizado correctamente");
      setShowDeposito(false);
      setAbono(0);
      obtenerPlanes();
    } catch (err) {
      console.error("Error al realizar abono:", err);
      mostrarAlerta("Error al realizar depósito", "danger");
    }
  };

  const tarjetaEstilo = modoOscuro
    ? "bg-dark text-light border-secondary"
    : "bg-white text-dark";

  return (
    <div className="w-100 px-3 py-4 min-vh-100">
      {alerta && (
        <Alert variant={alerta.tipo} className="text-center">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className={modoOscuro ? "text-light" : "text-dark"}>Metas de Ahorro</h4>
        <Button variant="success" onClick={() => setShowModal(true)}>
          <Icon icon="mdi:plus" className="me-1" />
          Nueva Meta
        </Button>
      </div>

      {planes.length === 0 && (
        <p className={modoOscuro ? "text-light" : "text-dark"}>
          No tienes metas de ahorro activas.
        </p>
      )}

      <div className="d-flex flex-column gap-4">
        {planes.map((plan) => {
          const progreso = calcularProgreso(plan);
          return (
            <div
              key={`plan-${plan.id}`}
              className={`p-4 rounded shadow ${tarjetaEstilo} w-100`}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="mb-1 fw-bold">{plan.descripcion || `Meta ${plan.id}`}</h5>
                  <small className={modoOscuro ? "text-light" : "text-dark"}>
                    Meta para {plan.fecha_fin?.split("T")[0] || "sin fecha"}
                  </small>
                </div>
                <div className="text-end">
                  <p className="mb-1 fw-semibold">
                    Q {plan.total_ahorrado || 0} / Q {plan.meta}
                  </p>
                  <small className="text-success">{progreso}% completado</small>
                </div>
              </div>

              <div className="progress mb-3" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => abrirEdicion(plan)}>
                  <Icon icon="mdi:pencil" className="me-1" /> Editar
                </Button>
                <Button variant="success" size="sm" onClick={() => abrirDeposito(plan)}>
                  <Icon icon="mdi:cash-plus" className="me-1" /> Depositar
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setMetaSeleccionada(plan.id); setShowEliminar(true); }}>
                  <Icon icon="mdi:trash-can-outline" className="me-1" /> Eliminar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nueva/Editar Meta */}
      <Modal show={showModal} fullscreen onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleGuardarMeta} className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control type="text" required value={nuevaMeta.descripcion} onChange={(e) => setNuevaMeta({ ...nuevaMeta, descripcion: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto meta (Q)</Form.Label>
              <Form.Control type="number" required value={nuevaMeta.meta} onChange={(e) => setNuevaMeta({ ...nuevaMeta, meta: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto diario sugerido</Form.Label>
              <Form.Control type="number" required value={nuevaMeta.monto_diario} onChange={(e) => setNuevaMeta({ ...nuevaMeta, monto_diario: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha inicio</Form.Label>
              <Form.Control type="date" required value={nuevaMeta.fecha_inicio} onChange={(e) => setNuevaMeta({ ...nuevaMeta, fecha_inicio: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha fin</Form.Label>
              <Form.Control type="date" required value={nuevaMeta.fecha_fin} onChange={(e) => setNuevaMeta({ ...nuevaMeta, fecha_fin: e.target.value })} />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="success" type="submit">
                {modoEdicion ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Eliminar */}
      <Modal show={showEliminar} centered onHide={() => setShowEliminar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Meta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar esta meta de ahorro? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEliminar(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminarMeta}>Sí, eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Depósito */}
      <Modal show={showDeposito} centered onHide={() => setShowDeposito(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Depositar en Meta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Monto a depositar</Form.Label>
              <Form.Control type="number" value={abono} min="0" onChange={(e) => setAbono(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeposito(false)}>Cancelar</Button>
          <Button variant="success" onClick={realizarDeposito}>Depositar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SeccionAhorro;