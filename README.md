# Credit Card Offers

Credit Card Offers is an open dataset and browser app for comparing public credit card offers without affiliate links or sponsored placement.

This project started as a personal research dataset for finding the best credit card offers. The data was assembled by researching major credit card issuers and their current public offers, then published here as raw data so other people can inspect, reuse, and build on it directly.

The checked-in SQLite database currently contains 242 offers from 28 issuers. Offer data is time-sensitive, so always verify current rates, fees, bonuses, eligibility terms, and application details with the issuer before making a financial decision.

## Raw Data

The raw dataset is available in several formats:

| Format | Repository path | Raw download |
| --- | --- | --- |
| SQLite database | [`data/cc-offers.sqlite`](data/cc-offers.sqlite) | [Download SQLite](https://raw.githubusercontent.com/sgolovine/cc-offers/main/data/cc-offers.sqlite) |
| CSV export | [`data/cc-offers-export.csv`](data/cc-offers-export.csv) | [Download CSV](https://raw.githubusercontent.com/sgolovine/cc-offers/main/data/cc-offers-export.csv) |
| Excel export | [`data/cc-offers-export.xlsx`](data/cc-offers-export.xlsx) | [Download XLSX](https://raw.githubusercontent.com/sgolovine/cc-offers/main/data/cc-offers-export.xlsx) |
| Dexie seed data | [`src/data/credit-card-offers.seed.ts`](src/data/credit-card-offers.seed.ts) | [View raw seed file](https://raw.githubusercontent.com/sgolovine/cc-offers/main/src/data/credit-card-offers.seed.ts) |

Supporting project files:

- [`schema/schema.ts`](schema/schema.ts): Drizzle schema for the SQLite database.
- [`scripts/export-sqlite-for-dexie.ts`](scripts/export-sqlite-for-dexie.ts): script that exports the SQLite `credit_card_offers` table into the Dexie seed file used by the browser app.
- [`src/data/credit-card-offer-fields.ts`](src/data/credit-card-offer-fields.ts): field metadata used by the UI.

## What's Included

The main `credit_card_offers` table includes:

- Issuer and card offer names.
- Card segment and category.
- Welcome or intro offer text.
- Bonus miles, cash bonuses, and spend requirements when available.
- Annual fee, additional user fee, APR, rewards, and key perks.
- Source URL, source basis, retrieval timestamp, notes, and raw JSON evidence.

The database also includes an `institution_targets` table used during research to track issuers, co-brands, loyalty programs, and other institutions that may publish credit card offers.

## Local Setup

Requirements:

- Node.js
- npm

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build the app:

```sh
npm run build
```

Run TypeScript checks:

```sh
npm run typecheck
```

## Working With The Data

Open the SQLite database directly:

```sh
sqlite3 data/cc-offers.sqlite
```

Example queries:

```sql
select count(*) from credit_card_offers;

select issuer, card_offer, welcome_intro_offer, source_url
from credit_card_offers
order by issuer, card_offer;
```

Regenerate the browser seed data from SQLite:

```sh
npm run dexie:export
```

By default, this reads from `file:./data/cc-offers.sqlite` and writes to `src/data/credit-card-offers.seed.ts`. You can override those paths:

```sh
DB_FILE_NAME=file:./data/cc-offers.sqlite \
DEXIE_SEED_FILE=src/data/credit-card-offers.seed.ts \
npm run dexie:export
```

## Database And App Architecture

The source of truth is the SQLite database at [`data/cc-offers.sqlite`](data/cc-offers.sqlite). The React app runs entirely in the browser and loads the offers into IndexedDB using Dexie. The generated seed file in [`src/data/credit-card-offers.seed.ts`](src/data/credit-card-offers.seed.ts) is created from SQLite so the app can ship the dataset as static client-side data.

The app is built with:

- React
- Vite
- TanStack Router
- TanStack Table
- Dexie
- Drizzle ORM

## Updating The Dataset

1. Update `data/cc-offers.sqlite`.
2. If the schema changed, update [`schema/schema.ts`](schema/schema.ts) and generate a migration with `npm run db:generate`.
3. Regenerate the Dexie seed file with `npm run dexie:export`.
4. Rebuild or typecheck the app with `npm run build` or `npm run typecheck`.
5. Export updated CSV/XLSX files if the public data exports changed.

## Agent Skills

This repository includes Codex skills that describe the agent workflows used to build and refresh the dataset. The recommended flow is:

1. Run [`credit-card-institution-target-research`](.codex/skills/credit-card-institution-target-research) to research institutions that issue, co-issue, partner on, or host rewards credit card offer pages. This is the first step in building the dataset and populates the `institution_targets` table.
2. Run [`credit-card-offer-research`](.codex/skills/credit-card-offer-research) to take the institution targets from the first step, browse current public sources, and write source-backed offer rows into the `credit_card_offers` table.

These workflows are best run in an agent environment with browser integration, such as Codex desktop in Goal Mode. Current offer research depends on live issuer and partner pages, and the skills are written to verify sources in the browser rather than relying on stale memory or static lists.

The initial run that generated the data in this repository took around 12 hours. Future refreshes may be shorter or longer depending on scope, browser availability, source page complexity, and how much enrichment is needed for rates, fees, benefits, and offer terms.

## Data Notes

- This dataset is for research and comparison, not financial advice.
- Offers can change without notice.
- Issuer terms, eligibility rules, APRs, fees, bonuses, and rewards structures should be verified at the original source URL before applying.
- Some fields are intentionally nullable because issuers publish different levels of detail for different cards.
- There are no affiliate links in this project.

## License

This project is released under the [MIT License](LICENSE).
