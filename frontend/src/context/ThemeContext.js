import React, { createContext, useContext, useState, useEffect } from 'react';

const lightTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    border: '#dee2e6',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
  }
};

const darkTheme = {
  colors: {
    primary: '#375a7f',
    secondary: '#444444',
    background: '#222222',
    surface: '#333333',
    text: '#ffffff',
    border: '#444444',
    success: '#00a859',
    warning: '#ff9800',
    danger: '#f44a4a',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newIsDark ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);