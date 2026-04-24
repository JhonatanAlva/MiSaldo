const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const configuracionesController = require('../controllers/configuracionesController');

router.get('/', verificarToken, configuracionesController.getConfiguracion);
router.put('/', verificarToken, configuracionesController.guardarConfiguracion);
router.put('/usuario', verificarToken, configuracionesController.actualizarPerfil);
router.put('/password', verificarToken, configuracionesController.cambiarPassword);

module.exports = router;