import { Link, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useDeferredValue, useMemo, useState, type KeyboardEvent } from "react";

import { SaveOfferButton } from "../../components/save-offer-button";
import {
  CREDIT_CARD_OFFER_FIELDS,
  type CreditCardOfferFieldKey,
  formatTableOfferValue,
} from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { useDexieQuery } from "../../hooks/use-dexie-query";
import { useLocalStorageState } from "../../hooks/use-local-storage-state";
import { useSavedOffers } from "../../hooks/use-saved-offers";
import { formatDatasetLastUpdated } from "../../util/dataset";
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

const COLUMN_VISIBILITY_STORAGE_KEY = "cc-offers:saved:column-visibility";

export function useSavedOffersPage() {
  const navigate = useNavigate({ from: "/saved-offers" });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>(
      COLUMN_VISIBILITY_STORAGE_KEY,
      {},
    );
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const { savedOfferIdSet, savedOfferIds, toggleSavedOffer } = useSavedOffers();

  const offersState = useDexieQuery(async (db) =>
    db.creditCardOffers.toArray(),
  );

  const savedOffers = useMemo(() => {
    const offersById = new Map(
      (offersState.data ?? []).map((offer) => [offer.id, offer]),
    );

    return savedOfferIds.flatMap((offerId) => {
      const offer = offersById.get(offerId);

      return offer ? [offer] : [];
    });
  }, [offersState.data, savedOfferIds]);

  const columns = useMemo<ColumnDef<CreditCardOfferSeed>[]>(
    () => [
      {
        id: "save",
        header: () => <span className="sr-only">Save</span>,
        cell: ({ row }) => (
          <SaveOfferButton
            offerName={row.original.card_offer}
            isSaved={savedOfferIdSet.has(row.original.id)}
            onToggle={() => toggleSavedOffer(row.original.id)}
          />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      ...CREDIT_CARD_OFFER_FIELDS.filter(
        (field) => !HIDDEN_TABLE_FIELD_KEYS.has(field.key),
      ).map((field) => ({
        accessorKey: field.key,
        header: field.label,
        cell: (info: CellContext<CreditCardOfferSeed, unknown>) => {
          const value = info.getValue();
          const formattedValue = formatTableOfferValue(value);

          if (field.key === "card_offer") {
            return (
              <Link
                to="/offers/$offerId"
                params={{ offerId: String(info.row.original.id) }}
                onClick={(event) => event.stopPropagation()}
                className="text-primary"
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
    ],
    [savedOfferIdSet, toggleSavedOffer],
  );

  const table = useReactTable({
    data: savedOffers,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: deferredGlobalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    globalFilterFn: fuzzyGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
    totalOffers: savedOffers.length,
    datasetLastUpdated: formatDatasetLastUpdated(savedOffers),
  };
}
