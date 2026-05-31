import { Link, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState, type KeyboardEvent } from "react";

import {
  CREDIT_CARD_OFFER_FIELDS,
  type CreditCardOfferFieldKey,
  formatTableOfferValue,
} from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { useDexieQuery } from "../../hooks/use-dexie-query";
import {
  exactFormattedColumnFilter,
  fuzzyGlobalFilter,
  handleOfferKeyDown,
  openOffer,
  offerValueSort,
} from "../../util/offer-table";

const HIDDEN_TABLE_FIELD_KEYS = new Set<CreditCardOfferFieldKey>([
  "retrieved",
  "raw_json",
  "created_at",
  "updated_at",
]);

function formatDatasetLastUpdated(
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

export function useHome() {
  const navigate = useNavigate({ from: "/" });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const offersState = useDexieQuery(async (db) =>
    db.creditCardOffers.toArray(),
  );

  const columns = useMemo<ColumnDef<CreditCardOfferSeed>[]>(
    () =>
      CREDIT_CARD_OFFER_FIELDS.filter(
        (field) => !HIDDEN_TABLE_FIELD_KEYS.has(field.key),
      ).map((field) => ({
        accessorKey: field.key,
        header: field.label,
        cell: (info) => {
          const value = info.getValue();
          const formattedValue = formatTableOfferValue(value);

          if (field.key === "card_offer") {
            return (
              <Link
                to="/offers/$offerId"
                params={{ offerId: String(info.row.original.id) }}
                onClick={(event) => event.stopPropagation()}
                className="text-primary underline-offset-4 hover:underline"
              >
                {formattedValue}
              </Link>
            );
          }

          if (field.key === "source_url" && typeof value === "string") {
            return (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="text-primary underline-offset-4 hover:underline"
              >
                {formattedValue}
              </a>
            );
          }

          return formattedValue;
        },
        filterFn: exactFormattedColumnFilter,
        sortingFn: offerValueSort,
      })),
    [],
  );

  const datasetLastUpdated = useMemo(
    () => formatDatasetLastUpdated(offersState.data),
    [offersState.data],
  );

  const table = useReactTable({
    data: offersState.data ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    globalFilterFn: fuzzyGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const onOpenOffer = (offerId: number) => {
    openOffer(offerId, navigate);
  };

  const onOfferKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    offerId: number,
  ) => {
    handleOfferKeyDown(event, offerId, navigate);
  };

  return {
    table,
    globalFilter,
    setGlobalFilter,
    offersState,
    onOpenOffer,
    onOfferKeyDown,
    visibleOffers: table.getFilteredRowModel().rows.length,
    totalOffers: table.getCoreRowModel().rows.length,
    datasetLastUpdated,
  };
}
