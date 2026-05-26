import { jwtDecode } from 'jwt-decode';

const normalizeStoredToken = (raw) => {
    if (!raw) return null;
    let t = raw;
    if (t.length >= 2 && ((t[0] === '"' && t[t.length - 1] === '"') || (t[0] === '\'' && t[t.length - 1] === '\''))) {
        t = t.slice(1, -1);
    }
    if (t.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(t);
            if (parsed) {
                if (typeof parsed === 'string') return parsed;
                return parsed.token || parsed.accessToken || parsed.jwt || null;
            }
        } catch (e) {
            return null;
        }
    }
    return t;
};

export const isTokenExpired = (token) => {
    try {
        if (!token) return true;
        const decoded = jwtDecode(token);
        return !decoded.exp || decoded.exp * 1000 <= Date.now();
    } catch (e) {
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

export const getUserId = () => {
    try {
        const token = getValidToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.userId || decoded.sub || null;
    } catch (e) {
        return null;
    }
};