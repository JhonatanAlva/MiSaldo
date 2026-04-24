const adminService = require('../services/adminService');

// ── Obtener todos los usuarios ────────────────────────────────
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await adminService.listarUsuarios();
        res.json(usuarios);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

// ── Actualizar usuario ────────────────────────────────────────
const actualizarUsuario = async (req, res) => {
    try {
        await adminService.actualizarUsuario(req.params.id, req.body);
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

// ── Eliminar usuario ──────────────────────────────────────────
const eliminarUsuario = async (req, res) => {
    try {
        await adminService.eliminarUsuario(req.params.id);
        res.json({ mensaje: 'Usuario y datos relacionados eliminados correctamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};

// ── Cambiar contraseña ────────────────────────────────────────
const cambiarContrasena = async (req, res) => {
    try {
        await adminService.cambiarContrasena(req.params.id, req.body.contrasena);
        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
    }
};

// ── Reenviar confirmación ─────────────────────────────────────
const reenviarConfirmacion = async (req, res) => {
    try {
        const data = await adminService.reenviarConfirmacion(req.params.id);
        if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
        res.json({ mensaje: data.mensaje });
    } catch (err) {
        console.error('Error al reenviar confirmación:', err);
        res.status(500).json({ mensaje: 'Error al enviar correo' });
    }
};

// ── Cambiar estado ────────────────────────────────────────────
const cambiarEstado = async (req, res) => {
    try {
        await adminService.cambiarEstado(req.params.id, req.body.activo);
        res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar estado:', err);
        res.status(500).json({ mensaje: 'Error al actualizar el estado' });
    }
};

// ── Bitácora de usuario ───────────────────────────────────────
const getBitacoraUsuario = async (req, res) => {
    try {
        const data = await adminService.getBitacoraUsuario(req.params.id);
        res.json(data);
    } catch (err) {
        console.error('Error al obtener bitácora:', err);
        res.status(500).json({ mensaje: 'Error al obtener actividad' });
    }
};

// ── Actividad general ─────────────────────────────────────────
const getActividadGeneral = async (req, res) => {
    try {
        const data = await adminService.getActividadGeneral();
        res.json(data);
    } catch (err) {
        console.error('Error al obtener actividad general:', err);
        res.status(500).json({ mensaje: 'Error al obtener resumen' });
    }
};

// ── Top 10 actividad ──────────────────────────────────────────
const getActividad = async (req, res) => {
    try {
        const data = await adminService.getActividad();
        res.json(data);
    } catch (err) {
        console.error('Error al obtener actividad:', err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// ── Actividad de datos ────────────────────────────────────────
const getActividadDatos = async (req, res) => {
    try {
        const data = await adminService.getActividadDatos(req.query.usuario_id);
        res.json(data);
    } catch (err) {
        console.error('Error al obtener actividad de datos:', err);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

// ── Estadísticas por operación ────────────────────────────────
const getEstadisticasOperaciones = async (req, res) => {
    try {
        const data = await adminService.getEstadisticasOperaciones(req.query.usuario_id);
        res.json(data);
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// ── Evolución mensual ─────────────────────────────────────────
const getEvolucionMensual = async (req, res) => {
    try {
        const data = await adminService.getEvolucionMensual(req.query.usuario_id);
        res.json(data);
    } catch (err) {
        console.error('Error al obtener evolución mensual:', err);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
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