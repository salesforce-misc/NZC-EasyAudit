/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from "lwc";
import NZCEasyAuditSampleExport, {
  MAX_SAMPLE_SIZE,
  DEFAULT_SAMPLE_SIZE
} from "c/nZC_EasyAuditSampleExport";
import selectSampleRecords from "@salesforce/apex/NZC_EasyAuditSampleController.selectSampleRecords";
import getLastSampleRun from "@salesforce/apex/NZC_EasyAuditSampleController.getLastSampleRun";
import saveLastSampleRun from "@salesforce/apex/NZC_EasyAuditSampleController.saveLastSampleRun";
import getRecordInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";
import saveAuditExport from "@salesforce/apex/NZC_EasyAuditExportController.saveAuditExport";

const mockConfirmOpen = jest.fn(() => Promise.resolve(true));

jest.mock(
  "@salesforce/apex/NZC_EasyAuditSampleController.selectSampleRecords",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/NZC_EasyAuditSampleController.getLastSampleRun",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/NZC_EasyAuditSampleController.saveLastSampleRun",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
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
  "lightning/confirm",
  () => ({
    __esModule: true,
    default: {
      open: (...args) => mockConfirmOpen(...args)
    }
  }),
  { virtual: true }
);

const STATIONARY_INFO = { objectName: "StnryAssetEnrgyUse" };

describe("c-n-z-c-easy-audit-sample-export", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  beforeEach(() => {
    getLastSampleRun.mockResolvedValue(null);
    saveLastSampleRun.mockResolvedValue(undefined);
    mockConfirmOpen.mockResolvedValue(true);
  });

  it("renders default sample size, generate, and disabled download", async () => {
    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    const input = element.shadowRoot.querySelector(
      'lightning-input[data-id="sample-size"]'
    );
    const generate = element.shadowRoot.querySelector(
      'lightning-button[data-id="generate"]'
    );
    const download = element.shadowRoot.querySelector(
      'lightning-button[data-id="download"]'
    );
    expect(input.value).toBe(DEFAULT_SAMPLE_SIZE);
    expect(generate.disabled).toBe(false);
    expect(download.disabled).toBe(true);
    expect(MAX_SAMPLE_SIZE).toBe(50);
  });

  it("restores the last run on load and enables download", async () => {
    getLastSampleRun.mockResolvedValue(
      JSON.stringify({
        sampleSize: 4,
        successCount: 1,
        errorCount: 0,
        totalCount: 1,
        completedAt: "2026-09-30T15:00:00.000Z",
        rows: [
          {
            recordId: "a0S000000000001",
            label: "StnryAssetEnrgyUse / Diesel",
            state: "success",
            message: "Exported JSON + Markdown",
            jsonContentDocumentId: "069000000000001",
            markdownContentDocumentId: "069000000000002"
          }
        ]
      })
    );

    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    const input = element.shadowRoot.querySelector(
      'lightning-input[data-id="sample-size"]'
    );
    expect(input.value).toBe(4);

    const successLink = element.shadowRoot.querySelector(
      '[data-id="success-file-link"]'
    );
    expect(successLink).not.toBeNull();
    expect(successLink.getAttribute("href")).toContain(
      "/lightning/r/ContentDocument/069000000000001/view"
    );

    const download = element.shadowRoot.querySelector(
      'lightning-button[data-id="download"]'
    );
    expect(download.disabled).toBe(false);
  });

  it("asks to confirm before regenerating when a last run exists", async () => {
    getLastSampleRun.mockResolvedValue(
      JSON.stringify({
        sampleSize: 2,
        successCount: 1,
        errorCount: 0,
        totalCount: 1,
        completedAt: "2026-09-30T15:00:00.000Z",
        rows: [
          {
            recordId: "a0S000000000099",
            label: "StnryAssetEnrgyUse / Diesel",
            state: "success",
            message: "Exported",
            jsonContentDocumentId: "069000000000099",
            markdownContentDocumentId: "069000000000098"
          }
        ]
      })
    );
    mockConfirmOpen.mockResolvedValue(false);

    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot
      .querySelector('lightning-button[data-id="generate"]')
      .click();
    await flushPromises();

    expect(mockConfirmOpen).toHaveBeenCalled();
    expect(selectSampleRecords).not.toHaveBeenCalled();
  });

  it("disables generate for invalid sample size", async () => {
    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    const input = element.shadowRoot.querySelector(
      'lightning-input[data-id="sample-size"]'
    );
    input.value = "0";
    input.dispatchEvent(new CustomEvent("change"));
    await Promise.resolve();

    const button = element.shadowRoot.querySelector(
      'lightning-button[data-id="generate"]'
    );
    expect(button.disabled).toBe(true);
  });

  it("exports each selected sample sequentially without AI summary", async () => {
    selectSampleRecords.mockResolvedValue([
      {
        recordId: "a0S000000000001",
        objectApiName: "StnryAssetEnrgyUse",
        fuelType: "Diesel"
      },
      {
        recordId: "a0S000000000002",
        objectApiName: "StnryAssetEnrgyUse",
        fuelType: "Electricity"
      }
    ]);
    getRecordInfo.mockResolvedValue(STATIONARY_INFO);
    saveAuditExport.mockResolvedValue({
      jsonTitle: "json",
      markdownTitle: "md",
      jsonContentDocumentId: "069000000000001",
      markdownContentDocumentId: "069000000000002"
    });

    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    const toastHandler = jest.fn();
    element.addEventListener("lightning__showtoast", toastHandler);

    element.shadowRoot
      .querySelector('lightning-button[data-id="generate"]')
      .click();

    await flushPromises();

    expect(selectSampleRecords).toHaveBeenCalledWith({
      sampleSize: DEFAULT_SAMPLE_SIZE
    });
    expect(getRecordInfo).toHaveBeenCalledTimes(2);
    expect(saveAuditExport).toHaveBeenCalledTimes(2);
    expect(saveLastSampleRun).toHaveBeenCalledTimes(1);

    const firstExport = saveAuditExport.mock.calls[0][0];
    const parsed = JSON.parse(firstExport.jsonBody);
    expect(parsed.ai).toEqual({ available: false });
    expect(firstExport.markdownBody).not.toContain("## AI summary");

    expect(toastHandler).toHaveBeenCalled();
    expect(toastHandler.mock.calls[0][0].detail.variant).toBe("success");

    const statuses = element.shadowRoot.querySelectorAll("li.slds-item");
    expect(statuses).toHaveLength(2);
    const successLinks = element.shadowRoot.querySelectorAll(
      '[data-id="success-file-link"]'
    );
    expect(successLinks).toHaveLength(2);
  });

  it("shows a warning toast when no samples are returned", async () => {
    selectSampleRecords.mockResolvedValue([]);

    const element = createElement("c-n-z-c-easy-audit-sample-export", {
      is: NZCEasyAuditSampleExport
    });
    document.body.appendChild(element);
    await flushPromises();

    const toastHandler = jest.fn();
    element.addEventListener("lightning__showtoast", toastHandler);

    element.shadowRoot
      .querySelector('lightning-button[data-id="generate"]')
      .click();
    await flushPromises();

    expect(saveAuditExport).not.toHaveBeenCalled();
    expect(toastHandler.mock.calls[0][0].detail.variant).toBe("warning");
  });
});

async function flushPromises() {
  for (let i = 0; i < 30; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}
