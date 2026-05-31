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
      {
        rel: "icon",
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%B3%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
      { rel: "stylesheet", href: picoCss },
      { rel: "stylesheet", href: compactCss },
    ],
  }),
  component: RootComponent,
});
