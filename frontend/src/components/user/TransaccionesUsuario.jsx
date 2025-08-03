import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button, Form, InputGroup, FormSelect, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

const fuentesIngreso = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Regalos",
  "Otros",
];

const TransaccionesUsuario = () => {
  const [transactions, setTransactions] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [formVisible, setFormVisible] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    obtenerHistorial();
    obtenerCategorias();

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

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get("http://localhost:5000/finanzas/categorias", {
        withCredentials: true,
      });
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  const obtenerHistorial = async () => {
    try {
      const res = await axios.get("http://localhost:5000/finanzas/historial", {
        withCredentials: true,
      });
      const datos = res.data.map((t, index) => ({
        ...t,
        id: t.id || index + 1,
        type: t.tipo.toLowerCase(),
        description: t.descripcion || t.fuente,
      }));
      setTransactions(datos);
    } catch (err) {
      console.error("Error al obtener historial:", err);
    }
  };

  const handleAddTransaction = async () => {
    const { type, category, description, amount, date } = newTransaction;

    if (!category || !amount || !date) return;

    try {
      if (modoEdicion && transaccionSeleccionada) {
        let payload = {
          monto: parseFloat(amount),
          fecha: date,
        };

        if (type === "ingreso") {
          payload.fuente = category;
        } else {
          payload.descripcion = description;

          // Obtener o crear categoría
          const categoriaRes = await axios.post(
            "http://localhost:5000/finanzas/categoria",
            { nombre: category },
            { withCredentials: true }
          );
          payload.categoria_id = categoriaRes.data.id;
        }

        await axios.put(
          `http://localhost:5000/finanzas/movimiento/${type}/${transaccionSeleccionada.id}`,
          payload,
          { withCredentials: true }
        );

        mostrarAlerta("Movimiento actualizado correctamente");
      } else {
        if (type === "ingreso") {
          await axios.post(
            "http://localhost:5000/finanzas/ingresos",
            { monto: parseFloat(amount), fuente: category, fecha: date },
            { withCredentials: true }
          );
        } else {
          const categoriaRes = await axios.post(
            "http://localhost:5000/finanzas/categoria",
            { nombre: category },
            { withCredentials: true }
          );

          await axios.post(
            "http://localhost:5000/finanzas/gastos",
            {
              monto: parseFloat(amount),
              descripcion: description,
              fecha: date,
              categoria_id: categoriaRes.data.id,
            },
            { withCredentials: true }
          );
        }

        mostrarAlerta("Transacción guardada exitosamente");
      }

      await obtenerHistorial();
      resetFormulario();
    } catch (err) {
      console.error("Error al guardar transacción:", err);
      mostrarAlerta("Ocurrió un error al guardar", "danger");
    }
  };

  const eliminarTransaccion = async (tipo, id) => {
    try {
      await axios.delete(
        `http://localhost:5000/finanzas/movimiento/${tipo}/${id}`,
        {
          withCredentials: true,
        }
      );
      mostrarAlerta("Movimiento eliminado correctamente");
      await obtenerHistorial();
      resetFormulario(); // 🔁 Cierra el formulario de edición automáticamente
    } catch (err) {
      console.error("Error al eliminar movimiento", err);
      mostrarAlerta("Error al eliminar movimiento", "danger");
    }
  };

  const resetFormulario = () => {
    setFormVisible(false);
    setModoEdicion(false);
    setTransaccionSeleccionada(null);
    setNewTransaction({
      type: "gasto",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditarTransaccion = (transaccion) => {
    setFormVisible(true);
    setModoEdicion(true);
    setTransaccionSeleccionada(transaccion);
    setNewTransaction({
      type: transaccion.type,
      category: transaccion.category || transaccion.categoria,
      description: transaccion.description,
      amount: transaccion.amount || transaccion.monto,
      date: transaccion.fecha,
    });
  };

  const filtered = useMemo(() => {
    if (filter === "todos") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [filter, transactions]);

  const formatCurrency = (value) => `Q ${parseFloat(value).toFixed(2)}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const tarjetaBase = modoOscuro
    ? "bg-dark text-light border-secondary"
    : "bg-white text-dark";

  return (
    <div className="container py-4 min-vh-100">
      {alerta && (
        <Alert variant={alerta.tipo} className="text-center">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className={modoOscuro ? "text-light" : "text-dark"}>
          Transacciones
        </h4>

        <Button
          variant="primary"
          onClick={() => resetFormulario() || setFormVisible(true)}
        >
          <Icon icon="lucide:plus" className="me-1" /> Nueva Transacción
        </Button>
      </div>

      {formVisible && (
        <div className={`border rounded p-4 mb-4 ${tarjetaBase}`}>
          <h5 className="mb-3">
            {modoEdicion ? "Editar" : "Agregar"} Transacción
          </h5>
          <div className="row g-3">
            <div className="col-md-6 d-flex gap-2">
              <Button
                variant={
                  newTransaction.type === "ingreso"
                    ? "success"
                    : "outline-secondary"
                }
                onClick={() =>
                  setNewTransaction({ ...newTransaction, type: "ingreso" })
                }
              >
                Ingreso
              </Button>
              <Button
                variant={
                  newTransaction.type === "gasto"
                    ? "danger"
                    : "outline-secondary"
                }
                onClick={() =>
                  setNewTransaction({ ...newTransaction, type: "gasto" })
                }
              >
                Gasto
              </Button>
            </div>
            <div className="col-md-6">
              <FormSelect
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
              >
                <option value="">Seleccione categoría</option>
                {newTransaction.type === "ingreso"
                  ? fuentesIngreso.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))
                  : categorias.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
              </FormSelect>
            </div>
            <div className="col-md-4">
              <Form.Control
                placeholder="Descripción"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-4">
              <InputGroup>
                <InputGroup.Text>Q</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Monto"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </div>
            <div className="col-md-4">
              <Form.Control
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
              />
            </div>
            <div className="col-12 text-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={resetFormulario}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleAddTransaction}>
                {modoEdicion ? "Actualizar" : "Guardar"}
              </Button>
              {modoEdicion && (
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={() =>
                    eliminarTransaccion(
                      transaccionSeleccionada.type,
                      transaccionSeleccionada.id
                    )
                  }
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <Button
          className="me-2"
          variant={filter === "todos" ? "primary" : "outline-secondary"}
          onClick={() => setFilter("todos")}
        >
          Todos
        </Button>
        <Button
          className="me-2"
          variant={filter === "ingreso" ? "success" : "outline-secondary"}
          onClick={() => setFilter("ingreso")}
        >
          Ingresos
        </Button>
        <Button
          variant={filter === "gasto" ? "danger" : "outline-secondary"}
          onClick={() => setFilter("gasto")}
        >
          Gastos
        </Button>
      </div>

      <div
        style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}
      >
        <div className="row g-3">
          {filtered.map((t) => (
            <div key={`${t.type}-${t.id}`} className="col-md-6 col-lg-4">
              <div
                className={`border rounded p-3 h-100 shadow-sm ${tarjetaBase}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleEditarTransaccion(t)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold">{t.description}</div>
                  <div
                    className={`fw-bold ${
                      t.type === "ingreso" ? "text-success" : "text-danger"
                    }`}
                  >
                    {t.type === "ingreso" ? "+" : "-"}
                    {formatCurrency(t.amount || t.monto)}
                  </div>
                </div>
                <div className="text-muted small">
                  {t.category || t.categoria} • {formatDate(t.fecha)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransaccionesUsuario;
