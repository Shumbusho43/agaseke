import { createContext, useContext } from "react";
import { lightColors } from "./colors";

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const useThemeMode = () => useContext(ThemeContext);
