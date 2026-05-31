import { Badge } from "@/components/ui/badge";
import { HeaderActions } from "./site-header";

interface OfferPageHeaderProps {
  datasetLastUpdated: string | null;
  visibleOffers: number;
  totalOffers: number;
}

export function OfferPageHeader({
  datasetLastUpdated,
  visibleOffers,
  totalOffers,
}: OfferPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-normal">
          <span aria-hidden="true">💳</span>
          <span>Credit Card Offers</span>
        </h1>
        <Badge variant="secondary" className="mt-2">
          {visibleOffers} of {totalOffers} offers
        </Badge>
        {datasetLastUpdated ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Dataset last updated {datasetLastUpdated}
          </p>
        ) : null}
      </div>
      <HeaderActions />
    </header>
  );
}
