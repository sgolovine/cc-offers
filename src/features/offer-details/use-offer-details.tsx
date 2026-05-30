import type { ReactNode } from "react";

import { formatOfferValue, formatRawJson } from "../../data/credit-card-offer-fields";
import type { CreditCardOfferFieldKey } from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { useDexieQuery } from "../../hooks/use-dexie-query";

function renderOfferField(offer: CreditCardOfferSeed, key: CreditCardOfferFieldKey): ReactNode {
  const value = offer[key];

  if (key === "source_url" && typeof value === "string") {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }

  if (key === "raw_json") {
    return (
      <pre>
        <code>{formatRawJson(typeof value === "string" ? value : null)}</code>
      </pre>
    );
  }

  return formatOfferValue(value);
}

type OfferDetailsStatus = "error" | "loading" | "not-found" | "ready";


export function useOfferDetails(offerId: string) {
  const numericOfferId = Number(offerId);
  const hasValidOfferId = Number.isInteger(numericOfferId) && numericOfferId > 0;

  const offerState = useDexieQuery(
    async (db) =>
      hasValidOfferId ? db.creditCardOffers.get(numericOfferId) : undefined,
    [hasValidOfferId, numericOfferId],
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
      renderOfferField,
    };
  }

  return {
    status,
    offer: offerState.data,
    offerState,
    renderOfferField,
  };
}
