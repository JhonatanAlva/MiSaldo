const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../utils/jwt');
const categoriasController = require('../controllers/categoriasController');

router.post('/', verificarAdmin, categoriasController.crearCategoria);
router.get('/', verificarToken, categoriasController.listarCategorias);
router.put('/:id', verificarAdmin, categoriasController.editarCategoria);
router.delete('/:id', verificarAdmin, categoriasController.eliminarCategoria);
router.get('/uso', verificarAdmin, categoriasController.getUsoCategorias);

module.exports = router;