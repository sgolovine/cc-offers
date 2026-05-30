import { OfferErrorView } from "../../components/offer-error-view";
import { OfferPageHeader } from "../../components/offer-page-header";
import { OfferSearchBar } from "../../components/offer-search-bar";
import { OfferTable } from "../../components/offer-table";
import { useHome } from "./use-home";

export function Home() {
  const {
    globalFilter,
    onOfferKeyDown,
    onOpenOffer,
    offersState,
    setGlobalFilter,
    table,
    totalOffers,
    visibleOffers,
  } = useHome();

  if (offersState.error) {
    return <OfferErrorView message={offersState.error.message} />;
  }

  return (
    <main className="container-fluid">
      <OfferPageHeader
        visibleOffers={visibleOffers}
        totalOffers={totalOffers}
      />
      <OfferSearchBar
        globalFilter={globalFilter}
        onChange={setGlobalFilter}
      />

      {offersState.isLoading ? (
        <p aria-busy="true">Loading offers...</p>
      ) : (
        <OfferTable
          table={table}
          onOpenOffer={onOpenOffer}
          onOfferKeyDown={onOfferKeyDown}
        />
      )}
    </main>
  );
}
