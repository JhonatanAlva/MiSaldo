const jwt = require('jsonwebtoken');

// Verificar token desde cookie
const verificarToken = (req, res, next) => {
  let token = null;

  // 1. Intentar leer desde Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  //  2. Fallback a cookie (login normal)
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

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
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

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
const generarToken = (usuario, expiresIn = '2h') => {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol_id: usuario.rol_id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

module.exports = {
  generarToken,
  verificarToken,
  verificarAdmin
};