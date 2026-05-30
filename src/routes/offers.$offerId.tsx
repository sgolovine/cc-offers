import { Link, createFileRoute } from "@tanstack/react-router";

import {
  CREDIT_CARD_OFFER_FIELDS,
  formatOfferValue,
  formatRawJson,
} from "../data/credit-card-offer-fields";
import type { CreditCardOfferFieldKey } from "../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../data/credit-card-offers.seed";
import { useDexieQuery } from "../hooks/use-dexie-query";

export const Route = createFileRoute("/offers/$offerId")({
  component: OfferDetail,
});

function OfferDetail() {
  const { offerId } = Route.useParams();
  const numericOfferId = Number(offerId);
  const hasValidOfferId = Number.isInteger(numericOfferId) && numericOfferId > 0;

  const offerState = useDexieQuery(
    async (db) =>
      hasValidOfferId ? db.creditCardOffers.get(numericOfferId) : undefined,
    [hasValidOfferId, numericOfferId],
  );

  if (offerState.error) {
    return (
      <main className="container-fluid">
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link to="/">Offers</Link>
            </li>
            <li>Error</li>
          </ul>
        </nav>
        <article>
          <h1>Offer unavailable</h1>
          <p>{offerState.error.message}</p>
        </article>
      </main>
    );
  }

  if (offerState.isLoading) {
    return (
      <main className="container-fluid">
        <p aria-busy="true">Loading offer...</p>
      </main>
    );
  }

  if (!offerState.data) {
    return (
      <main className="container-fluid">
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link to="/">Offers</Link>
            </li>
            <li>Not found</li>
          </ul>
        </nav>
        <article>
          <h1>Offer not found</h1>
          <p>No credit card offer was found for ID {offerId}.</p>
        </article>
      </main>
    );
  }

  const offer = offerState.data;

  return (
    <main className="container-fluid">
      <nav aria-label="breadcrumb">
        <ul>
          <li>
            <Link to="/">Offers</Link>
          </li>
          <li>{offer.card_offer}</li>
        </ul>
      </nav>

      <article>
        <header>
          <h1>{offer.card_offer}</h1>
          <p>{offer.issuer}</p>
        </header>

        <figure className="overflow-auto">
          <table>
            <tbody>
              {CREDIT_CARD_OFFER_FIELDS.map((field) => (
                <tr key={field.key}>
                  <th scope="row">{field.label}</th>
                  <td>{renderOfferField(offer, field.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </article>
    </main>
  );
}

function renderOfferField(
  offer: CreditCardOfferSeed,
  key: CreditCardOfferFieldKey,
) {
  const value = offer[key];

  if (key === "source_url" && typeof value === "string") {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }

  if (key === "raw_json") {
    return (
      <pre>
        <code>{formatRawJson(typeof value === "string" ? value : null)}</code>
      </pre>
    );
  }

  return formatOfferValue(value);
}
