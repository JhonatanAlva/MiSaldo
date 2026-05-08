const express = require("express");

const router = express.Router();

const upload =
    require("../middleware/upload");

const {
    analizarImagen,
} = require("../controllers/escanerIAController");

const {
    verificarToken,
} = require("../utils/jwt");

// ─────────────────────────────────────
// Escanear imagen IA
// ─────────────────────────────────────
router.post(
    "/",
    verificarToken,
    upload.single("imagen"),
    analizarImagen
);

module.exports = router;