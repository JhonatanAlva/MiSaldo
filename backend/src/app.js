const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const { FRONTEND_URL } = require("./utils/urls");

require("./config/db");
require("./config/passport");

require("./cron");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

app.set('trust proxy', 1);

// ── Middleware ────────────────────────────────────────────────
app.use(cookieParser());

const allowedOrigins = [
  FRONTEND_URL,
  process.env.CLIENT_URL,
  "https://misaldo.lat",
  "https://www.misaldo.lat",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave_secreta",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ── Rutas ─────────────────────────────────────────────────────
app.use("/auth",           require("./routes/auth"));
app.use("/finanzas",       require("./routes/finanzas"));
app.use("/configuraciones",require("./routes/configuracionesRoutes"));
app.use("/ahorro",         require("./routes/ahorro"));
app.use("/admin",          require("./routes/admin"));
app.use("/notificaciones", require("./routes/notificacionesRoutes"));
app.use("/asistente",      require("./routes/asistente"));
app.use("/categorias",     require("./routes/categorias"));

app.use("/gastos-fijos",   require("./routes/gastosFijos"));

module.exports = app;