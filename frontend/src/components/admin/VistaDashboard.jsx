import { useEffect, useState } from "react";
import { FiUsers, FiTrendingUp, FiTag, FiActivity, FiUserCheck } from "react-icons/fi";
import { getUsuarios, getEstadisticasOperaciones } from "../../services/adminService";
import api from "../../services/api";

const STAT_CONFIG = [
  { key: "usuarios",    label: "Usuarios totales", Icon: FiUsers,     accent: "#a78bfa", glow: "rgba(167,139,250,0.12)" },
  { key: "operaciones", label: "Operaciones",      Icon: FiActivity,  accent: "#00c896", glow: "rgba(0,200,150,0.12)"   },
  { key: "categorias",  label: "Categorías",       Icon: FiTag,       accent: "#fb923c", glow: "rgba(251,146,60,0.12)"  },
  { key: "activos",     label: "Usuarios activos", Icon: FiUserCheck, accent: "#60a5fa", glow: "rgba(96,165,250,0.12)"  },
];

const Stat = ({ config, value, sub }) => {
  const { label, Icon, accent, glow } = config;
  return (
    <div
      className="relative overflow-hidden bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between"
      style={{ minHeight: "110px" }}
    >
      {/* glow esquina */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: glow }}
      />
      {/* línea accent top */}
      <div
        className="absolute top-0 left-5 right-5 h-[2px] rounded-b-full"
        style={{ backgroundColor: accent, opacity: 0.6 }}
      />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-semibold">{label}</span>
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold text-white tracking-tight leading-none">{value ?? "—"}</p>
        {sub && <p className="text-[11px] text-gray-600 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
};

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

const fechaHoy = () => {
  const s = new Date().toLocaleDateString("es-GT", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const fmtFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
};

const OP_COLORS = { Ingreso: "#00c896", Gasto: "#ef4444", Ahorro: "#3b82f6" };

const BarChart = ({ ops }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);
  const total = ops.reduce((a, b) => a + Number(b.cantidad), 0);
  return (
    <div className="space-y-5">
      {ops.map((op) => {
        const pct   = total ? Math.round((Number(op.cantidad) / total) * 100) : 0;
        const color = OP_COLORS[op.tipo] || "#888";
        return (
          <div key={op.tipo}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[13px] text-gray-300">{op.tipo}</span>
              </div>
              <span className="text-[13px] font-semibold text-white">
                {op.cantidad}{" "}
                <span className="text-gray-600 font-normal text-[11px]">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: visible ? `${pct}%` : "0%",
                  backgroundColor: color,
                  transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function VistaDashboard() {
  const [stats,     setStats]     = useState({ usuarios: 0, operaciones: 0, categorias: 0, activos: 0 });
  const [ops,       setOps]       = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [rU, rO, rC] = await Promise.all([
          getUsuarios(),
          getEstadisticasOperaciones(),
          api.get("/categorias"),
        ]);
        const usuarios = rU.data;
        const activos  = usuarios.filter((u) => u.activo).length;
        const totalOps = rO.data.reduce((a, b) => a + Number(b.cantidad), 0);

        setStats({ usuarios: usuarios.length, operaciones: totalOps, categorias: rC.data.length, activos });
        setOps(rO.data);

        const ordenados = [...usuarios].sort((a, b) => {
          if (!a.creado_en && !b.creado_en) return 0;
          if (!a.creado_en) return 1;
          if (!b.creado_en) return -1;
          return new Date(b.creado_en) - new Date(a.creado_en);
        });
        setRecientes(ordenados.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const statsValues = {
    usuarios:    { value: stats.usuarios,    sub: `${stats.activos} activos` },
    operaciones: { value: stats.operaciones, sub: "ingresos + gastos + ahorro" },
    categorias:  { value: stats.categorias,  sub: "globales y personales" },
    activos:     { value: stats.activos,     sub: `de ${stats.usuarios} registrados` },
  };

  if (cargando) {
    return (
      <div>
        <div className="h-7 w-48 bg-white/[0.04] rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-32 bg-white/[0.03] rounded-lg animate-pulse mb-7" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">{saludo()}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{fechaHoy()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CONFIG.map((cfg) => (
          <Stat key={cfg.key} config={cfg} {...statsValues[cfg.key]} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

        {/* Distribución */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-1">
            Distribución de operaciones
          </p>
          <p className="text-gray-500 text-[12px] mb-6">Ingresos, gastos y ahorros registrados</p>
          {ops.length === 0 ? (
            <p className="text-gray-600 text-sm">Sin datos de operaciones aún.</p>
          ) : (
            <BarChart ops={ops} />
          )}
        </div>

        {/* Usuarios recientes */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-1">
            Usuarios recientes
          </p>
          <p className="text-gray-500 text-[12px] mb-6">Últimos 5 registros</p>
          {recientes.length === 0 ? (
            <p className="text-gray-600 text-sm">Sin usuarios registrados aún.</p>
          ) : (
            <div className="space-y-4">
              {recientes.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00c896]/10 border border-[#00c896]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#00c896] text-[11px] font-bold">
                      {(u.nombres?.[0] || "?").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-200 font-medium truncate">
                      {u.nombres} {u.apellidos}
                    </p>
                    <p className="text-[11px] text-gray-600 truncate">{u.correo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      u.activo
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-[10px] text-gray-700">{fmtFecha(u.creado_en)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
