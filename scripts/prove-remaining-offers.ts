import { spawnSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE_DB_PATH = "data/cc-offers.sqlite";
const TEMP_DB_PATH = join(tmpdir(), `cc-offers-remaining-proof-${Date.now()}.sqlite`);
const FALLBACK_TEMP_DB_PATH = join(
  tmpdir(),
  `cc-offers-remaining-fallback-proof-${Date.now()}.sqlite`,
);
const TSX_PATH = "node_modules/.bin/tsx";
const PREPARE_SCRIPT_PATH = "scripts/prepare-remaining-offers.ts";
const BROWSER_GATE_SATISFIED_ENV = "BROWSER_GATE_SATISFIED";
const FALLBACK_APPROVAL_ENV = "ALLOW_FALLBACK_OFFICIAL_SOURCE_WRITES";
const EXPECTED_REFUSAL_MESSAGE = "Refusing to write.";
const EXPECTED_LATEST_BROWSER_GATE_STEP = "Source-summary Browser gate retry";
const EXPECTED_BROWSER_GATE_SATISFIED_STEP = "browser:browser gate satisfied before write";
const EXPECTED_FALLBACK_APPROVED_STEP = "Explicit fallback approval for official-source write";
const EXPECTED_PREPARED_ROWS = [
  {
    issuer: "TD Bank USA, N.A. / Nordstrom",
    cardOffer: "Nordstrom Credit Card",
    sourceUrl: "https://www.nordstrom.com/browse/nordy-club/manage-card",
  },
  {
    issuer: "TD Bank USA, N.A. / Nordstrom",
    cardOffer: "Nordstrom Visa Credit Card",
    sourceUrl: "https://www.nordstrom.com/browse/nordy-club/manage-card",
  },
  {
    issuer: "WebBank / Gemini",
    cardOffer: "Gemini Credit Card",
    sourceUrl: "https://www.gemini.com/credit-card",
  },
] as const;
const EXPECTED_PREPARED_TARGETS = [
  {
    id: 92,
    institution: "Nordstrom",
    knownIssuerPartner: "TD Bank",
    knownRewardsCardExamples: "Nordstrom Credit Card, Nordstrom Visa",
  },
  {
    id: 121,
    institution: "Gemini",
    knownIssuerPartner: "WebBank",
    knownRewardsCardExamples: "Gemini Credit Card",
  },
] as const;
const EXPECTED_PREPARED_OFFERS = [
  "TD Bank USA, N.A. / Nordstrom::Nordstrom Credit Card",
  "TD Bank USA, N.A. / Nordstrom::Nordstrom Visa Credit Card",
  "WebBank / Gemini::Gemini Credit Card",
] as const;
const EXPECTED_SOURCE_URLS = [
  "https://assets.ctfassets.net/jg6lo9a2ukvr/4WAbBKi2wX3zG6HFyNP54A/4087b3be698807411388aa7685cd8c89/2026-04-01_Gemini_Credit_Card_Cardholder_Agreement.pdf",
  "https://www.gemini.com/credit-card",
  "https://www.gemini.com/legal/credit-card-rewards-agreement",
  "https://www.nordstrom.com/browse/nordy-club/manage-card",
  "https://www.td.com/content/dam/nordstromcard/document/pdf/nordstrom-credit-card-agreement-en.pdf",
] as const;

type HelperOutput = {
  databaseUrl: string;
  preparedRowCount: number;
  preparedMaterialFingerprintAlgorithm: string;
  preparedMaterialFingerprint: string;
  sourceCheckCount: number;
  failedSourceCheckCount: number;
  sourceContentCheckCount: number;
  failedSourceContentCheckCount: number;
  sourceContentExpectationVerification?: {
    expectedSourceUrls: string[];
    expectationUrls: string[];
    matchesPreparedSources: boolean;
    missingExpectationUrls: string[];
    extraExpectationUrls: string[];
  };
  noPublicOfferTargetCount: number;
  unblockSummary?: {
    liveWriteUnlock: string;
    browserGateRequired?: boolean;
    currentBrowserBlocker?: string;
    browserGateEvidence?: Array<{
      step: string;
      result: string;
      evidence: string;
    }>;
  };
  completionAudit?: {
    achieved: boolean;
    blockers: string[];
  };
  insertedCount: number;
  postInsertVerification?: Array<{
    issuer: string;
    cardOffer: string;
    retrieved: string;
    requiredFieldsPresent: boolean;
    rawJsonValid: boolean;
    browserGateWriteUnlock: string | null;
    browserGateSatisfied: boolean | null;
    browserGateStatus: string | null;
  }>;
  liveDatabaseAudit?: {
    offerCount: number;
    missingRequiredFields: number;
    invalidRawJson: number;
    duplicateCardOfferNames: number;
    preparedRowsAlreadyLive: number;
    preparedRowsMissing: number;
    liveIssuerGroups: Array<{
      issuer: string;
      rows: number;
    }>;
    livePreparedVerification: Array<{
      issuer: string;
      cardOffer: string;
      retrieved: string;
      requiredFieldsPresent: boolean;
      rawJsonValid: boolean;
      browserGateWriteUnlock: string | null;
      browserGateSatisfied: boolean | null;
      browserGateStatus: string | null;
    }>;
  };
  preparedRows?: Array<{
    issuer: string;
    cardOffer: string;
    sourceUrl: string;
  }>;
  preparedTargetCount?: number;
  preparedTargets?: Array<{
    id: number;
    institution: string;
    knownIssuerPartner: string;
    knownRewardsCardExamples: string;
  }>;
  preparedLiveGap?: {
    expectedRows: number;
    existingRows: number;
    missingRows: number;
    existingCardOffers: string[];
    missingCardOffers: string[];
    readyForLiveInsert: boolean;
  };
};

type SummaryOutput = {
  databaseUrl: string;
  targetCount: number;
  offerCount: number;
  insertedCount: number;
  missingRequiredFields: number;
  invalidRawJson: number;
  duplicateCardOfferNames: number;
  liveIssuerGroupCount: number;
  completionAchieved: boolean;
  completionBlockers: string[];
  completionRequirementCount: number;
  completionPassedRequirementCount: number;
  completionFailedRequirementCount: number;
  completionFailedRequirements: Array<{
    name: string;
    evidence: string;
  }>;
  preparedMaterialFingerprintAlgorithm: string;
  preparedMaterialFingerprint: string;
  preparedRowsAlreadyLive: number;
  preparedRowsMissing: number;
  preparedRowsExpected: number;
  readyForLiveInsert: boolean;
  missingCardOffers: string[];
  preparedRows: Array<{
    issuer: string;
    cardOffer: string;
    sourceUrl: string;
  }>;
  preparedTargetCount: number;
  preparedTargets: Array<{
    id: number;
    institution: string;
    knownIssuerPartner: string;
    knownRewardsCardExamples: string;
  }>;
  noPublicOfferTargetCount: number;
  noPublicOfferTargets: string[];
  sourceCheckCount: number;
  failedSourceCheckCount: number;
  sourceContentCheckCount: number;
  failedSourceContentCheckCount: number;
  sourceContentExpectationsMatch: boolean;
  preparedSourceUrlCount: number;
  preparedSourceUrls: string[];
  browserGateRequired: boolean;
  browserGateEvidenceCount: number;
  latestBrowserGateEvidenceStep: string | null;
  browserPaneRecoveryToolFound: boolean;
  browserPaneRecoveryToolDiscovery: string;
  liveWriteUnlock: string;
  currentBrowserBlocker: string;
  browserGateSatisfiedCommand: string;
  fallbackApprovalCommand: string;
  fallbackApprovalEnv: string;
  fallbackApprovalValue: string;
  note: string;
};

type LivePreparedState = "complete" | "incomplete";

type LiveAuditResult = {
  output: HelperOutput;
  state: LivePreparedState;
  status: number;
};

function preparedRowKey(row: { issuer: string; cardOffer: string; sourceUrl: string }): string {
  return `${row.issuer}::${row.cardOffer}::${row.sourceUrl}`;
}

function preparedTargetKey(target: {
  id: number;
  institution: string;
  knownIssuerPartner: string;
  knownRewardsCardExamples: string;
}): string {
  return [
    target.id,
    target.institution,
    target.knownIssuerPartner,
    target.knownRewardsCardExamples,
  ].join("::");
}

function assertExactPreparedRows(label: string, output: HelperOutput): void {
  const actualRows = output.preparedRows ?? [];
  const expectedRows = [...EXPECTED_PREPARED_ROWS];
  const actualKeys = actualRows.map(preparedRowKey).sort();
  const expectedKeys = expectedRows.map(preparedRowKey).sort();

  if (actualKeys.join("|") !== expectedKeys.join("|")) {
    throw new Error(
      `Expected ${label} to prepare exact rows ${JSON.stringify(
        expectedRows,
      )}, got ${JSON.stringify(actualRows)}.`,
    );
  }
}

function assertExactPreparedTargets(
  label: string,
  output: Pick<HelperOutput, "preparedTargetCount" | "preparedTargets">,
): void {
  const actualTargets = output.preparedTargets ?? [];
  const expectedTargets = [...EXPECTED_PREPARED_TARGETS];
  const actualKeys = actualTargets.map(preparedTargetKey).sort();
  const expectedKeys = expectedTargets.map(preparedTargetKey).sort();

  if (
    output.preparedTargetCount !== expectedTargets.length ||
    actualKeys.join("|") !== expectedKeys.join("|")
  ) {
    throw new Error(
      `Expected ${label} to prepare exact database targets ${JSON.stringify(
        expectedTargets,
      )}, got ${JSON.stringify(actualTargets)} with count ${output.preparedTargetCount}.`,
    );
  }
}

function assertPostInsertGateUnlock(
  label: string,
  output: HelperOutput,
  expectedUnlock: string,
  expectedSatisfied: boolean,
): void {
  const postInsertVerification = output.postInsertVerification ?? [];

  if (postInsertVerification.length !== EXPECTED_PREPARED_ROWS.length) {
    throw new Error(
      `Expected ${label} to verify ${EXPECTED_PREPARED_ROWS.length} inserted rows, got ${postInsertVerification.length}.`,
    );
  }

  assertGateUnlockRows(label, postInsertVerification, expectedUnlock, expectedSatisfied);
}

function assertLivePreparedGateUnlock(
  label: string,
  output: HelperOutput,
  expectedUnlock: string,
  expectedSatisfied: boolean,
): void {
  const livePreparedVerification = output.liveDatabaseAudit?.livePreparedVerification ?? [];

  if (livePreparedVerification.length !== EXPECTED_PREPARED_ROWS.length) {
    throw new Error(
      `Expected ${label} to verify ${EXPECTED_PREPARED_ROWS.length} live prepared rows, got ${livePreparedVerification.length}.`,
    );
  }

  assertGateUnlockRows(label, livePreparedVerification, expectedUnlock, expectedSatisfied);
}

function assertGateUnlockRows(
  label: string,
  rows: Array<{
    browserGateWriteUnlock: string | null;
    browserGateSatisfied: boolean | null;
    browserGateStatus: string | null;
  }>,
  expectedUnlock: string,
  expectedSatisfied: boolean,
): void {
  const mismatchedRows = rows.filter(
    (row) =>
      row.browserGateWriteUnlock !== expectedUnlock ||
      row.browserGateSatisfied !== expectedSatisfied ||
      !row.browserGateStatus?.trim(),
  );

  if (mismatchedRows.length > 0) {
    throw new Error(
      `Expected ${label} raw_json to record gate unlock ${expectedUnlock} and satisfied=${expectedSatisfied}, got ${JSON.stringify(
        mismatchedRows,
      )}.`,
    );
  }
}

function assertExactPreparedLiveGap(
  label: string,
  output: HelperOutput,
  expected: {
    existingRows: number;
    missingRows: number;
    existingCardOffers: string[];
    missingCardOffers: string[];
    readyForLiveInsert: boolean;
  },
): void {
  const preparedLiveGap = output.preparedLiveGap;

  if (!preparedLiveGap) {
    throw new Error(`Expected ${label} to emit preparedLiveGap.`);
  }

  const actualExistingCardOffers = [...preparedLiveGap.existingCardOffers].sort();
  const actualMissingCardOffers = [...preparedLiveGap.missingCardOffers].sort();
  const expectedExistingCardOffers = [...expected.existingCardOffers].sort();
  const expectedMissingCardOffers = [...expected.missingCardOffers].sort();

  if (
    preparedLiveGap.expectedRows !== EXPECTED_PREPARED_ROWS.length ||
    preparedLiveGap.existingRows !== expected.existingRows ||
    preparedLiveGap.missingRows !== expected.missingRows ||
    actualExistingCardOffers.join("|") !== expectedExistingCardOffers.join("|") ||
    actualMissingCardOffers.join("|") !== expectedMissingCardOffers.join("|") ||
    preparedLiveGap.readyForLiveInsert !== expected.readyForLiveInsert
  ) {
    throw new Error(
      `Expected ${label} preparedLiveGap ${JSON.stringify(
        expected,
      )}, got ${JSON.stringify(preparedLiveGap)}.`,
    );
  }
}

function assertLatestBrowserGateEvidence(label: string, output: HelperOutput): void {
  const unblockSummary = output.unblockSummary;

  if (unblockSummary?.browserGateRequired !== true) {
    throw new Error(`Expected ${label} to preserve browser gate requirement.`);
  }

  if (!unblockSummary.currentBrowserBlocker?.includes("in-app Browser")) {
    throw new Error(
      `Expected ${label} to include current in-app Browser blocker, got ${JSON.stringify(
        unblockSummary.currentBrowserBlocker,
      )}.`,
    );
  }

  const expectedStep =
    unblockSummary.liveWriteUnlock === "browser-gate-satisfied"
      ? EXPECTED_BROWSER_GATE_SATISFIED_STEP
      : unblockSummary.liveWriteUnlock === "fallback-approved"
        ? EXPECTED_FALLBACK_APPROVED_STEP
        : EXPECTED_LATEST_BROWSER_GATE_STEP;
  const latestEvidence = unblockSummary.browserGateEvidence?.find(
    (entry) => entry.step === expectedStep,
  );

  if (!latestEvidence) {
    throw new Error(
      `Expected ${label} to include Browser gate evidence step ${JSON.stringify(
        expectedStep,
      )}.`,
    );
  }

  if (
    unblockSummary.liveWriteUnlock === "browser-gate-satisfied" ||
    unblockSummary.liveWriteUnlock === "fallback-approved"
  ) {
    if (latestEvidence.result !== "passed") {
      throw new Error(
        `Expected ${label} Browser gate evidence to be passed for ${unblockSummary.liveWriteUnlock}, got ${JSON.stringify(
          latestEvidence,
        )}.`,
      );
    }

    return;
  }

  if (
    latestEvidence.result !== "blocked" ||
    !latestEvidence.evidence.includes("official Nordstrom or Gemini pages") ||
    !latestEvidence.evidence.includes("tabs.content is unsupported")
  ) {
    throw new Error(
      `Expected ${label} latest Browser gate evidence to describe the official-source tab blocker, got ${JSON.stringify(
        latestEvidence,
      )}.`,
    );
  }
}

function assertPreparedMaterialFingerprint(
  label: string,
  output: HelperOutput,
  expectedFingerprint?: string,
): void {
  if (output.preparedMaterialFingerprintAlgorithm !== "sha256-material-v1") {
    throw new Error(
      `Expected ${label} to use sha256-material-v1 fingerprinting, got ${output.preparedMaterialFingerprintAlgorithm}.`,
    );
  }

  if (!/^[a-f0-9]{64}$/.test(output.preparedMaterialFingerprint)) {
    throw new Error(
      `Expected ${label} to emit a sha256 prepared material fingerprint, got ${output.preparedMaterialFingerprint}.`,
    );
  }

  if (
    expectedFingerprint !== undefined &&
    output.preparedMaterialFingerprint !== expectedFingerprint
  ) {
    throw new Error(
      `Expected ${label} prepared material fingerprint to match ${expectedFingerprint}, got ${output.preparedMaterialFingerprint}.`,
    );
  }
}

function assertLiveIssuerGroups(label: string, output: HelperOutput): void {
  const liveDatabaseAudit = output.liveDatabaseAudit;
  const liveIssuerGroups = liveDatabaseAudit?.liveIssuerGroups ?? [];
  const offerCount = liveDatabaseAudit?.offerCount;
  const groupedOfferCount = liveIssuerGroups.reduce((sum, group) => sum + group.rows, 0);
  const invalidGroups = liveIssuerGroups.filter(
    (group) => group.issuer.trim() === "" || !Number.isInteger(group.rows) || group.rows <= 0,
  );

  if (
    !liveDatabaseAudit ||
    liveIssuerGroups.length === 0 ||
    groupedOfferCount !== offerCount ||
    invalidGroups.length > 0
  ) {
    throw new Error(
      `Expected ${label} to include valid live issuer groups summing to offer count ${offerCount}, got ${JSON.stringify(
        { liveIssuerGroups, groupedOfferCount, invalidGroups },
      )}.`,
    );
  }
}

function getTempOfferCount(dbPath = TEMP_DB_PATH): number {
  const result = spawnSync("sqlite3", [
    dbPath,
    "SELECT COUNT(*) FROM credit_card_offers;",
  ], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `sqlite3 count exited with status ${result.status}.`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const count = Number.parseInt(result.stdout.trim(), 10);

  if (!Number.isInteger(count)) {
    throw new Error(`Could not parse temporary offer count: ${result.stdout}`);
  }

  return count;
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function removePreparedRowsFromTemp(dbPath: string): void {
  const deleteClauses = EXPECTED_PREPARED_ROWS.map(
    (row) =>
      `(issuer = ${sqlString(row.issuer)} AND card_offer = ${sqlString(row.cardOffer)})`,
  ).join(" OR ");
  const result = spawnSync("sqlite3", [
    dbPath,
    `DELETE FROM credit_card_offers WHERE ${deleteClauses};`,
  ], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `sqlite3 prepared-row cleanup exited with status ${result.status}.`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function runHelper(
  args: string[],
  extraEnv: Record<string, string>,
  dbPath = TEMP_DB_PATH,
): HelperOutput {
  const result = spawnSync(TSX_PATH, [PREPARE_SCRIPT_PATH, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      DB_FILE_NAME: `file:${dbPath}`,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `Helper exited with status ${result.status}.`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  try {
    return JSON.parse(result.stdout) as HelperOutput;
  } catch (error: unknown) {
    throw new Error(
      `Could not parse helper JSON output: ${
        error instanceof Error ? error.message : String(error)
      }\n${result.stdout}`,
    );
  }
}

function runHelperExpectRefusal(
  args: string[],
  extraEnv: Record<string, string>,
  dbPath = TEMP_DB_PATH,
): string {
  const result = spawnSync(TSX_PATH, [PREPARE_SCRIPT_PATH, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      DB_FILE_NAME: `file:${dbPath}`,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status === 0) {
    throw new Error(
      [
        "Expected helper to refuse unapproved write, but it exited successfully.",
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const combinedOutput = [result.stdout.trim(), result.stderr.trim()]
    .filter(Boolean)
    .join("\n");

  if (!combinedOutput.includes(EXPECTED_REFUSAL_MESSAGE)) {
    throw new Error(
      `Expected refusal output to include ${JSON.stringify(
        EXPECTED_REFUSAL_MESSAGE,
      )}, got:\n${combinedOutput}`,
    );
  }

  return combinedOutput.split("\n")[0] ?? EXPECTED_REFUSAL_MESSAGE;
}

function runHelperAuditLiveState(dbPath = SOURCE_DB_PATH): LiveAuditResult {
  const result = spawnSync(TSX_PATH, [PREPARE_SCRIPT_PATH, "--require-live-complete"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      DB_FILE_NAME: `file:${dbPath}`,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && result.stdout.trim() === "") {
    throw new Error(
      [
        `Live completion audit exited with status ${result.status} and no JSON output.`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const output: HelperOutput = (() => {
    try {
      return JSON.parse(result.stdout) as HelperOutput;
    } catch (error: unknown) {
      throw new Error(
        `Could not parse live audit JSON output: ${
          error instanceof Error ? error.message : String(error)
        }\n${result.stdout}`,
      );
    }
  })();

  assertExactPreparedRows("live audit", output);
  assertExactPreparedTargets("live audit", output);
  assertLiveIssuerGroups("live audit", output);

  const preparedRowsAlreadyLive = output.liveDatabaseAudit?.preparedRowsAlreadyLive;
  const preparedRowsMissing = output.liveDatabaseAudit?.preparedRowsMissing;
  const state: LivePreparedState =
    preparedRowsAlreadyLive === EXPECTED_PREPARED_ROWS.length && preparedRowsMissing === 0
      ? "complete"
      : preparedRowsAlreadyLive === 0 && preparedRowsMissing === EXPECTED_PREPARED_ROWS.length
        ? "incomplete"
        : (() => {
            throw new Error(
              `Live audit has unexpected prepared-row state: ${JSON.stringify({
                preparedRowsAlreadyLive,
                preparedRowsMissing,
                preparedLiveGap: output.preparedLiveGap,
              })}.`,
            );
          })();

  if (state === "complete" && result.status !== 0) {
    throw new Error(
      `Expected completed live audit to exit 0, got ${result.status}:\n${result.stdout}\n${result.stderr}`,
    );
  }

  if (state === "incomplete" && result.status === 0) {
    throw new Error(
      "Expected incomplete live audit to exit non-zero while prepared rows are missing.",
    );
  }

  assertExactPreparedLiveGap("live audit", output, {
    existingRows: state === "complete" ? EXPECTED_PREPARED_ROWS.length : 0,
    missingRows: state === "complete" ? 0 : EXPECTED_PREPARED_ROWS.length,
    existingCardOffers:
      state === "complete" ? EXPECTED_PREPARED_ROWS.map((row) => row.cardOffer) : [],
    missingCardOffers:
      state === "complete" ? [] : EXPECTED_PREPARED_ROWS.map((row) => row.cardOffer),
    readyForLiveInsert: state === "incomplete",
  });

  const blockers = output.completionAudit?.blockers ?? [];

  if (
    state === "incomplete" &&
    !blockers.some(
      (blocker) =>
        blocker.includes("Nordstrom Credit Card") &&
        blocker.includes("Nordstrom Visa Credit Card") &&
        blocker.includes("Gemini Credit Card"),
    )
  ) {
    throw new Error(
      `Expected live completion blocker to name all missing prepared cards, got ${JSON.stringify(
        blockers,
      )}.`,
    );
  }

  if (state === "complete" && output.completionAudit?.achieved !== true) {
    throw new Error(
      `Expected completed live audit to be achieved, got ${JSON.stringify(
        output.completionAudit,
      )}.`,
    );
  }

  if (state === "incomplete" && output.completionAudit?.achieved !== false) {
    throw new Error(
      `Expected incomplete live audit to be unachieved, got ${JSON.stringify(
        output.completionAudit,
      )}.`,
    );
  }

  return { output, state, status: result.status ?? 0 };
}

function runSummary(dbPath = SOURCE_DB_PATH): SummaryOutput {
  const result = spawnSync(TSX_PATH, [PREPARE_SCRIPT_PATH, "--summary"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      DB_FILE_NAME: `file:${dbPath}`,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `Summary helper exited with status ${result.status}.`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  try {
    return JSON.parse(result.stdout) as SummaryOutput;
  } catch (error: unknown) {
    throw new Error(
      `Could not parse summary JSON output: ${
        error instanceof Error ? error.message : String(error)
      }\n${result.stdout}`,
    );
  }
}

function assertSummaryMatchesLiveState(
  summary: SummaryOutput,
  expectedOfferCount: number,
  expectedState: LivePreparedState,
): void {
  const actualPreparedRows = summary.preparedRows.map(preparedRowKey).sort();
  const expectedPreparedRows = [...EXPECTED_PREPARED_ROWS].map(preparedRowKey).sort();
  const actualPreparedTargets = summary.preparedTargets.map(preparedTargetKey).sort();
  const expectedPreparedTargets = [...EXPECTED_PREPARED_TARGETS]
    .map(preparedTargetKey)
    .sort();
  const actualPreparedSourceUrls = [...summary.preparedSourceUrls].sort();
  const expectedPreparedSourceUrls = [...EXPECTED_SOURCE_URLS].sort();
  const expectedMissingCardOffers =
    expectedState === "complete"
      ? []
      : EXPECTED_PREPARED_ROWS.map((row) => row.cardOffer).sort();
  const expectedExistingRows =
    expectedState === "complete" ? EXPECTED_PREPARED_ROWS.length : 0;
  const expectedMissingRows =
    expectedState === "complete" ? 0 : EXPECTED_PREPARED_ROWS.length;
  const expectedReadyForLiveInsert = expectedState === "incomplete";
  const expectedRequirementCount = 10;
  const expectedFailedRequirementCount = expectedState === "complete" ? 0 : 1;
  const expectedPassedRequirementCount =
    expectedRequirementCount - expectedFailedRequirementCount;
  const actualMissingCardOffers = [...summary.missingCardOffers].sort();
  const actualFailedRequirementNames = summary.completionFailedRequirements
    .map((requirement) => requirement.name)
    .sort();
  const expectedFailedRequirementNames =
    expectedState === "complete" ? [] : ["remaining prepared offers are present in live database"];
  const expectedNoteText =
    expectedState === "complete" ? "Completion achieved" : "explicitly approved";

  if (
    summary.targetCount <= 0 ||
    summary.offerCount !== expectedOfferCount ||
    summary.insertedCount !== 0 ||
    summary.missingRequiredFields !== 0 ||
    summary.invalidRawJson !== 0 ||
    summary.duplicateCardOfferNames !== 0 ||
    summary.liveIssuerGroupCount <= 0 ||
    summary.completionAchieved !== (expectedState === "complete") ||
    summary.completionRequirementCount !== expectedRequirementCount ||
    summary.completionPassedRequirementCount !== expectedPassedRequirementCount ||
    summary.completionFailedRequirementCount !== expectedFailedRequirementCount ||
    actualFailedRequirementNames.join("|") !== expectedFailedRequirementNames.join("|") ||
    summary.preparedMaterialFingerprintAlgorithm !== "sha256-material-v1" ||
    !/^[a-f0-9]{64}$/.test(summary.preparedMaterialFingerprint) ||
    summary.preparedRowsAlreadyLive !== expectedExistingRows ||
    summary.preparedRowsMissing !== expectedMissingRows ||
    summary.preparedRowsExpected !== EXPECTED_PREPARED_ROWS.length ||
    summary.readyForLiveInsert !== expectedReadyForLiveInsert ||
    actualPreparedRows.join("|") !== expectedPreparedRows.join("|") ||
    summary.preparedTargetCount !== EXPECTED_PREPARED_TARGETS.length ||
    actualPreparedTargets.join("|") !== expectedPreparedTargets.join("|") ||
    actualMissingCardOffers.join("|") !== expectedMissingCardOffers.join("|") ||
    summary.noPublicOfferTargetCount !== 0 ||
    summary.noPublicOfferTargets.length !== 0 ||
    summary.sourceCheckCount !== 5 ||
    summary.failedSourceCheckCount !== 0 ||
    summary.sourceContentCheckCount !== 5 ||
    summary.failedSourceContentCheckCount !== 0 ||
    summary.sourceContentExpectationsMatch !== true ||
    summary.preparedSourceUrlCount !== EXPECTED_SOURCE_URLS.length ||
    actualPreparedSourceUrls.join("|") !== expectedPreparedSourceUrls.join("|") ||
    summary.browserGateRequired !== true ||
    summary.browserGateEvidenceCount <= 0 ||
    summary.latestBrowserGateEvidenceStep !== EXPECTED_LATEST_BROWSER_GATE_STEP ||
    summary.browserPaneRecoveryToolFound !== false ||
    !summary.browserPaneRecoveryToolDiscovery.includes("no Browser pane recovery tool") ||
    summary.liveWriteUnlock !== "blocked" ||
    summary.fallbackApprovalEnv !== FALLBACK_APPROVAL_ENV ||
    summary.fallbackApprovalValue !== "yes" ||
    !summary.fallbackApprovalCommand.includes(`${FALLBACK_APPROVAL_ENV}=yes`) ||
    !summary.currentBrowserBlocker.includes("in-app Browser") ||
    !summary.note.includes(expectedNoteText)
  ) {
    throw new Error(
      `Unexpected summary ${expectedState} output: ${JSON.stringify(summary)}.`,
    );
  }
}

function main(): void {
  const proofStartedAt = Date.now();
  copyFileSync(SOURCE_DB_PATH, TEMP_DB_PATH);

  const liveGuardedRefusalOfferCountBefore = getTempOfferCount(SOURCE_DB_PATH);
  const liveGuardedRefusalMessage = runHelperExpectRefusal(
    ["--execute"],
    {},
    SOURCE_DB_PATH,
  );
  const liveGuardedRefusalOfferCountAfter = getTempOfferCount(SOURCE_DB_PATH);

  if (liveGuardedRefusalOfferCountAfter !== liveGuardedRefusalOfferCountBefore) {
    throw new Error(
      `Expected unapproved live guarded refusal to leave source offer count unchanged, got ${liveGuardedRefusalOfferCountBefore} before and ${liveGuardedRefusalOfferCountAfter} after.`,
    );
  }

  const liveAuditOfferCountBefore = getTempOfferCount(SOURCE_DB_PATH);
  const liveAuditResult = runHelperAuditLiveState(SOURCE_DB_PATH);
  const liveAuditOutput = liveAuditResult.output;
  const liveAuditOfferCountAfter = getTempOfferCount(SOURCE_DB_PATH);

  if (liveAuditOfferCountAfter !== liveAuditOfferCountBefore) {
    throw new Error(
      `Expected live audit to leave source offer count unchanged, got ${liveAuditOfferCountBefore} before and ${liveAuditOfferCountAfter} after.`,
    );
  }

  assertPreparedMaterialFingerprint("live audit", liveAuditOutput);
  assertLatestBrowserGateEvidence("live audit", liveAuditOutput);

  const liveSummaryOfferCountBefore = getTempOfferCount(SOURCE_DB_PATH);
  const liveSummaryOutput = runSummary(SOURCE_DB_PATH);
  const liveSummaryOfferCountAfter = getTempOfferCount(SOURCE_DB_PATH);

  if (liveSummaryOfferCountAfter !== liveSummaryOfferCountBefore) {
    throw new Error(
      `Expected live summary to leave source offer count unchanged, got ${liveSummaryOfferCountBefore} before and ${liveSummaryOfferCountAfter} after.`,
    );
  }

  assertSummaryMatchesLiveState(
    liveSummaryOutput,
    liveSummaryOfferCountBefore,
    liveAuditResult.state,
  );

  if (
    liveAuditOutput.sourceCheckCount !== 5 ||
    liveAuditOutput.failedSourceCheckCount !== 0 ||
    liveAuditOutput.sourceContentCheckCount !== 5 ||
    liveAuditOutput.failedSourceContentCheckCount !== 0
  ) {
    throw new Error(
      `Expected live audit to pass current official source checks, got ${JSON.stringify({
        sourceCheckCount: liveAuditOutput.sourceCheckCount,
        failedSourceCheckCount: liveAuditOutput.failedSourceCheckCount,
        sourceContentCheckCount: liveAuditOutput.sourceContentCheckCount,
        failedSourceContentCheckCount:
          liveAuditOutput.failedSourceContentCheckCount,
      })}.`,
    );
  }

  removePreparedRowsFromTemp(TEMP_DB_PATH);

  const guardedRefusalOfferCountBefore = getTempOfferCount();
  const guardedRefusalMessage = runHelperExpectRefusal(["--execute"], {});
  const guardedRefusalOfferCountAfter = getTempOfferCount();

  if (guardedRefusalOfferCountAfter !== guardedRefusalOfferCountBefore) {
    throw new Error(
      `Expected guarded refusal to leave temp offer count unchanged, got ${guardedRefusalOfferCountBefore} before and ${guardedRefusalOfferCountAfter} after.`,
    );
  }

  const insertOutput = runHelper(["--execute"], {
    [BROWSER_GATE_SATISFIED_ENV]: "yes",
  });
  assertPreparedMaterialFingerprint("browser-gated proof insert", insertOutput);
  assertLatestBrowserGateEvidence("browser-gated proof insert", insertOutput);
  assertLiveIssuerGroups("browser-gated proof insert", insertOutput);
  assertPostInsertGateUnlock(
    "browser-gated proof insert",
    insertOutput,
    "browser-gate-satisfied",
    true,
  );
  const preparedMaterialFingerprint = insertOutput.preparedMaterialFingerprint;
  const auditOutput = runHelper(["--require-live-complete"], {});
  assertPreparedMaterialFingerprint(
    "browser-gated proof audit",
    auditOutput,
    preparedMaterialFingerprint,
  );
  assertLatestBrowserGateEvidence("browser-gated proof audit", auditOutput);
  assertLiveIssuerGroups("browser-gated proof audit", auditOutput);
  assertLivePreparedGateUnlock(
    "browser-gated proof audit",
    auditOutput,
    "browser-gate-satisfied",
    true,
  );

  copyFileSync(SOURCE_DB_PATH, FALLBACK_TEMP_DB_PATH);
  removePreparedRowsFromTemp(FALLBACK_TEMP_DB_PATH);
  const fallbackOfferCountBefore = getTempOfferCount(FALLBACK_TEMP_DB_PATH);
  const fallbackInsertOutput = runHelper(
    ["--execute"],
    {
      [FALLBACK_APPROVAL_ENV]: "yes",
    },
    FALLBACK_TEMP_DB_PATH,
  );
  const fallbackAuditOutput = runHelper(
    ["--require-live-complete"],
    {},
    FALLBACK_TEMP_DB_PATH,
  );
  assertPreparedMaterialFingerprint(
    "fallback-approved proof insert",
    fallbackInsertOutput,
    preparedMaterialFingerprint,
  );
  assertLatestBrowserGateEvidence("fallback-approved proof insert", fallbackInsertOutput);
  assertLiveIssuerGroups("fallback-approved proof insert", fallbackInsertOutput);
  assertPostInsertGateUnlock(
    "fallback-approved proof insert",
    fallbackInsertOutput,
    "fallback-approved",
    false,
  );
  assertPreparedMaterialFingerprint(
    "fallback-approved proof audit",
    fallbackAuditOutput,
    preparedMaterialFingerprint,
  );
  assertLatestBrowserGateEvidence("fallback-approved proof audit", fallbackAuditOutput);
  assertLiveIssuerGroups("fallback-approved proof audit", fallbackAuditOutput);
  assertLivePreparedGateUnlock(
    "fallback-approved proof audit",
    fallbackAuditOutput,
    "fallback-approved",
    false,
  );
  const fallbackOfferCountAfter = getTempOfferCount(FALLBACK_TEMP_DB_PATH);
  const proofFinishedAt = Date.now();

  if (insertOutput.insertedCount !== 3) {
    throw new Error(`Expected proof insert to add 3 rows, got ${insertOutput.insertedCount}.`);
  }

  if (insertOutput.unblockSummary?.liveWriteUnlock !== "browser-gate-satisfied") {
    throw new Error(
      `Expected proof insert to use browser-gate-satisfied write unlock, got ${insertOutput.unblockSummary?.liveWriteUnlock}.`,
    );
  }

  if (insertOutput.preparedRowCount !== 3) {
    throw new Error(`Expected 3 prepared rows, got ${insertOutput.preparedRowCount}.`);
  }

  assertExactPreparedRows("browser-gated proof insert", insertOutput);

  if (insertOutput.sourceCheckCount !== 5 || insertOutput.failedSourceCheckCount !== 0) {
    throw new Error(
      `Expected 5 reachable official source URLs and 0 failures, got ${insertOutput.sourceCheckCount} checks and ${insertOutput.failedSourceCheckCount} failures.`,
    );
  }

  if (
    insertOutput.sourceContentCheckCount !== 5 ||
    insertOutput.failedSourceContentCheckCount !== 0
  ) {
    throw new Error(
      `Expected 5 official source-content checks and 0 failures, got ${insertOutput.sourceContentCheckCount} checks and ${insertOutput.failedSourceContentCheckCount} failures.`,
    );
  }

  if (insertOutput.sourceContentExpectationVerification?.matchesPreparedSources !== true) {
    throw new Error(
      `Expected source-content expectations to match prepared evidence sources, got ${JSON.stringify(
        insertOutput.sourceContentExpectationVerification,
      )}.`,
    );
  }

  if (insertOutput.noPublicOfferTargetCount !== 0) {
    throw new Error(
      `Expected no no-public-offer targets in proof scope, got ${insertOutput.noPublicOfferTargetCount}.`,
    );
  }

  const postInsertOfferKeys = (insertOutput.postInsertVerification ?? [])
    .map((row) => `${row.issuer}::${row.cardOffer}`)
    .sort();

  if (postInsertOfferKeys.join("|") !== [...EXPECTED_PREPARED_OFFERS].sort().join("|")) {
    throw new Error(
      `Expected proof insert to verify exact prepared offers ${JSON.stringify(
        EXPECTED_PREPARED_OFFERS,
      )}, got ${JSON.stringify(postInsertOfferKeys)}.`,
    );
  }

  const invalidPostInsertRows = (insertOutput.postInsertVerification ?? []).filter(
    (row) => !row.requiredFieldsPresent || !row.rawJsonValid,
  );

  if (invalidPostInsertRows.length > 0) {
    throw new Error(
      `Expected exact proof rows to have required fields and valid raw_json, got ${JSON.stringify(
        invalidPostInsertRows,
      )}.`,
    );
  }

  const staleRetrievedRows = (insertOutput.postInsertVerification ?? []).filter((row) => {
    const retrievedTime = Date.parse(row.retrieved);

    return (
      Number.isNaN(retrievedTime) ||
      retrievedTime < proofStartedAt - 60_000 ||
      retrievedTime > proofFinishedAt + 60_000
    );
  });

  if (staleRetrievedRows.length > 0) {
    throw new Error(
      `Expected exact proof rows to have current ISO retrieved timestamps, got ${JSON.stringify(
        staleRetrievedRows,
      )}.`,
    );
  }

  if (auditOutput.completionAudit?.achieved !== true) {
    throw new Error(
      `Expected proof audit to pass, blockers: ${JSON.stringify(
        auditOutput.completionAudit?.blockers ?? [],
      )}`,
    );
  }

  if (auditOutput.liveDatabaseAudit?.preparedRowsMissing !== 0) {
    throw new Error(
      `Expected no prepared rows missing in proof DB, got ${auditOutput.liveDatabaseAudit?.preparedRowsMissing}.`,
    );
  }

  assertExactPreparedRows("browser-gated proof audit", auditOutput);
  assertExactPreparedLiveGap("browser-gated proof audit", auditOutput, {
    existingRows: EXPECTED_PREPARED_ROWS.length,
    missingRows: 0,
    existingCardOffers: EXPECTED_PREPARED_ROWS.map((row) => row.cardOffer),
    missingCardOffers: [],
    readyForLiveInsert: false,
  });

  if (fallbackOfferCountBefore !== guardedRefusalOfferCountBefore) {
    throw new Error(
      `Expected fallback proof to start from ${guardedRefusalOfferCountBefore} rows, got ${fallbackOfferCountBefore}.`,
    );
  }

  if (fallbackInsertOutput.insertedCount !== 3) {
    throw new Error(
      `Expected fallback-approved proof insert to add 3 rows, got ${fallbackInsertOutput.insertedCount}.`,
    );
  }

  assertExactPreparedRows("fallback-approved proof insert", fallbackInsertOutput);

  if (fallbackOfferCountAfter - fallbackOfferCountBefore !== 3) {
    throw new Error(
      `Expected fallback-approved proof DB count to increase by 3, got ${fallbackOfferCountBefore} before and ${fallbackOfferCountAfter} after.`,
    );
  }

  if (fallbackInsertOutput.unblockSummary?.liveWriteUnlock !== "fallback-approved") {
    throw new Error(
      `Expected fallback proof insert to use fallback-approved write unlock, got ${fallbackInsertOutput.unblockSummary?.liveWriteUnlock}.`,
    );
  }

  if (
    fallbackInsertOutput.sourceCheckCount !== 5 ||
    fallbackInsertOutput.failedSourceCheckCount !== 0 ||
    fallbackInsertOutput.sourceContentCheckCount !== 5 ||
    fallbackInsertOutput.failedSourceContentCheckCount !== 0
  ) {
    throw new Error(
      `Expected fallback proof to pass source checks, got ${JSON.stringify({
        sourceCheckCount: fallbackInsertOutput.sourceCheckCount,
        failedSourceCheckCount: fallbackInsertOutput.failedSourceCheckCount,
        sourceContentCheckCount: fallbackInsertOutput.sourceContentCheckCount,
        failedSourceContentCheckCount: fallbackInsertOutput.failedSourceContentCheckCount,
      })}.`,
    );
  }

  if (
    fallbackInsertOutput.sourceContentExpectationVerification?.matchesPreparedSources !== true
  ) {
    throw new Error(
      `Expected fallback source-content expectations to match prepared evidence sources, got ${JSON.stringify(
        fallbackInsertOutput.sourceContentExpectationVerification,
      )}.`,
    );
  }

  const fallbackPostInsertOfferKeys = (fallbackInsertOutput.postInsertVerification ?? [])
    .map((row) => `${row.issuer}::${row.cardOffer}`)
    .sort();

  if (
    fallbackPostInsertOfferKeys.join("|") !== [...EXPECTED_PREPARED_OFFERS].sort().join("|")
  ) {
    throw new Error(
      `Expected fallback proof insert to verify exact prepared offers ${JSON.stringify(
        EXPECTED_PREPARED_OFFERS,
      )}, got ${JSON.stringify(fallbackPostInsertOfferKeys)}.`,
    );
  }

  const invalidFallbackPostInsertRows = (
    fallbackInsertOutput.postInsertVerification ?? []
  ).filter((row) => !row.requiredFieldsPresent || !row.rawJsonValid);

  if (invalidFallbackPostInsertRows.length > 0) {
    throw new Error(
      `Expected fallback proof rows to have required fields and valid raw_json, got ${JSON.stringify(
        invalidFallbackPostInsertRows,
      )}.`,
    );
  }

  if (fallbackAuditOutput.completionAudit?.achieved !== true) {
    throw new Error(
      `Expected fallback proof audit to pass, blockers: ${JSON.stringify(
        fallbackAuditOutput.completionAudit?.blockers ?? [],
      )}`,
    );
  }

  if (fallbackAuditOutput.liveDatabaseAudit?.preparedRowsMissing !== 0) {
    throw new Error(
      `Expected no prepared rows missing in fallback proof DB, got ${fallbackAuditOutput.liveDatabaseAudit?.preparedRowsMissing}.`,
    );
  }

  assertExactPreparedRows("fallback-approved proof audit", fallbackAuditOutput);
  assertExactPreparedLiveGap("fallback-approved proof audit", fallbackAuditOutput, {
    existingRows: EXPECTED_PREPARED_ROWS.length,
    missingRows: 0,
    existingCardOffers: EXPECTED_PREPARED_ROWS.map((row) => row.cardOffer),
    missingCardOffers: [],
    readyForLiveInsert: false,
  });

  console.log(
    JSON.stringify(
      {
        sourceDatabasePath: SOURCE_DB_PATH,
        tempDatabasePath: TEMP_DB_PATH,
        liveGuardedRefusal: {
          refused: true,
          message: liveGuardedRefusalMessage,
          offerCountBefore: liveGuardedRefusalOfferCountBefore,
          offerCountAfter: liveGuardedRefusalOfferCountAfter,
        },
        liveSourceAudit: {
          state: liveAuditResult.state,
          status: liveAuditResult.status,
          completionAchieved: liveAuditOutput.completionAudit?.achieved,
          offerCountBefore: liveAuditOfferCountBefore,
          offerCountAfter: liveAuditOfferCountAfter,
          preparedRowsAlreadyLive:
            liveAuditOutput.liveDatabaseAudit?.preparedRowsAlreadyLive,
          preparedRowsMissing: liveAuditOutput.liveDatabaseAudit?.preparedRowsMissing,
          preparedRows: liveAuditOutput.preparedRows,
          preparedLiveGap: liveAuditOutput.preparedLiveGap,
          latestBrowserGateEvidenceStep: EXPECTED_LATEST_BROWSER_GATE_STEP,
          blockers: liveAuditOutput.completionAudit?.blockers,
          sourceCheckCount: liveAuditOutput.sourceCheckCount,
          failedSourceCheckCount: liveAuditOutput.failedSourceCheckCount,
          sourceContentCheckCount: liveAuditOutput.sourceContentCheckCount,
          failedSourceContentCheckCount: liveAuditOutput.failedSourceContentCheckCount,
          liveIssuerGroupCount: liveAuditOutput.liveDatabaseAudit?.liveIssuerGroups.length,
          preparedMaterialFingerprint: liveAuditOutput.preparedMaterialFingerprint,
        },
        liveSummary: liveSummaryOutput,
        guardedRefusal: {
          refused: true,
          message: guardedRefusalMessage,
          offerCountBefore: guardedRefusalOfferCountBefore,
          offerCountAfter: guardedRefusalOfferCountAfter,
        },
        liveWriteUnlock: insertOutput.unblockSummary?.liveWriteUnlock,
        insertedCount: insertOutput.insertedCount,
        preparedRowCount: insertOutput.preparedRowCount,
        preparedMaterialFingerprintAlgorithm:
          insertOutput.preparedMaterialFingerprintAlgorithm,
        preparedMaterialFingerprint,
        sourceCheckCount: insertOutput.sourceCheckCount,
        failedSourceCheckCount: insertOutput.failedSourceCheckCount,
        sourceContentCheckCount: insertOutput.sourceContentCheckCount,
        failedSourceContentCheckCount: insertOutput.failedSourceContentCheckCount,
        sourceContentExpectationsMatch:
          insertOutput.sourceContentExpectationVerification?.matchesPreparedSources,
        noPublicOfferTargetCount: insertOutput.noPublicOfferTargetCount,
        postInsertOfferKeys,
        postInsertRetrievedValues: (insertOutput.postInsertVerification ?? []).map((row) => ({
          cardOffer: row.cardOffer,
          retrieved: row.retrieved,
        })),
        completionAchieved: auditOutput.completionAudit.achieved,
        offerCount: auditOutput.liveDatabaseAudit?.offerCount,
        liveIssuerGroupCount: auditOutput.liveDatabaseAudit?.liveIssuerGroups.length,
        preparedRowsAlreadyLive: auditOutput.liveDatabaseAudit?.preparedRowsAlreadyLive,
        preparedRowsMissing: auditOutput.liveDatabaseAudit?.preparedRowsMissing,
        missingRequiredFields: auditOutput.liveDatabaseAudit?.missingRequiredFields,
        invalidRawJson: auditOutput.liveDatabaseAudit?.invalidRawJson,
        duplicateCardOfferNames: auditOutput.liveDatabaseAudit?.duplicateCardOfferNames,
        fallbackApprovedProof: {
          tempDatabasePath: FALLBACK_TEMP_DB_PATH,
          liveWriteUnlock: fallbackInsertOutput.unblockSummary?.liveWriteUnlock,
          insertedCount: fallbackInsertOutput.insertedCount,
          preparedMaterialFingerprint: fallbackInsertOutput.preparedMaterialFingerprint,
          offerCountBefore: fallbackOfferCountBefore,
          offerCountAfter: fallbackOfferCountAfter,
          liveIssuerGroupCount:
            fallbackAuditOutput.liveDatabaseAudit?.liveIssuerGroups.length,
          sourceCheckCount: fallbackInsertOutput.sourceCheckCount,
          failedSourceCheckCount: fallbackInsertOutput.failedSourceCheckCount,
          sourceContentCheckCount: fallbackInsertOutput.sourceContentCheckCount,
          failedSourceContentCheckCount: fallbackInsertOutput.failedSourceContentCheckCount,
          sourceContentExpectationsMatch:
            fallbackInsertOutput.sourceContentExpectationVerification?.matchesPreparedSources,
          postInsertOfferKeys: fallbackPostInsertOfferKeys,
          completionAchieved: fallbackAuditOutput.completionAudit?.achieved,
          preparedRowsMissing: fallbackAuditOutput.liveDatabaseAudit?.preparedRowsMissing,
        },
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error: unknown) {
  console.error(error);
  process.exitCode = 1;
}
