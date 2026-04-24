const express = require('express');
const router = express.Router();
const { verificarToken } = require('../utils/jwt');
const finanzasController = require('../controllers/finanzasController');

// ── Ingresos ──────────────────────────────────────────────────
router.post('/ingresos', verificarToken, finanzasController.agregarIngreso);
router.get('/ingresos', verificarToken, finanzasController.getIngresos);

// ── Gastos ────────────────────────────────────────────────────
router.post('/gastos', verificarToken, finanzasController.agregarGasto);
router.get('/gastos', verificarToken, finanzasController.getGastos);

// ── Categorías ────────────────────────────────────────────────
router.post('/categoria', verificarToken, finanzasController.crearCategoriaLocal);
router.get('/categorias', verificarToken, finanzasController.getCategorias);

// ── Reportes y gráficas ───────────────────────────────────────
router.get('/resumen', verificarToken, finanzasController.getResumen);
router.get('/movimientos-recientes', verificarToken, finanzasController.getMovimientosRecientes);
router.get('/clasificacion-gastos', verificarToken, finanzasController.getClasificacionGastos);
router.get('/clasificacion-ingresos', verificarToken, finanzasController.getClasificacionIngresos);
router.get('/balance', verificarToken, finanzasController.getBalance);
router.get('/historial', verificarToken, finanzasController.getHistorial);

// ── Movimientos ───────────────────────────────────────────────
router.delete('/movimiento/:tipo/:id', verificarToken, finanzasController.eliminarMovimiento);
router.put('/movimiento/:tipo/:id', verificarToken, finanzasController.editarMovimiento);

module.exports = router;