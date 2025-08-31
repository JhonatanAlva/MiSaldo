const express = require("express");
const router = express.Router();
const { manejarAsistente } = require("../controllers/asistenteController");

const { verificarToken } = require("../utils/jwt");

router.post("/", verificarToken, manejarAsistente);

module.exports = router;