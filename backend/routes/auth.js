const express = require("express");
const passport = require("passport");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/mailer");
const { generarToken } = require("../utils/jwt");
const { verificarToken } = require("../utils/jwt");
const { registrarBitacora } = require("../utils/bitacora");

// ---------------- GOOGLE AUTH ----------------
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // ⚠️ Verifica si la cuenta está activa
    if (req.user.activo === 0) {
      return res.redirect("http://localhost:5173/login?error=cuenta_inactiva");
    }

    const token = generarToken(req.user);

    //Registrar en bitácora
    registrarBitacora(req.user.id, "Inicio de sesión con Google");

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 60 * 1000,
    });

    const destino =
      req.user.rol_id === 1
        ? "http://localhost:5173/admin"
        : "http://localhost:5173/usuario";

    res.redirect(destino);
  }
);


// ---------------- USUARIO ACTUAL ----------------
router.get("/usuario", verificarToken, (req, res) => {
  const userId = req.usuario.id;

  db.query(
    "SELECT id, nombres, apellidos, correo, celular, rol_id FROM usuarios WHERE id = ?",
    [userId],
    (err, r) => {
      if (err || r.length === 0) {
        return res.status(400).json({ mensaje: "Usuario no encontrado" });
      }
      const u = r[0];
      res.json({
        id: u.id,
        nombres: u.nombres,
        apellidos: u.apellidos,
        correo: u.correo,
        celular: u.celular,                 // <-- ahora sí
        rol: u.rol_id === 1 ? "Administrador" : "Usuario",
      });
    }
  );
});


// ---------------- LOGIN ----------------
router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE correo = ?",
    [correo],
    async (err, results) => {
      if (err) return res.status(500).json({ mensaje: "Error del servidor" });

      if (results.length === 0) {
        return res.status(401).json({ mensaje: "Correo no registrado" });
      }

      const usuario = results[0];

      if (!usuario.confirmado) {
        return res
          .status(403)
          .json({ mensaje: "Debes confirmar tu cuenta desde el correo" });
      }

      const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!coincide) {
        return res.status(401).json({ mensaje: "Contraseña incorrecta" });
      }
      if (usuario.activo === 0) {
        return res.status(403).json({
          mensaje: "Tu cuenta está desactivada. Contacta al administrador.",
        });
      }

      const token = generarToken(usuario);
      const isProduction = process.env.NODE_ENV === "production";
      console.log("👤 Usuario encontrado:", usuario);
      registrarBitacora(usuario.id, "Inicio de sesión");

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 2 * 60 * 60 * 1000,
        })
        .json({
          mensaje: "Inicio de sesión exitoso",
          usuario: {
            nombres: usuario.nombres,
            correo: usuario.correo,
            rol: usuario.rol_id === 1 ? "Administrador" : "Usuario",
          },
        });
    }
  );
});

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.clearCookie("connect.sid");
    res.clearCookie("token");
    res.status(200).json({ mensaje: "Sesión cerrada" });
  });
});

// ---------------- CONFIRMAR CUENTA ----------------
router.get("/confirmar/:token", (req, res) => {
  const token = req.params.token;

  db.query(
    "SELECT * FROM usuarios WHERE token_confirmacion = ?",
    [token],
    (err, resultados) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return res.status(500).send("Error al confirmar cuenta");
      }

      if (resultados.length === 0) {
        return res.status(400).send("Token inválido o expirado");
      }

      const usuarioId = resultados[0].id;
      db.query(
        "UPDATE usuarios SET confirmado = 1, token_confirmacion = NULL WHERE id = ?",
        [usuarioId],
        (err2) => {
          if (err2) {
            console.error("Error al actualizar usuario:", err2);
            return res.status(500).send("Error al confirmar cuenta");
          }

          res.redirect("http://localhost:5173/login?confirmado=1");
        }
      );
    }
  );
});

// ---------------- REGISTRO ----------------
router.post("/registro", async (req, res) => {
  const { nombres, apellidos, correo, celular, contrasena } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE correo = ?",
    [correo],
    async (err, resultados) => {
      if (err) return res.status(500).json({ mensaje: "Error del servidor" });

      if (resultados.length > 0) {
        return res
          .status(400)
          .json({ mensaje: "El correo ya está registrado" });
      }

      try {
        const hash = await bcrypt.hash(contrasena, 10);
        const rol_id = 2;
        const token = uuidv4();
        console.log("Token generado:", token);

        const sql = `
        INSERT INTO usuarios (nombres, apellidos, correo, celular, contrasena, rol_id, token_confirmacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(
          sql,
          [nombres, apellidos, correo, celular, hash, rol_id, token],
          async (err, result) => {
            if (err)
              return res
                .status(500)
                .json({ mensaje: "Error al registrar usuario" });

            const url = `http://localhost:5000/auth/confirmar/${token}`;

            //enviar email
            const html = `
          <h2>¡Bienvenido a MiSaldo, ${nombres}!</h2>
          <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
          <a href="${url}">${url}</a>
        `;

            try {
              await sendEmail(correo, "Confirma tu cuenta en MiSaldo", html);
              res.status(201).json({
                mensaje:
                  "Registro exitoso. Revisa tu correo para confirmar tu cuenta.",
              });
            } catch (error) {
              res.status(500).json({
                mensaje:
                  "Usuario creado, pero ocurrió un error al enviar el correo.",
              });
            }
          }
        );
      } catch (err) {
        res.status(500).json({ mensaje: "Error al procesar el registro" });
      }
    }
  );
});

// ---------------- OBTENER USUARIOS ADMIN ----------------
// router.get('/usuarios', verificarToken, (req, res) => {
//   if (req.usuario.rol_id !== 1) {
//     return res.status(403).json({ mensaje: 'Acceso no autorizado' });
//   }

//   db.query('SELECT id, nombres, apellidos, correo, celular, rol_id, confirmado FROM usuarios', (err, resultados) => {
//     if (err) return res.status(500).json({ mensaje: 'Error al obtener usuarios' });

//     res.json(resultados);
//   });
// });

module.exports = router;
