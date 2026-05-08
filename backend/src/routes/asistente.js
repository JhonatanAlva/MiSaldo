const express = require('express');

const router = express.Router();

const {
    manejarAsistente,
    analizarFinanzas,
    analizarGastosFijos,
    analizarIngresosFijos,
} = require('../controllers/asistenteController');

const {
    analizarGraficasIA,
} = require('../controllers/asistenteControlleradmin');

const {
    verificarToken,
} = require('../utils/jwt');

// ─────────────────────────────────────
// Chat IA
// ─────────────────────────────────────
router.post(
    '/',
    verificarToken,
    manejarAsistente
);

// ─────────────────────────────────────
// Admin IA
// ─────────────────────────────────────
router.post(
    '/analizar',
    verificarToken,
    analizarGraficasIA
);

// ─────────────────────────────────────
// Finanzas generales
// ─────────────────────────────────────
router.post(
    '/analisis',
    verificarToken,
    analizarFinanzas
);

// ─────────────────────────────────────
// IA → gastos fijos
// ─────────────────────────────────────
router.post(
    '/analisis-gastos-fijos',
    verificarToken,
    analizarGastosFijos
);

// ─────────────────────────────────────
// IA → ingresos + gastos fijos
// ─────────────────────────────────────
router.post(
    '/analisis-ingresos-fijos',
    verificarToken,
    analizarIngresosFijos
);

module.exports = router;