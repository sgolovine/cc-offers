import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const priorityValues = ["High", "Medium", "Low"] as const;

export enum CreditCardOfferSegmentValue {
  Business = "BUSINESS",
  BusinessChargeCard = "BUSINESS_CHARGE_CARD",
  BusinessCoBrand = "BUSINESS_CO_BRAND",
  BusinessSecured = "BUSINESS_SECURED",
  Consumer = "CONSUMER",
  ConsumerCoBrand = "CO_BRAND_CONSUMER",
  ConsumerCoBrandPremium = "CO_BRAND_CONSUMER_PREMIUM",
  ConsumerCoBrandPremiumMembership = "CO_BRAND_CONSUMER_PREMIUM_MEMBERSHIP",
  ConsumerCreditBuilding = "CREDIT_BUILDING_CONSUMER",
  ConsumerPrivateLabel = "PRIVATE_LABEL_CONSUMER",
  ConsumerSecured = "SECURED_CONSUMER",
  ConsumerSecuredPrivateLabel = "SECURED_PRIVATE_LABEL_CONSUMER",
  Student = "STUDENT",
}

export const creditCardOfferSegmentValues = Object.values(
  CreditCardOfferSegmentValue,
) as [CreditCardOfferSegmentValue, ...CreditCardOfferSegmentValue[]];

export enum CreditCardOfferCategoryValue {
  AirlineRewards = "AIRLINE_REWARDS",
  AutoRewards = "AUTO_REWARDS",
  AutomotiveFinancing = "AUTOMOTIVE_FINANCING",
  BalanceTransfer = "BALANCE_TRANSFER",
  CashBack = "CASH_BACK",
  CreditBuilding = "CREDIT_BUILDING",
  CruiseRewards = "CRUISE_REWARDS",
  CryptoRewards = "CRYPTO_REWARDS",
  DigitalWalletCashBack = "DIGITAL_WALLET_CASH_BACK",
  DiningRewards = "DINING_REWARDS",
  EducationSavingsCashBack = "EDUCATION_SAVINGS_CASH_BACK",
  FlexibleFinancing = "FLEXIBLE_FINANCING",
  GamingRewards = "GAMING_REWARDS",
  GasRestaurantCashBack = "GAS_RESTAURANT_CASH_BACK",
  GroceryRewards = "GROCERY_REWARDS",
  HealthWellnessFinancing = "HEALTH_WELLNESS_FINANCING",
  HealthWellnessRewards = "HEALTH_WELLNESS_REWARDS",
  HomeFinancing = "HOME_FINANCING",
  HomeImprovementFinancing = "HOME_IMPROVEMENT_FINANCING",
  HotelRewards = "HOTEL_REWARDS",
  JewelryFinancing = "JEWELRY_FINANCING",
  LowIntroApr = "LOW_INTRO_APR",
  MusicRetailFinancing = "MUSIC_RETAIL_FINANCING",
  OutdoorPowerEquipmentFinancing = "OUTDOOR_POWER_EQUIPMENT_FINANCING",
  PointsRewards = "POINTS_REWARDS",
  PowersportsFinancing = "POWERSPORTS_FINANCING",
  PremiumAirlineRewards = "PREMIUM_AIRLINE_REWARDS",
  PremiumTravelRewards = "PREMIUM_TRAVEL_REWARDS",
  RailTravelRewards = "RAIL_TRAVEL_REWARDS",
  RentMortgageRewards = "RENT_MORTGAGE_REWARDS",
  RetailFinancing = "RETAIL_FINANCING",
  RetailRewards = "RETAIL_REWARDS",
  RetailRewardsAndFinancing = "RETAIL_REWARDS_AND_FINANCING",
  Rewards = "REWARDS",
  Secured = "SECURED",
  SpecialtyRetailFinancing = "SPECIALTY_RETAIL_FINANCING",
  SportingGoodsFinancing = "SPORTING_GOODS_FINANCING",
  TelecomRewards = "TELECOM_REWARDS",
  TravelCashBack = "TRAVEL_CASH_BACK",
  TravelMarketplaceRewards = "TRAVEL_MARKETPLACE_REWARDS",
  TravelRewards = "TRAVEL_REWARDS",
  VacationClubRewards = "VACATION_CLUB_REWARDS",
  WarehouseClubCashBack = "WAREHOUSE_CLUB_CASH_BACK",
  WarehouseClubCredit = "WAREHOUSE_CLUB_CREDIT",
  WarehouseClubRewards = "WAREHOUSE_CLUB_REWARDS",
}

export const creditCardOfferCategoryValues = Object.values(
  CreditCardOfferCategoryValue,
) as [CreditCardOfferCategoryValue, ...CreditCardOfferCategoryValue[]];

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
    issuerPartner: text('issuer_partner'),
    cardOffer: text("card_offer").notNull(),
    segment: text("segment", { enum: creditCardOfferSegmentValues }),
    category: text("category", { enum: creditCardOfferCategoryValues }),
    welcomeIntroOffer: text("welcome_intro_offer"),
    bonusMiles: text("bonus_miles"),
    bonusMilesType: text("bonus_miles_type"),
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

export type InstitutionTarget = typeof institutionTargets.$inferSelect;
export type NewInstitutionTarget = typeof institutionTargets.$inferInsert;
export type CreditCardOffer = typeof creditCardOffers.$inferSelect;
export type NewCreditCardOffer = typeof creditCardOffers.$inferInsert;
