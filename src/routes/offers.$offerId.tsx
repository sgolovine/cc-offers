import { createFileRoute } from "@tanstack/react-router";

import { OfferDetails } from "../features/offer-details";

export const Route = createFileRoute("/offers/$offerId")({
  component: OfferDetailsRoute,
});

function OfferDetailsRoute() {
  const { offerId } = Route.useParams();
  return <OfferDetails offerId={offerId} />;
}
