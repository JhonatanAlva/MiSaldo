const express = require("express");
const router = express.Router();
const { verificarToken } = require("../utils/jwt");
const {
  getEstadoPresupuesto,
  getTip,
} = require("../controllers/notificacionesController");

router.get("/estado-presupuesto", verificarToken, getEstadoPresupuesto);
router.get("/tip", verificarToken, getTip);

module.exports = router;