import React, { useState, useEffect } from 'react';
import { light, dark } from '../theme/tokens';
import { ThemeContext } from './themeContextStore';

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('vem-theme') !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('vem-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);
  const theme = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};