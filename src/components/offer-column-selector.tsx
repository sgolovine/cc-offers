import type { Column, Table } from "@tanstack/react-table";
import { Columns3, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";

interface OfferColumnSelectorProps {
  table: Table<CreditCardOfferSeed>;
}

function getColumnLabel(column: Column<CreditCardOfferSeed, unknown>) {
  const header = column.columnDef.header;

  return typeof header === "string" ? header : column.id;
}

export function OfferColumnSelector({ table }: OfferColumnSelectorProps) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  const visibleColumnCount = columns.filter((column) =>
    column.getIsVisible(),
  ).length;
  const hasCustomColumnVisibility =
    Object.keys(table.getState().columnVisibility).length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          <Columns3 data-icon="inline-start" aria-hidden="true" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Columns3 className="size-4" aria-hidden="true" />
          Columns
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reset columns"
            title="Reset columns"
            className="ml-auto"
            disabled={!hasCustomColumnVisibility}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              table.setColumnVisibility({});
            }}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            disabled={column.getIsVisible() && visibleColumnCount === 1}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            {getColumnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
