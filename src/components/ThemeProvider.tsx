import { type ReactNode, useEffect } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

// Dark mode only - no theme switching
export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Ensure dark mode is always set
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return <>{children}</>;
}
