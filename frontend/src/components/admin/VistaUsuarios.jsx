import { useState, useContext, useMemo, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiEdit2, FiLock, FiCheck, FiX, FiMail, FiUserCheck, FiUserX } from "react-icons/fi";

const Badge = ({ ok, si, no }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide
    ${ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
    {ok ? si : no}
  </span>
);

const inputCls =
  "w-full px-3 py-1.5 rounded-lg bg-[#0a0c10] border border-white/10 text-white text-[12px] focus:outline-none focus:border-[#00c896]/60 transition-all";

const IconBtn = ({ onClick, title, color, Icon, size = 13 }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color}`}
  >
    <Icon size={size} />
  </button>
);

export default function VistaUsuarios({
  usuariosFiltrados,
  busqueda,
  setBusqueda,
  reenviarConfirmacion,
  cambiarEstado,
  guardarCambios,
  guardarContrasena,
}) {
  const { usuario: usuarioActual } = useContext(AuthContext);
  const [editando,       setEditando]       = useState(null);
  const [cambioPass,     setCambioPass]     = useState(null);
  const [nuevaPass,      setNuevaPass]      = useState("");
  const [paginaActual,   setPaginaActual]   = useState(1);
  const POR_PAGINA = 10;

  useEffect(() => { setPaginaActual(1); }, [busqueda]);

  const paginados = useMemo(() => {
    const ini = (paginaActual - 1) * POR_PAGINA;
    return usuariosFiltrados.slice(ini, ini + POR_PAGINA);
  }, [usuariosFiltrados, paginaActual]);

  const totalPags = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));

  const guardar = () => { guardarCambios(editando); setEditando(null); };
  const guardarPass = () => { guardarContrasena(cambioPass.id, nuevaPass); setCambioPass(null); setNuevaPass(""); };
  const puedeToggle = (u) => u.rol_id !== 1 && u.id !== usuarioActual?.id;

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Usuarios</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Sesión como{" "}
          <span className="text-[#00c896] font-medium">
            {usuarioActual?.nombres} {usuarioActual?.apellidos}
          </span>
        </p>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full mb-5 px-4 py-2.5 rounded-xl bg-[#0f1117] border border-white/[0.07] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00c896]/40 transition-all"
      />

      {/* Tabla desktop */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden hidden md:block mb-5">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["#", "Nombre", "Correo", "Celular", "Rol", "Confirmado", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-gray-600 font-semibold text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginados.length > 0 ? (
              paginados.map((u) => {
                const enEdicion = editando?.id === u.id;
                const enPass    = cambioPass?.id === u.id;
                return (
                  <tr key={u.id} className="border-t border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                    {/* # */}
                    <td className="px-4 py-3 text-gray-600 text-[11px]">{u.id}</td>

                    {/* Nombre */}
                    <td className="px-4 py-3">
                      {enEdicion ? (
                        <div className="flex flex-col gap-1 w-36">
                          <input className={inputCls} value={editando.nombres}
                            onChange={(e) => setEditando({ ...editando, nombres: e.target.value })} />
                          <input className={inputCls} value={editando.apellidos}
                            onChange={(e) => setEditando({ ...editando, apellidos: e.target.value })} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#00c896]/10 border border-[#00c896]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#00c896] text-[10px] font-bold">
                              {(u.nombres?.[0] || "?").toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-200 font-medium text-[13px]">
                            {u.nombres} {u.apellidos}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Correo */}
                    <td className="px-4 py-3 text-gray-500 text-[12px]">{u.correo}</td>

                    {/* Celular */}
                    <td className="px-4 py-3">
                      {enEdicion ? (
                        <input className={`${inputCls} w-28`} value={editando.celular}
                          onChange={(e) => setEditando({ ...editando, celular: e.target.value })} />
                      ) : (
                        <span className="text-gray-500 text-[12px]">{u.celular || "—"}</span>
                      )}
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3">
                      {enEdicion ? (
                        <select className={`${inputCls} w-32`} value={editando.rol_id}
                          onChange={(e) => setEditando({ ...editando, rol_id: parseInt(e.target.value) })}
                          style={{ colorScheme: "dark" }}>
                          <option value={1} style={{ backgroundColor: "#0a0c10" }}>Admin</option>
                          <option value={2} style={{ backgroundColor: "#0a0c10" }}>Usuario</option>
                        </select>
                      ) : (
                        <Badge ok={u.rol_id === 1} si="Admin" no="Usuario" />
                      )}
                    </td>

                    {/* Confirmado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge ok={u.confirmado} si="Sí" no="No" />
                        {!u.confirmado && (
                          <IconBtn onClick={() => reenviarConfirmacion(u.id)} title="Reenviar correo"
                            color="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" Icon={FiMail} />
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge ok={u.activo} si="Activo" no="Inactivo" />
                        {puedeToggle(u) && (
                          <IconBtn
                            onClick={() => cambiarEstado(u.id, u.activo)}
                            title={u.activo ? "Desactivar" : "Activar"}
                            color={u.activo
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }
                            Icon={u.activo ? FiUserX : FiUserCheck}
                          />
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      {enEdicion ? (
                        <div className="flex gap-1.5">
                          <IconBtn onClick={guardar} title="Guardar"
                            color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" Icon={FiCheck} />
                          <IconBtn onClick={() => setEditando(null)} title="Cancelar"
                            color="bg-red-500/15 text-red-400 hover:bg-red-500/25" Icon={FiX} />
                        </div>
                      ) : enPass ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={nuevaPass}
                            onChange={(e) => setNuevaPass(e.target.value)}
                            className={`${inputCls} w-36`}
                          />
                          <IconBtn onClick={guardarPass} title="Guardar contraseña"
                            color="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" Icon={FiCheck} />
                          <IconBtn onClick={() => setCambioPass(null)} title="Cancelar"
                            color="bg-red-500/15 text-red-400 hover:bg-red-500/25" Icon={FiX} />
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <IconBtn onClick={() => setEditando({ ...u })} title="Editar datos"
                            color="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" Icon={FiEdit2} />
                          <IconBtn onClick={() => { setCambioPass(u); setNuevaPass(""); }} title="Cambiar contraseña"
                            color="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" Icon={FiLock} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-12 text-center text-gray-600 text-sm">No hay usuarios disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPags > 1 && (
          <div className="flex justify-center items-center gap-1.5 py-4 border-t border-white/[0.05]">
            <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                paginaActual === 1 ? "bg-white/[0.03] text-gray-700 cursor-not-allowed" : "bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20"
              }`}>←</button>
            {[...Array(totalPags)].map((_, i) => (
              <button key={i + 1} onClick={() => setPaginaActual(i + 1)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                  paginaActual === i + 1 ? "bg-[#00c896] text-black" : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
                }`}>{i + 1}</button>
            ))}
            <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPags))} disabled={paginaActual === totalPags}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                paginaActual === totalPags ? "bg-white/[0.03] text-gray-700 cursor-not-allowed" : "bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20"
              }`}>→</button>
          </div>
        )}
      </div>

      {/* Tarjetas móvil */}
      <div className="md:hidden flex flex-col gap-3">
        {paginados.map((u) => (
          <div key={u.id} className="bg-[#0f1117] rounded-2xl p-4 border border-white/[0.07]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#00c896]/10 border border-[#00c896]/20 flex items-center justify-center shrink-0">
                <span className="text-[#00c896] text-[11px] font-bold">{(u.nombres?.[0] || "?").toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-gray-200 font-semibold text-[13px] truncate">{u.nombres} {u.apellidos}</p>
                <p className="text-gray-600 text-[11px] truncate">{u.correo}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge ok={u.rol_id === 1} si="Admin" no="Usuario" />
              <Badge ok={u.confirmado} si="Confirmado" no="Sin confirmar" />
              <Badge ok={u.activo} si="Activo" no="Inactivo" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditando({ ...u })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                <FiEdit2 size={11} /> Editar
              </button>
              <button onClick={() => { setCambioPass(u); setNuevaPass(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all">
                <FiLock size={11} /> Contraseña
              </button>
              {puedeToggle(u) && (
                <button onClick={() => cambiarEstado(u.id, u.activo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    u.activo ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}>
                  {u.activo ? <><FiUserX size={11} /> Desactivar</> : <><FiUserCheck size={11} /> Activar</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
