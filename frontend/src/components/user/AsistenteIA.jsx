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
    } catch {
      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto: "❌ Hubo un error al conectarse con el asistente IA.",
        },
      ]);
    }
  };

  const manejarAnalisis = async (tipo) => {
    setRespuestas((prev) => [
      ...prev,
      { rol: "asistente", texto: `Analizando tus ${tipo}... 🔍` },
    ]);

    let url = "";
    if (tipo === "gastos") url = "http://localhost:5000/finanzas/gastos";
    else if (tipo === "ingresos")
      url = "http://localhost:5000/finanzas/ingresos";
    else if (tipo === "balance")
      url = "http://localhost:5000/finanzas/resumen?tipo=mensual";

    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      // Enviar los datos al asistente IA para que los interprete
      const aiRes = await fetch("http://localhost:5000/asistente/analisis", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, datos: data, nombre: nombreUsuario }),
      });

      const resultado = await aiRes.json();

      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto: resultado.resumen || "Análisis completado ✅",
        },
      ]);
    } catch (error) {
      console.error("❌ Error al analizar:", error);
      setRespuestas((prev) => [
        ...prev,
        {
          rol: "asistente",
          texto: "❌ No se pudieron analizar tus datos. Intenta más tarde.",
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
            style={{
              height: "min(50vh, 700px)", // máximo 700px, pero se adapta en pantallas pequeñas
              overflowY: "auto",
            }}
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
          <div className="d-flex gap-2 mb-3">
            <button
              className="btn btn-outline-info"
              onClick={() => manejarAnalisis("gastos")}
            >
              🧾 Analizar mis gastos
            </button>

            <button
              className="btn btn-outline-success"
              onClick={() => manejarAnalisis("ingresos")}
            >
              💰 Analizar mis ingresos
            </button>

            <button
              className="btn btn-outline-warning"
              onClick={() => manejarAnalisis("balance")}
            >
              📊 Analizar mi balance
            </button>
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
