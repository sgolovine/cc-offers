import type { KeyboardEvent } from "react";
import { flexRender, type Table } from "@tanstack/react-table";

import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";

interface OfferTableProps {
  table: Table<CreditCardOfferSeed>;
  onOpenOffer: (offerId: number) => void;
  onOfferKeyDown: (
    event: KeyboardEvent<HTMLTableRowElement>,
    offerId: number,
) => void;
}

export function OfferTable({ table, onOpenOffer, onOfferKeyDown }: OfferTableProps) {
  return (
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
                        {header.column.getIsSorted() === "asc" ? " asc" : null}
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
                onClick={() => onOpenOffer(row.original.id)}
                onKeyDown={(event) => onOfferKeyDown(event, row.original.id)}
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
  );
}

