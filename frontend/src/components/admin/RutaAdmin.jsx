import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PantallaCarga from '../ui/PantallaCarga';

const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);
  if (cargando) return <PantallaCarga />;
  if (!usuario || usuario.rol !== 'Administrador') return <Navigate to="/login" />;
  return children;
};

export default RutaAdmin;