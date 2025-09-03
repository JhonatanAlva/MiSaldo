const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/db');
require('./config/passport');

const app = express();

// Middleware
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(session({
  secret: 'clave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/auth', require('./routes/auth'));
app.use('/finanzas', require('./routes/finanzas'));
app.use('/configuraciones', require('./routes/configuracionesRoutes'));
app.use('/ahorro', require('./routes/ahorro'));
app.use('/admin', require('./routes/admin'));
// app.js o index.js
const notificacionesRoutes = require('./routes/notificacionesRoutes');
app.use('/notificaciones', notificacionesRoutes);
const asistenteRoutes = require('./routes/asistente');
app.use('/asistente', asistenteRoutes);
const categoriasRoutes = require("./routes/categorias");
app.use("/categorias", categoriasRoutes);



// Server
app.listen(process.env.PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT}`);
});