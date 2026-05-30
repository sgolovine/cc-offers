/// <reference types="vite/client" />

import {
  createRootRoute,
} from "@tanstack/react-router";

import compactCss from "../styles/compact.css?url";
import picoCss from "../styles/pico.min.css?url";
import { RootComponent } from "./-root-component";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "CC Offers" },
    ],
    links: [
      { rel: "stylesheet", href: picoCss },
      { rel: "stylesheet", href: compactCss },
    ],
  }),
  component: RootComponent,
});
