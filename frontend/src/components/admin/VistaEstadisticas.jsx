import React from "react";
import GraficaActividad from "./GraficaActividad";
import GraficaOperaciones from "./GraficaOperaciones";
import GraficaEvolucion from "./GraficaEvolucion";

const VistaEstadisticas = ({
  usuarioSeleccionado,
  setUsuarioSeleccionado,
  listaUsuarios,
  usuariosPorDatos,
  datosOperaciones,
  datosEvolucion,
}) => {
  return (
    <>
      <h1 className="admin-title">Estadísticas de los usuarios</h1>
      <div
        className="admin-card"
        style={{ marginTop: "1rem", marginBottom: "1rem" }}
      >
        <label
          htmlFor="filtroUsuario"
          style={{
            color: "#eee",
            fontWeight: "bold",
            marginRight: "0.5rem",
          }}
        >
          Filtrar:
        </label>
        <select
          id="filtroUsuario"
          value={usuarioSeleccionado}
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: "6px" }}
        >
          <option value="">Todos</option>
          {listaUsuarios
            .filter((u) => u.rol_id !== 1) 
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombres} {u.apellidos}
              </option>
            ))}
        </select>
      </div>

      {/* Primera gráfica */}
      <div className="admin-card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#eee" }}>
          Usuarios con más datos registrados
        </h3>
        <p style={{ color: "#ccc" }}>
          Se contabilizan registros en ingresos, gastos y planes de ahorro.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <GraficaActividad usuariosConMasActividad={usuariosPorDatos} />
        </div>
      </div>

      {/* Segunda gráfica */}
      <div className="admin-card" style={{ marginTop: "3rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#eee" }}>
          Tipos de operaciones más comunes
        </h3>
        <p style={{ color: "#ccc" }}>
          Se muestran cuántos ingresos, gastos y planes de ahorro han sido
          registrados.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <GraficaOperaciones data={datosOperaciones} />
        </div>
      </div>

      {/* Tercera gráfica */}
      <div className="admin-card" style={{ marginTop: "3rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#eee" }}>
          Evolución mensual de registros
        </h3>
        <p style={{ color: "#ccc" }}>
          Se observa cómo han evolucionado los ingresos, gastos y planes de
          ahorro a lo largo del tiempo.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <GraficaEvolucion data={datosEvolucion} />
        </div>
      </div>
    </>
  );
};

export default VistaEstadisticas;
