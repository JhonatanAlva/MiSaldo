const express = require("express");

const router = express.Router();

const { verificarToken } = require("../utils/jwt");

const ingresosFijosController = require("../controllers/ingresosFijosController");

// ─────────────────────────────────────
router.get("/", verificarToken, ingresosFijosController.getIngresosFijos);

router.get(
  "/:id/historial",
  verificarToken,
  ingresosFijosController.obtenerHistorial,
);

router.post("/", verificarToken, ingresosFijosController.crearIngresoFijo);

router.put("/:id", verificarToken, ingresosFijosController.editarIngresoFijo);

router.delete(
  "/:id",
  verificarToken,
  ingresosFijosController.eliminarIngresoFijo,
);

module.exports = router;
