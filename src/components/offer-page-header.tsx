import { Badge } from "@/components/ui/badge";
import { HeaderActions } from "./site-header";

interface OfferPageHeaderProps {
  visibleOffers: number;
  totalOffers: number;
}

export function OfferPageHeader({
  visibleOffers,
  totalOffers,
}: OfferPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Credit Card Offers
        </h1>
        <Badge variant="secondary" className="mt-2">
          {visibleOffers} of {totalOffers} offers
        </Badge>
      </div>
      <HeaderActions />
    </header>
  );
}
