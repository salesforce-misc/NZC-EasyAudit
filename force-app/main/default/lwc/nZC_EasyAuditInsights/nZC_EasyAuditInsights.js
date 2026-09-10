/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * "Ask AI About This Audit Trail": once nZC_EasyAudit builds the client-side audit trail
 * (instructions), auto-generate a plain-language summary, and let the user ask single-shot
 * follow-up questions about it via the NZC_EasyAudit_Audit_Insights prompt template.
 *
 * The initial summary call doubles as a live availability probe: if Prompt Builder / Einstein
 * Generative AI isn't activated in the org (or the template isn't deployed/published), that call
 * fails and the whole panel stays hidden rather than surfacing an error for a feature the org
 * never turned on.
 */
import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAuditSummary from "@salesforce/apex/NZC_EasyAuditAiController.getAuditSummary";
import askAuditQuestion from "@salesforce/apex/NZC_EasyAuditAiController.askAuditQuestion";

/** Always-available suggestion chips; the audit trail shape is consistent across steps. */
const SUGGESTION_PROMPTS = [
  {
    id: "summary",
    text: "Which step contributed the most to the final result?"
  },
  { id: "factor", text: "Which emission factor or record was used, and why?" },
  { id: "formula", text: "Walk me through the formula for the final step." }
];

export default class NZCEasyAuditInsights extends LightningElement {
  @api recordId;

  _instructions;
  didRequestSummary = false;

  probeComplete = false;
  aiAvailable = false;
  summaryText = "";

  userQuestion = "";
  aiResponse = "";
  isAsking = false;
  selectedSuggestionId = null;

  @api
  get instructions() {
    return this._instructions;
  }

  set instructions(value) {
    this._instructions = value;
    if (this.hasInstructions && !this.didRequestSummary) {
      this.didRequestSummary = true;
      this.loadSummary();
    }
  }

  get hasInstructions() {
    return Array.isArray(this._instructions) && this._instructions.length > 0;
  }

  /** True once the availability probe (the initial summary call) has resolved either way. */
  get isProbing() {
    return !this.probeComplete;
  }

  /** Only render the AI panel once we've confirmed the org can actually generate a response. */
  get showAiPanel() {
    return this.probeComplete && this.aiAvailable;
  }

  get auditTrailJson() {
    return this.hasInstructions ? JSON.stringify(this._instructions) : "";
  }

  get suggestedPrompts() {
    return SUGGESTION_PROMPTS.map((p) => ({
      id: p.id,
      text: p.text,
      pillClass:
        this.selectedSuggestionId === p.id ? "pill pill_selected" : "pill"
    }));
  }

  get disableAsk() {
    return (
      this.isAsking ||
      !this.hasInstructions ||
      !this.userQuestion ||
      this.userQuestion.trim().length === 0
    );
  }

  async loadSummary() {
    try {
      const text = await getAuditSummary({
        recordId: this.recordId,
        auditTrailJson: this.auditTrailJson
      });
      this.summaryText = text || "";
      this.aiAvailable = true;
    } catch {
      // Treat any failure (feature not activated, template not published, etc.) as
      // "AI isn't available here" rather than surfacing an error for a disabled feature.
      this.aiAvailable = false;
    } finally {
      this.probeComplete = true;
    }
  }

  handlePillClick(event) {
    const sid = event.currentTarget.dataset.sid;
    const found = SUGGESTION_PROMPTS.find((p) => p.id === sid);
    if (found) {
      this.userQuestion = found.text;
      this.selectedSuggestionId = sid;
    }
  }

  handleQuestionChange(event) {
    this.userQuestion = event.target.value;
    this.selectedSuggestionId = null;
  }

  async handleAsk() {
    if (this.isAsking || !this.userQuestion || !this.userQuestion.trim()) {
      return;
    }
    this.isAsking = true;
    this.aiResponse = "";
    try {
      const text = await askAuditQuestion({
        recordId: this.recordId,
        auditTrailJson: this.auditTrailJson,
        userQuestion: this.userQuestion.trim()
      });
      this.aiResponse = text || "";
    } catch (error) {
      this.showToast("Error", this.extractErrorMessage(error), "error");
    } finally {
      this.isAsking = false;
    }
  }

  extractErrorMessage(error) {
    if (error && error.body && error.body.message) {
      return error.body.message;
    }
    if (error && typeof error.message === "string") {
      return error.message;
    }
    return "Request failed";
  }

  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
