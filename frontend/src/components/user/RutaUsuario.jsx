import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RutaUsuario = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);

  console.log("Usuario:", usuario);

  if (cargando) return <p>Cargando...</p>;

  if (!usuario) return <Navigate to="/login" />;

  // Si no es usuario normal, redirige también al login
  if (usuario.rol?.toLowerCase() !== "usuario") return <Navigate to="/login" />;

  return children;
};

export default RutaUsuario;
