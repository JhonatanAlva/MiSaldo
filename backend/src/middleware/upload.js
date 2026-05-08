const multer = require("multer");

const path = require("path");

const fs = require("fs");

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

    filename: (
      req,
      file,
      cb
    ) => {

      const nombre =
        Date.now() +
        "-" +
        file.originalname
          .replace(/\s+/g, "-");

      cb(null, nombre);

    },
  });

// ─────────────────────────────────────
// Filtro imágenes
// ─────────────────────────────────────
const fileFilter = (
  req,
  file,
  cb
) => {

  const tiposPermitidos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    tiposPermitidos.includes(
      file.mimetype
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Formato no permitido"
      ),
      false
    );

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