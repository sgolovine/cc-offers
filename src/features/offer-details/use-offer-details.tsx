import { useDexieQuery } from "../../hooks/use-dexie-query";

type OfferDetailsStatus = "error" | "loading" | "not-found" | "ready";

export function useOfferDetails(offerId: string) {
  const numericOfferId = Number(offerId);
  const hasValidOfferId = Number.isInteger(numericOfferId) && numericOfferId > 0;

  const offerState = useDexieQuery(
    async (db) =>
      hasValidOfferId ? db.creditCardOffers.get(numericOfferId) : undefined,
    numericOfferId,
  );

  const status: OfferDetailsStatus = offerState.error
    ? "error"
    : offerState.isLoading
      ? "loading"
      : offerState.data
        ? "ready"
        : "not-found";

  if (status === "error" || status === "loading" || status === "not-found") {
    return {
      status,
      offer: undefined,
      offerState,
    };
  }

  return {
    status,
    offer: offerState.data,
    offerState,
  };
}
