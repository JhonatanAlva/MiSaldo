const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// BASE URL dinámica
const BASE_URL = isProduction
  ? process.env.BASE_URL   // Railway
  : 'http://localhost:5000';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  // AQUÍ ESTÁ LA CLAVE
  callbackURL: `${BASE_URL}/auth/google/callback`

}, async (accessToken, refreshToken, profile, done) => {

  const correo = profile.emails[0].value;

  try {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    const usuario = result.rows[0];

    // ❌ usuario inválido
    if (usuario && (!usuario.contrasena || usuario.contrasena.trim() === '')) {
      return done(null, false, {
        message: 'Tu cuenta fue eliminada o no está activa. Regístrate manualmente.'
      });
    }

    // usuario válido
    if (usuario) {
      return done(null, usuario);
    }

    //  no existe
    return done(null, false, {
      message: 'Debes registrarte manualmente antes de usar Google.'
    });

  } catch (err) {
    return done(err);
  }
}));

// ── SESSION ─────────────────────────────
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});