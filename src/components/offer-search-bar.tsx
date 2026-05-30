import { type ChangeEvent } from "react";

interface OfferSearchBarProps {
  globalFilter: string;
  onChange: (nextValue: string) => void;
}

export function OfferSearchBar({
  globalFilter,
  onChange,
}: OfferSearchBarProps) {
  return (
    <>
      <label htmlFor="offer-search">Search offers</label>
      <input
        id="offer-search"
        type="search"
        aria-label="Search offers"
        value={globalFilter}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder="Search across every field"
      />
    </>
  );
}
