import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import VistaUsuarios from "../components/admin/VistaUsuarios";
import VistaEstadisticas from "../components/admin/VistaEstadisticas";
import VistaIA from "../components/admin/VistaIA";
import VistaConfiguracion from "../components/admin/VistaConfiguracion";
import VistaCategorias from "../components/admin/VistaCategorias";
import axios from "axios";
import "../assets/Admin.css";

const Admin = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombres} ${u.apellidos}`.toLowerCase();
    return (
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/usuarios", {
        withCredentials: true,
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios", err);
    }
  };

  useEffect(() => {
    if (seccionActiva === "usuarios") {
      obtenerUsuarios();
    }
  }, [seccionActiva]);

  const cerrarSesion = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:5000/admin/usuarios/${id}`, {
          withCredentials: true,
        });
        setUsuarios(usuarios.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error al eliminar usuario", err);
      }
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    try {
      await axios.put(
        `http://localhost:5000/admin/usuarios/${id}/estado`,
        { activo: nuevoEstado },
        { withCredentials: true }
      );
      setUsuarios(
        usuarios.map((u) => (u.id === id ? { ...u, activo: nuevoEstado } : u))
      );
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  const reenviarConfirmacion = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/admin/usuarios/${id}/reenviar-confirmacion`,
        {},
        { withCredentials: true }
      );
      alert("Correo de confirmación reenviado.");
    } catch (err) {
      console.error("Error al reenviar correo", err);
    }
  };

  const guardarCambios = async (usuarioEditado) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/usuarios/${usuarioEditado.id}`,
        usuarioEditado,
        { withCredentials: true }
      );
      setUsuarios(
        usuarios.map((u) => (u.id === usuarioEditado.id ? usuarioEditado : u))
      );
    } catch (err) {
      console.error("Error al editar usuario", err);
    }
  };

  const guardarContrasena = async (id, nuevaContrasena) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/usuarios/${id}/contrasena`,
        { contrasena: nuevaContrasena },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error al cambiar contraseña", err);
    }
  };

  //Estadísticas
  const [usuariosPorDatos, setUsuariosPorDatos] = useState([]);
  const [datosOperaciones, setDatosOperaciones] = useState([]);
  const [datosEvolucion, setDatosEvolucion] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");

  //Obtener lista de usuarios para el filtro
  const obtenerListaUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/usuarios", {
        withCredentials: true,
      });
      setListaUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener lista de usuarios:", err);
    }
  };

  //Datos: usuarios con más actividad
 const obtenerUsuariosPorDatos = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/actividad-datos${
          usuarioSeleccionado ? `?usuario_id=${usuarioSeleccionado}` : ""
        }`,
        { withCredentials: true }
      );

      //Asegurarse de que siempre sea array
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setUsuariosPorDatos(data.filter((u) => u.usuario)); // solo usuarios válidos con nombre
    } catch (err) {
      console.error("Error al obtener datos registrados por usuarios:", err);
    }
  };
  1;

  //Datos: operaciones registradas
  const obtenerDatosOperaciones = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/estadisticas/operaciones${
          usuarioSeleccionado ? `?usuario_id=${usuarioSeleccionado}` : ""
        }`,
        { withCredentials: true }
      );
      setDatosOperaciones(res.data);
    } catch (error) {
      console.error("Error al obtener datos de operaciones:", error);
    }
  };

  // Datos: evolución mensual
  const obtenerEvolucionMensual = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/estadisticas/evolucion-mensual${
          usuarioSeleccionado ? `?usuario_id=${usuarioSeleccionado}` : ""
        }`,
        { withCredentials: true }
      );
      setDatosEvolucion(res.data);
    } catch (error) {
      console.error("Error al obtener evolución mensual:", error);
    }
  };

  // Cargar datos al cambiar usuario seleccionado
  useEffect(() => {
    if (seccionActiva === "estadisticas") {
      obtenerUsuariosPorDatos();
      obtenerDatosOperaciones();
      obtenerEvolucionMensual();
    }
  }, [usuarioSeleccionado]);

  // Cargar datos al cambiar a la vista de estadísticas
  useEffect(() => {
    if (seccionActiva === "estadisticas") {
      obtenerListaUsuarios();
      obtenerUsuariosPorDatos();
      obtenerDatosOperaciones();
      obtenerEvolucionMensual();
    }
  }, [seccionActiva]);

  const renderContenido = () => {
    switch (seccionActiva) {
      case "usuarios":
        return (
          <VistaUsuarios
            usuario={usuario}
            usuariosFiltrados={usuariosFiltrados}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            reenviarConfirmacion={reenviarConfirmacion}
            eliminarUsuario={eliminarUsuario}
            cambiarEstado={cambiarEstado}
            guardarCambios={guardarCambios}
            guardarContrasena={guardarContrasena}
          />
        );
      case "estadisticas":
        return (
          <VistaEstadisticas
            usuarioSeleccionado={usuarioSeleccionado}
            setUsuarioSeleccionado={setUsuarioSeleccionado}
            listaUsuarios={listaUsuarios}
            usuariosPorDatos={usuariosPorDatos}
            datosOperaciones={datosOperaciones}
            datosEvolucion={datosEvolucion}
          />
        );

      case "ia":
        return <VistaIA />;
      case "configuracion":
        return <VistaConfiguracion />;
      case "categorias":
        return <VistaCategorias />;
      default:
        return <p>Selecciona una opción del menú.</p>;
    }
  };

  return (
    <div className="admin-layout">
      <SidebarAdmin
        setSeccionActiva={setSeccionActiva}
        cerrarSesion={cerrarSesion}
      />
      <main className="admin-main">{renderContenido()}</main>
    </div>
  );
};

export default Admin;
