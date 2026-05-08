import { createContext, useEffect, useState } from 'react';
import { getUsuario, logout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeLogout, setMensajeLogout] = useState(null);

  const verificarUsuario = async () => {
    try {
      const res = await getUsuario();
      setUsuario(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error al verificar usuario:', err);
      }
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {

      // Limpiar sesiones temporales
      sessionStorage.removeItem("asistente_ia_chat");
      sessionStorage.removeItem("scanner_resultado");

      await logout();

      setUsuario(null);

      setMensajeLogout(
        'Sesión cerrada correctamente.'
      );

      setTimeout(() => {

        setMensajeLogout(null);

        window.location.href = '/login';

      }, 2000);

    } catch (err) {

      console.error(
        'Error al cerrar sesión:',
        err
      );

      setMensajeLogout(
        'Error al cerrar sesión.'
      );

      setTimeout(
        () => setMensajeLogout(null),
        3000
      );
    }
  };

  useEffect(() => {
    verificarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando, verificarUsuario, cerrarSesion, mensajeLogout }}>
      {children}
    </AuthContext.Provider>
  );
};