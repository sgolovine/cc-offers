import { LoaderCircle } from "lucide-react";

import { OfferColumnSelector } from "../../components/offer-column-selector";
import { OfferErrorView } from "../../components/offer-error-view";
import { OfferPageHeader } from "../../components/offer-page-header";
import { OfferSearchBar } from "../../components/offer-search-bar";
import { OfferTable } from "../../components/offer-table";
import { useSavedOffersPage } from "./use-saved-offers-page";

export function SavedOffers() {
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
  } = useSavedOffersPage();

  if (offersState.error) {
    return <OfferErrorView message={offersState.error.message} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6">
      <OfferPageHeader
        title="Saved Offers"
        datasetLastUpdated={datasetLastUpdated}
        visibleOffers={visibleOffers}
        totalOffers={totalOffers}
      />

      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        Saved offers are stored only on this computer in your browser&apos;s
        local storage.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <OfferSearchBar
          globalFilter={globalFilter}
          onChange={setGlobalFilter}
        />
        <div className="flex gap-2 sm:ml-auto">
          <OfferColumnSelector table={table} />
        </div>
      </div>

      {offersState.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          <span>Loading saved offers&hellip;</span>
        </div>
      ) : (
        <OfferTable
          table={table}
          emptyMessage="No saved offers yet."
          onOpenOffer={onOpenOffer}
          onOfferKeyDown={onOfferKeyDown}
        />
      )}
    </main>
  );
}
