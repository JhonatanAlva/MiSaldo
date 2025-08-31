// frontend/src/components/user/ConfiguracionUsuario.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ConfiguracionUsuario = () => {
  const [tab, setTab] = useState("perfil");

  // Perfil
  const [perfil, setPerfil] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    celular: "",
  });

  // Configuraciones
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    push: true,
    weekly: true,
    monthly: true,
    tips: false,
  });
  const [formato, setFormato] = useState("pdf");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 1) Perfil
        const u = await axios.get(`${API}/auth/usuario`);
        setPerfil({
          nombres: u.data.nombres || "",
          apellidos: u.data.apellidos || "",
          correo: u.data.correo || "",
          celular: u.data.celular || "",
        });

        // 2) Configuraciones
        const c = await axios.get(`${API}/configuraciones`);
        if (c.data?.notificaciones) setNotificaciones(c.data.notificaciones);
        if (c.data?.formato) setFormato(c.data.formato);
      } catch (e) {
        console.error(e);
        setMsg("No se pudieron cargar las configuraciones.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const guardarPerfil = async () => {
    setGuardando(true);
    setMsg("");
    try {
      const { data } = await axios.put(`${API}/configuraciones/usuario`, {
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        celular: perfil.celular ?? "",
      });

      if (data?.usuario) {
        setPerfil((p) => ({
          ...p,
          nombres: data.usuario.nombres ?? p.nombres,
          apellidos: data.usuario.apellidos ?? p.apellidos,
          correo: data.usuario.correo ?? p.correo,
          celular: data.usuario.celular ?? p.celular,
        }));
      }

      setMsg("Perfil actualizado correctamente.");
    } catch (e) {
      console.error(e);
      setMsg("Error al actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  const guardarConfig = async () => {
    setGuardando(true);
    setMsg("");
    try {
      await axios.put(`${API}/configuraciones`, {
        notificaciones,
        formato,
      });
      setMsg("Configuración guardada.");
    } catch (e) {
      console.error(e);
      setMsg("Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  const toggleNotif = (key, value) => {
    setNotificaciones((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (cargando) return <div className="container py-4">Cargando…</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="fw-bold mb-4">Configuración</h2>
        {msg && <small className="text-muted">{msg}</small>}
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "perfil" && "active"}`}
            onClick={() => setTab("perfil")}
          >
            Perfil
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "notificaciones" && "active"}`}
            onClick={() => setTab("notificaciones")}
          >
            Notificaciones
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {tab === "perfil" && (
          <div className="card card-body">
            <h5 className="mb-3">Perfil del Usuario</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={perfil.nombres}
                  onChange={(e) =>
                    setPerfil({ ...perfil, nombres: e.target.value })
                  }
                  placeholder="Tu nombre"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  value={perfil.apellidos}
                  onChange={(e) =>
                    setPerfil({ ...perfil, apellidos: e.target.value })
                  }
                  placeholder="Tu apellido"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Correo Electrónico</label>
                <input
                  className="form-control"
                  value={perfil.correo}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={perfil.celular || ""}
                  onChange={(e) =>
                    setPerfil({ ...perfil, celular: e.target.value })
                  }
                  placeholder="+502 5555-1234"
                />
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={guardarPerfil}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar perfil"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "notificaciones" && (
          <div className="card card-body">
            <h5 className="mb-3">Notificaciones</h5>
            {[
              { key: "push", label: "Alertas de Presupuesto" }, // ✅ corregido
              { key: "tips", label: "Consejos Financieros" },
            ].map(({ key, label }) => (
              <div className="form-check form-switch mb-2" key={key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!notificaciones[key]}
                  onChange={(e) => toggleNotif(key, e.target.checked)}
                />
                <label className="form-check-label">{label}</label>
              </div>
            ))}
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary mt-2"
                onClick={guardarConfig}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar notificaciones"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionUsuario;