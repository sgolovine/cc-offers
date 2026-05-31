import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
    routeTree,
    scrollRestoration: true,
  });
}
