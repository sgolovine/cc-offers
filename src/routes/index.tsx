import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import type {
  CreditCardOfferRecord,
  InstitutionTargetRecord,
  SeedImportResult,
} from "../lib/cc-offers-dexie";

type BrowserDataState =
  | { status: "loading" }
  | {
      status: "ready";
      seed: SeedImportResult;
      offers: CreditCardOfferRecord[];
      targets: InstitutionTargetRecord[];
    }
  | { status: "error"; message: string };

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [state, setState] = useState<BrowserDataState>({ status: "loading" });
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBrowserDatabase() {
      try {
        const { ccOffersDb, importSqliteSeed } = await import(
          "../lib/cc-offers-dexie"
        );
        const seed = await importSqliteSeed();
        const [offers, targets] = await Promise.all([
          ccOffersDb.creditCardOffers.toArray(),
          ccOffersDb.institutionTargets.toArray(),
        ]);

        if (isMounted) {
          setState({ status: "ready", seed, offers, targets });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to open the browser database.",
          });
        }
      }
    }

    loadBrowserDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  const readyState = state.status === "ready" ? state : null;
  const categories = useMemo(() => {
    if (!readyState) return [];

    return Array.from(
      new Set(
        readyState.offers
          .map((offer) => offer.category)
          .filter((category): category is string => Boolean(category)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [readyState]);

  const filteredOffers = useMemo(() => {
    if (!readyState) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return readyState.offers
      .filter((offer) => {
        return selectedCategory === "ALL" || offer.category === selectedCategory;
      })
      .filter((offer) => {
        if (!normalizedQuery) return true;

        return [offer.issuer, offer.issuer_partner, offer.card_offer]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .slice(0, 80);
  }, [query, readyState, selectedCategory]);

  const issuerCount = useMemo(() => {
    if (!readyState) return 0;
    return new Set(readyState.offers.map((offer) => offer.issuer)).size;
  }, [readyState]);

  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">IndexedDB</p>
          <h1>Credit card offer workspace</h1>
        </div>

        {readyState ? (
          <div className="sync-status">
            <span>{readyState.seed.imported ? "Imported" : "Current"}</span>
            <time dateTime={readyState.seed.exportedAt}>
              {new Date(readyState.seed.exportedAt).toLocaleString()}
            </time>
          </div>
        ) : null}
      </header>

      {state.status === "loading" ? (
        <section className="status-panel">Loading browser database...</section>
      ) : null}

      {state.status === "error" ? (
        <section className="status-panel error">{state.message}</section>
      ) : null}

      {readyState ? (
        <>
          <section className="metric-grid" aria-label="Database totals">
            <Metric label="Offers" value={readyState.offers.length} />
            <Metric label="Institutions" value={readyState.targets.length} />
            <Metric label="Issuers" value={issuerCount} />
            <Metric label="Categories" value={categories.length} />
          </section>

          <section className="toolbar" aria-label="Offer filters">
            <label>
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="ALL">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Search</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Issuer, partner, or card"
                type="search"
              />
            </label>
          </section>

          <section className="data-section">
            <div className="section-heading">
              <h2>Offers</h2>
              <p>{filteredOffers.length} visible</p>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Issuer</th>
                    <th>Card</th>
                    <th>Category</th>
                    <th>Bonus</th>
                    <th>Annual fee</th>
                    <th>Retrieved</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td>
                        <strong>{offer.issuer}</strong>
                        {offer.issuer_partner ? (
                          <span>{offer.issuer_partner}</span>
                        ) : null}
                      </td>
                      <td>{offer.card_offer}</td>
                      <td>{offer.category ?? "NA"}</td>
                      <td>{formatBonus(offer)}</td>
                      <td>{formatCurrency(offer.base_annual_fee_usd)}</td>
                      <td>{formatDate(offer.retrieved)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function formatBonus(offer: CreditCardOfferRecord) {
  if (offer.bonus_miles && offer.bonus_miles !== "NA") {
    return `${Number(offer.bonus_miles).toLocaleString()} ${offer.bonus_miles_type ?? "points"}`;
  }

  if (offer.cash_bonus && offer.cash_bonus !== "NA") {
    return `${formatCurrency(Number(offer.cash_bonus))} ${offer.cash_bonus_type ?? ""}`.trim();
  }

  return offer.welcome_intro_offer ?? "NA";
}

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "NA";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;

  return date.toLocaleDateString();
}
