import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

export const databaseUrl = process.env.DB_FILE_NAME ?? "file:./data/cc-offers.sqlite";

export const client = createClient({
  url: databaseUrl,
});

export const db = drizzle(client, { schema });
