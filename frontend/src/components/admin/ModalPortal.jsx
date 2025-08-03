import ReactDOM from "react-dom";

const ModalPortal = ({ children }) => {
  const el = document.getElementById("modal-root");
  if (!el) {
    console.error("❌ modal-root no encontrado en el DOM");
    return null;
  }

  return ReactDOM.createPortal(children, el);
};

export default ModalPortal;