import { readFile } from "node:fs/promises";

import { sql } from "drizzle-orm";

import { client, databaseUrl, db } from "../src/db/client";
import { institutionTargets, priorityValues, type NewInstitutionTarget } from "../src/db/schema";

const DEFAULT_JSON_PATH = "build_institution_targets.json";
const DEFAULT_RETRIEVED_DATE = "2026-05-30";

type Priority = (typeof priorityValues)[number];

type RawInstitutionTarget = {
  institution?: unknown;
  type?: unknown;
  role?: unknown;
  issuerPartner?: unknown;
  examples?: unknown;
  url?: unknown;
  alternateUrl?: unknown;
  basis?: unknown;
  signal?: unknown;
  priority?: unknown;
  notes?: unknown;
};

function requiredText(value: unknown, field: string, rowNumber: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Row ${rowNumber} is missing required field: ${field}`);
  }

  return value.trim();
}

function optionalText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parsePriority(value: unknown, rowNumber: number): Priority {
  const priority = requiredText(value, "priority", rowNumber);

  if (!priorityValues.includes(priority as Priority)) {
    throw new Error(`Row ${rowNumber} has unsupported priority: ${priority}`);
  }

  return priority as Priority;
}

function mapInstitutionTarget(row: RawInstitutionTarget, rowNumber: number): NewInstitutionTarget {
  return {
    institution: requiredText(row.institution, "institution", rowNumber),
    institutionType: requiredText(row.type, "type", rowNumber),
    role: requiredText(row.role, "role", rowNumber),
    knownIssuerPartner: optionalText(row.issuerPartner),
    knownRewardsCardExamples: optionalText(row.examples),
    offerResearchUrl: requiredText(row.url, "url", rowNumber),
    alternateIssuerUrl: optionalText(row.alternateUrl),
    sourceBasis: requiredText(row.basis, "basis", rowNumber),
    publicSignal: requiredText(row.signal, "signal", rowNumber),
    priority: parsePriority(row.priority, rowNumber),
    retrieved: DEFAULT_RETRIEVED_DATE,
    notes: optionalText(row.notes),
    rawJson: JSON.stringify(row),
  };
}

async function getInstitutionTargetCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(institutionTargets);

  return Number(result?.count ?? 0);
}

async function main(): Promise<void> {
  const jsonPath = process.argv[2] ?? DEFAULT_JSON_PATH;
  const parsed = JSON.parse(await readFile(jsonPath, "utf8")) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`${jsonPath} must contain a JSON array`);
  }

  const rows = parsed.map((row, index) =>
    mapInstitutionTarget(row as RawInstitutionTarget, index + 1),
  );

  const beforeCount = await getInstitutionTargetCount();

  for (const row of rows) {
    await db
      .insert(institutionTargets)
      .values(row)
      .onConflictDoUpdate({
        target: [institutionTargets.institution, institutionTargets.offerResearchUrl],
        set: {
          institutionType: row.institutionType,
          role: row.role,
          knownIssuerPartner: row.knownIssuerPartner,
          knownRewardsCardExamples: row.knownRewardsCardExamples,
          alternateIssuerUrl: row.alternateIssuerUrl,
          sourceBasis: row.sourceBasis,
          publicSignal: row.publicSignal,
          priority: row.priority,
          retrieved: row.retrieved,
          notes: row.notes,
          rawJson: row.rawJson,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  const afterCount = await getInstitutionTargetCount();
  const netNewCount = afterCount - beforeCount;

  console.log(
    `Imported ${rows.length} institution targets into ${databaseUrl}; ${afterCount} total rows (${netNewCount} net new).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    client.close();
  });
