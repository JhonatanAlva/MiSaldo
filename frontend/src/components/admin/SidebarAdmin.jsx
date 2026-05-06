import { useState } from "react";
import {
  FiUsers, FiBarChart2, FiTag, FiCpu,
  FiLogOut, FiMenu, FiX, FiGrid,
  FiFileText, FiBook
} from "react-icons/fi";

const NAV = [
  { id: "dashboard",   label: "Dashboard",    Icon: FiGrid },
  { id: "usuarios",    label: "Usuarios",     Icon: FiUsers },
  { id: "estadisticas",label: "Estadísticas", Icon: FiBarChart2 },
  { id: "categorias",  label: "Categorías",   Icon: FiTag },
  { id: "bitacora",    label: "Bitácora",     Icon: FiBook },
  { id: "reportes",    label: "Reportes",     Icon: FiFileText },
  { id: "ia",          label: "Asistente IA", Icon: FiCpu },
];

export default function SidebarAdmin({ seccionActiva, setSeccionActiva, cerrarSesion }) {
  const [open, setOpen] = useState(false);

  const nav = (id) => { setSeccionActiva(id); setOpen(false); };

  return (
    <>
      {/* Hamburguesa móvil */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-[#0f1117] border border-white/10 flex items-center justify-center text-white"
      >
        {open ? <FiX size={16} /> : <FiMenu size={16} />}
      </button>

      {open && <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/60 z-30" />}

      <aside className={`
        fixed md:static top-0 left-0 h-full w-60 z-40 flex flex-col
        bg-[#0a0c10] border-r border-white/[0.06]
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="px-5 pt-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00c896] flex items-center justify-center">
              <span className="text-black font-black text-xs">S</span>
            </div>
            <span className="text-white font-bold tracking-tight text-sm">SaldoGt <span className="text-[#00c896]">Admin</span></span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 px-3 mb-3 font-semibold">Menú</p>
          {NAV.map(({ id, label, Icon }) => {
            const active = seccionActiva === id;
            return (
              <button key={id} onClick={() => nav(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative
                  ${active
                    ? "bg-[#00c896]/10 text-[#00c896]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
                  }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00c896] rounded-r-full" />}
                <Icon size={15} className={active ? "text-[#00c896]" : "text-gray-600 group-hover:text-gray-400"} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/[0.06] pt-4">
          <button onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          >
            <FiLogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}