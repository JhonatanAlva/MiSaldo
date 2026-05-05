const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const notificacionesController = require('../controllers/notificacionesController');

router.get('/estado-presupuesto', verificarToken, notificacionesController.getEstadoPresupuesto);
router.get('/tip', verificarToken, notificacionesController.getTip);

module.exports = router;