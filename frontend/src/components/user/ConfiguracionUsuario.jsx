import React, { useState } from "react";

const ConfiguracionUsuario = () => {
  const [tab, setTab] = useState("perfil");
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    push: true,
    weekly: true,
    monthly: true,
    tips: false,
  });
  const [formato, setFormato] = useState("pdf");

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Configuración</h2>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === "perfil" && "active"}`} onClick={() => setTab("perfil")}>Perfil</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "preferencias" && "active"}`} onClick={() => setTab("preferencias")}>Preferencias</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "notificaciones" && "active"}`} onClick={() => setTab("notificaciones")}>Notificaciones</button>
        </li>
      </ul>

      <div className="tab-content">
        {tab === "perfil" && (
          <div className="card card-body">
            <h5 className="mb-3">Perfil del Usuario</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label>Nombre</label>
                <input className="form-control" placeholder="Tu nombre" defaultValue="Alexis" />
              </div>
              <div className="col-md-6">
                <label>Apellido</label>
                <input className="form-control" placeholder="Tu apellido" defaultValue="Rodríguez" />
              </div>
              <div className="col-md-6">
                <label>Correo Electrónico</label>
                <input type="email" className="form-control" defaultValue="alexis.rodriguez@email.com" />
              </div>
              <div className="col-md-6">
                <label>Teléfono</label>
                <input className="form-control" defaultValue="+502 5555-1234" />
              </div>
            </div>
          </div>
        )}

        {tab === "preferencias" && (
          <div className="card card-body">
            <h5 className="mb-3">Preferencias</h5>
            <div className="mb-3">
              <label>Formato de Exportación</label>
              <select className="form-select" value={formato} onChange={(e) => setFormato(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        )}

        {tab === "notificaciones" && (
          <div className="card card-body">
            <h5 className="mb-3">Notificaciones</h5>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" checked={notificaciones.email} onChange={(e) => setNotificaciones({ ...notificaciones, email: e.target.checked })} />
              <label className="form-check-label">Correo Electrónico</label>
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" checked={notificaciones.push} onChange={(e) => setNotificaciones({ ...notificaciones, push: e.target.checked })} />
              <label className="form-check-label">Notificaciones Push</label>
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" checked={notificaciones.weekly} onChange={(e) => setNotificaciones({ ...notificaciones, weekly: e.target.checked })} />
              <label className="form-check-label">Resumen Semanal</label>
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" checked={notificaciones.monthly} onChange={(e) => setNotificaciones({ ...notificaciones, monthly: e.target.checked })} />
              <label className="form-check-label">Resumen Mensual</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={notificaciones.tips} onChange={(e) => setNotificaciones({ ...notificaciones, tips: e.target.checked })} />
              <label className="form-check-label">Consejos Financieros</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionUsuario;
