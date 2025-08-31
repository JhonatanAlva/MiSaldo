import React from "react";
import { Modal, Button } from "react-bootstrap";

const FinancialTipModal = ({ open, onClose, tip }) => {
  if (!tip) return null;

  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>💡 Consejo Financiero</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{tip}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinancialTipModal;