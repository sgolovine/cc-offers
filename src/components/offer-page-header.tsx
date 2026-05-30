interface OfferPageHeaderProps {
  visibleOffers: number;
  totalOffers: number;
}

export function OfferPageHeader({
  visibleOffers,
  totalOffers,
}: OfferPageHeaderProps) {
  return (
    <>
      <h1>Credit Card Offers</h1>
      <p>
        {visibleOffers} of {totalOffers} offers
      </p>
    </>
  );
}

