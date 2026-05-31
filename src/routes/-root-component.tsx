import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter } from "../components/site-footer";

const themeScript = `
(() => {
  const storageKey = "cc-offers-theme";
  const darkMediaQuery = "(prefers-color-scheme: dark)";

  try {
    const storedTheme = localStorage.getItem(storageKey);
    const theme = storedTheme ? JSON.parse(storedTheme) : "system";
    const resolvedTheme =
      theme === "dark" ||
      (theme === "system" && window.matchMedia(darkMediaQuery).matches)
        ? "dark"
        : "light";

    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {
    const prefersDark = window.matchMedia(darkMediaQuery).matches;

    document.documentElement.classList.toggle("dark", prefersDark);
    document.documentElement.style.colorScheme = prefersDark ? "dark" : "light";
  }
})();
`;

export function RootComponent() {
  return (
    <RootDocument>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <SiteFooter />
      </div>
    </RootDocument>
  );
}

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
