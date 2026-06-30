const express = require("express");
const cors = require("cors");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const logger = require("./utils/logger");
const { FRONTEND_URL } = require("./utils/urls");
const db = require("./config/db");

require("./config/passport");

require("./cron");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.disable("x-powered-by");

// ─────────────────────────────────────
// Rate limit IA
// ─────────────────────────────────────
const iaLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    mensaje: "Demasiadas solicitudes al asistente.",
  },
});

// ─────────────────────────────────────
// Rate limit Escáner IA
// ─────────────────────────────────────
const escanerLimiter = rateLimit({

  windowMs:
    5 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    mensaje:
      "Demasiados escaneos. Intenta más tarde.",
  },

});

// ─────────────────────────────────────
// Middleware
// ─────────────────────────────────────
app.use(cookieParser());

app.use(pinoHttp({
  logger,
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization"],
    censor: "[REDACTED]",
  },
}));

app.use(helmet());

// ─────────────────────────────────────
// CORS
// ─────────────────────────────────────
const allowedOrigins = [
  FRONTEND_URL,

  process.env.CLIENT_URL,

  "https://misaldo.lat",

  "https://www.misaldo.lat",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Sin header Origin = navegación directa del browser (OAuth, links, etc.) → permitir
      if (!origin) return callback(null, true);

      // Origin: "null" (string) = petición desde file:// o iframe sandboxed → bloquear en producción
      if (origin === "null") {
        if (process.env.NODE_ENV !== "production") return callback(null, true);
        return callback(new Error("No permitido por CORS"));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("No permitido por CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─────────────────────────────────────
// Limitar JSON
// ─────────────────────────────────────
app.use(
  express.json({
    limit: "2mb",
  }),
);

// ─────────────────────────────────────
// Session
// ─────────────────────────────────────
app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());

app.use(passport.session());

// ─────────────────────────────────────
// Health check
// ─────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// ─────────────────────────────────────
// Rutas
// ─────────────────────────────────────
app.use("/auth", require("./routes/auth"));

app.use("/asistente", iaLimiter, require("./routes/asistente"));

app.use(
  "/escaner-ia",
  escanerLimiter,
  require("./routes/escanerIA")
);

app.use("/finanzas", require("./routes/finanzas"));

app.use("/configuraciones", require("./routes/configuracionesRoutes"));

app.use("/ahorro", require("./routes/ahorro"));

app.use("/admin", require("./routes/admin"));

app.use("/notificaciones", require("./routes/notificacionesRoutes"));

app.use("/categorias", require("./routes/categorias"));

app.use("/ingresos-fijos", require("./routes/ingresosFijos"));

app.use("/gastos-fijos", require("./routes/gastosFijos"));

// ─────────────────────────────────────
// Error handler global
// ─────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  logger.error({ err, method: req.method, path: req.path, status }, err.message);

  res.status(status).json({
    mensaje: status === 500 ? "Error interno del servidor" : err.message,
  });
});

module.exports = app;
