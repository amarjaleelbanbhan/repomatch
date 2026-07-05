export type Theme = "dark" | "light" | "transparent";

export interface ThemeColors {
  background: string;
  cardBorder: string;
  title: string;
  subtitle: string;
  reason: string;
}

const THEMES: Record<Theme, ThemeColors> = {
  dark: {
    background: "#0d1117",
    cardBorder: "#30363d",
    title: "#c9d1d9",
    subtitle: "#8b949e",
    reason: "#58a6ff",
  },
  light: {
    background: "#ffffff",
    cardBorder: "#d0d7de",
    title: "#24292f",
    subtitle: "#57606a",
    reason: "#0969da",
  },
  transparent: {
    background: "none",
    cardBorder: "#8b949e",
    title: "#24292f",
    subtitle: "#57606a",
    reason: "#0969da",
  },
};

export function resolveTheme(value: string | null): Theme {
  if (value === "dark" || value === "light" || value === "transparent") return value;
  return "dark";
}

export function getThemeColors(theme: Theme): ThemeColors {
  return THEMES[theme];
}
