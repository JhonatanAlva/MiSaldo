const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const gastosFijosController = require('../controllers/gastosFijosController');

router.get('/', verificarToken, gastosFijosController.getGastosFijos);
router.post('/', verificarToken, gastosFijosController.crearGastoFijo);
router.put('/:id', verificarToken, gastosFijosController.editarGastoFijo);
router.delete('/:id', verificarToken, gastosFijosController.eliminarGastoFijo);

module.exports = router;