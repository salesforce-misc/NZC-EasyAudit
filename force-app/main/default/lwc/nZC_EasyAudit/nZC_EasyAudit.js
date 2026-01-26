/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import {LightningElement, api, track} from 'lwc';
import getAuditInfo from '@salesforce/apex/NZC_EasyAuditControllerV2.getRecordInfo';
import NZC_EasyAuditVehicleCalc from 'c/nZC_EasyAuditVehicleCalc';
import NZC_EasyAuditStationaryCalc from "c/nZC_EasyAuditStationaryCalc";
export default class NZCEasyAudit extends LightningElement {
    // #region agent log
    renderedCallback() {
        console.log('[NZC_EasyAudit] renderedCallback - Component rendered', {
            recordId: this.recordId,
            showV2: this.showV2,
            instructions: this.instructions,
            instructionsLength: Array.isArray(this.instructions) ? this.instructions.length : 'not array',
            hasAccordion: !!this.template.querySelector('lightning-accordion'),
            accordionChildren: this.template.querySelector('lightning-accordion')?.children?.length || 0
        });
    }
    // #endregion

    @api
    recordId;

    didCall = false;
    serverAuditInfo = {};

    showV2 = true;
    @track
    instructions;


    connectedCallback() {
        // #region agent log
        console.log('[NZC_EasyAudit] connectedCallback - Component initialized', {
            recordId: this.recordId,
            didCall: this.didCall,
            showV2: this.showV2,
            instructions: this.instructions
        });
        // #endregion
        if (!this.didCall) {
            this.didCall = true;
            this.serverCallGetAuditInfo();
        } else {
            // #region agent log
            console.log('[NZC_EasyAudit] connectedCallback - Skipping call, already called');
            // #endregion
        }
    }
    serverCallGetAuditInfo = () => {
        // #region agent log
        console.log('[NZC_EasyAudit] serverCallGetAuditInfo - Starting Apex call', {
            recordId: this.recordId,
            recordIdType: typeof this.recordId,
            recordIdLength: this.recordId ? this.recordId.length : 0
        });
        // #endregion
        this.serverAuditInfo = {};
        getAuditInfo({recordId : this.recordId})
            .then(res=>{
                // #region agent log
                console.log('[NZC_EasyAudit] serverCallGetAuditInfo - Apex call SUCCESS', {
                    response: res,
                    responseType: typeof res,
                    objectName: res?.objectName,
                    hasObjectName: !!res?.objectName,
                    responseKeys: res ? Object.keys(res) : []
                });
                // #endregion
                this.serverAuditInfo = res
                this.startCalculation();
            })
            .catch(err=>{
                // #region agent log
                console.error('[NZC_EasyAudit] serverCallGetAuditInfo - Apex call ERROR', {
                    error: err,
                    errorMessage: err?.body?.message || err?.message || String(err),
                    errorType: typeof err,
                    recordId: this.recordId
                });
                // #endregion
                console.log('error getting audit info', err)
            })
    }

    startCalculation = () => {
        // #region agent log
        console.log('[NZC_EasyAudit] startCalculation - Starting calculation', {
            serverAuditInfo: this.serverAuditInfo,
            objectName: this.serverAuditInfo?.objectName,
            hasObjectName: !!this.serverAuditInfo?.objectName,
            objectNameMatch: {
                vehicle: this.serverAuditInfo?.objectName === 'VehicleAssetEnrgyUse',
                stationary: this.serverAuditInfo?.objectName === 'StnryAssetEnrgyUse'
            }
        });
        // #endregion
        if (this.serverAuditInfo.objectName === 'VehicleAssetEnrgyUse') {
            // #region agent log
            console.log('[NZC_EasyAudit] startCalculation - Processing Vehicle calculation');
            // #endregion
            let vehicle = new NZC_EasyAuditVehicleCalc(this.serverAuditInfo);
            this.instructions = vehicle.run();
            // #region agent log
            console.log('[NZC_EasyAudit] startCalculation - Vehicle calculation complete', {
                instructions: this.instructions,
                instructionsType: typeof this.instructions,
                instructionsLength: Array.isArray(this.instructions) ? this.instructions.length : 'not array',
                instructionsContent: Array.isArray(this.instructions) ? this.instructions.map(i => ({title: i?.title, hasTitle: !!i?.title})) : 'N/A'
            });
            // #endregion
        }
        if (this.serverAuditInfo.objectName === 'StnryAssetEnrgyUse') {
            // #region agent log
            console.log('[NZC_EasyAudit] startCalculation - Processing Stationary calculation');
            // #endregion
            let stationary = new NZC_EasyAuditStationaryCalc(this.serverAuditInfo)
            this.instructions = stationary.run();
            // #region agent log
            console.log('[NZC_EasyAudit] startCalculation - Stationary calculation complete', {
                instructions: this.instructions,
                instructionsType: typeof this.instructions,
                instructionsLength: Array.isArray(this.instructions) ? this.instructions.length : 'not array',
                instructionsContent: Array.isArray(this.instructions) ? this.instructions.map(i => ({title: i?.title, hasTitle: !!i?.title})) : 'N/A'
            });
            // #endregion
        }
        // #region agent log
        if (!this.serverAuditInfo?.objectName || 
            (this.serverAuditInfo.objectName !== 'VehicleAssetEnrgyUse' && 
             this.serverAuditInfo.objectName !== 'StnryAssetEnrgyUse')) {
            console.warn('[NZC_EasyAudit] startCalculation - No matching objectName, calculation not started', {
                objectName: this.serverAuditInfo?.objectName,
                serverAuditInfo: this.serverAuditInfo
            });
        }
        console.log('[NZC_EasyAudit] startCalculation - Final state', {
            instructions: this.instructions,
            showV2: this.showV2,
            willRender: this.showV2 && Array.isArray(this.instructions) && this.instructions.length > 0
        });
        // #endregion
    }


}