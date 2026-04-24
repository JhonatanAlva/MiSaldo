const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/mailer');

// ── Obtener todos los usuarios ────────────────────────────────
const listarUsuarios = async () => {
    const result = await db.query('SELECT * FROM usuarios');
    return result.rows.map(u => ({ ...u, activo: Boolean(u.activo) }));
};

// ── Actualizar usuario ────────────────────────────────────────
const actualizarUsuario = async (id, { nombres, apellidos, celular, rol_id }) => {
    await db.query(
        `UPDATE usuarios SET nombres = $1, apellidos = $2, celular = $3, rol_id = $4 WHERE id = $5`,
        [nombres, apellidos, celular, rol_id, id]
    );
};

// ── Eliminar usuario y datos relacionados ─────────────────────
// Las FK con ON DELETE CASCADE en plan_ahorro y abonos_ahorro
// se encargan de los hijos; esto lo hacemos explícito por claridad.
const eliminarUsuario = async (id) => {
    await db.query('DELETE FROM abonos_ahorro WHERE usuario_id = $1', [id]);
    await db.query('DELETE FROM plan_ahorro   WHERE usuario_id = $1', [id]);
    await db.query('DELETE FROM usuarios      WHERE id = $1', [id]);
};

// ── Cambiar contraseña ────────────────────────────────────────
const cambiarContrasena = async (id, contrasena) => {
    const hash = await bcrypt.hash(contrasena, 10);
    await db.query('UPDATE usuarios SET contrasena = $1 WHERE id = $2', [hash, id]);
};

// ── Reenviar confirmación ─────────────────────────────────────
const reenviarConfirmacion = async (id) => {
    const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return { error: 404, mensaje: 'Usuario no encontrado' };
    }

    const usuario = result.rows[0];
    let token = usuario.token_confirmacion;

    if (!token) {
        token = uuidv4();
        await db.query(
            'UPDATE usuarios SET token_confirmacion = $1 WHERE id = $2',
            [token, id]
        );
    }

    const url = `http://localhost:5000/auth/confirmar/${token}`;
    const html = `
    <h2>Hola ${usuario.nombres},</h2>
    <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
    <a href="${url}">${url}</a>
  `;

    await sendEmail(usuario.correo, 'Reenvío de confirmación de cuenta', html);
    return { mensaje: 'Correo de confirmación reenviado correctamente' };
};

// ── Cambiar estado activo/inactivo ────────────────────────────
const cambiarEstado = async (id, activo) => {
    await db.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [activo, id]);
};

// ── Bitácora de un usuario ────────────────────────────────────
const getBitacoraUsuario = async (id) => {
    const result = await db.query(
        'SELECT tipo, descripcion, fecha FROM bitacora WHERE usuario_id = $1 ORDER BY fecha DESC',
        [id]
    );
    return result.rows;
};

// ── Actividad general (para gráfica) ─────────────────────────
const getActividadGeneral = async () => {
    const result = await db.query(`
    SELECT u.nombres, COUNT(b.id) AS total
    FROM bitacora b
    JOIN usuarios u ON u.id = b.usuario_id
    GROUP BY b.usuario_id, u.nombres
  `);
    return result.rows;
};

// ── Top 10 actividad ──────────────────────────────────────────
const getActividad = async () => {
    const result = await db.query(`
    SELECT u.nombres AS usuario, COUNT(b.id) AS acciones
    FROM bitacora b
    JOIN usuarios u ON b.usuario_id = u.id
    GROUP BY b.usuario_id, u.nombres
    ORDER BY acciones DESC
    LIMIT 10
  `);
    return result.rows;
};

// ── Actividad de datos (ingresos + gastos + ahorro) ───────────
const getActividadDatos = async (usuarioId) => {
    if (usuarioId) {
        const result = await db.query(`
      SELECT
        u.id,
        CONCAT(u.nombres, ' ', u.apellidos) AS usuario,
        (SELECT COUNT(*) FROM ingresos   WHERE usuario_id = u.id) +
        (SELECT COUNT(*) FROM gastos     WHERE usuario_id = u.id) +
        (SELECT COUNT(*) FROM plan_ahorro WHERE usuario_id = u.id) AS acciones
      FROM usuarios u
      WHERE u.id = $1
    `, [usuarioId]);
        return result.rows;
    }

    const result = await db.query(`
    SELECT
      u.id,
      CONCAT(u.nombres, ' ', u.apellidos) AS usuario,
      (SELECT COUNT(*) FROM ingresos    WHERE usuario_id = u.id) +
      (SELECT COUNT(*) FROM gastos      WHERE usuario_id = u.id) +
      (SELECT COUNT(*) FROM plan_ahorro WHERE usuario_id = u.id) AS acciones
    FROM usuarios u
    WHERE u.rol_id != 1
    ORDER BY acciones DESC
    LIMIT 10
  `);
    return result.rows;
};

// ── Estadísticas por tipo de operación ───────────────────────
const getEstadisticasOperaciones = async (usuarioId) => {
    if (usuarioId) {
        const result = await db.query(`
      SELECT tipo, COUNT(*) AS cantidad
      FROM (
        SELECT 'Ingreso' AS tipo FROM ingresos    WHERE usuario_id = $1
        UNION ALL
        SELECT 'Gasto'   AS tipo FROM gastos      WHERE usuario_id = $1
        UNION ALL
        SELECT 'Ahorro'  AS tipo FROM plan_ahorro WHERE usuario_id = $1
      ) operaciones
      GROUP BY tipo
    `, [usuarioId]);
        return result.rows;
    }

    const result = await db.query(`
    SELECT tipo, COUNT(*) AS cantidad
    FROM (
      SELECT 'Ingreso' AS tipo FROM ingresos
      UNION ALL
      SELECT 'Gasto'   AS tipo FROM gastos
      UNION ALL
      SELECT 'Ahorro'  AS tipo FROM plan_ahorro
    ) operaciones
    GROUP BY tipo
  `);
    return result.rows;
};

// ── Evolución mensual ─────────────────────────────────────────
// DATE_FORMAT de MySQL → TO_CHAR en PostgreSQL
const getEvolucionMensual = async (usuarioId) => {
    if (usuarioId) {
        const result = await db.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, 'Ingreso' AS tipo, COUNT(*) AS cantidad
      FROM ingresos WHERE usuario_id = $1 GROUP BY mes
      UNION
      SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, 'Gasto' AS tipo, COUNT(*) AS cantidad
      FROM gastos WHERE usuario_id = $1 GROUP BY mes
      UNION
      SELECT TO_CHAR(fecha_inicio, 'YYYY-MM') AS mes, 'Ahorro' AS tipo, COUNT(*) AS cantidad
      FROM plan_ahorro WHERE usuario_id = $1 GROUP BY mes
      ORDER BY mes ASC
    `, [usuarioId]);
        return result.rows;
    }

    const result = await db.query(`
    SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, 'Ingreso' AS tipo, COUNT(*) AS cantidad
    FROM ingresos GROUP BY mes
    UNION
    SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, 'Gasto' AS tipo, COUNT(*) AS cantidad
    FROM gastos GROUP BY mes
    UNION
    SELECT TO_CHAR(fecha_inicio, 'YYYY-MM') AS mes, 'Ahorro' AS tipo, COUNT(*) AS cantidad
    FROM plan_ahorro GROUP BY mes
    ORDER BY mes ASC
  `);
    return result.rows;
};

module.exports = {
    listarUsuarios,
    actualizarUsuario,
    eliminarUsuario,
    cambiarContrasena,
    reenviarConfirmacion,
    cambiarEstado,
    getBitacoraUsuario,
    getActividadGeneral,
    getActividad,
    getActividadDatos,
    getEstadisticasOperaciones,
    getEvolucionMensual,
};