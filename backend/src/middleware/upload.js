const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ─────────────────────────────────────
// Crear carpeta uploads si no existe
// ─────────────────────────────────────
const uploadPath =
  path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, {
    recursive: true,
  });

}

// ─────────────────────────────────────
// Configuración storage
// ─────────────────────────────────────
const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(null, uploadPath);

    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const nombre = crypto.randomUUID() + ext;
      cb(null, nombre);
    },
  });

// ─────────────────────────────────────
// Filtro imágenes
// ─────────────────────────────────────
const EXTENSIONES_PERMITIDAS = [".jpg", ".jpeg", ".png", ".webp"];
const MIMES_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeValido = MIMES_PERMITIDOS.includes(file.mimetype);
  const extValida = EXTENSIONES_PERMITIDAS.includes(ext);

  if (mimeValido && extValida) {
    cb(null, true);
  } else {
    cb(new Error("Formato no permitido"), false);
  }
};

// ─────────────────────────────────────
// Upload
// ─────────────────────────────────────
const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

module.exports = upload;