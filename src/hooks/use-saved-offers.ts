import { useMemo } from "react";

import { useLocalStorageState } from "./use-local-storage-state";

const SAVED_OFFER_IDS_STORAGE_KEY = "cc-offers:saved-offer-ids";

function normalizeSavedOfferIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((offerId) => Number(offerId))
        .filter((offerId) => Number.isInteger(offerId) && offerId > 0),
    ),
  );
}

export function useSavedOffers() {
  const [savedOfferIds, setSavedOfferIds] = useLocalStorageState<unknown>(
    SAVED_OFFER_IDS_STORAGE_KEY,
    [],
  );
  const normalizedSavedOfferIds = useMemo(
    () => normalizeSavedOfferIds(savedOfferIds),
    [savedOfferIds],
  );
  const savedOfferIdSet = useMemo(
    () => new Set(normalizedSavedOfferIds),
    [normalizedSavedOfferIds],
  );

  const toggleSavedOffer = (offerId: number) => {
    setSavedOfferIds((currentValue: unknown) => {
      const currentOfferIds = normalizeSavedOfferIds(currentValue);

      return currentOfferIds.includes(offerId)
        ? currentOfferIds.filter((currentOfferId) => currentOfferId !== offerId)
        : [...currentOfferIds, offerId];
    });
  };

  return {
    savedOfferIds: normalizedSavedOfferIds,
    savedOfferIdSet,
    isOfferSaved: (offerId: number) => savedOfferIdSet.has(offerId),
    toggleSavedOffer,
  };
}
