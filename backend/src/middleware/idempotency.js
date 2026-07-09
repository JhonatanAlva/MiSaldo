const store = new Map();
const TTL_MS = 30_000;

// Limpia entradas expiradas cada minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, time] of store) {
    if (now - time > TTL_MS) store.delete(key);
  }
}, 60_000).unref();

const idempotency = (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next();

  const userId = req.usuario?.id;
  const storeKey = `${userId}:${key}`;

  if (store.has(storeKey)) {
    return res.status(409).json({ mensaje: 'Solicitud duplicada' });
  }

  store.set(storeKey, Date.now());
  next();
};

module.exports = idempotency;
