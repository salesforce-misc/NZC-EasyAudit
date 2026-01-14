/**
 * Created by mverigin on 5/16/23.
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
        return `${this.stepInstruction.title} 
        ${this.stepInstruction.final? ' : ' + this.stepInstruction.final : ''}`;
    }

    connectedCallback() {
        if (!this.lines) {
            this.lines = this.stepInstruction.descriptions
            this.recordLinkId = this.stepInstruction.recordLinkId;
            this.recordLinkName = this.stepInstruction.recordLinkName;
        }
    }
}