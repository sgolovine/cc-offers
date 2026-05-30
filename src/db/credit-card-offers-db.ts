import Dexie, { type Table } from "dexie";

import {
  CREDIT_CARD_OFFERS_DEXIE_SCHEMA,
  CREDIT_CARD_OFFERS_STORE,
  type CreditCardOfferSeed,
  seedCreditCardOffers,
} from "../data/credit-card-offers.seed";

export type CreditCardOffersDb = Dexie & {
  [CREDIT_CARD_OFFERS_STORE]: Table<CreditCardOfferSeed, number>;
};

const DATABASE_NAME = "cc-offers";
const DATABASE_VERSION = 1;

let db: CreditCardOffersDb | undefined;

export function getCreditCardOffersDb(): CreditCardOffersDb {
  if (typeof window === "undefined") {
    throw new Error("Dexie is only available in the browser.");
  }

  if (db) {
    return db;
  }

  const nextDb = new Dexie(DATABASE_NAME) as CreditCardOffersDb;

  nextDb.version(DATABASE_VERSION).stores({
    [CREDIT_CARD_OFFERS_STORE]: CREDIT_CARD_OFFERS_DEXIE_SCHEMA,
  });

  nextDb.on.populate.subscribe(() => seedCreditCardOffers(nextDb));

  db = nextDb;

  return nextDb;
}
