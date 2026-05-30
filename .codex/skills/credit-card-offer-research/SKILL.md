---
name: credit-card-offer-research
description: Research current public credit card offers from institution targets in the cc-offers SQLite database and write source-backed findings to the credit_card_offers table, with current browsing and source verification mandatory because offers are time-sensitive. Use when Codex is asked to compare, catalog, refresh, verify, or store credit card welcome offers, intro APRs, fees, rewards, or issuer/source-backed offer data.
---

# Credit Card Offer Research

Research live public credit card offers for the institutions listed in the local database and store source-backed findings in SQLite.

## Core Workflow

1. Use `data/cc-offers.sqlite` as the default database unless the user provides another path.
2. Read the `institution_targets` table to determine which companies/institutions to research. Do not fall back to a hard-coded issuer list; if the database is unavailable, stop and report the blocker unless the user explicitly provides a different scope.
3. Use each target row as research context: `institution`, `institution_type`, `role`, `known_issuer_partner`, `known_rewards_card_examples`, `offer_research_url`, `alternate_issuer_url`, `source_basis`, `public_signal`, `priority`, `retrieved`, `notes`, and `raw_json`.
4. Because offers are time-sensitive, browse current sources. Do not rely on memory or stale prior work.
5. Treat `browser:browser` as a hard requirement. If it is unavailable, stop and report the blocker, or ask the user before using a fallback.
6. Browse safely: do not log in, submit forms, start applications, transmit sensitive data, solve CAPTCHA, bypass safety barriers, or click final apply/accept flows.
7. Prioritize official issuer or partner pages from the target row; use third-party pages only when requested or clearly labeled as supplementary context.
8. Capture the top-level offer facts for every public card offer, then complete the mandatory Enrichment Pass for every card before treating the data as ready.
9. Write findings to the `credit_card_offers` table with source basis, retrieval date, and raw source evidence. Do not delete or overwrite existing rows unless the user explicitly requests a refresh strategy.

## Database Workflow

Inspect the schema before writing. The default target and output tables are:

- `institution_targets`: research scope.
- `credit_card_offers`: one row per researched public card offer.

Default target query:

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

If the user narrows the scope, filter this query rather than using an external issuer list. For each target, start from `offer_research_url`; use `alternate_issuer_url` when the primary page is unavailable, incomplete, or points to a partner surface.

Insert one `credit_card_offers` row for each real public offer found. Do not invent placeholder card offers for institutions where no public credit card offer is found; report those targets in the final response instead. If appending new research to an existing database, report inserted row counts and any possible duplicate risk.

## Source Strategy

Prefer sources in this order:

1. Official issuer credit card listing pages.
2. Official product, offer, terms, pricing, or rates-and-fees pages.
3. Official search-result snippets, page metadata, or page source when SPA-heavy pages expose limited visible text.
4. Supplementary sources, clearly labeled, only when official pages cannot answer the scoped request.

For SPA-heavy pages, use direct official product URLs, browser snapshots, visible metadata, and official snippets as fallback evidence. Record limitations in `source_basis` or `notes`, using labels such as `Official product page`, `Official listing page`, `Official terms page`, or `Official metadata/snippet`.

## Enrichment Pass

After collecting top-level listing or product-page information, perform an Enrichment Pass for every card or offer row. This is mandatory for all cards, including rows that already appear complete from the top-level page.

For each card, navigate beyond the main offer page and search for official supporting pages or documents, including:

- Credit card terms.
- Offer terms.
- Benefit terms.
- Rates and fees.
- Offer details.

Use links from the product page first, then official issuer search, page metadata, source text, disclosure PDFs, pricing pages, benefit guide pages, and other official pages that are clearly tied to the same card or offer. Do not enter application flows or submit personal information to reveal personalized terms.

Use what the Enrichment Pass finds to improve the base offer data already captured:

- Fill missing `annual_fee`, `intro_apr`, `regular_apr`, spend requirement, timing, bonus, reward, and benefit fields when official enrichment sources provide them.
- Refine vague top-level values into clearer source-backed values when terms pages provide more precise language.
- Add or update `source_url`, `source_basis`, and `notes` so the row reflects the strongest source used for each material claim.
- Add every enrichment source to `raw_json` with issuer, URL, source basis, retrieval timestamp, and notes.
- Preserve uncertainty where terms vary by applicant, channel, location, or application flow; explain the limitation instead of flattening it into a false certainty.

If enrichment sources conflict with the top-level page, prefer the issuer's official pricing, terms, rates-and-fees, or offer-terms page for the specific field, and note the discrepancy. If no supporting terms or details page can be found for a card, record the search limitation in `notes` and continue to the Product Terms Escalation workflow for any requested field that remains unresolved.

## Product Terms Escalation

For any requested field that cannot be found on the card's main offer page, run a focused escalation loop before using a placeholder. Research the product terms, pricing terms, rates-and-fees documents, offer terms, or similar legal/terms pages for that particular card and answer the exact missing field.

The escalation search must check the issuer product page, linked terms/pricing/rates-and-fees pages, official PDFs or HTML disclosures, visible page metadata/snippets, and any official terms pages reachable. If the user explicitly authorizes sub-agents, this focused search may be delegated for a specific card and missing fact.

Only record `See product terms` after completing this official-source search and still failing to find the requested information. If the search finds the answer, record the value, `source_url`, `source_basis`, retrieval date, and any limitations in `notes`.

## Offer Fields

Write offer data to `credit_card_offers` using the database column names below. Required columns are marked `NOT NULL` in the schema and must be populated for every inserted row.

- `issuer` (required): issuer, partner, or institution name that owns the offer.
- `card_offer` (required): public card or offer name.
- `segment`: consumer, business, student, secured, co-brand, private-label, or similar.
- `category`: travel, cash back, airline, hotel, retail, balance transfer, secured, or similar.
- `welcome_intro_offer`: visible welcome bonus, intro APR, promo financing, or intro offer summary.
- `bonus_miles`: number of bonus miles/points received, if applicable; otherwise `NA`.
- `cash_bonus`: cash bonus amount in USD, if applicable; otherwise `NA`.
- `spend_requirement`: amount that must be spent to earn the bonus; otherwise `NA`.
- `spend_timeframe`: how long the user has to meet the spend requirement, such as `First 3 months`; otherwise `NA`.
- `spend_requirement_timing`: combined spend-and-timing language from the source; otherwise `NA`.
- `annual_fee`: annual fee or public limitation if it varies.
- `intro_apr`: introductory APR or promo financing language.
- `regular_apr`: regular purchase APR range or public limitation if it varies.
- `rewards_key_perks`: rewards structure and key benefits.
- `source_url` (required): strongest official source URL used for the material offer claims.
- `source_basis` (required): concise label such as `Official product page`, `Official listing page`, `Official terms page`, `Official pricing page`, or `Official metadata/snippet`.
- `retrieved` (required): ISO-8601 retrieval date or timestamp for the current research pass.
- `notes`: uncertainty, conflicts, eligibility limits, enrichment limits, no-apply-flow caveats, or partner context.
- `raw_json`: JSON evidence payload with at least target row identifiers, source URLs consulted, visible source text snippets or paraphrased evidence, and any conflicts/limitations.

Do not invent missing offer details. Use clear placeholders such as `Not found on public source` or `Varies by applicant/channel` and explain uncertainty in `notes`.

Do not use `See product terms` as a shortcut placeholder. It is allowed only after following the Product Terms Escalation workflow above for that particular card and field.

## Writing Rows

Prefer parameterized SQLite writes from a small script or structured database library rather than constructing ad hoc SQL strings. Keep `created_at` and `updated_at` on their default values unless an update operation is explicitly requested.

Use `raw_json` for auditability. Include enough context for a later reviewer to understand why the row exists without reopening every source, but do not paste full copyrighted pages.

Before finalizing a database run:

- Count target rows read from `institution_targets`.
- Count offers inserted into `credit_card_offers`.
- Group inserted rows by `issuer`.
- Check that required fields are non-empty.
- Check `raw_json` is valid JSON when populated.

## Optional Workbook Export

Only create a workbook when the user explicitly asks for one. In that case, use the `spreadsheets:Spreadsheets` workflow: load workspace dependencies, author the workbook with `@oai/artifact-tool`, and export the final `.xlsx` under `outputs/<unique-folder>/`. Treat the database as the source of truth for workbook rows.

For workbook exports, include:

- `Summary`: issuer row counts, no-annual-fee counts where available, notable visible offers, retrieval date, and research caveats.
- `Offers`: formatted and filterable detail table from `credit_card_offers`.
- `Sources`: one row per source from `raw_json` or captured source evidence.
- `Scope Notes`: target count, assumptions, exclusions, caveats, and any representative-coverage decisions.

## Domain Cautions

- Offer terms can vary by applicant, location, marketing channel, referral path, and application flow. Issuer apply pages and pricing terms are the final authority.
- American Express may show personalized or eligibility-dependent welcome-offer language.
- Synchrony has a very large partner-card catalog. Label coverage as representative unless the user explicitly requests exhaustive partner-card coverage.
- Co-branded and business cards may have separate issuer or partner landing pages; record both the card issuer and source basis.

## Verification

Before finalizing:

1. Check that every inserted offer row has at least `issuer`, `card_offer`, `source_url`, `source_basis`, and `retrieved`.
2. Reconcile inserted row counts to the targets researched.
3. Query grouped counts from `credit_card_offers` by `issuer`.
4. Validate populated `raw_json` values with SQLite JSON functions or a JSON parser when available.
5. If a workbook was requested, render every sheet and fix clipped headers, unreadable text, blank sheets, broken charts, or obvious formatting problems.
6. If a workbook was requested, export one final `.xlsx` and validate integrity by loading/opening it as a workbook or checking the archive structure, not only by confirming the file exists.

In the final response, include the database path, target count, inserted or updated offer row count, any targets with no public offers found, and a brief note that offers were researched from current public sources. Include the workbook path only when a workbook was requested.
