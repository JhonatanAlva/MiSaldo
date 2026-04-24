const express   = require('express');
const passport  = require('passport');
const router    = express.Router();
const { verificarToken } = require('../utils/jwt');
const authController = require('../controllers/authController');

// ── Google OAuth ──────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', {
    scope:  ['profile', 'email'],
    prompt: 'select_account',
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback
);

// ── Auth ──────────────────────────────────────────────────────
router.post('/login',            authController.login);
router.get('/logout',            authController.logout);
router.post('/registro',         authController.registro);
router.get('/confirmar/:token',  authController.confirmarCuenta);

// ── Usuario ───────────────────────────────────────────────────
router.get('/usuario',   verificarToken, authController.getUsuario);
router.get('/usuarios',  verificarToken, authController.listarUsuarios);

module.exports = router;