const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const correo = profile.emails[0].value;
  const nombres = profile.name.givenName;
  const apellidos = profile.name.familyName;

  // Buscar si ya existe
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
    if (err) return done(err);

    const usuario = results[0];

    // Si el usuario ya existe pero está incompleto (ej. sin contraseña), lo bloqueamos
    if (usuario && (!usuario.contrasena || usuario.contrasena.trim() === '')) {
      return done(null, false, { message: 'Tu cuenta fue eliminada o no está activa. Por favor regístrate manualmente.' });
    }

    // Si existe y es válido, lo dejamos pasar
    if (usuario) {
      return done(null, usuario);
    }

    // Si no existe, bloqueamos también (obligamos a registrarse manualmente)
    return done(null, false, { message: 'Debes registrarte manualmente antes de usar Google.' });
  });
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, user) => {
    done(err, user[0]);
  });
});