import type { CreditCardOfferSeed } from "./credit-card-offers.seed";

export type CreditCardOfferFieldKey = keyof CreditCardOfferSeed;

export interface CreditCardOfferField {
  key: CreditCardOfferFieldKey;
  label: string;
}

export const EMPTY_OFFER_VALUE = "Not provided";

export const CREDIT_CARD_OFFER_FIELDS = [
  { key: "id", label: "ID" },
  { key: "issuer", label: "Issuer" },
  { key: "card_offer", label: "Card Offer" },
  { key: "issuer_partner", label: "Issuer Partner" },
  { key: "segment", label: "Segment" },
  { key: "category", label: "Category" },
  { key: "welcome_intro_offer", label: "Welcome Intro Offer" },
  { key: "bonus_miles", label: "Bonus Miles" },
  { key: "bonus_miles_type", label: "Bonus Miles Type" },
  { key: "cash_bonus", label: "Cash Bonus" },
  { key: "cash_bonus_type", label: "Cash Bonus Type" },
  { key: "spend_requirement", label: "Spend Requirement" },
  {
    key: "spend_requirement_extra_reqs",
    label: "Spend Requirement Extra Requirements",
  },
  {
    key: "spend_timeframe_days_tier_1",
    label: "Spend Timeframe Days Tier 1",
  },
  {
    key: "spend_timeframe_days_tier_2",
    label: "Spend Timeframe Days Tier 2",
  },
  { key: "spend_requirement_timing", label: "Spend Requirement Timing" },
  { key: "base_annual_fee_usd", label: "Base Annual Fee USD" },
  {
    key: "additional_user_annual_fee_usd",
    label: "Additional User Annual Fee USD",
  },
  {
    key: "additional_requirements_annual_fee",
    label: "Additional Requirements Annual Fee",
  },
  { key: "intro_apr", label: "Intro APR" },
  { key: "regular_apr", label: "Regular APR" },
  { key: "rewards_key_perks", label: "Rewards Key Perks" },
  { key: "source_url", label: "Source URL" },
  { key: "source_basis", label: "Source Basis" },
  { key: "retrieved", label: "Retrieved" },
  { key: "notes", label: "Notes" },
  { key: "raw_json", label: "Raw JSON" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
] as const satisfies readonly CreditCardOfferField[];

export function formatOfferValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return EMPTY_OFFER_VALUE;
  }

  return String(value);
}

export function formatTableOfferValue(value: unknown): string {
  const formattedValue = formatOfferValue(value);

  if (formattedValue.length <= 160) {
    return formattedValue;
  }

  return `${formattedValue.slice(0, 157)}...`;
}

export function formatRawJson(value: string | null): string {
  if (!value) {
    return EMPTY_OFFER_VALUE;
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
