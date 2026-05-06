import { useState, useEffect, useRef } from "react";
import { FiSend, FiBarChart2, FiMessageSquare, FiCpu, FiRefreshCw } from "react-icons/fi";
import { getActividadDatos, getEstadisticasOperaciones, getEvolucionMensual, analizarConIA } from "../../services/adminService";
import api from "../../services/api";

const parseMarkdown = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^- /gm, "• ")
    .replace(/\n/g, "<br/>");

const SUGERENCIAS = [
  "¿Cuáles son las categorías más comunes?",
  "Recomendaciones para mejorar el ahorro",
  "¿Qué patrones ves en los usuarios?",
  "Resume el estado del sistema",
];

const Mensaje = ({ msg }) => {
  const esIA = msg.rol === "assistant";
  return (
    <div className={`flex gap-2.5 ${esIA ? "" : "flex-row-reverse"}`}>
      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5
        ${esIA ? "bg-[#00c896]/20 text-[#00c896]" : "bg-violet-500/20 text-violet-400"}`}>
        {esIA ? <FiCpu size={11} /> : <span className="text-[9px] font-bold">A</span>}
      </div>
      <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[12px] sm:text-[13px] leading-relaxed
        ${esIA
          ? "bg-[#0f1117] border border-white/[0.07] text-gray-300 rounded-tl-sm"
          : "bg-violet-500/15 border border-violet-500/20 text-gray-200 rounded-tr-sm"
        }`}>
        {msg.cargando ? (
          <div className="flex gap-1 items-center h-4">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.contenido) }} />
        )}
      </div>
    </div>
  );
};

export default function VistaIA() {
  const [modo,          setModo]          = useState("chat");
  const [mensajes,      setMensajes]      = useState([
    { rol: "assistant", contenido: "Hola, soy el asistente IA de SaldoGt. Puedo ayudarte a analizar estadísticas del sistema o responder preguntas sobre las finanzas de los usuarios. ¿En qué te ayudo?" }
  ]);
  const [input,         setInput]         = useState("");
  const [enviando,      setEnviando]      = useState(false);
  const [statsData,     setStatsData]     = useState(null);
  const [cargandoStats, setCargandoStats] = useState(false);
  const [analisisTexto, setAnalisisTexto] = useState("");
  const [analizando,    setAnalizando]    = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const cargarStats = async () => {
    setCargandoStats(true);
    try {
      const [rD, rO, rE] = await Promise.all([
        getActividadDatos(), getEstadisticasOperaciones(), getEvolucionMensual(),
      ]);
      setStatsData({ usuariosPorDatos: rD.data, datosOperaciones: rO.data, datosEvolucion: rE.data });
    } catch(e) { console.error(e); }
    finally { setCargandoStats(false); }
  };

  useEffect(() => {
    if (modo === "analisis" && !statsData) cargarStats();
  }, [modo]);

  const enviarMensaje = async (texto) => {
    const msg = texto || input.trim();
    if (!msg || enviando) return;
    setInput("");
    setMensajes(prev => [...prev, { rol: "user", contenido: msg }, { rol: "assistant", contenido: "", cargando: true }]);
    setEnviando(true);
    try {
      const res = await api.post("/asistente", { mensaje: msg });
      setMensajes(prev => { const c = [...prev]; c[c.length-1] = { rol: "assistant", contenido: res.data.respuesta || res.data.resumen || "Sin respuesta" }; return c; });
    } catch {
      setMensajes(prev => { const c = [...prev]; c[c.length-1] = { rol: "assistant", contenido: "Error al conectar." }; return c; });
    } finally { setEnviando(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } };
  const limpiarChat  = () => setMensajes([{ rol: "assistant", contenido: "Chat reiniciado. ¿En qué te puedo ayudar?" }]);

  const generarAnalisis = async () => {
    if (!statsData || analizando) return;
    setAnalizando(true); setAnalisisTexto("");
    try { const res = await analizarConIA(statsData); setAnalisisTexto(res.data.respuesta || res.data.resumen || "Sin respuesta"); }
    catch { setAnalisisTexto("Error al generar el análisis."); }
    finally { setAnalizando(false); }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 4rem)" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Asistente IA</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Análisis inteligente del sistema</p>
        </div>
        {/* Tabs */}
        <div className="flex bg-[#0f1117] border border-white/[0.07] rounded-xl p-1 gap-1 self-start sm:self-auto">
          {[
            { id: "chat",     label: "Chat",     Icon: FiMessageSquare },
            { id: "analisis", label: "Análisis", Icon: FiBarChart2 },
          ].map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setModo(id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all
                ${modo === id ? "bg-[#00c896]/10 text-[#00c896]" : "text-gray-500 hover:text-gray-300"}`}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT ───────────────────────────────────────────────── */}
      {modo === "chat" && (
        <div className="flex flex-col flex-1 bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden min-h-0">
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {mensajes.map((msg, i) => <Mensaje key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Sugerencias — scroll horizontal en móvil */}
          {mensajes.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {SUGERENCIAS.map(s => (
                <button key={s} onClick={() => enviarMensaje(s)}
                  className="text-[10px] sm:text-[11px] px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-500
                             hover:text-gray-300 hover:bg-white/[0.07] transition-all whitespace-nowrap shrink-0">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-white/[0.05] flex gap-2 items-end">
            <button onClick={limpiarChat} title="Limpiar"
              className="p-2 rounded-xl bg-white/[0.04] text-gray-600 hover:text-gray-300 hover:bg-white/[0.07] transition-all shrink-0">
              <FiRefreshCw size={13} />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={enviando}
              className="flex-1 resize-none bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] sm:text-[13px]
                         text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00c896]/40 transition-all disabled:opacity-50"
              style={{ maxHeight: "100px" }}
            />
            <button onClick={() => enviarMensaje()} disabled={!input.trim() || enviando}
              className="p-2 sm:p-2.5 rounded-xl bg-[#00c896] text-black hover:bg-[#00b388] active:scale-95 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── ANÁLISIS ───────────────────────────────────────────── */}
      {modo === "analisis" && (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Mini stats */}
          {statsData && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Usuarios con datos",   value: statsData.usuariosPorDatos.length },
                { label: "Tipos de operaciones", value: statsData.datosOperaciones.length },
                { label: "Meses con actividad",  value: [...new Set(statsData.datosEvolucion.map(d => d.mes))].length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-600 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Análisis card */}
          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-1">Análisis automático</p>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">La IA analiza los datos actuales y genera observaciones y recomendaciones.</p>
            <button onClick={generarAnalisis} disabled={analizando || cargandoStats || !statsData}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#00c896] text-black text-xs sm:text-sm font-bold
                         hover:bg-[#00b388] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <FiCpu size={13} />
              {analizando ? "Analizando..." : cargandoStats ? "Cargando..." : "Analizar con IA"}
            </button>
            {analisisTexto && (
              <div className="mt-4 p-3 sm:p-4 rounded-xl bg-black/30 border border-white/[0.05] text-[11px] sm:text-[13px] text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(analisisTexto) }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}