export type Theme = "dark" | "light" | "transparent";

export interface ThemeColors {
  background: string;
  cardBorder: string;
  title: string;
  subtitle: string;
  accent: string;
  reason: string;
}

const THEMES: Record<Theme, ThemeColors> = {
  dark: {
    background: "#0d1117",
    cardBorder: "#21262d",
    title: "#00d9ff",
    subtitle: "#8b98a9",
    accent: "#00ffa3",
    reason: "#a78bfa",
  },
  light: {
    background: "#ffffff",
    cardBorder: "#d0d7de",
    title: "#0f172a",
    subtitle: "#57606a",
    accent: "#0e7490",
    reason: "#6d28d9",
  },
  transparent: {
    background: "none",
    cardBorder: "#8b98a9",
    title: "#0f172a",
    subtitle: "#57606a",
    accent: "#0e7490",
    reason: "#6d28d9",
  },
};

export function resolveTheme(value: string | null): Theme {
  if (value === "dark" || value === "light" || value === "transparent") return value;
  return "dark";
}

export function getThemeColors(theme: Theme): ThemeColors {
  return THEMES[theme];
}
