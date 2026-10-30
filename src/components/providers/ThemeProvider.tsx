"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemeContextValue = {
  isDark: boolean;
  isReady: boolean;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "goodtogether-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const shouldUseDark = document.documentElement.classList.contains("dark");
    const frame = window.requestAnimationFrame(() => {
      setIsDark(shouldUseDark);
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const nextIsDark = !isDark;

    setIsDark(nextIsDark);
    applyTheme(nextIsDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ isDark, isReady, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
