import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SpinnerCentrado from '../ui/SpinnerCentrado';

const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);
  if (cargando) return <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center"><SpinnerCentrado /></div>;
  if (!usuario || usuario.rol !== 'Administrador') return <Navigate to="/login" />;
  return children;
};

export default RutaAdmin;