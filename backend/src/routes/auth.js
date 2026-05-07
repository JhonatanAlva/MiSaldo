const express = require("express");

const passport = require("passport");

const rateLimit = require("express-rate-limit");

const router = express.Router();

const { verificarToken } = require("../utils/jwt");

const authController = require("../controllers/authController");

// ─────────────────────────────────────
// Login limiter
// ─────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    mensaje: "Demasiados intentos de login.",
  },
});

// ─────────────────────────────────────
// Registro limiter
// ─────────────────────────────────────
const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    mensaje: "Demasiados registros. Intenta más tarde.",
  },
});

// ─────────────────────────────────────
// Google OAuth
// ─────────────────────────────────────
router.get(
  "/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],

    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",

  passport.authenticate("google", {
    failureRedirect: "/",
  }),

  authController.googleCallback,
);

// ─────────────────────────────────────
// Auth
// ─────────────────────────────────────
router.post(
  "/login",

  loginLimiter,

  authController.login,
);

router.get(
  "/logout",

  authController.logout,
);

router.post(
  "/registro",

  registroLimiter,

  authController.registro,
);

router.get(
  "/confirmar/:token",

  authController.confirmarCuenta,
);

// ─────────────────────────────────────
// Usuario
// ─────────────────────────────────────
router.get(
  "/usuario",

  verificarToken,

  authController.getUsuario,
);

router.get(
  "/usuarios",

  verificarToken,

  authController.listarUsuarios,
);

module.exports = router;
