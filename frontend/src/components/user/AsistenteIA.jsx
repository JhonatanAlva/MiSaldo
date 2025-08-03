import React, { useState, useEffect } from "react";

const AsistenteIA = () => {
  const [mensaje, setMensaje] = useState("");
  const [respuestas, setRespuestas] = useState([
    { rol: "asistente", texto: "Hola 👋 ¿En qué puedo ayudarte con tus finanzas hoy?" },
  ]);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const tema = document.body.getAttribute("data-theme");
    setModoOscuro(tema === "dark");

    const observer = new MutationObserver(() => {
      const nuevoTema = document.body.getAttribute("data-theme");
      setModoOscuro(nuevoTema === "dark");
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevaPregunta = { rol: "usuario", texto: mensaje };
    setRespuestas((prev) => [...prev, nuevaPregunta]);
    setMensaje("");

    setTimeout(() => {
      const respuesta = generarRespuestaSimulada(mensaje);
      setRespuestas((prev) => [...prev, { rol: "asistente", texto: respuesta }]);
    }, 800);
  };

  const generarRespuestaSimulada = (texto) => {
    if (texto.toLowerCase().includes("ahorro")) {
      return "Te recomiendo apartar al menos el 10% de tus ingresos mensuales para ahorrar.";
    }
    if (texto.toLowerCase().includes("gasto")) {
      return "Evita gastar más del 50% de tus ingresos en gastos fijos mensuales.";
    }
    return "Estoy aprendiendo aún. ¿Podrías darme más detalles?";
  };

  const claseTarjeta = `card ${modoOscuro ? "bg-dark text-light" : ""}`;
  const claseFondoMensaje = (rol) =>
    rol === "usuario"
      ? "bg-success text-white"
      : modoOscuro
      ? "bg-secondary text-white"
      : "bg-light text-dark";

  return (
    <div className="panel-usuario-container">
      <div className={claseTarjeta}>
        <div className="card-body">
          <h4 className="mb-3">Asistente Inteligente</h4>

          <div className="border rounded p-3 mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {respuestas.map((r, i) => (
              <div key={i} className={`mb-2 text-${r.rol === "usuario" ? "end" : "start"}`}>
                <span className={`d-inline-block px-3 py-2 rounded ${claseFondoMensaje(r.rol)}`}>
                  {r.texto}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={manejarEnvio} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <button type="submit" className="btn btn-success">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsistenteIA;
