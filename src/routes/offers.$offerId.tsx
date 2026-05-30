import { createFileRoute } from "@tanstack/react-router";

import { OfferDetailsRoute } from "./-offer-details-route";

export const Route = createFileRoute("/offers/$offerId")({
  component: OfferDetailsRoute,
});
