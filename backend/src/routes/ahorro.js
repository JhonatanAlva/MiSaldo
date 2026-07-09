const express = require("express");
const router = express.Router();
const { verificarToken } = require("../utils/jwt");
const idempotency = require("../middleware/idempotency");
const {
  getTodos,
  getPlan,
  crearPlan,
  editarPlan,
  agregarAbono,
  eliminarPlan,
  getTotalAhorrado,
  getTendencia,
} = require("../controllers/ahorroController");

router.get("/todos", verificarToken, getTodos);
router.get("/plan", verificarToken, getPlan);
router.get("/total-ahorrado/:planId", verificarToken, getTotalAhorrado);
router.get("/tendencia", verificarToken, getTendencia);
router.post("/", verificarToken, idempotency, crearPlan);
router.post("/abono", verificarToken, idempotency, agregarAbono);
router.put("/:id", verificarToken, editarPlan);
router.delete("/:id", verificarToken, eliminarPlan);

module.exports = router;