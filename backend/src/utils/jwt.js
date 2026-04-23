const jwt = require('jsonwebtoken');

// Verificar token desde cookie
const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

// Verificar si es administrador (rol_id === 1)
const verificarAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol_id !== 1) {
      return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

// Generar token con solo la info necesaria
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol_id: usuario.rol_id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

module.exports = {
  generarToken,
  verificarToken,
  verificarAdmin
};