/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Pure, reusable builders for EasyAudit file exports. Other LWCs should import these
 * helpers rather than re-serializing the audit trail ad hoc. The trail is always
 * client-built (CalculationStep); do not re-derive it in Apex for export.
 *
 * Filename contract (discoverable by downstream processes):
 *   NZC_EasyAudit_{recordId}_{yyyyMMdd'T'HHmmss'Z'}_audit.json|.md
 * Query tip: ContentVersion.Title LIKE 'NZC_EasyAudit_' + recordId + '%'
 */

/** Stable schema version for the JSON export document. */
export const SCHEMA_VERSION = "1.0";

/** Discriminator for downstream File / ContentVersion processors. */
export const EXPORT_TYPE = "NZC_EasyAudit";

/** Filename prefix shared with Apex NZC_EasyAuditExportService. */
export const FILE_NAME_PREFIX = "NZC_EasyAudit_";

/** Filename suffix before the extension (artifact kind). */
export const FILE_NAME_KIND = "_audit";

/**
 * Builds deterministic PathOnClient / Title base names for a record export.
 * @param {{ recordId: string, exportedAt?: string|Date }} input
 * @returns {{ jsonFileName: string, markdownFileName: string, stamp: string }}
 */
export function buildFileNames({ recordId, exportedAt } = {}) {
  if (!recordId) {
    throw new Error("recordId is required to build export file names.");
  }
  const stamp = formatUtcStamp(exportedAt || new Date());
  const base = `${FILE_NAME_PREFIX}${recordId}_${stamp}${FILE_NAME_KIND}`;
  return {
    jsonFileName: `${base}.json`,
    markdownFileName: `${base}.md`,
    stamp
  };
}

/**
 * Builds JSON + Markdown export payloads from the client audit trail.
 * @param {{
 *   recordId: string,
 *   objectApiName?: string,
 *   steps?: Array<object>,
 *   aiLoadSummary?: string|null,
 *   exportedAt?: string|Date
 * }} input
 */
export function buildAuditExport({
  recordId,
  objectApiName,
  steps,
  aiLoadSummary,
  exportedAt
} = {}) {
  if (!recordId) {
    throw new Error("recordId is required to build an audit export.");
  }

  const exportedAtIso = toIsoString(exportedAt || new Date());
  const normalizedSteps = normalizeSteps(steps);
  const aiAvailable =
    typeof aiLoadSummary === "string" && aiLoadSummary.trim().length > 0;

  const document = {
    schemaVersion: SCHEMA_VERSION,
    exportType: EXPORT_TYPE,
    recordId,
    objectApiName: objectApiName || null,
    exportedAt: exportedAtIso,
    steps: normalizedSteps,
    ai: aiAvailable
      ? { available: true, loadSummary: aiLoadSummary.trim() }
      : { available: false }
  };

  const { jsonFileName, markdownFileName } = buildFileNames({
    recordId,
    exportedAt: exportedAtIso
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    exportType: EXPORT_TYPE,
    jsonString: JSON.stringify(document, null, 2),
    markdownString: buildMarkdown(document),
    jsonFileName,
    markdownFileName,
    document
  };
}

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) {
    return [];
  }
  return steps.map((step) => {
    const out = {
      title: step && step.title != null ? String(step.title) : "",
      descriptions: Array.isArray(step && step.descriptions)
        ? step.descriptions.map((line) => String(line))
        : []
    };
    if (step && step.final != null && step.final !== "") {
      out.final = String(step.final);
    }
    if (step && step.recordLinkName) {
      out.recordLinkName = String(step.recordLinkName);
    }
    if (step && step.recordLinkId) {
      out.recordLinkId = String(step.recordLinkId);
    }
    return out;
  });
}

function buildMarkdown(document) {
  const lines = [
    "# NZC EasyAudit export",
    "",
    `- Record Id: ${document.recordId}`,
    `- Object: ${document.objectApiName || "n/a"}`,
    `- Exported at: ${document.exportedAt}`,
    `- Schema version: ${document.schemaVersion}`,
    ""
  ];

  if (document.ai && document.ai.available) {
    lines.push("## AI summary", "", document.ai.loadSummary, "");
  }

  lines.push("## Calculation steps", "");

  if (!document.steps.length) {
    lines.push("_No calculation steps were available._", "");
  } else {
    document.steps.forEach((step, index) => {
      lines.push(`### ${index + 1}. ${step.title || "Untitled step"}`, "");
      (step.descriptions || []).forEach((line) => {
        lines.push(`- ${line}`);
      });
      if (step.final != null && step.final !== "") {
        lines.push(`- Final: ${step.final}`);
      }
      if (step.recordLinkName) {
        const href = step.recordLinkId || "";
        lines.push(
          href
            ? `- Related: [${step.recordLinkName}](${href})`
            : `- Related: ${step.recordLinkName}`
        );
      }
      lines.push("");
    });
  }

  return lines.join("\n").trimEnd() + "\n";
}

function toIsoString(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    throw new Error("exportedAt must be a valid Date or ISO string.");
  }
  return asDate.toISOString();
}

/** Formats UTC as yyyyMMdd'T'HHmmss'Z' for file names. */
function formatUtcStamp(value) {
  const iso = toIsoString(value);
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
