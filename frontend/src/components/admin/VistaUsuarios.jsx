import React, { useState } from "react";

const VistaUsuarios = ({
  usuario,
  usuariosFiltrados,
  busqueda,
  setBusqueda,
  reenviarConfirmacion,
  eliminarUsuario,
  cambiarEstado,
  guardarCambios,
  guardarContrasena,
}) => {
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioContrasena, setUsuarioContrasena] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  const manejarGuardar = () => {
    guardarCambios(usuarioEditando);
    setUsuarioEditando(null);
  };

  const manejarGuardarContrasena = () => {
    guardarContrasena(usuarioContrasena.id, nuevaContrasena);
    setUsuarioContrasena(null);
    setNuevaContrasena("");
  };

  return (
    <div>
      <h1 className="admin-title">Gestión de Usuarios</h1>
      <p className="admin-subtitle">
        Bienvenido:{" "}
        <strong>{usuario?.nombres + " " + usuario?.apellidos}</strong>
      </p>

      <input
        type="text"
        className="admin-search"
        placeholder="Buscar por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* ===== Vista en tabla (desktop) ===== */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Rol</th>
              <th>Confirmado</th>
              <th>Acciones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    {usuarioEditando?.id === u.id ? (
                      <>
                        <input
                          value={usuarioEditando.nombres}
                          onChange={(e) =>
                            setUsuarioEditando({
                              ...usuarioEditando,
                              nombres: e.target.value,
                            })
                          }
                        />
                        <input
                          value={usuarioEditando.apellidos}
                          onChange={(e) =>
                            setUsuarioEditando({
                              ...usuarioEditando,
                              apellidos: e.target.value,
                            })
                          }
                        />
                      </>
                    ) : (
                      `${u.nombres} ${u.apellidos}`
                    )}
                  </td>
                  <td>{u.correo}</td>
                  <td>
                    {usuarioEditando?.id === u.id ? (
                      <input
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
                  <td>
                    {usuarioEditando?.id === u.id ? (
                      <select
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
                    ) : u.rol_id === 1 ? (
                      "Administrador"
                    ) : (
                      "Usuario"
                    )}
                  </td>
                  <td>
                    {u.confirmado ? (
                      "Sí"
                    ) : (
                      <>
                        No
                        <button
                          onClick={() => reenviarConfirmacion(u.id)}
                          className="btn-confirmar"
                        >
                          🔁
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {usuarioEditando?.id === u.id ? (
                      <>
                        <button
                          onClick={manejarGuardar}
                          className="btn-guardar"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => setUsuarioEditando(null)}
                          className="btn-cancelar"
                        >
                          ❌
                        </button>
                      </>
                    ) : usuarioContrasena?.id === u.id ? (
                      <>
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          value={nuevaContrasena}
                          onChange={(e) => setNuevaContrasena(e.target.value)}
                        />
                        <button
                          onClick={manejarGuardarContrasena}
                          className="btn-guardar"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => setUsuarioContrasena(null)}
                          className="btn-cancelar"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setUsuarioEditando({ ...u })}
                          className="btn-editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarUsuario(u.id)}
                          className="btn-eliminar"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => {
                            setUsuarioContrasena(u);
                            setNuevaContrasena("");
                          }}
                          className="btn-cambiar"
                        >
                          🔐
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {u.activo === 1 ? "Activo" : "Inactivo"}
                    <button
                      onClick={() => cambiarEstado(u.id, u.activo)}
                      className={u.activo === 1 ? "btn-desactivar" : "btn-activar"}
                    >
                      {u.activo === 1 ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "1rem", color: "#bbb" }}
                >
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Vista en tarjetas (móvil) ===== */}
      <div className="usuarios-mobile">
        {usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map((u) => (
            <div key={u.id} className="usuario-card">
              <h4>{u.nombres} {u.apellidos}</h4>
              <p><strong>ID:</strong> {u.id}</p>
              <p><strong>Correo:</strong> {u.correo}</p>
              <p><strong>Celular:</strong> {u.celular}</p>
              <p>
                <strong>Rol:</strong>{" "}
                <span className={u.rol_id === 1 ? "badge-admin" : "badge-user"}>
                  {u.rol_id === 1 ? "Administrador" : "Usuario"}
                </span>
              </p>
              <p>
                <strong>Confirmado:</strong>{" "}
                <span className={u.confirmado ? "badge-ok" : "badge-pending"}>
                  {u.confirmado ? "Sí" : "No"}
                </span>
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span className={u.activo === 1 ? "badge-ok" : "badge-pending"}>
                  {u.activo === 1 ? "Activo" : "Inactivo"}
                </span>
              </p>

              <div className="acciones">
                <button onClick={() => setUsuarioEditando({ ...u })} className="btn-editar">
                  ✏️ Editar
                </button>
                <button onClick={() => eliminarUsuario(u.id)} className="btn-eliminar">
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => {
                    setUsuarioContrasena(u);
                    setNuevaContrasena("");
                  }}
                  className="btn-cambiar"
                >
                  🔐 Contraseña
                </button>
                <button
                  onClick={() => cambiarEstado(u.id, u.activo)}
                  className={u.activo === 1 ? "btn-desactivar" : "btn-activar"}
                >
                  {u.activo === 1 ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#bbb" }}>
            No hay usuarios disponibles.
          </p>
        )}
      </div>
    </div>
  );
};

export default VistaUsuarios;
