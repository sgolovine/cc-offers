import { Link, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
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
  formatTableOfferValue,
} from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { useDexieQuery } from "../../hooks/use-dexie-query";
import {
  fuzzyColumnFilter,
  fuzzyGlobalFilter,
  handleOfferKeyDown,
  openOffer,
  offerValueSort,
} from "../../util/offer-table";

export function useHome() {
  const navigate = useNavigate({ from: "/" });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const offersState = useDexieQuery(async (db) => db.creditCardOffers.toArray());

  const columns = useMemo<ColumnDef<CreditCardOfferSeed>[]>(
    () =>
      CREDIT_CARD_OFFER_FIELDS.map((field) => ({
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
              >
                {formattedValue}
              </a>
            );
          }

          return formattedValue;
        },
        filterFn: fuzzyColumnFilter,
        sortingFn: offerValueSort,
      })),
    [],
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
  };
}
