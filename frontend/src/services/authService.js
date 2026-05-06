import api from './api';

export const login = (correo, contrasena) =>
    api.post('/auth/login', { correo, contrasena });

export const registro = (formulario) =>
    api.post('/auth/registro', formulario);

export const logout = () =>
    api.get('/auth/logout');

export const getUsuario = () =>
    api.get('/auth/usuario');

export const loginGoogle = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${baseURL}/auth/google`;
};