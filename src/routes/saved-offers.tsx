import { createFileRoute } from "@tanstack/react-router";

import { SavedOffers } from "../features/saved-offers/saved-offers";

export const Route = createFileRoute("/saved-offers")({
  component: SavedOffers,
});
