import axios from 'axios';
import { getValidToken, clearStoredToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://vem-backend-y13y.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getValidToken();
  console.log('[API Request]', config.method?.toUpperCase(), config.url, 'Token:', token ? 'yes (' + token.substring(0, 30) + '...)' : 'no');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API Request] Added Authorization header');
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
    console.log('[API Request] Removed Authorization header');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('[API Error] Status:', error.response.status, 'URL:', error.config?.url);
      // Only logout on 401 Unauthorized, not 403 Forbidden (might be permission issue, not auth issue)
      if (error.response?.status === 401) {
        console.log('[API] 401 Unauthorized - clearing token');
        clearStoredToken();
        // notify app that session expired so UI can show a toast and redirect
        try {
          window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { status: error.response.status } }));
        } catch (e) {
          // ignore in environments where window isn't available
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
