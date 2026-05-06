import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import VistaDashboard from "../components/admin/VistaDashboard";
import VistaUsuarios from "../components/admin/VistaUsuarios";
import VistaEstadisticas from "../components/admin/VistaEstadisticas";
import VistaIA from "../components/admin/VistaIA";
import VistaCategorias from "../components/admin/VistaCategorias";
import VistaBitacora from "../components/admin/VistaBitacora";
import VistaReportes from "../components/admin/VistaReportes";
import {
  getUsuarios, actualizarUsuario,

  cambiarContrasena as cambiarContrasenaAPI,
  reenviarConfirmacion as reenviarConfirmacionAPI,
  cambiarEstado as cambiarEstadoAPI,
  getActividadDatos, getEstadisticasOperaciones, getEvolucionMensual,
} from "../services/adminService";

export default function Admin() {
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [usuariosPorDatos, setUsuariosPorDatos] = useState([]);
  const [datosOperaciones, setDatosOperaciones] = useState([]);
  const [datosEvolucion, setDatosEvolucion] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");

  const usuariosFiltrados = usuarios.filter(u => {
    const n = `${u.nombres} ${u.apellidos}`.toLowerCase();
    return n.includes(busqueda.toLowerCase()) || u.correo.toLowerCase().includes(busqueda.toLowerCase());
  });

  const obtenerUsuarios = async () => {
    try {
      const r = await getUsuarios();
      setUsuarios(r.data);
      return r.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };


  const cambiarEstado = async (id, actual) => {
    try {
      await cambiarEstadoAPI(id, !actual);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !actual } : u));
    } catch (e) { console.error(e); }
  };

  const reenviarConfirmacion = async (id) => {
    try { await reenviarConfirmacionAPI(id); alert("Correo de confirmación reenviado."); } catch (e) { console.error(e); }
  };

  const guardarCambios = async (u) => {
    try { await actualizarUsuario(u.id, u); setUsuarios(prev => prev.map(p => p.id === u.id ? u : p)); } catch (e) { console.error(e); }
  };

  const guardarContrasena = async (id, c) => {
    try { await cambiarContrasenaAPI(id, c); } catch (e) { console.error(e); }
  };

  const cargarEstadisticas = async () => {
    try {
      const [rD, rO, rE] = await Promise.all([
        getActividadDatos(usuarioSeleccionado),
        getEstadisticasOperaciones(usuarioSeleccionado),
        getEvolucionMensual(usuarioSeleccionado),
      ]);
      const data = Array.isArray(rD.data) ? rD.data : [rD.data];
      setUsuariosPorDatos(data.filter(u => u.usuario));
      setDatosOperaciones(rO.data);
      setDatosEvolucion(rE.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (seccionActiva === "usuarios") obtenerUsuarios();
    if (seccionActiva === "estadisticas") {
      obtenerUsuarios().then(data => setListaUsuarios(data));
      cargarEstadisticas();
    }
  }, [seccionActiva]);

  useEffect(() => {
    if (seccionActiva === "estadisticas") cargarEstadisticas();
  }, [usuarioSeleccionado]);

  const renderContenido = () => {
    switch (seccionActiva) {
      case "dashboard": return <VistaDashboard />;
      case "usuarios": return <VistaUsuarios usuario={usuario} usuariosFiltrados={usuariosFiltrados} busqueda={busqueda} setBusqueda={setBusqueda} reenviarConfirmacion={reenviarConfirmacion} cambiarEstado={cambiarEstado} guardarCambios={guardarCambios} guardarContrasena={guardarContrasena} />;
      case "estadisticas": return <VistaEstadisticas usuarioSeleccionado={usuarioSeleccionado} setUsuarioSeleccionado={setUsuarioSeleccionado} listaUsuarios={listaUsuarios} usuariosPorDatos={usuariosPorDatos} datosOperaciones={datosOperaciones} datosEvolucion={datosEvolucion} />;
      case "categorias": return <VistaCategorias />;
      case "bitacora": return <VistaBitacora />;
      case "reportes": return <VistaReportes />;
      case "ia": return <VistaIA />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#080a0e] text-white overflow-hidden">
      <SidebarAdmin seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} cerrarSesion={cerrarSesion} />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        {renderContenido()}
      </main>
    </div>
  );
}