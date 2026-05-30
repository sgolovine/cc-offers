import { Link } from "@tanstack/react-router";

import {
  CREDIT_CARD_OFFER_FIELDS,
  type CreditCardOfferFieldKey,
  formatOfferValue,
  formatRawJson,
} from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { useOfferDetails } from "./use-offer-details";

type OfferDetailsProps = {
  offerId: string;
};

export function OfferDetails({ offerId }: OfferDetailsProps) {
  const { offer, offerState, status } = useOfferDetails(offerId);

  if (status === "error") {
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
          <p>{offerState.error?.message}</p>
        </article>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="container-fluid">
        <p aria-busy="true">Loading offer&hellip;</p>
      </main>
    );
  }

  if (status === "not-found") {
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

  if (!offer) {
    return (
      <main className="container-fluid">
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link to="/">Offers</Link>
            </li>
            <li>No offer</li>
          </ul>
        </nav>
        <article>
          <h1>Offer data unavailable</h1>
          <p>No details are available for offer ID {offerId}.</p>
        </article>
      </main>
    );
  }

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
                  <td>
                    <OfferFieldValue offer={offer} fieldKey={field.key} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </article>
    </main>
  );
}

type OfferFieldValueProps = {
  offer: CreditCardOfferSeed;
  fieldKey: CreditCardOfferFieldKey;
};

function OfferFieldValue({ offer, fieldKey }: OfferFieldValueProps) {
  const value = offer[fieldKey];

  if (fieldKey === "source_url" && typeof value === "string") {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }

  if (fieldKey === "raw_json") {
    return (
      <pre>
        <code>{formatRawJson(typeof value === "string" ? value : null)}</code>
      </pre>
    );
  }

  return formatOfferValue(value);
}
