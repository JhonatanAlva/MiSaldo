const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const correo   = profile.emails[0].value;

  try {
    const result  = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    const usuario = result.rows[0];

    // Si existe pero no tiene contraseña, bloqueamos
    if (usuario && (!usuario.contrasena || usuario.contrasena.trim() === '')) {
      return done(null, false, { message: 'Tu cuenta fue eliminada o no está activa. Por favor regístrate manualmente.' });
    }

    // Si existe y es válido, lo dejamos pasar
    if (usuario) {
      return done(null, usuario);
    }

    // Si no existe, obligamos a registrarse manualmente
    return done(null, false, { message: 'Debes registrarte manualmente antes de usar Google.' });

  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});