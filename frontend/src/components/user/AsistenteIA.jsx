import React, { useState, useEffect } from "react";

const AsistenteIA = ({ nombreUsuario = "Usuario" }) => {
  const [mensaje, setMensaje] = useState("");
  const [respuestas, setRespuestas] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
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

    // Mensaje inicial personalizado
    setRespuestas([
      {
        rol: "asistente",
        texto: `Hola ${nombreUsuario} 👋 ¿En qué puedo ayudarte con tus finanzas hoy?`,
      },
    ]);

    return () => observer.disconnect();
  }, [nombreUsuario]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevaPregunta = { rol: "usuario", texto: mensaje };
    setRespuestas((prev) => [...prev, nuevaPregunta]);
    setMensaje("");

    try {
      const res = await fetch("http://localhost:5000/asistente", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensaje, nombre: nombreUsuario }),
      });

      const data = await res.json();
      setRespuestas((prev) => [
        ...prev,
        { rol: "asistente", texto: data.respuesta },
      ]);
    } catch (error) {
      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto: "❌ Hubo un error al conectarse con el asistente IA.",
        },
      ]);
    }
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

          <div
            className="border rounded p-3 mb-3"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {respuestas.map((r, i) => (
              <div
                key={i}
                className={`mb-2 text-${r.rol === "usuario" ? "end" : "start"}`}
              >
                <span
                  className={`d-inline-block px-3 py-2 rounded ${claseFondoMensaje(
                    r.rol
                  )}`}
                >
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
            <button type="submit" className="btn btn-success">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsistenteIA;