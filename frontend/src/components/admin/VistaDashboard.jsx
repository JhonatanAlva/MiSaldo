import { useEffect, useState } from "react";
import { FiUsers, FiTrendingUp, FiTag, FiActivity } from "react-icons/fi";
import { getUsuarios, getActividadDatos, getEstadisticasOperaciones } from "../../services/adminService";
import api from "../../services/api";

const STAT_CONFIG = [
  { key: "usuarios",    label: "Usuarios",    Icon: FiUsers,     gradient: "from-violet-500/20 to-violet-500/5",  border: "border-violet-500/20", iconBg: "bg-violet-500/20",  iconColor: "text-violet-400" },
  { key: "operaciones", label: "Operaciones", Icon: FiActivity,  gradient: "from-[#00c896]/20 to-[#00c896]/5",   border: "border-[#00c896]/20",  iconBg: "bg-[#00c896]/20",   iconColor: "text-[#00c896]"  },
  { key: "categorias",  label: "Categorías",  Icon: FiTag,       gradient: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", iconBg: "bg-orange-500/20",  iconColor: "text-orange-400" },
  { key: "activos",     label: "Activos",     Icon: FiTrendingUp,gradient: "from-blue-500/20 to-blue-500/5",     border: "border-blue-500/20",   iconBg: "bg-blue-500/20",    iconColor: "text-blue-400"   },
];

const Stat = ({ config, value, sub }) => {
  const { label, Icon, gradient, border, iconBg, iconColor } = config;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-5`}>
      {/* Glow decorativo */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl bg-white pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-1.5">{sub}</p>}
    </div>
  );
};

export default function VistaDashboard() {
  const [stats,    setStats]    = useState({ usuarios: 0, operaciones: 0, categorias: 0, activos: 0 });
  const [ops,      setOps]      = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [rU, rO, rC] = await Promise.all([
          getUsuarios(),
          getEstadisticasOperaciones(),
          api.get('/categorias'),
        ]);
        const usuarios  = rU.data;
        const activos   = usuarios.filter(u => u.activo).length;
        const totalOps  = rO.data.reduce((a, b) => a + Number(b.cantidad), 0);
        setStats({ usuarios: usuarios.length, operaciones: totalOps, categorias: rC.data.length, activos });
        setOps(rO.data);
      } catch(e) { console.error(e); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const OP_COLORS = { Ingreso: "#00c896", Gasto: "#ef4444", Ahorro: "#3b82f6" };
  const totalOps  = ops.reduce((a, b) => a + Number(b.cantidad), 0);

  const statsValues = {
    usuarios:    { value: stats.usuarios,    sub: `${stats.activos} activos` },
    operaciones: { value: stats.operaciones, sub: "ingresos + gastos + ahorro" },
    categorias:  { value: stats.categorias,  sub: null },
    activos:     { value: stats.activos,     sub: `de ${stats.usuarios} usuarios` },
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen general del sistema</p>
      </div>

      {cargando ? (
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-28 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STAT_CONFIG.map(cfg => (
              <Stat key={cfg.key} config={cfg} {...statsValues[cfg.key]} />
            ))}
          </div>

          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-5">Distribución de operaciones</p>
            {ops.length === 0 ? (
              <p className="text-gray-600 text-sm">Sin datos de operaciones aún.</p>
            ) : (
              <div className="space-y-4">
                {ops.map(op => {
                  const pct   = totalOps ? Math.round((Number(op.cantidad) / totalOps) * 100) : 0;
                  const color = OP_COLORS[op.tipo] || "#888";
                  return (
                    <div key={op.tipo}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-[13px] text-gray-300">{op.tipo}</span>
                        </div>
                        <span className="text-[13px] font-semibold text-white">
                          {op.cantidad} <span className="text-gray-600 font-normal text-[11px]">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}