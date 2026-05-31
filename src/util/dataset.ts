import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";

export function formatDatasetLastUpdated(
  offers: CreditCardOfferSeed[] | undefined,
): string | null {
  if (!offers?.length) {
    return null;
  }

  const latestTimestamp = offers.reduce<number | null>((latest, offer) => {
    const timestamps = [offer.created_at, offer.updated_at]
      .map((timestamp) => new Date(timestamp).getTime())
      .filter(Number.isFinite);

    if (timestamps.length === 0) {
      return latest;
    }

    const offerLatest = Math.max(...timestamps);

    return latest === null ? offerLatest : Math.max(latest, offerLatest);
  }, null);

  if (latestTimestamp === null) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(latestTimestamp);
}
