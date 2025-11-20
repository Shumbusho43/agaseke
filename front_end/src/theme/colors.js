export const lightColors = {
  background: "#f5f5f5",
  surface: "#ffffff",
  primary: "#1565C0",
  secondary: "#00A651",
  text: "#1a1a1a",
  subtitle: "#666666",
  border: "#e5e5e5",
  cardShadow: "rgba(0,0,0,0.05)",
  warning: "#FFB74D",
  success: "#4CAF50",
  danger: "#FF7043",
};

export const darkColors = {
  background: "#121212",
  surface: "#1e1e1e",
  primary: "#4FC3F7",
  secondary: "#81C784",
  text: "#ffffff",
  subtitle: "#b0b0b0",
  border: "#2c2c2c",
  cardShadow: "rgba(0,0,0,0.75)",
  warning: "#FBC02D",
  success: "#66BB6A",
  danger: "#FF8A65",
};

export const navigationThemes = {
  light: {
    dark: false,
    colors: {
      primary: lightColors.primary,
      background: lightColors.background,
      card: lightColors.surface,
      text: lightColors.text,
      border: lightColors.border,
      notification: lightColors.primary,
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: darkColors.primary,
      background: darkColors.background,
      card: darkColors.surface,
      text: darkColors.text,
      border: darkColors.border,
      notification: darkColors.primary,
    },
  },
};
