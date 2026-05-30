import { useParams } from "@tanstack/react-router";

import { OfferDetails } from "../features/offer-details/offer-details";

export function OfferDetailsRoute() {
  const { offerId } = useParams({ from: "/offers/$offerId" });

  return <OfferDetails offerId={offerId} />;
}
