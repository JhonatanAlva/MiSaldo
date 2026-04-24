const finanzasService = require('../services/finanzasService');

const agregarIngreso = async (req, res) => {
    try {
        await finanzasService.agregarIngreso(req.usuario.id, req.body);
        res.json({ mensaje: 'Ingreso registrado correctamente' });
    } catch (err) {
        console.error('Error al guardar ingreso:', err);
        res.status(500).json({ mensaje: 'Error al guardar ingreso' });
    }
};

const agregarGasto = async (req, res) => {
    if (!req.body.categoria_id) {
        return res.status(400).json({ mensaje: 'La categoría es obligatoria' });
    }
    try {
        await finanzasService.agregarGasto(req.usuario.id, req.body);
        res.json({ mensaje: 'Gasto registrado correctamente' });
    } catch (err) {
        console.error('Error al guardar gasto:', err);
        res.status(500).json({ mensaje: 'Error al guardar gasto' });
    }
};

const getIngresos = async (req, res) => {
    try {
        const data = await finanzasService.getIngresos(req.usuario.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener ingresos' });
    }
};

const getGastos = async (req, res) => {
    try {
        const data = await finanzasService.getGastos(req.usuario.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener gastos' });
    }
};

const getResumen = async (req, res) => {
    try {
        const data = await finanzasService.getResumen(req.usuario.id, req.query);
        if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
        res.json(data);
    } catch (err) {
        console.error('Error al obtener resumen:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const getMovimientosRecientes = async (req, res) => {
    try {
        const data = await finanzasService.getMovimientosRecientes(req.usuario.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener movimientos recientes' });
    }
};

const crearCategoriaLocal = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ mensaje: 'Nombre de categoría es requerido' });
    }
    try {
        const id = await finanzasService.crearCategoriaLocal(req.usuario.id, nombre);
        res.json({ id });
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al crear categoría' });
    }
};

const getCategorias = async (req, res) => {
    try {
        const data = await finanzasService.getCategorias(req.usuario.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
};

const getClasificacionGastos = async (req, res) => {
    try {
        const data = await finanzasService.getClasificacionGastos(req.usuario.id);
        res.json(data);
    } catch (err) {
        console.error('Error en clasificacion-gastos:', err);
        res.status(500).json({ mensaje: 'Error al clasificar gastos' });
    }
};

const getClasificacionIngresos = async (req, res) => {
    try {
        const data = await finanzasService.getClasificacionIngresos(req.usuario.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al clasificar ingresos' });
    }
};

const getBalance = async (req, res) => {
    try {
        const data = await finanzasService.getBalance(req.usuario.id, req.query);
        res.json(data);
    } catch (err) {
        console.error('Error al obtener balance:', err);
        res.status(500).json({ mensaje: 'Error al obtener balance' });
    }
};

const getHistorial = async (req, res) => {
    try {
        const data = await finanzasService.getHistorial(req.usuario.id, req.query);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

const eliminarMovimiento = async (req, res) => {
    try {
        const data = await finanzasService.eliminarMovimiento(req.params.tipo, req.params.id);
        if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
        res.json({ mensaje: 'Movimiento eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al eliminar movimiento' });
    }
};

const editarMovimiento = async (req, res) => {
    try {
        const data = await finanzasService.editarMovimiento(req.params.tipo, req.params.id, req.body);
        if (data.error) return res.status(data.error).json({ mensaje: data.mensaje });
        res.json({ mensaje: 'Movimiento actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al actualizar movimiento' });
    }
};

module.exports = {
    agregarIngreso,
    agregarGasto,
    getIngresos,
    getGastos,
    getResumen,
    getMovimientosRecientes,
    crearCategoriaLocal,
    getCategorias,
    getClasificacionGastos,
    getClasificacionIngresos,
    getBalance,
    getHistorial,
    eliminarMovimiento,
    editarMovimiento,
};