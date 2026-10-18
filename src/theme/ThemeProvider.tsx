import { useMemo, useState, type ReactNode } from "react";
import cx from "clsx";
import { vars } from "./theme.css";
import { ThemeContext, themes, type ThemeName } from "./ThemeContext";
import { root } from "./ThemeProvider.css";

interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  className?: string;
  children: ReactNode;
}

export function ThemeProvider({
  defaultTheme = "light",
  className,
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme);
  const value = useMemo(() => ({ theme, setTheme, vars }), [theme]);

  return (
    <ThemeContext value={value}>
      <div className={cx(themes[theme], root, className)}>{children}</div>
    </ThemeContext>
  );
}
