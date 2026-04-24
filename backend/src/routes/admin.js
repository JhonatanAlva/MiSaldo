const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../utils/jwt');
const adminController = require('../controllers/adminController');

// ── Usuarios ──────────────────────────────────────────────────
router.get('/usuarios', verificarToken, verificarAdmin, adminController.listarUsuarios);
router.put('/usuarios/:id', verificarToken, verificarAdmin, adminController.actualizarUsuario);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, adminController.eliminarUsuario);
router.put('/usuarios/:id/contrasena', verificarToken, verificarAdmin, adminController.cambiarContrasena);
router.post('/usuarios/:id/reenviar-confirmacion', verificarToken, verificarAdmin, adminController.reenviarConfirmacion);
router.put('/usuarios/:id/estado', verificarToken, verificarAdmin, adminController.cambiarEstado);
router.get('/usuarios/:id/bitacora', verificarToken, verificarAdmin, adminController.getBitacoraUsuario);

// ── Actividad y estadísticas ──────────────────────────────────
router.get('/actividad/general', verificarToken, verificarAdmin, adminController.getActividadGeneral);
router.get('/actividad', verificarToken, verificarAdmin, adminController.getActividad);
router.get('/actividad-datos', verificarToken, verificarAdmin, adminController.getActividadDatos);
router.get('/estadisticas/operaciones', verificarToken, verificarAdmin, adminController.getEstadisticasOperaciones);
router.get('/estadisticas/evolucion-mensual', verificarToken, verificarAdmin, adminController.getEvolucionMensual);

module.exports = router;