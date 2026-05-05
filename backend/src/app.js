const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");

require("./config/db");
require("./config/passport");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// ── Middleware ────────────────────────────────────────────────
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
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
app.use("/auth", require("./routes/auth"));
app.use("/finanzas", require("./routes/finanzas"));
app.use("/configuraciones", require("./routes/configuracionesRoutes"));
app.use("/ahorro", require("./routes/ahorro"));
app.use("/admin", require("./routes/admin"));
app.use("/notificaciones", require("./routes/notificacionesRoutes"));
app.use("/asistente", require("./routes/asistente"));
app.use("/categorias", require("./routes/categorias"));

module.exports = app;