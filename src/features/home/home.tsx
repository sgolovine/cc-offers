import { OfferErrorView } from "../../components/offer-error-view";
import { OfferPageHeader } from "../../components/offer-page-header";
import { OfferSearchBar } from "../../components/offer-search-bar";
import { OfferTable } from "../../components/offer-table";
import { useHome } from "./use-home";
import { LoaderCircle } from "lucide-react";

export function Home() {
  const {
    datasetLastUpdated,
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
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6">
      <OfferPageHeader
        datasetLastUpdated={datasetLastUpdated}
        visibleOffers={visibleOffers}
        totalOffers={totalOffers}
      />
      <OfferSearchBar globalFilter={globalFilter} onChange={setGlobalFilter} />

      {offersState.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          <span>Loading offers&hellip;</span>
        </div>
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
