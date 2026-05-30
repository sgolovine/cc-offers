import { defineConfig } from "drizzle-kit";

export const databaseUrl = process.env.DB_FILE_NAME ?? "file:./data/cc-offers.sqlite";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
