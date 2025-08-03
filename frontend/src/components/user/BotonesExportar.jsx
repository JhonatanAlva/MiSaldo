import React from "react";
import html2pdf from "html2pdf.js";
import { Icon } from "@iconify/react";
import { Button } from "react-bootstrap";

const BotonesExportar = ({ targetId = "exportarArea", isDarkMode }) => {

  const exportToPDF = () => {
    const input = document.getElementById(targetId);
    if (!input) return alert("No se encontró el contenido para exportar.");

    // Aplicar clase temporal
    input.classList.add("pdf-export");

    const options = {
      margin: 0,
      filename: 'analisis_financiero.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] } // <-- Respeta los page-break CSS
    };

    html2pdf().set(options).from(input).save().finally(() => {
      input.classList.remove("pdf-export");
    });
  };

  return (
    <div className="d-flex gap-2 mt-3">
      <Button variant={isDarkMode ? "outline-light" : "dark"} size="sm" onClick={exportToPDF}>
        <Icon icon="lucide:file-text" className="me-1" /> PDF
      </Button>
    </div>
  );
};

export default BotonesExportar;