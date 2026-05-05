import GraficaActividad   from "./GraficaActividad";
import GraficaOperaciones from "./GraficaOperaciones";
import GraficaEvolucion   from "./GraficaEvolucion";

const Card = ({ title, subtitle, children }) => (
  <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5">
    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-1">{title}</p>
    {subtitle && <p className="text-gray-500 text-[11px] sm:text-[12px] mb-4 sm:mb-5">{subtitle}</p>}
    {children}
  </div>
);

export default function VistaEstadisticas({
  usuarioSeleccionado, setUsuarioSeleccionado,
  listaUsuarios, usuariosPorDatos, datosOperaciones, datosEvolucion,
}) {
  return (
    <>
      <div className="mb-5 sm:mb-7">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Estadísticas de usuarios</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Actividad y métricas del sistema</p>
      </div>

      {/* Filtro */}
      <Card title="Filtrar por usuario">
        <select
          value={usuarioSeleccionado}
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm text-gray-200 focus:outline-none transition-all"
          style={{
            backgroundColor: "#0a0c10",
            border: "1px solid rgba(255,255,255,0.08)",
            colorScheme: "dark",
          }}
        >
          <option value=""           style={{ backgroundColor: "#0a0c10", color: "#ccc" }}>Todos los usuarios</option>
          {listaUsuarios.filter(u => u.rol_id !== 1).map(u => (
            <option key={u.id} value={u.id} style={{ backgroundColor: "#0a0c10", color: "#ccc" }}>
              {u.nombres} {u.apellidos}
            </option>
          ))}
        </select>
      </Card>

      <Card title="Usuarios con más datos registrados" subtitle="Contabiliza ingresos, gastos y planes de ahorro.">
        <GraficaActividad usuariosConMasActividad={usuariosPorDatos} />
      </Card>

      <Card title="Tipos de operaciones más comunes" subtitle="Ingresos, gastos y planes de ahorro registrados.">
        <GraficaOperaciones data={datosOperaciones} />
      </Card>

      <Card title="Evolución mensual de registros" subtitle="Cómo han evolucionado los registros a lo largo del tiempo.">
        <GraficaEvolucion data={datosEvolucion} />
      </Card>
    </>
  );
}