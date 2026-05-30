import fuzzysort from "fuzzysort";
import type { KeyboardEvent } from "react";
import type {
  FilterFn,
  SortingFn,
} from "@tanstack/react-table";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";
import {
  CREDIT_CARD_OFFER_FIELDS,
  formatOfferValue,
} from "../data/credit-card-offer-fields";

export const FUZZY_SCORE_THRESHOLD = 0.3;

export function fuzzyMatches(search: string, value: unknown): boolean {
  const result = fuzzysort.single(search, formatOfferValue(value));

  return result !== null && result.score >= FUZZY_SCORE_THRESHOLD;
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

export const fuzzyGlobalFilter: FilterFn<CreditCardOfferSeed> = (
  row,
  _columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "").trim();

  if (!search) {
    return true;
  }

  return CREDIT_CARD_OFFER_FIELDS.some(({ key }) =>
    fuzzyMatches(search, row.original[key]),
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
