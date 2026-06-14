import api from '../services/api';

// Fetches all drivers for the current user. The backend has always supported
// this endpoint, so there is no per-vehicle fallback.
export const fetchDrivers = async () => {
  const res = await api.get('/drivers');
  return res.data || [];
};