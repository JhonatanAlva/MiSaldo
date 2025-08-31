import React from "react";
import { Modal, Button } from "react-bootstrap";

const BudgetAlertModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const colores = {
    EXCEDIDO: "danger",
    CERCA: "warning",
    OK: "success",
    SIN_PRESUPUESTO: "secondary",
  };

  const mensajes = {
    EXCEDIDO: "🔴 Tus gastos superan tus ingresos. Revisa tus finanzas.",
    CERCA: "⚠️ Tu saldo es bajo. Considera limitar tus gastos.",
    OK: "✅ Vas bien este mes. ¡Sigue así!",
    SIN_DATOS: "ℹ️ Aún no hay registros de ingresos o gastos.",
  };

  const formatMoneda = (valor) =>
    typeof valor === "number" ? `Q${valor.toFixed(2)}` : "Q0.00";

  const getSaldoColor = (saldo) => {
    if (saldo < 0) return "text-danger";
    if (saldo <= 200) return "text-warning";
    return "text-success";
  };

  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header
        closeButton
        className={`bg-${colores[data.estado]} text-white`}
      >
        <Modal.Title>📊 Estado del Presupuesto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Gastado este mes:</strong> {formatMoneda(data.gastado)}
        </p>
        <p>
          <strong>Saldo actual:</strong> {formatMoneda(data.saldo)}
        </p>

        {data.presupuesto > 0 ? (
          <p>
            <strong>Saldo restante:</strong> {formatMoneda(data.saldo)}
          </p>
        ) : null}

        <hr />
        <p className="mt-2">{mensajes[data.estado]}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BudgetAlertModal;
