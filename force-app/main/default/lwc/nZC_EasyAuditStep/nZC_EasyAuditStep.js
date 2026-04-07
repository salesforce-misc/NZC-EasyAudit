/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import {LightningElement, api, track} from 'lwc';

export default class NZcEasyAuditStep extends LightningElement {

    @api
    stepInstruction;

    @track
    lines;
    recordLinkId;
    recordLinkName;

    get title() {
        const suffix = this.stepInstruction.final
            ? ` : ${this.stepInstruction.final}`
            : '';
        return `${this.stepInstruction.title}${suffix}`;
    }

    get lineRows() {
        const list = this.lines;
        if (!list) {
            return [];
        }
        return list.map((text, i) => ({ key: `insight-${i}`, text }));
    }

    connectedCallback() {
        if (!this.lines) {
            this.lines = this.stepInstruction.descriptions
            this.recordLinkId = this.stepInstruction.recordLinkId;
            this.recordLinkName = this.stepInstruction.recordLinkName;
        }
    }
}