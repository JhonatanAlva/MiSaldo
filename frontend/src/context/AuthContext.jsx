import { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const verificarUsuario = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/usuario', {
        withCredentials: true
      });
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

  const [mensajeLogout, setMensajeLogout] = useState(null);

const cerrarSesion = async () => {
  try {
    await axios.get('http://localhost:5000/auth/logout', { withCredentials: true });
    setUsuario(null);
    setMensajeLogout("Sesión cerrada correctamente.");
    setTimeout(() => {
      setMensajeLogout(null);
      window.location.href = '/login';
    }, 2000);
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    setMensajeLogout("Error al cerrar sesión.");
    setTimeout(() => setMensajeLogout(null), 3000);
  }
};


  useEffect(() => {
    verificarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando, verificarUsuario, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};