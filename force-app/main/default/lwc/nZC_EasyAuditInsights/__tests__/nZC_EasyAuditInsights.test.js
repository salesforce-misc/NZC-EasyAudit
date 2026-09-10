/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from "lwc";
import NZCEasyAuditInsights from "c/nZC_EasyAuditInsights";
import getAuditSummary from "@salesforce/apex/NZC_EasyAuditAiController.getAuditSummary";
import askAuditQuestion from "@salesforce/apex/NZC_EasyAuditAiController.askAuditQuestion";

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

const SAMPLE_INSTRUCTIONS = [
  {
    title: "Total fuel consumption Kwh",
    descriptions: ["100 L * 10 = 1000 Kwh"],
    final: "1000 Kwh"
  }
];

describe("c-n-z-c-easy-audit-insights", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders nothing when there are no instructions yet", async () => {
    const element = createElement("c-n-z-c-easy-audit-insights", {
      is: NZCEasyAuditInsights
    });
    document.body.appendChild(element);

    await Promise.resolve();

    expect(element.shadowRoot.querySelector(".ask-ai-card")).toBeNull();
    expect(getAuditSummary).not.toHaveBeenCalled();
  });

  it("requests a summary once instructions are set, and renders it", async () => {
    getAuditSummary.mockResolvedValue(
      "Fuel consumption drove the final result."
    );

    const element = createElement("c-n-z-c-easy-audit-insights", {
      is: NZCEasyAuditInsights
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);

    element.instructions = SAMPLE_INSTRUCTIONS;
    await Promise.resolve();
    await Promise.resolve();

    expect(getAuditSummary).toHaveBeenCalledTimes(1);
    expect(getAuditSummary).toHaveBeenCalledWith({
      recordId: "a01000000000001AAA",
      auditTrailJson: JSON.stringify(SAMPLE_INSTRUCTIONS)
    });

    const summaryText = element.shadowRoot.querySelector(
      ".summary-box .response-text"
    );
    expect(summaryText.textContent).toBe(
      "Fuel consumption drove the final result."
    );

    // Re-setting the same instructions should not trigger a second summary call.
    element.instructions = SAMPLE_INSTRUCTIONS;
    await Promise.resolve();
    expect(getAuditSummary).toHaveBeenCalledTimes(1);
  });

  it("stays hidden when the summary probe fails (AI not activated)", async () => {
    getAuditSummary.mockRejectedValue({
      body: { message: "Prompt Builder isn't enabled for this org." }
    });

    const element = createElement("c-n-z-c-easy-audit-insights", {
      is: NZCEasyAuditInsights
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);
    element.instructions = SAMPLE_INSTRUCTIONS;

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(getAuditSummary).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot.querySelector(".ask-ai-card")).toBeNull();
  });

  it("asks a question and renders the response", async () => {
    getAuditSummary.mockResolvedValue("Summary text");
    askAuditQuestion.mockResolvedValue(
      "The electricity emission factor set was used."
    );

    const element = createElement("c-n-z-c-easy-audit-insights", {
      is: NZCEasyAuditInsights
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);
    element.instructions = SAMPLE_INSTRUCTIONS;
    await Promise.resolve();
    await Promise.resolve();

    const textarea = element.shadowRoot.querySelector("lightning-textarea");
    textarea.value = "Which emission factor was used?";
    textarea.dispatchEvent(
      new CustomEvent("change", { detail: { value: textarea.value } })
    );

    const askButton = element.shadowRoot.querySelector("lightning-button");
    askButton.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(askAuditQuestion).toHaveBeenCalledWith({
      recordId: "a01000000000001AAA",
      auditTrailJson: JSON.stringify(SAMPLE_INSTRUCTIONS),
      userQuestion: "Which emission factor was used?"
    });

    const responseText = element.shadowRoot.querySelector(
      ".response-box .response-text"
    );
    expect(responseText.textContent).toBe(
      "The electricity emission factor set was used."
    );
  });

  it("shows a toast when asking fails", async () => {
    getAuditSummary.mockResolvedValue("Summary text");
    askAuditQuestion.mockRejectedValue({
      body: { message: "Prompt invocation failed: boom" }
    });

    const element = createElement("c-n-z-c-easy-audit-insights", {
      is: NZCEasyAuditInsights
    });
    element.recordId = "a01000000000001AAA";
    document.body.appendChild(element);
    element.instructions = SAMPLE_INSTRUCTIONS;
    await Promise.resolve();
    await Promise.resolve();

    const toastHandler = jest.fn();
    element.addEventListener("lightning__showtoast", toastHandler);

    const textarea = element.shadowRoot.querySelector("lightning-textarea");
    textarea.value = "Why did this fail?";
    textarea.dispatchEvent(
      new CustomEvent("change", { detail: { value: textarea.value } })
    );

    element.shadowRoot.querySelector("lightning-button").click();

    await Promise.resolve();
    await Promise.resolve();

    expect(toastHandler).toHaveBeenCalledTimes(1);
    expect(toastHandler.mock.calls[0][0].detail.message).toBe(
      "Prompt invocation failed: boom"
    );
  });
});
