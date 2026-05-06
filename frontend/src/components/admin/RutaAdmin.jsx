import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);
  if (cargando) return <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center text-gray-400">Cargando...</div>;
  if (!usuario || usuario.rol_id !== 1) return <Navigate to="/login" />;
  return children;
};

export default RutaAdmin;