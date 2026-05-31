import { useRef, type KeyboardEvent } from "react";
import { flexRender, type Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";

interface OfferTableProps {
  table: Table<CreditCardOfferSeed>;
  className?: string;
  emptyMessage?: string;
  onOpenOffer: (offerId: number) => void;
  onOfferKeyDown: (
    event: KeyboardEvent<HTMLTableRowElement>,
    offerId: number,
  ) => void;
}

export function OfferTable({
  table,
  className,
  emptyMessage = "No offers match the current filters.",
  onOpenOffer,
  onOfferKeyDown,
}: OfferTableProps) {
  const rows = table.getRowModel().rows;
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 48,
    getScrollElement: () => scrollParentRef.current,
    overscan: 12,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const visibleColumns = table.getVisibleLeafColumns();
  const totalTableWidth = visibleColumns.reduce(
    (width, column) => width + column.getSize(),
    0,
  );

  return (
    <Card className={cn("overflow-hidden py-0", className)}>
      <CardContent className="px-0">
        <div
          ref={scrollParentRef}
          className="max-h-[min(72vh,900px)] overflow-auto"
        >
          <table
            data-slot="table"
            className="grid text-xs"
            style={{ minWidth: totalTableWidth }}
          >
            <TableHeader className="bg-muted sticky top-0 z-10 grid">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="flex w-full">
                  {headerGroup.headers.map((header) => {
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        className="flex min-w-0 p-1"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-full justify-between gap-2 px-2 text-left text-xs font-medium"
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                          >
                            <span className="min-w-0 truncate">
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
                        ) : (
                          <div className="flex h-7 w-full min-w-0 items-center px-2 text-left text-xs font-medium">
                            <span className="min-w-0 truncate">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              className="relative grid"
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];

                return (
                  <TableRow
                    key={row.id}
                    tabIndex={0}
                    onClick={() => onOpenOffer(row.original.id)}
                    onKeyDown={(event) =>
                      onOfferKeyDown(event, row.original.id)
                    }
                    aria-label={`Open ${row.original.card_offer}`}
                    className="absolute flex w-full cursor-pointer items-center focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="flex min-w-0 items-center overflow-hidden text-ellipsis"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </table>
        </div>
      </CardContent>

      {rows.length === 0 ? (
        <div className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : null}

      <CardFooter className="border-t py-3 text-sm text-muted-foreground">
        Showing {rows.length.toLocaleString()}{" "}
        {rows.length === 1 ? "offer" : "offers"}
      </CardFooter>
    </Card>
  );
}
