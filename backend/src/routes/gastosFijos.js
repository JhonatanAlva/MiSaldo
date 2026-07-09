const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const idempotency = require('../middleware/idempotency');
const gastosFijosController = require('../controllers/gastosFijosController');

router.get('/', verificarToken, gastosFijosController.getGastosFijos);
router.post('/', verificarToken, idempotency, gastosFijosController.crearGastoFijo);
router.get(
    '/calendario',
    verificarToken,
    gastosFijosController.obtenerCalendario
);
router.get(
    '/:id/historial',
    verificarToken,
    gastosFijosController.obtenerHistorial
);
router.put('/:id', verificarToken, gastosFijosController.editarGastoFijo);
router.delete('/:id', verificarToken, gastosFijosController.eliminarGastoFijo);


module.exports = router;