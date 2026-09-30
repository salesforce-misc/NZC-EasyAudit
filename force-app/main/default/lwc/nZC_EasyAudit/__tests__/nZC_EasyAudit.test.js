/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from "lwc";
import NZCEasyAudit from "c/nZC_EasyAudit";
import getAuditInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";
import saveAuditExport from "@salesforce/apex/NZC_EasyAuditExportController.saveAuditExport";
import getAuditSummary from "@salesforce/apex/NZC_EasyAuditAiController.getAuditSummary";

jest.mock(
  "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/NZC_EasyAuditExportController.saveAuditExport",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/NZC_EasyAuditAiController.getAuditSummary",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/NZC_EasyAuditAiController.askAuditQuestion",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

// Minimal StnryAssetEnrgyUse payload: unconditional steps in
// NZC_EasyAuditStationaryCalc.run() (FuelConsumptionInKwh,
// FuelConsumptionInGigajoule, TotalFuelConsumptionInKwh,
// OccupiedFloorAreaInSqft) all execute with defaults, no Scope set so the
// Scope1/Scope2 steps are skipped.
const STATIONARY_PAYLOAD = {
  objectName: "StnryAssetEnrgyUse"
};

describe("c-n-z-c-easy-audit", () => {
  afterEach(() => {
    jest.clearAllMocks();
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("does not render the expand-all button when there are no steps", async () => {
    getAuditInfo.mockResolvedValue({});
    const element = createElement("c-n-z-c-easy-audit", {
      is: NZCEasyAudit
    });
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    const button = element.shadowRoot.querySelector(
      'lightning-button[data-id="toggle-expand"]'
    );
    expect(button).toBeNull();
    expect(
      element.shadowRoot.querySelector(
        'lightning-button[data-id="export-audit"]'
      )
    ).toBeNull();
  });

  it("toggles active-section-name across all steps and flips the button label", async () => {
    getAuditInfo.mockResolvedValue(STATIONARY_PAYLOAD);
    const element = createElement("c-n-z-c-easy-audit", {
      is: NZCEasyAudit
    });
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    const accordion = element.shadowRoot.querySelector("lightning-accordion");
    const steps = element.shadowRoot.querySelectorAll(
      "c-n-z-c_-easy-audit-step"
    );
    expect(steps.length).toBeGreaterThan(0);
    expect(accordion.activeSectionName).toEqual([]);

    const button = element.shadowRoot.querySelector(
      'lightning-button[data-id="toggle-expand"]'
    );
    expect(button.label).toBe("Expand all");

    button.click();
    await Promise.resolve();

    expect(button.label).toBe("Collapse all");
    expect(accordion.activeSectionName).toHaveLength(steps.length);

    button.click();
    await Promise.resolve();

    expect(button.label).toBe("Expand all");
    expect(accordion.activeSectionName).toEqual([]);
  });

  it("renders an Export audit button when steps exist", async () => {
    getAuditInfo.mockResolvedValue(STATIONARY_PAYLOAD);
    const element = createElement("c-n-z-c-easy-audit", {
      is: NZCEasyAudit
    });
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    const exportButton = element.shadowRoot.querySelector(
      'lightning-button[data-id="export-audit"]'
    );
    expect(exportButton).not.toBeNull();
    expect(exportButton.label).toBe("Export audit");
    expect(exportButton.disabled).toBe(false);
  });

  it("exports JSON and Markdown via Apex including AI summary when ready", async () => {
    getAuditInfo.mockResolvedValue(STATIONARY_PAYLOAD);
    getAuditSummary.mockResolvedValue(
      "Fuel consumption drove the final result."
    );
    saveAuditExport.mockResolvedValue({
      jsonTitle: "NZC_EasyAudit_file_audit",
      markdownTitle: "NZC_EasyAudit_file_audit"
    });

    const element = createElement("c-n-z-c-easy-audit", {
      is: NZCEasyAudit
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const toastHandler = jest.fn();
    element.addEventListener("lightning__showtoast", toastHandler);

    element.shadowRoot
      .querySelector('lightning-button[data-id="export-audit"]')
      .click();

    await Promise.resolve();
    await Promise.resolve();

    expect(saveAuditExport).toHaveBeenCalledTimes(1);
    const args = saveAuditExport.mock.calls[0][0];
    expect(args.recordId).toBe("a01000000000001AAA");
    expect(args.jsonFileName).toMatch(
      /^NZC_EasyAudit_a01000000000001AAA_.+_audit\.json$/
    );
    expect(args.markdownFileName).toMatch(
      /^NZC_EasyAudit_a01000000000001AAA_.+_audit\.md$/
    );
    const parsed = JSON.parse(args.jsonBody);
    expect(parsed.ai).toEqual({
      available: true,
      loadSummary: "Fuel consumption drove the final result."
    });
    expect(args.markdownBody).toContain("## AI summary");
    expect(toastHandler).toHaveBeenCalled();
    expect(toastHandler.mock.calls[0][0].detail.variant).toBe("success");
  });

  it("exports without AI when summary is unavailable", async () => {
    getAuditInfo.mockResolvedValue(STATIONARY_PAYLOAD);
    getAuditSummary.mockRejectedValue({
      body: { message: "Prompt Builder isn't enabled" }
    });
    saveAuditExport.mockResolvedValue({
      jsonTitle: "json",
      markdownTitle: "md"
    });

    const element = createElement("c-n-z-c-easy-audit", {
      is: NZCEasyAudit
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    element.shadowRoot
      .querySelector('lightning-button[data-id="export-audit"]')
      .click();

    await Promise.resolve();
    await Promise.resolve();

    const parsed = JSON.parse(saveAuditExport.mock.calls[0][0].jsonBody);
    expect(parsed.ai).toEqual({ available: false });
    expect(saveAuditExport.mock.calls[0][0].markdownBody).not.toContain(
      "## AI summary"
    );
  });
});
