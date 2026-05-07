import React, { useState, useEffect } from "react";

import useNotificaciones from "../../hooks/useNotificaciones";

const Notificaciones = () => {
  const { notificaciones, cantidadNoLeidas, marcarLeida } = useNotificaciones();

  const [abierto, setAbierto] = useState(false);

  // ─────────────────────────────────────
  // Tema
  // ─────────────────────────────────────
  const temaOscuro = document.body.getAttribute("data-theme") === "dark";

  // ─────────────────────────────────────
  // SOLO NO LEÍDAS
  // ─────────────────────────────────────
  const notificacionesVisibles = notificaciones.filter((n) => !n.leida);

  // ─────────────────────────────────────
  // Pedir permisos push
  // ─────────────────────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="position-relative">
      {/* Botón */}
      <button
        className={`
                    btn
                    position-relative
                    rounded-circle
                    shadow-sm
                    border-0
                    ${temaOscuro ? "btn-dark" : "btn-light"}
                `}
        onClick={() => setAbierto(!abierto)}
        style={{
          width: "52px",
          height: "52px",
        }}
      >
        🔔
        {cantidadNoLeidas > 0 && (
          <span
            className="
                            position-absolute
                            top-0
                            start-100
                            translate-middle
                            badge
                            rounded-pill
                            bg-danger
                        "
          >
            {cantidadNoLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div
          className={`
            position-absolute
            end-0
            mt-3
            rounded-4
            shadow-lg
            border
            overflow-hidden
            ${
              temaOscuro
                ? "bg-dark text-light border-secondary"
                : "bg-white text-dark"
            }
        `}
          style={{
            width: window.innerWidth < 576 ? "95vw" : "360px",

            maxWidth: "360px",

            maxHeight: "500px",

            overflowY: "auto",

            zIndex: 9999,

            right: window.innerWidth < 576 ? "-10px" : "0",
          }}
        >
          {/* Header */}
          <div
            className={`
                            d-flex
                            justify-content-between
                            align-items-center
                            px-4
                            py-3
                            border-bottom
                            ${temaOscuro ? "border-secondary" : ""}
                        `}
          >
            <h5 className="m-0 fw-bold">🔔 Notificaciones</h5>

            <span className="badge bg-primary rounded-pill">
              {cantidadNoLeidas}
            </span>
          </div>

          {/* Lista */}
          <div className="p-3">
            {notificacionesVisibles.length === 0 ? (
              <div
                className={`
                                    text-center
                                    py-5
                                    ${
                                      temaOscuro
                                        ? "text-light opacity-75"
                                        : "text-muted"
                                    }
                                `}
              >
                No tienes notificaciones nuevas
              </div>
            ) : (
              notificacionesVisibles.map((n) => (
                <div
                  key={n.id}
                  className={`
                                        rounded-4
                                        p-3
                                        mb-3
                                        border
                                        shadow-sm
                                        ${
                                          temaOscuro
                                            ? "bg-black text-light border-secondary"
                                            : "bg-light border-secondary"
                                        }
                                    `}
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onClick={() => marcarLeida(n.id)}
                >
                  {/* Mensaje */}
                  <div className="fw-semibold mb-2">{n.mensaje}</div>

                  {/* Fecha */}
                  <small
                    className={
                      temaOscuro ? "text-light opacity-75" : "text-muted"
                    }
                  >
                    {new Date(n.creado_en).toLocaleString()}
                  </small>

                  {/* Badge */}
                  <div className="mt-3">
                    <span className="badge bg-success rounded-pill px-3 py-2">
                      Nueva
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
