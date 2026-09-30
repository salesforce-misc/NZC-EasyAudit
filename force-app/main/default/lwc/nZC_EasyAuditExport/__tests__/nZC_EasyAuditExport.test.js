/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import {
  SCHEMA_VERSION,
  EXPORT_TYPE,
  FILE_NAME_PREFIX,
  FILE_NAME_KIND,
  buildFileNames,
  buildAuditExport
} from "c/nZC_EasyAuditExport";

const SAMPLE_STEPS = [
  {
    title: "Total fuel consumption Kwh",
    descriptions: ["100 L * 10 = 1000 Kwh"],
    final: "1000 Kwh",
    recordLinkName: "EF Set",
    recordLinkId: "https://example.my.salesforce.com/a0E000000000001"
  }
];

const FIXED_AT = "2026-09-30T13:04:05.000Z";

describe("c-n-z-c-easy-audit-export", () => {
  it("builds discoverable file names with prefix, record Id, stamp, and kind", () => {
    const names = buildFileNames({
      recordId: "a01000000000001AAA",
      exportedAt: FIXED_AT
    });

    expect(names.stamp).toBe("20260930T130405Z");
    expect(names.jsonFileName).toBe(
      `${FILE_NAME_PREFIX}a01000000000001AAA_20260930T130405Z${FILE_NAME_KIND}.json`
    );
    expect(names.markdownFileName).toBe(
      `${FILE_NAME_PREFIX}a01000000000001AAA_20260930T130405Z${FILE_NAME_KIND}.md`
    );
  });

  it("throws when recordId is missing for file names", () => {
    expect(() => buildFileNames({})).toThrow(/recordId/i);
  });

  it("builds a stable JSON document with schema and steps", () => {
    const result = buildAuditExport({
      recordId: "a01000000000001AAA",
      objectApiName: "StnryAssetEnrgyUse",
      steps: SAMPLE_STEPS,
      exportedAt: FIXED_AT
    });

    expect(result.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.exportType).toBe(EXPORT_TYPE);

    const parsed = JSON.parse(result.jsonString);
    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.exportType).toBe("NZC_EasyAudit");
    expect(parsed.recordId).toBe("a01000000000001AAA");
    expect(parsed.objectApiName).toBe("StnryAssetEnrgyUse");
    expect(parsed.exportedAt).toBe(FIXED_AT);
    expect(parsed.steps).toHaveLength(1);
    expect(parsed.steps[0].title).toBe("Total fuel consumption Kwh");
    expect(parsed.steps[0].final).toBe("1000 Kwh");
    expect(parsed.ai).toEqual({ available: false });
  });

  it("includes load-time AI summary when provided", () => {
    const result = buildAuditExport({
      recordId: "a01000000000001AAA",
      steps: SAMPLE_STEPS,
      aiLoadSummary: "  Fuel consumption drove the final result.  ",
      exportedAt: FIXED_AT
    });

    const parsed = JSON.parse(result.jsonString);
    expect(parsed.ai).toEqual({
      available: true,
      loadSummary: "Fuel consumption drove the final result."
    });
    expect(result.markdownString).toContain("## AI summary");
    expect(result.markdownString).toContain(
      "Fuel consumption drove the final result."
    );
  });

  it("omits AI summary section when summary is blank", () => {
    const result = buildAuditExport({
      recordId: "a01000000000001AAA",
      steps: SAMPLE_STEPS,
      aiLoadSummary: "   ",
      exportedAt: FIXED_AT
    });

    const parsed = JSON.parse(result.jsonString);
    expect(parsed.ai).toEqual({ available: false });
    expect(parsed.ai.loadSummary).toBeUndefined();
    expect(result.markdownString).not.toContain("## AI summary");
  });

  it("renders markdown with metadata, steps, final, and related link", () => {
    const result = buildAuditExport({
      recordId: "a01000000000001AAA",
      objectApiName: "VehicleAssetEnrgyUse",
      steps: SAMPLE_STEPS,
      exportedAt: FIXED_AT
    });

    expect(result.markdownString).toContain("# NZC EasyAudit export");
    expect(result.markdownString).toContain("a01000000000001AAA");
    expect(result.markdownString).toContain("VehicleAssetEnrgyUse");
    expect(result.markdownString).toContain(
      "### 1. Total fuel consumption Kwh"
    );
    expect(result.markdownString).toContain(
      "- 100 L * 10 = 1000 Kwh"
    );
    expect(result.markdownString).toContain("- Final: 1000 Kwh");
    expect(result.markdownString).toContain(
      "- Related: [EF Set](https://example.my.salesforce.com/a0E000000000001)"
    );
  });

  it("throws when recordId is missing for the export document", () => {
    expect(() => buildAuditExport({ steps: SAMPLE_STEPS })).toThrow(/recordId/i);
  });
});
