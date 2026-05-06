import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const AsistenteIA = ({ nombreUsuario = "Usuario" }) => {
  const [mensaje, setMensaje]     = useState("");
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setModoOscuro(document.body.getAttribute("data-theme") === "dark");
    const observer = new MutationObserver(() =>
      setModoOscuro(document.body.getAttribute("data-theme") === "dark")
    );
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

    setRespuestas([{
      rol: "asistente",
      texto: `Hola ${nombreUsuario} 👋 ¿En qué puedo ayudarte con tus finanzas hoy?`,
    }]);

    return () => observer.disconnect();
  }, [nombreUsuario]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [respuestas]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || cargando) return;

    const pregunta = mensaje.trim();
    setRespuestas(prev => [...prev, { rol: "usuario", texto: pregunta }]);
    setMensaje("");
    setCargando(true);

    try {
      //  Axios: solo pasar el body directamente
      const res = await api.post("/asistente", {
        mensaje: pregunta,
        nombre: nombreUsuario,
      });
      setRespuestas(prev => [...prev, { rol: "asistente", texto: res.data.respuesta }]);
    } catch {
      setRespuestas(prev => [...prev, {
        rol: "asistente",
        texto: "❌ Hubo un error al conectarse con el asistente IA.",
      }]);
    } finally {
      setCargando(false);
    }
  };

  const manejarAnalisis = async (tipo) => {
    setRespuestas(prev => [...prev, {
      rol: "asistente",
      texto: `Analizando tus ${tipo}... 🔍`,
    }]);
    setCargando(true);

    const urls = {
      gastos:   "/finanzas/gastos",
      ingresos: "/finanzas/ingresos",
      balance:  "/finanzas/resumen?tipo=mensual",
    };

    try {
      // Axios: res.data, sin .json()
      const res    = await api.get(urls[tipo]);
      const aiRes  = await api.post("/asistente/analisis", {
        tipo,
        datos: res.data,
        nombre: nombreUsuario,
      });
      setRespuestas(prev => [...prev, {
        rol: "asistente",
        texto: aiRes.data.resumen || "Análisis completado ✅",
      }]);
    } catch (err) {
      console.error("Error al analizar:", err);
      setRespuestas(prev => [...prev, {
        rol: "asistente",
        texto: "❌ No se pudieron analizar tus datos. Intenta más tarde.",
      }]);
    } finally {
      setCargando(false);
    }
  };

  /* ── Clases ──────────────────────────────────────────── */
  const card = `rounded-xl p-5 transition-colors duration-300
    ${modoOscuro
      ? "bg-[#1a1a1a] text-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
      : "bg-white text-[#2e2828] shadow-[0_2px_8px_rgba(0,0,0,0.07)]"}`;

  const chatBg = modoOscuro ? "bg-[#111]" : "bg-gray-50";

  const burbuja = (rol) =>
    rol === "usuario"
      ? "bg-[#00c57a] text-white self-end rounded-2xl rounded-br-sm"
      : modoOscuro
        ? "bg-[#2a2a2a] text-gray-100 self-start rounded-2xl rounded-bl-sm"
        : "bg-gray-200 text-[#2e2828] self-start rounded-2xl rounded-bl-sm";

  const btnAnalisis = (color) => `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
    ${modoOscuro
      ? `border border-${color}-400/40 text-${color}-400 hover:bg-${color}-400/15`
      : `border border-${color}-500/40 text-${color}-600 hover:bg-${color}-50`}`;

  const inputCls = `flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors
    ${modoOscuro
      ? "bg-[#262626] text-gray-100 border border-white/15 focus:border-[#00c57a] placeholder-gray-500"
      : "bg-gray-100 text-[#2e2828] border border-gray-200 focus:border-[#00c57a] placeholder-gray-400"}`;

  return (
    <div className="w-full">
      <div className={card}>
        <h4 className="font-bold text-lg mb-4">Asistente Inteligente</h4>

        {/* ── Chat ─────────────────────────────────────── */}
        <div className={`${chatBg} rounded-xl p-4 mb-4 flex flex-col gap-3 overflow-y-auto`}
          style={{ height: "min(50vh, 500px)" }}>
          {respuestas.map((r, i) => (
            <div key={i} className={`flex ${r.rol === "usuario" ? "justify-end" : "justify-start"}`}>
              <span className={`px-4 py-2.5 text-sm max-w-[80%] leading-relaxed ${burbuja(r.rol)}`}>
                {r.texto}
              </span>
            </div>
          ))}
          {cargando && (
            <div className="flex justify-start">
              <span className={`px-4 py-2.5 text-sm rounded-2xl rounded-bl-sm ${modoOscuro ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                Escribiendo...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Botones de análisis ───────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => manejarAnalisis("gastos")}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-cyan-400/40 text-cyan-500
                       hover:bg-cyan-400/10 transition-all duration-200">
            🧾 Analizar mis gastos
          </button>
          <button onClick={() => manejarAnalisis("ingresos")}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-[#00c57a]/40 text-[#00c57a]
                       hover:bg-[#00c57a]/10 transition-all duration-200">
            💰 Analizar mis ingresos
          </button>
          <button onClick={() => manejarAnalisis("balance")}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-yellow-400/40 text-yellow-500
                       hover:bg-yellow-400/10 transition-all duration-200">
            📊 Analizar mi balance
          </button>
        </div>

        {/* ── Input ────────────────────────────────── */}
        <form onSubmit={manejarEnvio} className="flex gap-2">
          <input
            type="text"
            className={inputCls}
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={cargando}
          />
          <button
            type="submit"
            disabled={cargando || !mensaje.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#00c57a] text-white text-sm font-semibold
                       hover:bg-[#00a865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AsistenteIA;