const categoriasService = require('../services/categoriasService');
const logger = require('../utils/logger');

// ── Crear categoría ───────────────────────────────────────────
const crearCategoria = async (req, res) => {
    const { nombre, descripcion, es_global } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    try {
        const id = await categoriasService.crearCategoria(req.usuario.id, { nombre, descripcion, es_global });
        res.json({ id, mensaje: 'Categoría creada correctamente' });
    } catch (err) {
        logger.error({ err }, 'Error al crear categoría');
        res.status(500).json({ mensaje: 'Error al crear categoría' });
    }
};

// ── Listar categorías ─────────────────────────────────────────
const listarCategorias = async (req, res) => {
    try {
        const data = await categoriasService.listarCategorias(req.usuario.id);
        res.json(data);
    } catch (err) {
        logger.error({ err }, 'Error al obtener categorías');
        res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
};

// ── Editar categoría ──────────────────────────────────────────
const editarCategoria = async (req, res) => {
    const { nombre, descripcion, es_global } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    try {
        const filas = await categoriasService.editarCategoria(req.params.id, { nombre, descripcion, es_global });
        if (filas === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        res.json({ mensaje: 'Categoría actualizada correctamente' });
    } catch (err) {
        logger.error({ err }, 'Error al editar categoría');
        res.status(500).json({ mensaje: 'Error al editar categoría' });
    }
};

// ── Eliminar categoría ────────────────────────────────────────
const eliminarCategoria = async (req, res) => {
    try {
        const filas = await categoriasService.eliminarCategoria(req.params.id);
        if (filas === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (err) {
        logger.error({ err }, 'Error al eliminar categoría');
        res.status(500).json({ mensaje: 'Error al eliminar categoría' });
    }
};

// ── Uso de categorías ─────────────────────────────────────────
const getUsoCategorias = async (req, res) => {
    try {
        const data = await categoriasService.getUsoCategorias();
        res.json(data);
    } catch (err) {
        logger.error({ err }, 'Error al obtener uso de categorías');
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

module.exports = {
    crearCategoria,
    listarCategorias,
    editarCategoria,
    eliminarCategoria,
    getUsoCategorias,
};