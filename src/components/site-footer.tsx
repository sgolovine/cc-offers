import { useMemo } from "react";

import { socialLinks } from "../config";
import { useDexieQuery } from "../hooks/use-dexie-query";
import { formatDatasetLastUpdated } from "../util/dataset";
import { SimpleIcon } from "./site-header";

export function SiteFooter() {
  const offersState = useDexieQuery(async (db) =>
    db.creditCardOffers.toArray(),
  );

  const datasetLastUpdated = useMemo(
    () => formatDatasetLastUpdated(offersState.data),
    [offersState.data],
  );

  return (
    <footer className="mt-8 border-t bg-background">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p>This project is an open dataset of credit card offers.</p>
          {datasetLastUpdated ? (
            <p>Last updated {datasetLastUpdated}</p>
          ) : null}
        </div>

        <nav aria-label="Social links">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  aria-label={link.label}
                  className="inline-flex size-8 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                  title={link.label}
                >
                  <SimpleIcon icon={link.icon} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
