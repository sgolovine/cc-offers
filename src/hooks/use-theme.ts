import { useEffect, useMemo, useState } from "react";

import { useLocalStorageState } from "./use-local-storage-state";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "cc-offers-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): Exclude<ThemeMode, "system"> {
  if (
    typeof window !== "undefined" &&
    window.matchMedia(DARK_MEDIA_QUERY).matches
  ) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: ThemeMode): Exclude<ThemeMode, "system"> {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  if (typeof document === "undefined") {
    return resolvedTheme;
  }

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorageState<ThemeMode>(
    THEME_STORAGE_KEY,
    "system",
  );
  const [resolvedTheme, setResolvedTheme] =
    useState<Exclude<ThemeMode, "system">>(getSystemTheme);

  useEffect(() => {
    setResolvedTheme(applyTheme(theme));

    if (theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const onSystemThemeChange = () => setResolvedTheme(applyTheme("system"));

    mediaQuery.addEventListener("change", onSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", onSystemThemeChange);
    };
  }, [theme]);

  return useMemo(
    () => ({
      resolvedTheme,
      setTheme,
      theme,
      toggleTheme: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      },
    }),
    [resolvedTheme, setTheme, theme],
  );
}
