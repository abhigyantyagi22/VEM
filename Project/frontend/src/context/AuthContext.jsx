import React, { useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired } from '../utils/auth';
import { AuthContext } from './authContextStore';

const readToken = () => {
  const raw = localStorage.getItem('token');
  if (!raw) return null;

  let token = raw;
  if (token.length >= 2 && ((token[0] === '"' && token[token.length - 1] === '"') || (token[0] === '\'' && token[token.length - 1] === '\''))) {
    token = token.slice(1, -1);
  }

  if (token.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(token);
      if (typeof parsed === 'string') return parsed;
      token = parsed.token || parsed.accessToken || parsed.jwt || null;
    } catch {
      return null;
    }
  }

  if (!token || isTokenExpired(token)) {
    return null;
  }

  return token;
};

const readUserId = (token) => {
  try {
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.userId || decoded.sub || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readToken());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setToken(readToken());
      }
    };

    const onSessionExpired = () => {
      localStorage.removeItem('token');
      setToken(null);
    };

    const onAuthChanged = () => setToken(readToken());

    window.addEventListener('storage', onStorage);
    window.addEventListener('sessionExpired', onSessionExpired);
    window.addEventListener('authChanged', onAuthChanged);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sessionExpired', onSessionExpired);
      window.removeEventListener('authChanged', onAuthChanged);
    };
  }, []);

  const value = useMemo(() => ({
    token,
    userId: readUserId(token),
    isAuthenticated: Boolean(token),
    login: (nextToken) => {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    },
    logout: () => {
      localStorage.removeItem('token');
      setToken(null);
    },
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};