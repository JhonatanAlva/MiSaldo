import React from "react";

const TransaccionesRecientes = ({ movimientos }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-GT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const iconoPorCategoria = (nombre) => {
    if (!nombre) return "💸";
    const lower = nombre.toLowerCase();
    if (lower.includes("super")) return "🛒";
    if (lower.includes("salario")) return "💼";
    if (lower.includes("restaurante")) return "🍽️";
    if (lower.includes("luz") || lower.includes("electric")) return "💡";
    return "💸";
  };

  return (
    <div className="bg-white rounded shadow p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Transacciones Recientes</h5>
        <a href="#" className="text-primary">Ver todas</a>
      </div>
      {movimientos.length > 0 ? (
        <ul className="list-group list-group-flush">
          {movimientos.map((m, i) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: "1.4rem" }}>{iconoPorCategoria(m.descripcion || m.fuente)}</span>
                <div>
                  <div>{m.descripcion || m.fuente}</div>
                  <small className="text-muted">{formatearFecha(m.fecha)}</small>
                </div>
              </div>
              <div className={`fw-bold ${m.tipo === "ingreso" ? "text-success" : "text-danger"}`}>
                {m.tipo === "ingreso" ? "+" : "-"}Q {parseFloat(m.monto).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No hay transacciones recientes.</p>
      )}
    </div>
  );
};

export default TransaccionesRecientes;