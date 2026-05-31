import fuzzysort from "fuzzysort";
import type { KeyboardEvent } from "react";
import type {
  FilterFn,
  SortingFn,
} from "@tanstack/react-table";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";
import {
  CREDIT_CARD_OFFER_FIELDS,
  type CreditCardOfferFieldKey,
  formatOfferValue,
} from "../data/credit-card-offer-fields";

const FUZZY_SCORE_THRESHOLD = 0.3;
const GLOBAL_SEARCH_FIELD_KEYS = CREDIT_CARD_OFFER_FIELDS.map(
  ({ key }) => key,
).filter(
  (key): key is CreditCardOfferFieldKey =>
    key !== "raw_json" && key !== "created_at" && key !== "updated_at",
);
const globalSearchTextCache = new WeakMap<
  CreditCardOfferSeed,
  { text: string; normalizedText: string }
>();

function fuzzyMatches(search: string, value: unknown): boolean {
  const result = fuzzysort.single(search, formatOfferValue(value));

  return result !== null && result.score >= FUZZY_SCORE_THRESHOLD;
}

function getGlobalSearchText(offer: CreditCardOfferSeed): {
  text: string;
  normalizedText: string;
} {
  const cachedSearchText = globalSearchTextCache.get(offer);

  if (cachedSearchText) {
    return cachedSearchText;
  }

  const searchText = GLOBAL_SEARCH_FIELD_KEYS.map((key) =>
    formatOfferValue(offer[key]),
  ).join(" ");
  const cachedSearchTextValue = {
    text: searchText,
    normalizedText: searchText.toLowerCase(),
  };

  globalSearchTextCache.set(offer, cachedSearchTextValue);

  return cachedSearchTextValue;
}

export const fuzzyColumnFilter: FilterFn<CreditCardOfferSeed> = (
  row,
  columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "").trim();

  if (!search) {
    return true;
  }

  return fuzzyMatches(search, row.getValue(columnId));
};

export const exactFormattedColumnFilter: FilterFn<CreditCardOfferSeed> = (
  row,
  columnId,
  filterValue,
) => {
  const selectedValue = String(filterValue ?? "").trim();

  if (!selectedValue) {
    return true;
  }

  return formatOfferValue(row.getValue(columnId)) === selectedValue;
};

export const fuzzyGlobalFilter: FilterFn<CreditCardOfferSeed> = (
  row,
  _columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "").trim();

  if (!search) {
    return true;
  }

  const normalizedSearch = search.toLowerCase();
  const searchText = getGlobalSearchText(row.original);

  return (
    searchText.normalizedText.includes(normalizedSearch) ||
    fuzzyMatches(search, searchText.text)
  );
};

export const offerValueSort: SortingFn<CreditCardOfferSeed> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue(columnId);
  const valueB = rowB.getValue(columnId);

  if (valueA === valueB) {
    return 0;
  }

  if (valueA === null || valueA === undefined) {
    return -1;
  }

  if (valueB === null || valueB === undefined) {
    return 1;
  }

  if (typeof valueA === "number" && typeof valueB === "number") {
    return valueA - valueB;
  }

  return formatOfferValue(valueA).localeCompare(formatOfferValue(valueB), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

type NavigateFn = (options: {
  to: string;
  params: { offerId: string };
}) => Promise<unknown>;

export function openOffer(offerId: number, navigate: NavigateFn): void {
  void navigate({
    to: "/offers/$offerId",
    params: { offerId: String(offerId) },
  });
}

export function handleOfferKeyDown(
  event: KeyboardEvent<HTMLTableRowElement>,
  offerId: number,
  navigate: NavigateFn,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  openOffer(offerId, navigate);
}
