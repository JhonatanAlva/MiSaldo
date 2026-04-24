const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const { manejarAsistente } = require('../controllers/asistenteController');
const { analizarGraficasIA } = require('../controllers/asistenteControlleradmin');
const { analizarFinanzas } = require('../controllers/asistenteController');

router.post('/', verificarToken, manejarAsistente);
router.post('/analizar', verificarToken, analizarGraficasIA);
router.post('/analisis', verificarToken, analizarFinanzas);

module.exports = router;