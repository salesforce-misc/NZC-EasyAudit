/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { LightningElement, api, track } from "lwc";
import getAuditInfo from "@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo";
import NZC_EasyAuditVehicleCalc from "c/nZC_EasyAuditVehicleCalc";
import NZC_EasyAuditStationaryCalc from "c/nZC_EasyAuditStationaryCalc";
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

  toggleExpandAll = () => {
    this.activeSectionNames = this.allExpanded
      ? []
      : this.steps.map((step) => step.sectionName);
  };
}
