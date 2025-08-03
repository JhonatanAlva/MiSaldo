import React from 'react';

const VistaConfiguracion = () => {
  return (
    <div className="admin-card">
      <h2 className="admin-title">Configuración</h2>
      <p className="admin-subtitle">Ajustes y preferencias del sistema.</p>

      {/* Aquí puedes agregar campos de configuración como idioma, notificaciones, etc. */}
      <form>
        <label htmlFor="idioma">Idioma:</label>
        <select id="idioma" className="admin-search">
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>

        <label htmlFor="notificaciones">Notificaciones:</label>
        <select id="notificaciones" className="admin-search">
          <option value="on">Activadas</option>
          <option value="off">Desactivadas</option>
        </select>

        <button type="submit" className="btn-guardar">Guardar cambios</button>
      </form>
    </div>
  );
};

export default VistaConfiguracion;