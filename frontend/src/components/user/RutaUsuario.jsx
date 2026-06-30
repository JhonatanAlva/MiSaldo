import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SpinnerCentrado from '../ui/SpinnerCentrado';

const RutaUsuario = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-[#111318]"><SpinnerCentrado /></div>;

  if (!usuario) return <Navigate to="/login" />;

  // Si no es usuario normal, redirige también al login
  if (usuario.rol?.toLowerCase() !== "usuario") return <Navigate to="/login" />;

  return children;
};

export default RutaUsuario;
