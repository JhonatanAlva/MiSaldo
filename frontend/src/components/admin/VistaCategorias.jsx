import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VistaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [usoCategorias, setUsoCategorias] = useState([]);

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  const [limiteCategorias, setLimiteCategorias] = useState("todas");
  const [limiteUso, setLimiteUso] = useState("todas");
  const [vista, setVista] = useState("lista"); // lista | barras | circular

  useEffect(() => {
    fetchCategorias();
    fetchUsoCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await axios.get(`${API}/categorias`);
      setCategorias(res.data);
    } catch (err) {
      console.error("❌ Error al obtener categorías:", err);
    }
  };

  const fetchUsoCategorias = async () => {
    try {
      const res = await axios.get(`${API}/categorias/uso`);
      setUsoCategorias(res.data);
    } catch (err) {
      console.error("❌ Error al obtener estadísticas de uso:", err);
    }
  };

  const crearCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    try {
      await axios.post(`${API}/categorias`, {
        nombre: nuevaCategoria,
        descripcion,
        es_global: true,
      });
      setNuevaCategoria("");
      setDescripcion("");
      fetchCategorias();
    } catch (err) {
      console.error("❌ Error al crear categoría:", err);
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await axios.delete(`${API}/categorias/${id}`);
      fetchCategorias();
    } catch (err) {
      console.error("❌ Error al eliminar categoría:", err);
    }
  };

  const editarCategoria = (cat) => {
    setEditando(cat.id);
    setNombreEditado(cat.nombre);
    setDescripcionEditada(cat.descripcion || "");
  };

  const guardarEdicion = async () => {
    try {
      await axios.put(`${API}/categorias/${editando}`, {
        nombre: nombreEditado,
        descripcion: descripcionEditada,
        es_global: true,
      });
      setEditando(null);
      fetchCategorias();
    } catch (err) {
      console.error("❌ Error al editar categoría:", err);
    }
  };

  const aplicarLimite = (lista, limite) => {
    if (limite === "todas") return lista;
    return lista.slice(0, parseInt(limite));
  };

  // Colores consistentes
  const colores = [
    "#2980b9",
    "#27ae60",
    "#e67e22",
    "#8e44ad",
    "#c0392b",
    "#16a085",
    "#f39c12",
    "#2c3e50",
    "#d35400",
    "#7f8c8d",
  ];

  const totalUsos = usoCategorias.reduce((acc, c) => acc + c.usos, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { nombre, usos } = payload[0].payload;
      const porcentaje = ((usos / totalUsos) * 100).toFixed(1);
      return (
        <div
          style={{
            background: "#222",
            padding: "8px",
            borderRadius: "5px",
            color: "#fff",
          }}
        >
          <strong>{nombre}</strong>
          <br />
          {usos} usos ({porcentaje}%)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-card">
      <h1 className="admin-title">Gestión de Categorías</h1>
      <p className="admin-subtitle">
        Aquí puedes crear, editar o eliminar categorías de gastos para los
        usuarios.
      </p>

      {/* Crear nueva categoría */}
      <div className="categorias-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="admin-input"
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="admin-input"
        />
        <button className="btn-editar" onClick={crearCategoria}>
          + Añadir
        </button>
      </div>

      {/* Tabla (escritorio) */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aplicarLimite(categorias, limiteCategorias).map((cat) => (
              <tr key={cat.id}>
                <td>{cat.nombre}</td>
                <td>{cat.descripcion || "-"}</td>
                <td>{cat.es_global ? "🌍 Global" : "👤 Personal"}</td>
                <td>
                  <button
                    className="btn-editar"
                    onClick={() => editarCategoria(cat)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarCategoria(cat.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas (móvil) */}
      <div className="categorias-mobile">
        {aplicarLimite(categorias, limiteCategorias).map((cat) => (
          <div key={cat.id} className="categoria-card">
            <h4>{cat.nombre}</h4>
            <p>
              <strong>Descripción:</strong> {cat.descripcion || "-"}
            </p>
            <p>
              <strong>Tipo:</strong>{" "}
              {cat.es_global ? "🌍 Global" : "👤 Personal"}
            </p>
            <div className="acciones">
              <button
                className="btn-editar"
                onClick={() => editarCategoria(cat)}
              >
                ✏️ Editar
              </button>
              <button
                className="btn-eliminar"
                onClick={() => eliminarCategoria(cat.id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal editar */}
      {editando && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Editar Categoría</h3>
            <input
              type="text"
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              className="admin-input"
            />
            <input
              type="text"
              value={descripcionEditada}
              onChange={(e) => setDescripcionEditada(e.target.value)}
              className="admin-input"
            />
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button className="btn-guardar" onClick={guardarEdicion}>
                Guardar
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setEditando(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="admin-card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#eee" }}>
          📊 Categorías más utilizadas
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "10px" }}>Ver:</label>
          <select
            value={limiteUso}
            onChange={(e) => setLimiteUso(e.target.value)}
            className="admin-input"
          >
            <option value="todas">Todas</option>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>

          <label style={{ marginLeft: "20px", marginRight: "10px" }}>
            Vista:
          </label>
          <select
            value={vista}
            onChange={(e) => setVista(e.target.value)}
            className="admin-input"
          >
            <option value="lista">📋 Lista</option>
            <option value="barras">📊 Barras</option>
            <option value="circular">🥧 Circular</option>
          </select>
        </div>

        {vista === "lista" && (
          <ul style={{ color: "#ccc", lineHeight: "1.8" }}>
            {(limiteUso === "todas"
              ? usoCategorias
              : usoCategorias.slice(0, parseInt(limiteUso))
            ).map((c) => (
              <li key={c.id}>
                {c.nombre} → <strong>{c.usos}</strong> usos
              </li>
            ))}
          </ul>
        )}

        {vista === "barras" && (
          <div style={{ marginTop: "2rem", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  limiteUso === "todas"
                    ? usoCategorias
                    : usoCategorias.slice(0, parseInt(limiteUso))
                }
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="usos">
                  {usoCategorias.map((_, i) => (
                    <Cell key={i} fill={colores[i % colores.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {vista === "circular" && (
          <div style={{ marginTop: "2rem", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    limiteUso === "todas"
                      ? usoCategorias
                      : usoCategorias.slice(0, parseInt(limiteUso))
                  }
                  dataKey="usos"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {usoCategorias.map((_, i) => (
                    <Cell key={i} fill={colores[i % colores.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default VistaCategorias;
