/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from "lwc";
import NZCEasyAudit from "c/nZC_EasyAudit";
import getAuditInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";

jest.mock(
  "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo",
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

    const button = element.shadowRoot.querySelector("lightning-button");
    expect(button).toBeNull();
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

    const button = element.shadowRoot.querySelector("lightning-button");
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
});
