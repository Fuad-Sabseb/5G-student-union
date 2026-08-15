import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Themes: 'cyber' (Futuristic Quantum Cyan & Solar Gold) | 'classic' (Original Union Dusk & Warm Cream)
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('gbsg_theme');
    if (saved === 'classic') return 'classic';
    return 'cyber'; // Default to Futuristic Cyber
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('gbsg_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'cyber' ? 'classic' : 'cyber'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'classic' || newTheme === 'cyber') {
      setThemeState(newTheme);
    }
  };

  const isCyber = theme === 'cyber' || theme === 'cyber-glass';

  return (
    <ThemeContext.Provider
      value={{
        theme: isCyber ? 'cyber' : 'classic',
        isCyber,
        isClassic: !isCyber,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
