/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Lightning Home / App Page tool: ask for a sample size, select existing
 * Stationary and Vehicle energy-use records with FuelType×object coverage,
 * then run the client-side EasyAudit calc + File export pipeline per record.
 * Batch exports intentionally omit AI summaries.
 *
 * Remembers the last run per user, confirms before regenerating, links each
 * success to its Files, and offers a local multi-file download.
 */
import { LightningElement, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import LightningConfirm from "lightning/confirm";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import selectSampleRecords from "@salesforce/apex/NZC_EasyAuditSampleController.selectSampleRecords";
import getLastSampleRun from "@salesforce/apex/NZC_EasyAuditSampleController.getLastSampleRun";
import saveLastSampleRun from "@salesforce/apex/NZC_EasyAuditSampleController.saveLastSampleRun";
import getRecordInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";
import saveAuditExport from "@salesforce/apex/NZC_EasyAuditExportController.saveAuditExport";
import NZC_EasyAuditVehicleCalc from "c/nZC_EasyAuditVehicleCalc";
import NZC_EasyAuditStationaryCalc from "c/nZC_EasyAuditStationaryCalc";
import { buildAuditExport } from "c/nZC_EasyAuditExport";

export const MAX_SAMPLE_SIZE = 50;
export const DEFAULT_SAMPLE_SIZE = 10;

export default class NZCEasyAuditSampleExport extends NavigationMixin(
  LightningElement
) {
  sampleSize = DEFAULT_SAMPLE_SIZE;
  isRunning = false;
  isLoadingLastRun = true;
  hasLastRun = false;
  completedAt = null;

  @track
  rowStatuses = [];

  processedCount = 0;
  successCount = 0;
  errorCount = 0;
  totalCount = 0;

  connectedCallback() {
    this.loadLastRun();
  }

  get disableGenerate() {
    return this.isRunning || this.isLoadingLastRun || !this.isValidSampleSize;
  }

  get disableDownload() {
    return this.isRunning || this.downloadDocumentIds.length === 0;
  }

  get isValidSampleSize() {
    const n = Number(this.sampleSize);
    return Number.isInteger(n) && n >= 1 && n <= MAX_SAMPLE_SIZE;
  }

  get progressLabel() {
    if (!this.isRunning && this.totalCount === 0) {
      return "";
    }
    return `Processed ${this.processedCount} of ${this.totalCount}`;
  }

  get showProgress() {
    return this.totalCount > 0 || this.rowStatuses.length > 0;
  }

  get sampleSizeHelp() {
    return `Enter a number from 1 to ${MAX_SAMPLE_SIZE}. Sampling covers Stationary and Vehicle records across Fuel Types.`;
  }

  get lastRunBanner() {
    if (!this.hasLastRun || this.isRunning) {
      return "";
    }
    const when = this.completedAt
      ? ` (${this.formatCompletedAt(this.completedAt)})`
      : "";
    return `Showing your last run${when}. Generate again only if you need a new sample.`;
  }

  get downloadDocumentIds() {
    const ids = [];
    for (const row of this.rowStatuses) {
      if (row.state !== "success") {
        continue;
      }
      if (row.jsonContentDocumentId) {
        ids.push(row.jsonContentDocumentId);
      }
      if (row.markdownContentDocumentId) {
        ids.push(row.markdownContentDocumentId);
      }
    }
    return ids;
  }

  handleSampleSizeChange(event) {
    this.sampleSize = event.target.value;
  }

  async loadLastRun() {
    this.isLoadingLastRun = true;
    try {
      const raw = await getLastSampleRun();
      if (!raw) {
        this.hasLastRun = false;
        return;
      }
      const parsed = JSON.parse(raw);
      this.applyRunSnapshot(parsed, true);
    } catch (error) {
      // Non-blocking: user can still generate a fresh run
      this.hasLastRun = false;
    } finally {
      this.isLoadingLastRun = false;
    }
  }

  async handleGenerate() {
    if (this.disableGenerate) {
      return;
    }

    if (this.hasLastRun) {
      const confirmed = await LightningConfirm.open({
        message:
          "A previous sample export run is saved. Generate a new sample and replace the last run?",
        variant: "header",
        label: "Regenerate sample exports?",
        theme: "warning"
      });
      if (!confirmed) {
        return;
      }
    }

    const requested = Number(this.sampleSize);
    this.isRunning = true;
    this.rowStatuses = [];
    this.processedCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalCount = 0;
    this.completedAt = null;

    try {
      const samples = await selectSampleRecords({ sampleSize: requested });
      if (!Array.isArray(samples) || samples.length === 0) {
        this.showToast(
          "No eligible records",
          "No Stationary or Vehicle energy-use records with Fuel Type were found.",
          "warning"
        );
        return;
      }

      this.totalCount = samples.length;
      for (const sample of samples) {
        await this.exportOne(sample);
      }

      const completedAt = new Date().toISOString();
      this.completedAt = completedAt;
      this.hasLastRun = true;
      await this.persistLastRun(requested, completedAt);

      this.showToast(
        "Sample export complete",
        `Exported ${this.successCount} record(s) (${this.successCount * 2} Files). Errors: ${this.errorCount}.`,
        this.errorCount > 0 ? "warning" : "success"
      );
    } catch (error) {
      this.showToast("Sample export failed", this.extractErrorMessage(error), "error");
    } finally {
      this.isRunning = false;
    }
  }

  handleDownload() {
    const ids = this.downloadDocumentIds;
    if (ids.length === 0) {
      return;
    }
    // Shepherd multi-document download returns a zip when multiple Ids are provided.
    const url = `/sfc/servlet.shepherd/document/download/${ids.join("/")}`;
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: { url }
    });
  }

  async exportOne(sample) {
    const recordId = sample && sample.recordId;
    const label = `${sample.objectApiName || "Unknown"} / ${sample.fuelType || "n/a"}`;
    try {
      const info = await getRecordInfo({ recordId });
      const steps = this.runCalculation(info);
      if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error("No audit trail steps were produced for this record.");
      }
      const payload = buildAuditExport({
        recordId,
        objectApiName: info && info.objectName,
        steps,
        aiLoadSummary: null
      });
      const exportResult = await saveAuditExport({
        recordId,
        jsonBody: payload.jsonString,
        markdownBody: payload.markdownString,
        jsonFileName: payload.jsonFileName,
        markdownFileName: payload.markdownFileName
      });
      this.pushStatus(recordId, label, "success", "Exported JSON + Markdown", {
        jsonContentDocumentId: exportResult && exportResult.jsonContentDocumentId,
        markdownContentDocumentId:
          exportResult && exportResult.markdownContentDocumentId
      });
      this.successCount += 1;
    } catch (error) {
      this.pushStatus(
        recordId,
        label,
        "error",
        this.extractErrorMessage(error)
      );
      this.errorCount += 1;
    } finally {
      this.processedCount += 1;
    }
  }

  runCalculation(info) {
    if (!info || !info.objectName) {
      throw new Error("Record info did not include an object name.");
    }
    if (info.objectName === "VehicleAssetEnrgyUse") {
      return new NZC_EasyAuditVehicleCalc(info).run();
    }
    if (info.objectName === "StnryAssetEnrgyUse") {
      return new NZC_EasyAuditStationaryCalc(info).run();
    }
    throw new Error(`Unsupported object type: ${info.objectName}`);
  }

  pushStatus(recordId, label, state, message, fileIds = {}) {
    const jsonContentDocumentId = fileIds.jsonContentDocumentId || null;
    const markdownContentDocumentId =
      fileIds.markdownContentDocumentId || null;
    this.rowStatuses = [
      ...this.rowStatuses,
      this.buildRowStatus({
        recordId,
        label,
        state,
        message,
        jsonContentDocumentId,
        markdownContentDocumentId
      })
    ];
  }

  buildRowStatus({
    recordId,
    label,
    state,
    message,
    jsonContentDocumentId,
    markdownContentDocumentId
  }) {
    const isSuccess = state === "success";
    return {
      key: `${recordId}-${jsonContentDocumentId || message || "row"}`,
      recordId,
      label,
      state,
      message,
      jsonContentDocumentId,
      markdownContentDocumentId,
      badgeLabel: isSuccess ? "Success" : "Error",
      badgeClass: isSuccess
        ? "slds-badge slds-theme_success"
        : "slds-badge slds-theme_error",
      isSuccess,
      jsonUrl: jsonContentDocumentId
        ? this.contentDocumentUrl(jsonContentDocumentId)
        : null,
      markdownUrl: markdownContentDocumentId
        ? this.contentDocumentUrl(markdownContentDocumentId)
        : null,
      recordUrl: recordId ? `/lightning/r/${recordId}/view` : null
    };
  }

  contentDocumentUrl(contentDocumentId) {
    return `/lightning/r/ContentDocument/${contentDocumentId}/view`;
  }

  applyRunSnapshot(snapshot, fromPersisted) {
    if (!snapshot || typeof snapshot !== "object") {
      this.hasLastRun = false;
      return;
    }
    this.sampleSize =
      snapshot.sampleSize != null ? snapshot.sampleSize : this.sampleSize;
    this.successCount = snapshot.successCount || 0;
    this.errorCount = snapshot.errorCount || 0;
    this.totalCount = snapshot.totalCount || 0;
    this.processedCount = snapshot.totalCount || 0;
    this.completedAt = snapshot.completedAt || null;
    this.rowStatuses = (snapshot.rows || []).map((row) =>
      this.buildRowStatus({
        recordId: row.recordId,
        label: row.label,
        state: row.state,
        message: row.message,
        jsonContentDocumentId: row.jsonContentDocumentId,
        markdownContentDocumentId: row.markdownContentDocumentId
      })
    );
    this.hasLastRun = fromPersisted || this.rowStatuses.length > 0;
  }

  async persistLastRun(sampleSize, completedAt) {
    const payload = {
      sampleSize,
      successCount: this.successCount,
      errorCount: this.errorCount,
      totalCount: this.totalCount,
      completedAt,
      rows: this.rowStatuses.map((row) => ({
        recordId: row.recordId,
        label: row.label,
        state: row.state,
        message: row.message,
        jsonContentDocumentId: row.jsonContentDocumentId,
        markdownContentDocumentId: row.markdownContentDocumentId
      }))
    };
    try {
      await saveLastSampleRun({ runJson: JSON.stringify(payload) });
    } catch (error) {
      this.showToast(
        "Could not save last run",
        this.extractErrorMessage(error),
        "warning"
      );
    }
  }

  formatCompletedAt(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
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
