import axios from 'axios';
import { getValidToken, clearStoredToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://vem-backend-y13y.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 Unauthorized (not 403, which may be a permission issue).
    if (error.response?.status === 401) {
      clearStoredToken();
      try {
        window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { status: 401 } }));
      } catch {
        // ignore environments where window isn't available
      }
    }
    return Promise.reject(error);
  }
);

export default api;