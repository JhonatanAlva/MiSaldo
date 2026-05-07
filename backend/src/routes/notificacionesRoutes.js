const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const notificacionesController = require('../controllers/notificacionesController');

// ── Existentes ────────────────────────────────────────────────
router.get('/estado-presupuesto', verificarToken, notificacionesController.getEstadoPresupuesto);
router.get('/tip', verificarToken, notificacionesController.getTip);

// ── Nuevas ────────────────────────────────────────────────────
router.get('/app', verificarToken, notificacionesController.getNotificaciones);
router.get('/no-leidas', verificarToken, notificacionesController.contarNoLeidas);
router.put('/:id/leer', verificarToken, notificacionesController.marcarLeida);
router.put('/leer-todo', verificarToken, notificacionesController.marcarTodasLeidas);

module.exports = router;