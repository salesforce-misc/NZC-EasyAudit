/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { LightningElement, api, track } from "lwc";

/**
 * lowerCamelCase for runs of letter-words separated by spaces (natural-language phrases).
 */
function wordsToCamelCase(phrase) {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return phrase;
  }
  const lower = words.map((w) => w.toLowerCase());
  return (
    lower[0] +
    lower
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
  );
}

/**
 * Finds letter-only word sequences with internal spaces and converts each to camelCase.
 */
function camelCaseNaturalLanguageRuns(text) {
  if (!text) {
    return text;
  }
  return text.replace(/\b([A-Za-z]+(?:\s+[A-Za-z]+)+)\b/g, (match) =>
    wordsToCamelCase(match)
  );
}

/**
 * Adds grouping commas to non-negative numeric tokens (integers and decimals). Skips scientific notation.
 */
function formatPositiveNumbersWithCommas(text) {
  if (!text) {
    return text;
  }
  return text.replace(/\b\d+(?:\.\d+)?\b/g, (match) => {
    if (/[eE]/.test(match)) {
      return match;
    }
    const n = Number(match);
    if (Number.isNaN(n) || n < 0) {
      return match;
    }
    const parts = match.split(".");
    const intRaw = parts[0];
    const intFormatted = Number(intRaw).toLocaleString(undefined, {
      useGrouping: true
    });
    return parts.length > 1 ? `${intFormatted}.${parts[1]}` : intFormatted;
  });
}

export function formatAuditDisplayText(text) {
  if (text == null || text === "") {
    return text;
  }
  const camel = camelCaseNaturalLanguageRuns(String(text));
  return formatPositiveNumbersWithCommas(camel);
}

/**
 * Capitalizes only the first character, leaving the rest of the phrase untouched so
 * author-supplied acronyms/units (KWH, MPG, TCO2E, Co2) survive as written.
 */
function capitalizeFirst(text) {
  if (!text) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A line with no letters at all is a pure numeric substitution, e.g. "0 * 0.26417205". */
function isSubstitutionLine(text) {
  return !/[A-Za-z]/.test(String(text));
}

export default class NZcEasyAuditStep extends LightningElement {
  @api
  stepInstruction;

  @api
  sectionName;

  @track
  lines;
  recordLinkId;
  recordLinkName;

  get displayTitle() {
    const si = this.stepInstruction;
    if (!si) {
      return "";
    }
    const base = capitalizeFirst(si.title || "");
    const finalPart = si.final
      ? formatPositiveNumbersWithCommas(String(si.final))
      : "";
    return finalPart ? `${base} : ${finalPart}` : base;
  }

  get lineRows() {
    const list = this.lines;
    if (!list) {
      return [];
    }
    return list.map((text, i) => {
      const substitution = isSubstitutionLine(text);
      return {
        key: `insight-${i}`,
        text: formatAuditDisplayText(text),
        rowClass: substitution
          ? "formula-line formula-line_substitution"
          : "formula-line"
      };
    });
  }

  connectedCallback() {
    if (!this.lines) {
      this.lines = this.stepInstruction.descriptions;
      this.recordLinkId = this.stepInstruction.recordLinkId;
      this.recordLinkName = this.stepInstruction.recordLinkName;
    }
  }
}
