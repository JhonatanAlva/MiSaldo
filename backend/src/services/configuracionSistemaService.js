const db = require('../config/db');
const { invalidarCacheMantenimiento } = require('../middleware/mantenimiento');

const CLAVES_PERMITIDAS = new Set([
  'registro_abierto',
  'intentos_login',
  'expiracion_sesion',
  'notif_nuevo_usuario',
  'notif_errores',
  'modo_mantenimiento',
]);

const getConfiguracion = async () => {
  const res = await db.query(
    'SELECT clave, valor FROM configuracion_sistema ORDER BY clave'
  );
  const config = {};
  for (const row of res.rows) {
    config[row.clave] = row.valor;
  }
  return config;
};

const guardarConfiguracion = async (data) => {
  const entradas = Object.entries(data).filter(([clave]) =>
    CLAVES_PERMITIDAS.has(clave)
  );

  for (const [clave, valor] of entradas) {
    await db.query(
      `INSERT INTO configuracion_sistema (clave, valor, actualizado_en)
       VALUES ($1, $2, NOW())
       ON CONFLICT (clave) DO UPDATE SET valor = $2, actualizado_en = NOW()`,
      [clave, String(valor)]
    );
  }

  // Si se tocó modo_mantenimiento, el cache debe refrescarse de inmediato
  if (entradas.some(([clave]) => clave === 'modo_mantenimiento')) {
    invalidarCacheMantenimiento();
  }
};

module.exports = { getConfiguracion, guardarConfiguracion };
