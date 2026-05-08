import { useState, useContext, useMemo, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

const badge = (cond, si, no) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cond
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-red-500/20 text-red-400"
      }`}
  >
    {cond ? si : no}
  </span>
);

const inputCls =
  "w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00c896]/60";

const btnCls = (color) =>
  `p-1.5 rounded-lg text-xs font-semibold transition-all ${color}`;

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

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioContrasena, setUsuarioContrasena] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  // PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * usuariosPorPagina;

    return usuariosFiltrados.slice(
      inicio,
      inicio + usuariosPorPagina
    );
  }, [usuariosFiltrados, paginaActual]);

  // Reiniciar página cuando cambia búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const manejarGuardar = () => {
    guardarCambios(usuarioEditando);
    setUsuarioEditando(null);
  };

  const manejarGuardarContrasena = () => {
    guardarContrasena(usuarioContrasena.id, nuevaContrasena);

    setUsuarioContrasena(null);
    setNuevaContrasena("");
  };

  // Solo usuarios normales pueden ser desactivados
  const puedeDesactivar = (u) =>
    u.rol_id !== 1 && u.id !== usuarioActual?.id;

  return (
    <div>
      <h1 className="text-xl font-bold text-white tracking-tight mb-1">
        Gestión de Usuarios
      </h1>

      <p className="text-gray-500 text-sm mb-5">
        Bienvenido:{" "}
        <strong className="text-white">
          {usuarioActual?.nombres} {usuarioActual?.apellidos}
        </strong>
      </p>

      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full mb-5 px-4 py-2.5 rounded-xl bg-[#0f1117] border border-white/[0.07] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00c896]/40"
      />

      {/* TABLA DESKTOP */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden hidden md:block">
        <table className="w-full text-sm text-center">
          <thead className="border-b border-white/[0.05]">
            <tr>
              {[
                "ID",
                "Nombre",
                "Correo",
                "Celular",
                "Rol",
                "Confirmado",
                "Acciones",
                "Estado",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[11px] uppercase tracking-widest text-gray-600 font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {usuariosPaginados.length > 0 ? (
              usuariosPaginados.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-white/[0.03] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-gray-500">
                    {u.id}
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3 text-gray-200">
                    {usuarioEditando?.id === u.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          className={inputCls}
                          value={usuarioEditando.nombres}
                          onChange={(e) =>
                            setUsuarioEditando({
                              ...usuarioEditando,
                              nombres: e.target.value,
                            })
                          }
                        />

                        <input
                          className={inputCls}
                          value={usuarioEditando.apellidos}
                          onChange={(e) =>
                            setUsuarioEditando({
                              ...usuarioEditando,
                              apellidos: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      `${u.nombres} ${u.apellidos}`
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {u.correo}
                  </td>

                  {/* Celular */}
                  <td className="px-4 py-3 text-gray-400">
                    {usuarioEditando?.id === u.id ? (
                      <input
                        className={inputCls}
                        value={usuarioEditando.celular}
                        onChange={(e) =>
                          setUsuarioEditando({
                            ...usuarioEditando,
                            celular: e.target.value,
                          })
                        }
                      />
                    ) : (
                      u.celular
                    )}
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    {usuarioEditando?.id === u.id ? (
                      <select
                        className={inputCls}
                        value={usuarioEditando.rol_id}
                        onChange={(e) =>
                          setUsuarioEditando({
                            ...usuarioEditando,
                            rol_id: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={1}>Administrador</option>
                        <option value={2}>Usuario</option>
                      </select>
                    ) : (
                      badge(
                        u.rol_id === 1,
                        "Admin",
                        "Usuario"
                      )
                    )}
                  </td>

                  {/* Confirmado */}
                  <td className="px-4 py-3">
                    {u.confirmado ? (
                      badge(true, "Sí", "No")
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {badge(false, "Sí", "No")}

                        <button
                          onClick={() =>
                            reenviarConfirmacion(u.id)
                          }
                          className={btnCls(
                            "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          )}
                          title="Reenviar confirmación"
                        >
                          🔁
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    {usuarioEditando?.id === u.id ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={manejarGuardar}
                          className={btnCls(
                            "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          )}
                        >
                          💾
                        </button>

                        <button
                          onClick={() =>
                            setUsuarioEditando(null)
                          }
                          className={btnCls(
                            "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          )}
                        >
                          ✕
                        </button>
                      </div>
                    ) : usuarioContrasena?.id === u.id ? (
                      <div className="flex gap-1 justify-center">
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          value={nuevaContrasena}
                          onChange={(e) =>
                            setNuevaContrasena(
                              e.target.value
                            )
                          }
                          className={inputCls}
                        />

                        <button
                          onClick={
                            manejarGuardarContrasena
                          }
                          className={btnCls(
                            "bg-emerald-500/20 text-emerald-400"
                          )}
                        >
                          💾
                        </button>

                        <button
                          onClick={() =>
                            setUsuarioContrasena(null)
                          }
                          className={btnCls(
                            "bg-red-500/20 text-red-400"
                          )}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() =>
                            setUsuarioEditando({ ...u })
                          }
                          className={btnCls(
                            "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          )}
                          title="Editar datos"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => {
                            setUsuarioContrasena(u);
                            setNuevaContrasena("");
                          }}
                          className={btnCls(
                            "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          )}
                          title="Cambiar contraseña"
                        >
                          🔐
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      {badge(
                        u.activo,
                        "Activo",
                        "Inactivo"
                      )}

                      {puedeDesactivar(u) ? (
                        <button
                          onClick={() =>
                            cambiarEstado(
                              u.id,
                              u.activo
                            )
                          }
                          className={`text-[11px] px-2 py-0.5 rounded-lg transition-all ${u.activo
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                        >
                          {u.activo
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-700 italic">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="py-10 text-gray-600 text-sm"
                >
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2 mt-5 flex-wrap">
          <button
            onClick={() =>
              setPaginaActual((prev) =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={paginaActual === 1}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${paginaActual === 1
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20"
              }`}
          >
            ← Anterior
          </button>

          {[...Array(totalPaginas)].map((_, index) => {
            const pagina = index + 1;

            return (
              <button
                key={pagina}
                onClick={() =>
                  setPaginaActual(pagina)
                }
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${paginaActual === pagina
                    ? "bg-[#00c896] text-black"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
              >
                {pagina}
              </button>
            );
          })}

          <button
            onClick={() =>
              setPaginaActual((prev) =>
                Math.min(prev + 1, totalPaginas)
              )
            }
            disabled={
              paginaActual === totalPaginas
            }
            className={`px-3 py-1 rounded-lg text-sm transition-all ${paginaActual === totalPaginas
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20"
              }`}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* TARJETAS MÓVIL */}
      <div className="md:hidden flex flex-col gap-3 mt-5">
        {usuariosPaginados.map((u) => (
          <div
            key={u.id}
            className="bg-[#0f1117] rounded-xl p-4 border border-white/[0.07]"
          >
            <h4 className="text-[#00c896] font-semibold">
              {u.nombres} {u.apellidos}
            </h4>

            <p className="text-gray-400 text-sm mt-1">
              {u.correo}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {badge(
                u.rol_id === 1,
                "Admin",
                "Usuario"
              )}

              {badge(
                u.confirmado,
                "Confirmado",
                "Sin confirmar"
              )}

              {badge(
                u.activo,
                "Activo",
                "Inactivo"
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() =>
                  setUsuarioEditando({ ...u })
                }
                className={btnCls(
                  "bg-blue-500/20 text-blue-400"
                )}
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => {
                  setUsuarioContrasena(u);
                  setNuevaContrasena("");
                }}
                className={btnCls(
                  "bg-purple-500/20 text-purple-400"
                )}
              >
                🔐 Contraseña
              </button>

              {puedeDesactivar(u) && (
                <button
                  onClick={() =>
                    cambiarEstado(u.id, u.activo)
                  }
                  className={btnCls(
                    u.activo
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {u.activo
                    ? "Desactivar"
                    : "Activar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}