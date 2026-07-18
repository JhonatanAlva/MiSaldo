import api from './api';

// Usuarios
export const getUsuarios = () => api.get('/admin/usuarios');
export const actualizarUsuario = (id, data) => api.put(`/admin/usuarios/${id}`, data);
export const eliminarUsuario = (id) => api.delete(`/admin/usuarios/${id}`);
export const cambiarContrasena = (id, contrasena) => api.put(`/admin/usuarios/${id}/contrasena`, { contrasena });
export const reenviarConfirmacion = (id) => api.post(`/admin/usuarios/${id}/reenviar-confirmacion`);
export const cambiarEstado = (id, activo) => api.put(`/admin/usuarios/${id}/estado`, { activo });
export const getBitacoraUsuario = (id) => api.get(`/admin/usuarios/${id}/bitacora`);

// Estadísticas
export const getActividadDatos = (usuarioId) =>
    api.get('/admin/actividad-datos', { params: usuarioId ? { usuario_id: usuarioId } : {} });
export const getEstadisticasOperaciones = (usuarioId) =>
    api.get('/admin/estadisticas/operaciones', { params: usuarioId ? { usuario_id: usuarioId } : {} });
export const getEvolucionMensual = (usuarioId) =>
    api.get('/admin/estadisticas/evolucion-mensual', { params: usuarioId ? { usuario_id: usuarioId } : {} });

// IA
export const analizarConIA = (datos) => api.post('/asistente/analizar', datos);

// Categorías
export const getCategorias = () => api.get('/categorias');
export const getUsoCategorias = () => api.get('/categorias/uso');
export const crearCategoria = (data) => api.post('/categorias', data);
export const editarCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const eliminarCategoria = (id) => api.delete(`/categorias/${id}`);

// Configuración del sistema
export const getConfiguracion = () => api.get('/admin/configuracion');
export const guardarConfiguracion = (data) => api.put('/admin/configuracion', data);