import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getCategorias, getUsoCategorias,
  crearCategoria, editarCategoria, eliminarCategoria as eliminarCategoriaAPI,
} from "../../services/adminService";

const COLORES = ["#00c896","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#84cc16","#f97316","#ec4899","#6b7280"];
const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[#0a0c10] border border-white/[0.07] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00c896]/50 transition-all";

export default function VistaCategorias() {
  const [categorias,    setCategorias]    = useState([]);
  const [usoCategorias, setUsoCategorias] = useState([]);
  const [nuevaCat,      setNuevaCat]      = useState("");
  const [nuevaDesc,     setNuevaDesc]     = useState("");
  const [editando,      setEditando]      = useState(null);
  const [nomEdit,       setNomEdit]       = useState("");
  const [descEdit,      setDescEdit]      = useState("");
  const [limiteUso,     setLimiteUso]     = useState("todas");
  const [vista,         setVista]         = useState("lista");
  const [guardando,     setGuardando]     = useState(false);

  useEffect(() => { fetchCategorias(); fetchUso(); }, []);

  const fetchCategorias = async () => { try { const r = await getCategorias();    setCategorias(r.data); }    catch(e){ console.error(e); } };
  const fetchUso        = async () => { try { const r = await getUsoCategorias(); setUsoCategorias(r.data); } catch(e){ console.error(e); } };

  // ── BUG FIX: el handler ahora está en el onClick del botón, no en un form ──
  const handleCrear = async () => {
    if (!nuevaCat.trim()) return;
    setGuardando(true);
    try {
      await crearCategoria({ nombre: nuevaCat.trim(), descripcion: nuevaDesc.trim() || null, es_global: true });
      setNuevaCat(""); setNuevaDesc("");
      await fetchCategorias();
    } catch(e) { console.error(e); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try { await eliminarCategoriaAPI(id); await fetchCategorias(); await fetchUso(); } catch(e){ console.error(e); }
  };

  const handleGuardar = async () => {
    try {
      await editarCategoria(editando, { nombre: nomEdit, descripcion: descEdit || null, es_global: true });
      setEditando(null);
      await fetchCategorias();
    } catch(e){ console.error(e); }
  };

  const listaUso = limiteUso === "todas" ? usoCategorias : usoCategorias.slice(0, parseInt(limiteUso));
  const totalUsos = usoCategorias.reduce((a,c) => a + Number(c.usos), 0);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">Categorías</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona las categorías de gastos del sistema</p>
      </div>

      {/* Crear */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 mb-5">
        <p className="text-[12px] uppercase tracking-widest text-gray-600 font-semibold mb-3">Nueva categoría</p>
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Nombre de la categoría"
            value={nuevaCat}
            onChange={e => setNuevaCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCrear()}
            className={`${inputCls} flex-1 min-w-48`}
          />
          <input
            placeholder="Descripción (opcional)"
            value={nuevaDesc}
            onChange={e => setNuevaDesc(e.target.value)}
            className={`${inputCls} flex-1 min-w-48`}
          />
          <button
            onClick={handleCrear}
            disabled={guardando || !nuevaCat.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00c896] text-black text-sm font-bold
                       hover:bg-[#00b388] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={15} />
            {guardando ? "Añadiendo..." : "Añadir"}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-300">{categorias.length} categorías registradas</span>
        </div>
        {categorias.length === 0 ? (
          <div className="py-12 text-center text-gray-600 text-sm">Sin categorías aún. Crea la primera arriba.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Nombre","Descripción","Tipo","Acciones"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-widest text-gray-600 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-gray-200 font-medium">{cat.nombre}</td>
                  <td className="px-5 py-3 text-gray-500">{cat.descripcion || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cat.es_global ? "bg-[#00c896]/10 text-[#00c896]" : "bg-gray-700/50 text-gray-400"}`}>
                      {cat.es_global ? "Global" : "Personal"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditando(cat.id); setNomEdit(cat.nombre); setDescEdit(cat.descripcion || ""); }}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"><FiEdit2 size={13} /></button>
                      <button onClick={() => handleEliminar(cat.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal editar */}
      {editando && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Editar categoría</h3>
            <input value={nomEdit}  onChange={e => setNomEdit(e.target.value)}  className={`${inputCls} mb-3`} placeholder="Nombre" />
            <input value={descEdit} onChange={e => setDescEdit(e.target.value)} className={`${inputCls} mb-5`} placeholder="Descripción" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditando(null)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-gray-400 text-sm hover:bg-white/[0.08] transition-all">Cancelar</button>
              <button onClick={handleGuardar} className="px-4 py-2 rounded-xl bg-[#00c896] text-black text-sm font-bold hover:bg-[#00b388] transition-all">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas uso */}
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-[13px] font-semibold text-gray-300">Categorías más utilizadas</h3>
          <div className="flex gap-3">
            <select value={limiteUso} onChange={e => setLimiteUso(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07] text-gray-400 text-xs focus:outline-none">
              <option value="todas">Todas</option><option value="5">Top 5</option><option value="10">Top 10</option>
            </select>
            <select value={vista} onChange={e => setVista(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07] text-gray-400 text-xs focus:outline-none">
              <option value="lista">Lista</option><option value="barras">Barras</option><option value="circular">Circular</option>
            </select>
          </div>
        </div>

        {vista === "lista" && (
          <ul className="space-y-2">
            {listaUso.map((c,i) => (
              <li key={c.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black" style={{ backgroundColor: COLORES[i % COLORES.length] }}>{i+1}</span>
                <span className="flex-1 text-gray-300">{c.nombre}</span>
                <span className="text-white font-semibold">{c.usos}</span>
                <span className="text-gray-600 text-[11px]">usos</span>
              </li>
            ))}
          </ul>
        )}
        {vista === "barras" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={listaUso} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" stroke="#333" tick={{ fill:"#666", fontSize:11 }} />
              <YAxis type="category" dataKey="nombre" stroke="#333" tick={{ fill:"#888", fontSize:11 }} />
              <Tooltip contentStyle={{ background:"#0a0c10", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"8px", color:"#fff" }} />
              <Bar dataKey="usos" radius={[0,4,4,0]}>
                {listaUso.map((_,i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {vista === "circular" && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={listaUso} dataKey="usos" nameKey="nombre" cx="50%" cy="50%" outerRadius={110} paddingAngle={2}>
                {listaUso.map((_,i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"#0a0c10", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"8px", color:"#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}