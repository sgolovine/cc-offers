import type { KeyboardEvent } from "react";
import { flexRender, type Column, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatOfferValue } from "../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";

const ALL_FILTER_VALUE = "__all_column_values__";

function getColumnFilterOptions(
  column: Column<CreditCardOfferSeed, unknown>,
): string[] {
  const optionValues = new Set<string>();

  column.getFacetedUniqueValues().forEach((_count, value) => {
    optionValues.add(formatOfferValue(value));
  });

  return Array.from(optionValues).sort((valueA, valueB) =>
    valueA.localeCompare(valueB, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

interface OfferTableProps {
  table: Table<CreditCardOfferSeed>;
  onOpenOffer: (offerId: number) => void;
  onOfferKeyDown: (
    event: KeyboardEvent<HTMLTableRowElement>,
    offerId: number,
  ) => void;
}

export function OfferTable({
  table,
  onOpenOffer,
  onOfferKeyDown,
}: OfferTableProps) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="px-0">
        <DataTable className="text-xs">
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id} scope="col" className="p-1">
                      {header.isPlaceholder ? null : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-full justify-between gap-2 px-2 text-left text-xs font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          <span className="flex size-3.5 shrink-0 items-center justify-center">
                            {sortDirection === "asc" ? (
                              <>
                                <ArrowUp
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  sorted ascending
                                </span>
                              </>
                            ) : null}
                            {sortDirection === "desc" ? (
                              <>
                                <ArrowDown
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  sorted descending
                                </span>
                              </>
                            ) : null}
                            {sortDirection === false ? (
                              <ChevronsUpDown
                                className="size-3.5 opacity-0"
                                aria-hidden="true"
                              />
                            ) : null}
                          </span>
                        </Button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={`${headerGroup.id}-filters`}>
                {headerGroup.headers.map((header) => {
                  const filterOptions = getColumnFilterOptions(header.column);
                  const filterValue =
                    (header.column.getFilterValue() as string | undefined) ??
                    ALL_FILTER_VALUE;

                  return (
                    <TableHead
                      key={`${header.id}-filter`}
                      scope="col"
                      className="p-1"
                    >
                      {header.column.getCanFilter() ? (
                        <Select
                          value={filterValue}
                          onValueChange={(value) =>
                            header.column.setFilterValue(
                              value === ALL_FILTER_VALUE ? undefined : value,
                            )
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            aria-label={`Filter ${String(
                              header.column.columnDef.header,
                            )}`}
                            className="h-7 min-w-32 max-w-64 text-xs"
                          >
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL_FILTER_VALUE}>
                              All
                            </SelectItem>
                            {filterOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                tabIndex={0}
                onClick={() => onOpenOffer(row.original.id)}
                onKeyDown={(event) => onOfferKeyDown(event, row.original.id)}
                aria-label={`Open ${row.original.card_offer}`}
                className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="max-w-80 overflow-hidden text-ellipsis"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      </CardContent>

      {table.getRowModel().rows.length === 0 ? (
        <div className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
          No offers match the current filters.
        </div>
      ) : null}

      <CardFooter className="flex flex-col gap-3 border-t py-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          className="flex items-center gap-2"
          aria-label="Offer table pagination"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </nav>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              size="sm"
              aria-label="Rows per page"
              className="w-[116px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
}
