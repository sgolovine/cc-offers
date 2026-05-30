---
name: credit-card-offer-research
description: Research current public credit card offers from bank issuers and produce an auditable spreadsheet, with current browsing and source verification mandatory because offers are time-sensitive. Use when Codex is asked to compare, catalog, refresh, or verify credit card welcome offers, intro APRs, fees, rewards, or source-backed issuer offer tables, especially for Chase/JPMorgan Chase, American Express, Citi, Capital One, Bank of America, Discover, Wells Fargo, U.S. Bank, Synchrony, or Barclays.
---

# Credit Card Offer Research

Research live public credit card offers and deliver a verified `.xlsx` workbook with source-backed detail.

## Core Workflow

1. Confirm the issuer list and coverage depth. If the prompt does not override it, use: Chase / JPMorgan Chase, American Express, Citi, Capital One, Bank of America, Discover, Wells Fargo, U.S. Bank, Synchrony, and Barclays.
2. Because offers are time-sensitive, browse current sources. Do not rely on memory or stale prior work.
3. Treat `browser:browser` and `spreadsheets:Spreadsheets` as hard requirements. If either is unavailable, stop and report the blocker, or ask the user before using a fallback.
4. Browse safely: do not log in, submit forms, start applications, transmit sensitive data, solve CAPTCHA, bypass safety barriers, or click final apply/accept flows.
5. Prioritize official issuer pages; use third-party pages only when requested or clearly labeled as supplementary context.
6. Capture the top-level offer facts for every card, then complete the mandatory Enrichment Pass for every card before treating the data as ready for workbook production.
7. Capture every offer with source basis and retrieval date, then build and verify the `.xlsx` under `outputs/<unique-folder>/`.

## Source Strategy

Prefer sources in this order:

1. Official issuer credit card listing pages.
2. Official product, offer, terms, pricing, or rates-and-fees pages.
3. Official search-result snippets, page metadata, or page source when SPA-heavy pages expose limited visible text.
4. Supplementary sources, clearly labeled, only when official pages cannot answer the scoped request.

For SPA-heavy pages, use direct official product URLs, browser snapshots, visible metadata, and official snippets as fallback evidence. Record limitations in `Source Basis` or `Notes`, using labels such as `Official product page`, `Official listing page`, `Official terms page`, or `Official metadata/snippet`.

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

- Fill missing `Annual Fee`, `Intro APR`, `Regular APR`, spend requirement, timing, bonus, reward, and benefit fields when official enrichment sources provide them.
- Refine vague top-level values into clearer source-backed values when terms pages provide more precise language.
- Add or update `Source URL`, `Source Basis`, and `Notes` so the row reflects the strongest source used for each material claim.
- Add every enrichment source to the `Sources` sheet with issuer, URL, source basis, retrieval timestamp, and notes.
- Preserve uncertainty where terms vary by applicant, channel, location, or application flow; explain the limitation instead of flattening it into a false certainty.

If enrichment sources conflict with the top-level page, prefer the issuer's official pricing, terms, rates-and-fees, or offer-terms page for the specific field, and note the discrepancy. If no supporting terms or details page can be found for a card, record the search limitation in `Notes` and continue to the Product Terms Escalation workflow for any requested field that remains unresolved.

## Product Terms Escalation

For any requested field that cannot be found on the card's main offer page, run this escalation loop before using a placeholder: spawn a sub-agent for that specific card and missing fact. Instruct the sub-agent to use `browser:browser` at `/home/sgolovine/.codex/plugins/cache/openai-bundled/browser/26.519.81530/skills/browser/SKILL.md` to research the product terms, pricing terms, rates-and-fees documents, offer terms, or similar legal/terms pages for that particular card and answer the exact missing field.

The sub-agent must perform an exhaustive official-source search for that card's terms before returning. It should check the issuer product page, linked terms/pricing/rates-and-fees pages, official PDFs or HTML disclosures, visible page metadata/snippets, and any official terms pages reachable.

Only record `See product terms` when the sub-agent reports that it completed an exhaustive search and still could not find the requested information. If the sub-agent finds the answer, record the value, source URL, source basis, retrieval date, and any limitations in `Notes`.

## Offer Fields

Use this exact detail table schema for every offer. These fields are required: do not add, remove, rename, reorder, or replace them, even if the user requests a different schema.

- `Issuer`
- `Card / Offer`
- `Segment`
- `Category`
- `Welcome / Intro Offer`
- `Bonus Miles`
- `Cash Bonus`
- `Spend Requirement`
- `Spent Timeframe`
- `Spend Requirement / Timing`
- `Annual Fee`
- `Intro APR`
- `Regular APR`
- `Rewards / Key Perks`
- `Source URL`
- `Source Basis`
- `Retrieved`
- `Notes`

Populate the new bonus and spend fields as follows. If any of these fields do not apply to an offer, return `NA`.

- `Bonus Miles`: number of bonus miles received, if applicable.
- `Cash Bonus`: amount of cash bonus received in USD, if applicable.
- `Spend Requirement`: amount that must be spent to earn the bonus.
- `Spent Timeframe`: how long the user has to meet the spend requirement, such as `First 3 months`.

Do not invent missing offer details. Use clear placeholders such as `Not found on public source` or `Varies by applicant/channel` and explain uncertainty in `Notes`.

Do not use `See product terms` as a shortcut placeholder. It is allowed only after following the Product Terms Escalation workflow above for that particular card and field.

## Workbook Production

Use the `spreadsheets:Spreadsheets` workflow: load workspace dependencies, author the workbook with `@oai/artifact-tool`, and export the final `.xlsx` under `outputs/<unique-folder>/`. For non-trivial workbooks, create one repeatable builder script and rerun it after edits.

## Workbook Structure

Create a workbook with these sheets:

- `Summary`: issuer row counts, no-annual-fee counts, notable visible offers, retrieval date, and research caveats. Include no-annual-fee counts whenever Annual Fee data is populated; caveat them only when public sources do not expose enough fee data.
- `Offers`: formatted and filterable detail table using the offer fields above.
- `Sources`: one row per source with issuer, URL, source basis, retrieval timestamp, and notes.
- `Scope Notes`: assumptions, exclusions, caveats, and any representative-coverage decisions.

For large or analytical requests, add summary formulas, filters, freeze panes, readable column widths, and neutral formatting. Keep counts and derived summaries formula-driven from the Offers table.

## Domain Cautions

- Offer terms can vary by applicant, location, marketing channel, referral path, and application flow. Issuer apply pages and pricing terms are the final authority.
- American Express may show personalized or eligibility-dependent welcome-offer language.
- Synchrony has a very large partner-card catalog. Label coverage as representative unless the user explicitly requests exhaustive partner-card coverage.
- Co-branded and business cards may have separate issuer or partner landing pages; record both the card issuer and source basis.

## Verification

Before finalizing:

1. Check that every offer row has at least issuer, card/offer, source URL, source basis, retrieved date, and notes when facts are uncertain.
2. Reconcile summary counts to the Offers table.
3. Inspect key ranges in `Summary`, `Offers`, `Sources`, and `Scope Notes` for values and formulas.
4. Scan formulas for errors such as `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, and `#N/A`.
5. Render every sheet and fix clipped headers, unreadable text, blank sheets, broken charts, or obvious formatting problems.
6. Export one final `.xlsx` and validate integrity by loading/opening it as a workbook or checking the archive structure, not only by confirming the file exists.

In the final response, include the workbook path, row/source counts, and a brief note that offers were researched from current public sources.
