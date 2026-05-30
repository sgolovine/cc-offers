import { createClient } from "@libsql/client";
import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";

const sourceDatabase = process.env.DB_FILE_NAME ?? "file:./data/cc-offers.sqlite";
const outputPath = "src/data/cc-offers.seed.json";

const tables = ["institution_targets", "credit_card_offers"] as const;

type SeedTable = (typeof tables)[number];

type SeedPayload = {
  schemaVersion: 1;
  sourceDatabase: string;
  sourceModifiedAt: string | null;
  exportedAt: string;
  tables: Record<SeedTable, Array<Record<string, unknown>>>;
  counts: Record<SeedTable, number>;
};

function localFilePath(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) return null;
  return databaseUrl.slice("file:".length);
}

async function getSourceModifiedAt(databaseUrl: string) {
  const path = localFilePath(databaseUrl);
  if (!path) return null;

  try {
    return new Date((await stat(path)).mtimeMs).toISOString();
  } catch {
    return null;
  }
}

const client = createClient({ url: sourceDatabase });

try {
  const seedTables = {} as SeedPayload["tables"];
  const counts = {} as SeedPayload["counts"];

  for (const table of tables) {
    const result = await client.execute(`select * from ${table} order by id`);
    seedTables[table] = result.rows.map((row) => ({ ...row }));
    counts[table] = result.rows.length;
  }

  const payload: SeedPayload = {
    schemaVersion: 1,
    sourceDatabase,
    sourceModifiedAt: await getSourceModifiedAt(sourceDatabase),
    exportedAt: new Date().toISOString(),
    tables: seedTables,
    counts,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(`${outputPath}.tmp`, `${JSON.stringify(payload, null, 2)}\n`);
  await rename(`${outputPath}.tmp`, outputPath);

  console.log(
    `Exported ${counts.institution_targets} institution targets and ${counts.credit_card_offers} credit card offers to ${relative(process.cwd(), outputPath)}.`,
  );
} finally {
  client.close();
}
