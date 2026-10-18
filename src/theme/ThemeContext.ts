import { createContext } from "react";
import { darkTheme, lightTheme, vars } from "./theme.css";

export const themes = { light: lightTheme, dark: darkTheme } as const;

export type ThemeName = keyof typeof themes;

export interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  vars: typeof vars;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
