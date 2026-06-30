import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

const MENSAJES_SILENCIOSOS = [401, 403, 404];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (!MENSAJES_SILENCIOSOS.includes(status) && !isAuthRoute) {
      const mensaje = error.response?.data?.mensaje || 'Ocurrió un error inesperado';
      toast.error(mensaje);
    }

    return Promise.reject(error);
  }
);

export default api;