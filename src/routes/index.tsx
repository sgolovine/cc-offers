import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
  type SortingState,
} from "@tanstack/react-table";
import fuzzysort from "fuzzysort";
import { useMemo, useState, type KeyboardEvent } from "react";

import {
  CREDIT_CARD_OFFER_FIELDS,
  formatOfferValue,
  formatTableOfferValue,
} from "../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";
import { useDexieQuery } from "../hooks/use-dexie-query";

export const Route = createFileRoute("/")({
  component: Home,
});

const FUZZY_SCORE_THRESHOLD = 0.3;

function fuzzyMatches(search: string, value: unknown): boolean {
  const result = fuzzysort.single(search, formatOfferValue(value));

  return result !== null && result.score >= FUZZY_SCORE_THRESHOLD;
}

const fuzzyColumnFilter: FilterFn<CreditCardOfferSeed> = (
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

const fuzzyGlobalFilter: FilterFn<CreditCardOfferSeed> = (
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

const offerValueSort: SortingFn<CreditCardOfferSeed> = (rowA, rowB, columnId) => {
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

function Home() {
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

  function openOffer(offerId: number) {
    void navigate({
      to: "/offers/$offerId",
      params: { offerId: String(offerId) },
    });
  }

  function handleOfferKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    offerId: number,
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openOffer(offerId);
  }

  if (offersState.error) {
    return (
      <main className="container-fluid">
        <article>
          <h1>Credit Card Offers</h1>
          <p>{offersState.error.message}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="container-fluid">
      <h1>Credit Card Offers</h1>
      <p>
        {table.getFilteredRowModel().rows.length} of{" "}
        {table.getCoreRowModel().rows.length} offers
      </p>

      <label htmlFor="offer-search">Search offers</label>
      <input
        id="offer-search"
        type="search"
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        placeholder="Search across every field"
      />

      {offersState.isLoading ? (
        <p aria-busy="true">Loading offers...</p>
      ) : (
        <>
          <figure className="overflow-auto">
            <table className="striped">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} scope="col">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="secondary outline"
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getIsSorted() === "asc"
                              ? " asc"
                              : null}
                            {header.column.getIsSorted() === "desc"
                              ? " desc"
                              : null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={`${headerGroup.id}-filters`}>
                    {headerGroup.headers.map((header) => (
                      <th key={`${header.id}-filter`} scope="col">
                        {header.column.getCanFilter() ? (
                          <input
                            type="search"
                            aria-label={`Filter ${String(
                              header.column.columnDef.header,
                            )}`}
                            value={(header.column.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                              header.column.setFilterValue(event.target.value)
                            }
                            placeholder="Filter"
                          />
                        ) : null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onClick={() => openOffer(row.original.id)}
                    onKeyDown={(event) => handleOfferKeyDown(event, row.original.id)}
                    aria-label={`Open ${row.original.card_offer}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>

          {table.getRowModel().rows.length === 0 ? (
            <article>
              <p>No offers match the current filters.</p>
            </article>
          ) : null}

          <nav aria-label="Offer table pagination">
            <ul>
              <li>
                <button
                  type="button"
                  className="secondary outline"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="secondary outline"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </li>
            </ul>
            <ul>
              <li>
                <small>
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </small>
              </li>
              <li>
                <select
                  aria-label="Rows per page"
                  value={table.getState().pagination.pageSize}
                  onChange={(event) => table.setPageSize(Number(event.target.value))}
                >
                  {[10, 25, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize} rows
                    </option>
                  ))}
                </select>
              </li>
            </ul>
          </nav>
        </>
      )}
    </main>
  );
}
