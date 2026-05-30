import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const priorityValues = ["High", "Medium", "Low"] as const;

export const institutionTargets = sqliteTable(
  "institution_targets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    institution: text("institution").notNull(),
    institutionType: text("institution_type").notNull(),
    role: text("role").notNull(),
    knownIssuerPartner: text("known_issuer_partner"),
    knownRewardsCardExamples: text("known_rewards_card_examples"),
    offerResearchUrl: text("offer_research_url").notNull(),
    alternateIssuerUrl: text("alternate_issuer_url"),
    sourceBasis: text("source_basis").notNull(),
    publicSignal: text("public_signal").notNull(),
    priority: text("priority", { enum: priorityValues }).notNull(),
    retrieved: text("retrieved").notNull(),
    notes: text("notes"),
    rawJson: text("raw_json").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("institution_targets_institution_url_unique").on(
      table.institution,
      table.offerResearchUrl,
    ),
    index("institution_targets_type_idx").on(table.institutionType),
    index("institution_targets_priority_idx").on(table.priority),
  ],
);

export const creditCardOffers = sqliteTable(
  "credit_card_offers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    issuer: text("issuer").notNull(),
    cardOffer: text("card_offer").notNull(),
    segment: text("segment"),
    category: text("category"),
    welcomeIntroOffer: text("welcome_intro_offer"),
    bonusMiles: text("bonus_miles"),
    cashBonus: text("cash_bonus"),
    spendRequirement: text("spend_requirement"),
    spendTimeframe: text("spend_timeframe"),
    spendRequirementTiming: text("spend_requirement_timing"),
    annualFee: text("annual_fee"),
    introApr: text("intro_apr"),
    regularApr: text("regular_apr"),
    rewardsKeyPerks: text("rewards_key_perks"),
    sourceUrl: text("source_url").notNull(),
    sourceBasis: text("source_basis").notNull(),
    retrieved: text("retrieved").notNull(),
    notes: text("notes"),
    rawJson: text("raw_json"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("credit_card_offers_issuer_idx").on(table.issuer),
    index("credit_card_offers_category_idx").on(table.category),
    index("credit_card_offers_retrieved_idx").on(table.retrieved),
  ],
);

export const offerSources = sqliteTable(
  "offer_sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    issuer: text("issuer").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceBasis: text("source_basis").notNull(),
    retrieved: text("retrieved").notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("offer_sources_issuer_url_unique").on(table.issuer, table.sourceUrl),
    index("offer_sources_retrieved_idx").on(table.retrieved),
  ],
);

export const scopeNotes = sqliteTable(
  "scope_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    topic: text("topic").notNull(),
    note: text("note").notNull(),
    source: text("source"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("scope_notes_topic_idx").on(table.topic)],
);

export type InstitutionTarget = typeof institutionTargets.$inferSelect;
export type NewInstitutionTarget = typeof institutionTargets.$inferInsert;
export type CreditCardOffer = typeof creditCardOffers.$inferSelect;
export type NewCreditCardOffer = typeof creditCardOffers.$inferInsert;
export type OfferSource = typeof offerSources.$inferSelect;
export type NewOfferSource = typeof offerSources.$inferInsert;
export type ScopeNote = typeof scopeNotes.$inferSelect;
export type NewScopeNote = typeof scopeNotes.$inferInsert;
