---
name: credit-card-institution-target-research
description: Research, refresh, expand, verify, or export institution targets for rewards credit card offer research in the cc-offers SQLite database. Use when Codex is asked to find banks, issuers, airlines, hotels, grocery stores, retailers, fintechs, loyalty programs, or other institutions that issue, co-issue, or host rewards credit card offer pages, especially when the task is about institutions rather than current offer details.
---

# Credit Card Institution Target Research

Maintain the upstream list of institutions that later offer-research agents should investigate. This skill populates and refreshes `institution_targets`; it does not research individual credit card offers.

## Core Rules

1. Use `data/cc-offers.sqlite` as the default database and `institution_targets` as the target table unless the user gives another path.
2. Inspect the live schema before writing. Do not assume migrations, columns, or constraints from memory.
3. Use `browser:browser` for current source verification. Card and partner pages are time-sensitive; do not rely only on memory or prior spreadsheets.
4. Prefer official institution, issuer, loyalty-program, and partner-card pages. Use third-party sources only when requested or clearly supplemental.
5. Do not enter application flows, log in, submit forms, accept personalized terms, solve CAPTCHA, or transmit sensitive data.
6. Store one row per institution/source target, not one row per card offer.
7. Do not write offer facts, APRs, annual fees, bonuses, or terms into this table except brief card-name examples in `known_rewards_card_examples`.
8. Treat a current public card or credit-card hub page as satisfying the past-year criterion. For recent, transitioned, inactive, or uncertain programs, explain the signal and limitation in `public_signal`, `source_basis`, `notes`, and `raw_json`.
9. If the user asks for current offer details, switch to the sibling `credit-card-offer-research` skill instead of expanding this target workflow.

## Database Shape

The expected table is:

- `id` integer primary key autoincrement
- `institution` text not null
- `institution_type` text not null
- `role` text not null
- `known_issuer_partner` text
- `known_rewards_card_examples` text
- `offer_research_url` text not null
- `alternate_issuer_url` text
- `source_basis` text not null
- `public_signal` text not null
- `priority` text not null
- `retrieved` text not null
- `notes` text
- `raw_json` text not null
- `created_at` text default `CURRENT_TIMESTAMP` not null
- `updated_at` text default `CURRENT_TIMESTAMP` not null

There should be a unique index on `(institution, offer_research_url)` plus indexes on `institution_type` and `priority`. Verify this with SQLite before inserts or updates.

Use this default review order:

```sql
SELECT *
FROM institution_targets
ORDER BY
  CASE priority
    WHEN 'High' THEN 1
    WHEN 'Medium' THEN 2
    WHEN 'Low' THEN 3
    ELSE 4
  END,
  institution;
```

## Research Workflow

1. Clarify scope only when necessary. If the user asks broadly, cover banks/card issuers, airlines/rail, hotels/travel, grocery/warehouse/food delivery, retail/ecommerce, fintech, auto/mobility, entertainment, and other rewards-card institutions.
2. Query existing rows first so you expand or refresh the database rather than rebuilding a static list.
3. Browse each candidate's official card hub, partner card page, loyalty-program credit-card page, or issuer partner catalog.
4. Record the strongest URL future agents can use to research offers in `offer_research_url`. Use `alternate_issuer_url` for an issuer-side page, partner catalog, or fallback official page.
5. Classify `institution_type` consistently, such as `Bank/Card Issuer`, `Airline/Rail`, `Hotel/Travel/Lodging`, `Grocery/Warehouse/Food Delivery`, `Retail/Ecommerce`, `Financial/Technology/Other`, or `Auto/Mobility/Entertainment`.
6. Set `role` to describe why the institution belongs in the target table, such as issuer, co-brand partner, loyalty program, merchant partner, private-label card partner, or card marketplace.
7. Use `priority` to guide future offer research: `High` for major issuers or broad card hubs, `Medium` for known co-brand or category programs, and `Low` for uncertain, niche, inactive, or representative targets.
8. Write `retrieved` as the current ISO date or timestamp for the browser verification pass.

## Evidence Payload

`raw_json` must be valid JSON. Keep it compact but auditable, for example:

```json
{
  "checked_at": "2026-05-30",
  "urls_checked": [
    {
      "url": "https://example.com/credit-cards",
      "basis": "Official partner credit card page",
      "observed_title": "Example Rewards Credit Card"
    }
  ],
  "classification_reason": "Official page lists rewards credit card products for this institution.",
  "limitations": "Offer details were not researched; application flow was not opened."
}
```

Prefer paraphrased evidence and short titles/snippets. Do not paste full copyrighted page text.

## Writing Rows

Use parameterized SQLite writes or a small script. Do not construct SQL by concatenating untrusted values. Do not hard-code an old 126-row list as the workflow.

For refreshes, use the unique `(institution, offer_research_url)` key to upsert source fields, `retrieved`, `notes`, `raw_json`, and `updated_at`. Preserve `created_at`. For expansion, insert only when the institution/source URL is new or materially distinct.

Before finalizing, report inserted, updated, and skipped counts.

## Optional Workbook Export

Only create a workbook when the user asks for a spreadsheet/export. Use `spreadsheets:Spreadsheets` and treat SQLite as the source of truth.

A useful export pattern is:

- `Summary`: row counts by type and priority, retrieval date, caveats.
- `Institutions`: one row per `institution_targets` row.
- `Sources`: parsed URLs and evidence from `raw_json`.
- `Browser Checks`: current source checks, status, and limitations.
- `Scope Notes`: assumptions, exclusions, and handoff guidance.

## Verification

Before final response:

1. Count total rows in `institution_targets`.
2. Check required fields are non-empty: `institution`, `institution_type`, `role`, `offer_research_url`, `source_basis`, `public_signal`, `priority`, `retrieved`, and `raw_json`.
3. Confirm uniqueness for `(institution, offer_research_url)`.
4. Validate every populated `raw_json` value with SQLite JSON functions or a JSON parser.
5. Group counts by `institution_type` and `priority`.
6. If a workbook was exported, render and inspect every sheet, then export one final `.xlsx`.

In the final response, include the database path, table name, row count, inserted/updated/skipped counts, notable uncertainties, and any exported workbook path. State clearly that the work researched institution targets, not individual credit card offers.
