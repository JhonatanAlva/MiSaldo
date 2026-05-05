import { useEffect, useState } from "react";
import { FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getUsuarios, getBitacoraUsuario } from "../../services/adminService";

const POR_PAGINA = 10;

const fmt = (fecha) =>
  new Date(fecha).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });

export default function VistaBitacora() {
  const [usuarios,  setUsuarios]  = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [logs,      setLogs]      = useState([]);
  const [busqueda,  setBusqueda]  = useState("");
  const [cargando,  setCargando]  = useState(false);
  const [pagina,    setPagina]    = useState(1);

  useEffect(() => {
    getUsuarios().then(r => setUsuarios(r.data)).catch(console.error);
  }, []);

  const cargarBitacora = async (id) => {
    if (!id) { setLogs([]); return; }
    setCargando(true);
    setPagina(1);
    setBusqueda("");
    try {
      const res = await getBitacoraUsuario(id);
      setLogs(res.data);
    } catch(e) { console.error(e); setLogs([]); }
    finally { setCargando(false); }
  };

  const handleUsuario = (id) => { setUsuarioId(id); cargarBitacora(id); };

  const filtrados  = logs.filter(l =>
    (l.accion || "").toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPags  = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaReal = Math.min(pagina, totalPags);
  const pagActual  = filtrados.slice((paginaReal - 1) * POR_PAGINA, paginaReal * POR_PAGINA);

  const usuarioNombre = usuarios.find(u => String(u.id) === String(usuarioId));

  return (
    <div>
      {/* Título */}
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Bitácora de actividad</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Registro de acciones por usuario</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
        {/* Select usuario */}
        <select
          value={usuarioId}
          onChange={e => handleUsuario(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-gray-300 text-sm focus:outline-none transition-all"
          style={{ backgroundColor: "#0f1117", border: "1px solid rgba(255,255,255,0.07)", colorScheme: "dark" }}
        >
          <option value="" style={{ backgroundColor: "#0a0c10" }}>Selecciona un usuario</option>
          {usuarios.filter(u => u.rol_id !== 1).map(u => (
            <option key={u.id} value={u.id} style={{ backgroundColor: "#0a0c10" }}>
              {u.nombres} {u.apellidos}
            </option>
          ))}
        </select>

        {/* Búsqueda */}
        <div className="flex-1 relative">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            placeholder="Buscar acción..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f1117] border border-white/[0.07] text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-[#00c896]/40"
          />
        </div>

        {/* Actualizar */}
        <button
          onClick={() => cargarBitacora(usuarioId)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f1117] border border-white/[0.07] text-gray-400 hover:text-white text-sm transition-all"
        >
          <FiRefreshCw size={13} /> <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Resumen */}
      {usuarioId && !cargando && logs.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[12px] text-gray-600">
            <span className="text-white font-semibold">{filtrados.length}</span> registros
            {usuarioNombre && <> · <span className="text-[#00c896]">{usuarioNombre.nombres} {usuarioNombre.apellidos}</span></>}
          </span>
        </div>
      )}

      {/* Contenido */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {cargando ? (
          <div className="py-16 text-center">
            <div className="inline-flex gap-1">
              {[0,150,300].map(d => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        ) : !usuarioId ? (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-sm">Selecciona un usuario para ver su bitácora</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-sm">Sin registros {busqueda ? "para esa búsqueda" : "encontrados"}</p>
          </div>
        ) : (
          <>
            {/* Tabla — solo desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-widest text-gray-600 font-semibold w-12">#</th>
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-widest text-gray-600 font-semibold">Acción</th>
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-widest text-gray-600 font-semibold whitespace-nowrap w-36">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pagActual.map((log, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-gray-600 text-[11px]">{(paginaReal - 1) * POR_PAGINA + i + 1}</td>
                      <td className="px-5 py-3 text-gray-300">{log.accion || "—"}</td>
                      <td className="px-5 py-3 text-gray-500 text-[12px] whitespace-nowrap">{fmt(log.fecha)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — solo móvil */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {pagActual.map((log, i) => (
                <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-[10px] text-gray-600 mt-0.5 shrink-0 w-5 text-right">
                        {(paginaReal - 1) * POR_PAGINA + i + 1}
                      </span>
                      <p className="text-gray-300 text-[12px] leading-relaxed">{log.accion || "—"}</p>
                    </div>
                    <span className="text-gray-600 text-[10px] whitespace-nowrap shrink-0 mt-0.5">{fmt(log.fecha)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-white/[0.05]">
              <span className="text-[11px] sm:text-[12px] text-gray-600">
                Pág. <span className="text-white">{paginaReal}</span> / {totalPags}
                <span className="hidden sm:inline"> · {filtrados.length} registros</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={paginaReal === 1}
                  onClick={() => setPagina(p => p - 1)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-white/[0.04] disabled:opacity-30 hover:bg-white/[0.08] transition-all"
                >
                  <FiChevronLeft size={13} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página — solo desktop */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPags }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPags || Math.abs(n - paginaReal) <= 1)
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "..." ? (
                        <span key={`e${i}`} className="px-2 py-1 text-xs text-gray-600">…</span>
                      ) : (
                        <button key={n} onClick={() => setPagina(n)}
                          className={`w-7 h-7 rounded-lg text-xs transition-all ${n === paginaReal ? "bg-[#00c896]/20 text-[#00c896]" : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"}`}>
                          {n}
                        </button>
                      )
                    )
                  }
                </div>

                <button
                  disabled={paginaReal === totalPags}
                  onClick={() => setPagina(p => p + 1)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-white/[0.04] disabled:opacity-30 hover:bg-white/[0.08] transition-all"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <FiChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}