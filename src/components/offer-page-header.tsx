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
    <header className="offer-page-header">
      <div>
        <h1>Credit Card Offers</h1>
        <p>
          {visibleOffers} of {totalOffers} offers
        </p>
      </div>
      <HeaderActions />
    </header>
  );
}
