/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAuditInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";
import saveAuditExport from "@salesforce/apex/NZC_EasyAuditExportController.saveAuditExport";
import NZC_EasyAuditVehicleCalc from "c/nZC_EasyAuditVehicleCalc";
import NZC_EasyAuditStationaryCalc from "c/nZC_EasyAuditStationaryCalc";
import { buildAuditExport } from "c/nZC_EasyAuditExport";

export default class NZCEasyAudit extends LightningElement {
  @api
  recordId;

  didCall = false;
  serverAuditInfo = {};

  showV2 = true;
  @track
  instructions;

  @track
  activeSectionNames = [];

  aiAvailable = false;
  aiLoadSummary = null;
  isExporting = false;

  connectedCallback() {
    if (!this.didCall) {
      this.didCall = true;
      this.serverCallGetAuditInfo();
    }
  }
  serverCallGetAuditInfo = () => {
    this.serverAuditInfo = {};
    getAuditInfo({ recordId: this.recordId })
      .then((res) => {
        this.serverAuditInfo = res;
        this.startCalculation();
      })
      .catch(() => undefined);
  };

  startCalculation = () => {
    if (this.serverAuditInfo.objectName === "VehicleAssetEnrgyUse") {
      let vehicle = new NZC_EasyAuditVehicleCalc(this.serverAuditInfo);
      this.instructions = vehicle.run();
    }
    if (this.serverAuditInfo.objectName === "StnryAssetEnrgyUse") {
      let stationary = new NZC_EasyAuditStationaryCalc(this.serverAuditInfo);
      this.instructions = stationary.run();
    }
  };

  get steps() {
    const list = this.instructions;
    if (!Array.isArray(list)) {
      return [];
    }
    return list.map((instruction, i) => ({
      instruction,
      key: instruction.title || `step-${i}`,
      sectionName: `step-${i}`
    }));
  }

  get hasSteps() {
    return this.steps.length > 0;
  }

  get allExpanded() {
    return (
      this.hasSteps && this.activeSectionNames.length === this.steps.length
    );
  }

  get toggleAllLabel() {
    return this.allExpanded ? "Collapse all" : "Expand all";
  }

  get disableExport() {
    return !this.hasSteps || this.isExporting;
  }

  toggleExpandAll = () => {
    this.activeSectionNames = this.allExpanded
      ? []
      : this.steps.map((step) => step.sectionName);
  };

  handleSummaryReady = (event) => {
    const detail = event && event.detail ? event.detail : {};
    this.aiAvailable = !!detail.available;
    this.aiLoadSummary = this.aiAvailable ? detail.summary || "" : null;
  };

  /**
   * Public snapshot for other LWCs that compose EasyAudit and need the same
   * export payload without rebuilding the trail.
   */
  @api
  getAuditExportPayload() {
    if (!this.recordId || !this.hasSteps) {
      return null;
    }
    return buildAuditExport({
      recordId: this.recordId,
      objectApiName: this.serverAuditInfo && this.serverAuditInfo.objectName,
      steps: this.instructions,
      aiLoadSummary: this.aiAvailable ? this.aiLoadSummary : null
    });
  }

  handleExportAudit = async () => {
    if (this.disableExport) {
      return;
    }
    this.isExporting = true;
    try {
      const payload = this.getAuditExportPayload();
      if (!payload) {
        throw new Error("No audit trail is available to export.");
      }
      const result = await saveAuditExport({
        recordId: this.recordId,
        jsonBody: payload.jsonString,
        markdownBody: payload.markdownString,
        jsonFileName: payload.jsonFileName,
        markdownFileName: payload.markdownFileName
      });
      const jsonTitle =
        (result && result.jsonTitle) || payload.jsonFileName;
      const mdTitle =
        (result && result.markdownTitle) || payload.markdownFileName;
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Audit exported",
          message: `Saved Files: ${jsonTitle}, ${mdTitle}`,
          variant: "success"
        })
      );
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Export failed",
          message: this.extractErrorMessage(error),
          variant: "error"
        })
      );
    } finally {
      this.isExporting = false;
    }
  };

  extractErrorMessage(error) {
    if (error && error.body && error.body.message) {
      return error.body.message;
    }
    if (error && typeof error.message === "string") {
      return error.message;
    }
    return "Request failed";
  }
}
