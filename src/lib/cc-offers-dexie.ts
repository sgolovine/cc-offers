import Dexie, { type Table } from "dexie";

import seed from "../data/cc-offers.seed.json";

export type InstitutionTargetRecord = {
  id: number;
  institution: string;
  institution_type: string;
  role: string;
  known_issuer_partner: string | null;
  known_rewards_card_examples: string | null;
  offer_research_url: string;
  alternate_issuer_url: string | null;
  source_basis: string;
  public_signal: string;
  priority: "High" | "Medium" | "Low";
  retrieved: string;
  notes: string | null;
  raw_json: string;
  created_at: string;
  updated_at: string;
};

export type CreditCardOfferRecord = {
  id: number;
  issuer: string;
  issuer_partner: string | null;
  card_offer: string;
  segment: string | null;
  category: string | null;
  welcome_intro_offer: string | null;
  bonus_miles: string | null;
  bonus_miles_type: string | null;
  cash_bonus: string | null;
  cash_bonus_type: string | null;
  spend_requirement: string | null;
  spend_timeframe_days_tier_1: string | null;
  spend_timeframe_days_tier_2: string | null;
  spend_requirement_timing: string | null;
  spend_requirement_extra_reqs: string | null;
  base_annual_fee_usd: number | null;
  additional_user_annual_fee_usd: number | null;
  additional_requirements_annual_fee: string | null;
  intro_apr: string | null;
  regular_apr: string | null;
  rewards_key_perks: string | null;
  source_url: string;
  source_basis: string;
  retrieved: string;
  notes: string | null;
  raw_json: string | null;
  created_at: string;
  updated_at: string;
};

type SeedMetadata = {
  key: "sqliteSeed";
  schemaVersion: number;
  sourceDatabase: string;
  sourceModifiedAt: string | null;
  exportedAt: string;
  counts: typeof seed.counts;
};

export class CcOffersDexie extends Dexie {
  institutionTargets!: Table<InstitutionTargetRecord, number>;
  creditCardOffers!: Table<CreditCardOfferRecord, number>;
  metadata!: Table<SeedMetadata, SeedMetadata["key"]>;

  constructor() {
    super("cc-offers");

    this.version(1).stores({
      institutionTargets:
        "id, institution, institution_type, priority, &[institution+offer_research_url]",
      creditCardOffers:
        "id, issuer, issuer_partner, category, segment, retrieved, base_annual_fee_usd",
      metadata: "key",
    });
  }
}

export const ccOffersDb = new CcOffersDexie();

export type SeedImportResult = {
  imported: boolean;
  counts: typeof seed.counts;
  exportedAt: string;
};

export async function importSqliteSeed(options: { force?: boolean } = {}) {
  const expectedMetadata: SeedMetadata = {
    key: "sqliteSeed",
    schemaVersion: seed.schemaVersion,
    sourceDatabase: seed.sourceDatabase,
    sourceModifiedAt: seed.sourceModifiedAt,
    exportedAt: seed.exportedAt,
    counts: seed.counts,
  };

  const currentMetadata = await ccOffersDb.metadata.get("sqliteSeed");
  const isCurrent =
    !options.force &&
    currentMetadata?.schemaVersion === expectedMetadata.schemaVersion &&
    currentMetadata?.sourceModifiedAt === expectedMetadata.sourceModifiedAt &&
    currentMetadata?.exportedAt === expectedMetadata.exportedAt &&
    currentMetadata?.counts.institution_targets === seed.counts.institution_targets &&
    currentMetadata?.counts.credit_card_offers === seed.counts.credit_card_offers;

  if (isCurrent) {
    return {
      imported: false,
      counts: seed.counts,
      exportedAt: seed.exportedAt,
    } satisfies SeedImportResult;
  }

  await ccOffersDb.transaction(
    "rw",
    ccOffersDb.institutionTargets,
    ccOffersDb.creditCardOffers,
    ccOffersDb.metadata,
    async () => {
      await Promise.all([
        ccOffersDb.institutionTargets.clear(),
        ccOffersDb.creditCardOffers.clear(),
      ]);

      await ccOffersDb.institutionTargets.bulkPut(
        seed.tables.institution_targets as InstitutionTargetRecord[],
      );
      await ccOffersDb.creditCardOffers.bulkPut(
        seed.tables.credit_card_offers as CreditCardOfferRecord[],
      );
      await ccOffersDb.metadata.put(expectedMetadata);
    },
  );

  return {
    imported: true,
    counts: seed.counts,
    exportedAt: seed.exportedAt,
  } satisfies SeedImportResult;
}
