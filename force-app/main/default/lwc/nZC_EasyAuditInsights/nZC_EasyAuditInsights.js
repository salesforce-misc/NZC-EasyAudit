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

/*
 * The LLM is instructed (see NZC_EasyAudit_Audit_Insights prompt template) to avoid LaTeX,
 * to use plain Markdown, and to round long decimals - but model output can't be trusted to
 * always comply. These pure, exported helpers are a client-side safety net that repairs
 * residual LaTeX/markdown/precision issues before the text is handed to
 * lightning-formatted-rich-text.
 */

/** Strips LaTeX math markup (\[ \], \( \), $...$, \text{}, \times, etc.) down to plain text. */
export function stripLatex(text) {
  return String(text)
    .replace(/\\\[|\\\]|\\\(|\\\)|\$\$?/g, "")
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^}]*)\}/g, "$1")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1) / ($2)")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\cdot/g, "·")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\[,;!]/g, " ")
    .replace(/\\[A-Za-z]+/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ +\n/g, "\n")
    .trim();
}

/** Rounds numbers with more than 4 fractional digits to 4 places, trimming trailing zeros. */
export function roundLongDecimals(text) {
  return String(text).replace(/-?\d+\.\d{5,}/g, (match) => {
    const rounded = Number(match)
      .toFixed(4)
      .replace(/\.?0+$/, "");
    return rounded;
  });
}

/** Escapes the handful of characters that would otherwise be interpreted as HTML. */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Converts a safe subset of Markdown (bold, italic, "-"/"*" bullet lists, paragraphs) to HTML
 * restricted to the lightning-formatted-rich-text allowlist (p, br, strong, em, ul, li, ...).
 * Input is HTML-escaped first, so any literal markup in the model's text is neutralized rather
 * than rendered.
 */
export function markdownToSafeHtml(text) {
  const escaped = escapeHtml(text).replace(/\r\n/g, "\n");
  const blocks = escaped.split(/\n{2,}/);

  const htmlBlocks = blocks.map((block) => {
    const lines = block.split("\n").filter((line) => line.trim().length > 0);
    const isList =
      lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line.trim()));

    if (isList) {
      const items = lines
        .map(
          (line) =>
            `<li>${inlineMarkdownToHtml(line.trim().replace(/^[-*]\s+/, ""))}</li>`
        )
        .join("");
      return `<ul>${items}</ul>`;
    }

    return `<p>${inlineMarkdownToHtml(lines.join("<br>"))}</p>`;
  });

  return htmlBlocks.filter((html) => html.length > 0).join("");
}

/** Applies inline (non-block) Markdown: bold ("**x**" / "__x__") and italic ("*x*" / "_x_"). */
function inlineMarkdownToHtml(text) {
  return text
    .replace(
      /\*\*([^*]+)\*\*|__([^_]+)__/g,
      (match, a, b) => `<strong>${a || b}</strong>`
    )
    .replace(/\*([^*]+)\*|_([^_]+)_/g, (match, a, b) => `<em>${a || b}</em>`);
}

/** Full pipeline: repair LaTeX, round long floats, then convert Markdown to safe rich-text HTML. */
export function formatLlmResponse(text) {
  return markdownToSafeHtml(roundLongDecimals(stripLatex(text || "")));
}

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

  /** Repaired/rich-text-safe versions of the raw model output, for display. */
  get summaryHtml() {
    return formatLlmResponse(this.summaryText);
  }

  get responseHtml() {
    return formatLlmResponse(this.aiResponse);
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
      this.dispatchSummaryReady(true, this.summaryText);
    } catch {
      // Treat any failure (feature not activated, template not published, etc.) as
      // "AI isn't available here" rather than surfacing an error for a disabled feature.
      this.aiAvailable = false;
      this.dispatchSummaryReady(false, null);
    } finally {
      this.probeComplete = true;
    }
  }

  /**
   * Notifies parent (EasyAudit) that the load-time summary probe finished so exports
   * can include the summary when AI is available. Bubbles; composed for cross-root.
   */
  dispatchSummaryReady(available, summary) {
    this.dispatchEvent(
      new CustomEvent("summaryready", {
        detail: {
          available: !!available,
          summary: available ? summary || "" : null
        },
        bubbles: true,
        composed: true
      })
    );
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
