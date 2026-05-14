export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "ul_theme_mode";

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === "light" || value === "dark" || value === "system";
};

export const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(raw) ? raw : "system";
};

export const saveThemeMode = (mode: ThemeMode) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
};

const resolveTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const applyThemeMode = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;
  const nextTheme = resolveTheme(mode);
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
};
