import { jwtDecode } from 'jwt-decode';

// The login endpoint returns the raw JWT string, so stored tokens are plain
// strings. We defensively strip surrounding quotes in case an older session
// stored a JSON-stringified value.
const normalizeStoredToken = (raw) => {
    if (!raw) return null;
    if (raw.length >= 2 && raw[0] === '"' && raw[raw.length - 1] === '"') {
        return raw.slice(1, -1);
    }
    return raw;
};

export const isTokenExpired = (token) => {
    try {
        if (!token) return true;
        const decoded = jwtDecode(token);
        return !decoded.exp || decoded.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

export const getValidToken = () => {
    const token = normalizeStoredToken(localStorage.getItem('token'));
    if (!token || isTokenExpired(token)) {
        return null;
    }
    return token;
};

export const clearStoredToken = () => {
    localStorage.removeItem('token');
};