import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) return <p>Cargando...</p>;

  if (!usuario) return <Navigate to="/login" />;
  
  if (usuario.rol !== 'Administrador') return <Navigate to="/login" />;


  return children;
};

export default RutaAdmin;