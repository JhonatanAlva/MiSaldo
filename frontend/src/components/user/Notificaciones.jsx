import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import useNotificaciones from "../../hooks/useNotificaciones";
import EstadoVacio from "../ui/EstadoVacio";

const formatFecha = (isoString) => {
  const fecha = new Date(isoString);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  const hora = fecha.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  if (fecha.toDateString() === hoy.toDateString()) return `Hoy ${hora}`;
  if (fecha.toDateString() === ayer.toDateString()) return `Ayer ${hora}`;
  return fecha.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit", year: "numeric" }) + ` ${hora}`;
};

const Notificaciones = () => {
  const { notificaciones, cantidadNoLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones();
  const [abierto, setAbierto] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    document.body.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const actualizarTema = () =>
      setIsDarkMode(document.body.getAttribute("data-theme") === "dark");
    actualizarTema();
    const observer = new MutationObserver(actualizarTema);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida);

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  return (
    <div>
      {/* Botón campana */}
      <button
        className={`btn position-relative rounded-circle shadow-sm border-0 ${isDarkMode ? "btn-dark" : "btn-light"}`}
        onClick={() => setAbierto(!abierto)}
        style={{ width: 52, height: 52 }}
      >
        🔔
        {cantidadNoLeidas > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cantidadNoLeidas > 99 ? "99+" : cantidadNoLeidas}
          </span>
        )}
      </button>

      {/* Overlay para cerrar */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99998, background: "transparent" }}
        />
      )}

      {/* Dropdown */}
      {abierto && (
        <div
          className={`rounded-4 shadow-lg border overflow-hidden position-fixed ${
            isDarkMode ? "bg-dark text-light border-secondary" : "bg-white text-dark"
          }`}
          style={{
            top: 78,
            right: 20,
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "70vh",
            overflowY: "auto",
            zIndex: 99999,
          }}
        >
          {/* Header */}
          <div
            className={`d-flex justify-content-between align-items-center px-4 py-3 border-bottom ${
              isDarkMode ? "border-secondary" : ""
            }`}
          >
            <h5 className="m-0 fw-bold">🔔 Notificaciones</h5>
            <div className="d-flex align-items-center gap-2">
              {cantidadNoLeidas > 0 && (
                <button
                  className="btn btn-sm btn-link text-decoration-none p-0"
                  style={{ color: "#10b981", fontSize: "0.8rem" }}
                  onClick={handleMarcarTodas}
                >
                  Marcar todas leídas
                </button>
              )}
              <span className="badge bg-primary rounded-pill">{cantidadNoLeidas}</span>
            </div>
          </div>

          {/* Lista */}
          <div className="p-3">
            {noLeidas.length === 0 ? (
              <EstadoVacio
                icono="🔔"
                titulo="Sin notificaciones"
                descripcion="Todo al día por aquí."
              />
            ) : (
              noLeidas.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-4 p-3 mb-2 border shadow-sm ${
                    isDarkMode
                      ? "bg-black text-light border-secondary"
                      : "bg-light border-0"
                  }`}
                  style={{ cursor: "pointer", transition: "0.2s" }}
                  onClick={() => marcarLeida(n.id)}
                  title="Clic para marcar como leída"
                >
                  <div className="fw-semibold mb-1" style={{ fontSize: "0.92rem" }}>
                    {n.mensaje}
                  </div>
                  <small className={isDarkMode ? "text-light opacity-50" : "text-muted"}>
                    {formatFecha(n.creado_en)}
                  </small>
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
