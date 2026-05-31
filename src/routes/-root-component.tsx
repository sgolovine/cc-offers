import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter } from "../components/site-footer";

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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
