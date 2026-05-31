import { type ChangeEvent } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface OfferSearchBarProps {
  globalFilter: string;
  onChange: (nextValue: string) => void;
}

export function OfferSearchBar({
  globalFilter,
  onChange,
}: OfferSearchBarProps) {
  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="offer-search" className="sr-only">
        Search offers
      </label>
      <Search
        className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        id="offer-search"
        type="search"
        aria-label="Search offers"
        className="pl-8"
        value={globalFilter}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder="Search offers"
      />
    </div>
  );
}
