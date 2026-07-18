import { useState } from "react";
import { FiDownload, FiFileText, FiGrid, FiUsers, FiTag } from "react-icons/fi";
import { getUsuarios, getCategorias, getEstadisticasOperaciones } from "../../services/adminService";

// ── Helpers ────────────────────────────────────────────────────
const toCSV = (headers, rows) => {
  const escape = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  const head   = headers.map(escape).join(",");
  const body   = rows.map(r => r.map(escape).join(",")).join("\n");
  return `${head}\n${body}`;
};

const downloadCSV = (filename, csv) => {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadJSON = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Tarjeta de reporte ─────────────────────────────────────────
const ReporteCard = ({ icon: Icon, title, desc, color, onCSV, onJSON, loading }) => (
  <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5">
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-[14px]">{title}</h3>
        <p className="text-gray-500 text-[12px] mt-0.5 mb-4">{desc}</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onCSV}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00c896]/10 text-[#00c896] text-xs font-semibold
                       hover:bg-[#00c896]/20 transition-all disabled:opacity-40"
          >
            <FiDownload size={12} /> Exportar CSV
          </button>
          <button
            onClick={onJSON}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] text-gray-400 text-xs font-semibold
                       hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-40"
          >
            <FiDownload size={12} /> Exportar JSON
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function VistaReportes() {
  const [loading, setLoading] = useState({});

  const setL = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  // Reporte de usuarios
  const reporteUsuarios = async (fmt) => {
    setL("usuarios", true);
    try {
      const { data } = await getUsuarios();
      if (fmt === "csv") {
        const headers = ["ID","Nombres","Apellidos","Correo","Celular","Rol","Confirmado","Activo"];
        const rows    = data.map(u => [u.id, u.nombres, u.apellidos, u.correo, u.celular, u.rol_id === 1 ? "Admin" : "Usuario", u.confirmado ? "Sí" : "No", u.activo ? "Activo" : "Inactivo"]);
        downloadCSV("usuarios.csv", toCSV(headers, rows));
      } else {
        downloadJSON("usuarios.json", data);
      }
    } catch(e) { console.error(e); }
    finally { setL("usuarios", false); }
  };

  // Reporte de categorías
  const reporteCategorias = async (fmt) => {
    setL("categorias", true);
    try {
      const { data } = await getCategorias();
      if (fmt === "csv") {
        const headers = ["ID","Nombre","Descripción","Tipo"];
        const rows    = data.map(c => [c.id, c.nombre, c.descripcion || "", c.es_global ? "Global" : "Personal"]);
        downloadCSV("categorias.csv", toCSV(headers, rows));
      } else {
        downloadJSON("categorias.json", data);
      }
    } catch(e) { console.error(e); }
    finally { setL("categorias", false); }
  };

  // Reporte de operaciones
  const reporteOperaciones = async (fmt) => {
    setL("operaciones", true);
    try {
      const { data } = await getEstadisticasOperaciones();
      if (fmt === "csv") {
        const headers = ["Tipo","Cantidad"];
        const rows    = data.map(o => [o.tipo, o.cantidad]);
        downloadCSV("operaciones.csv", toCSV(headers, rows));
      } else {
        downloadJSON("operaciones.json", data);
      }
    } catch(e) { console.error(e); }
    finally { setL("operaciones", false); }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">Reportes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Exporta datos del sistema en CSV o JSON</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReporteCard
          icon={FiUsers}
          title="Usuarios"
          desc="Lista completa de usuarios registrados con su estado y rol."
          color="bg-violet-500/20"
          onCSV={() => reporteUsuarios("csv")}
          onJSON={() => reporteUsuarios("json")}
          loading={loading.usuarios}
        />
        <ReporteCard
          icon={FiTag}
          title="Categorías"
          desc="Todas las categorías del sistema, globales y personales."
          color="bg-orange-500/20"
          onCSV={() => reporteCategorias("csv")}
          onJSON={() => reporteCategorias("json")}
          loading={loading.categorias}
        />
        <ReporteCard
          icon={FiGrid}
          title="Operaciones"
          desc="Resumen de ingresos, gastos y ahorros registrados."
          color="bg-[#00c896]/20"
          onCSV={() => reporteOperaciones("csv")}
          onJSON={() => reporteOperaciones("json")}
          loading={loading.operaciones}
        />
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.05]">
        <p className="text-[12px] text-gray-600">
          💡 Los archivos CSV incluyen BOM UTF-8 para compatibilidad con Excel. Los JSON son datos crudos de la API.
        </p>
      </div>
    </div>
  );
}