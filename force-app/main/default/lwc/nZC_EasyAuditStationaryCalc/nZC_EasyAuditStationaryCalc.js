/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import CalculationStep from 'c/nZC_EasyAuditLogging';
import UnitConversion from 'c/nZC_EasyAuditUnitConversion'

const KWH_GIGAJOULE_CONVERSION = 277.7777777;
const M2_SQFT_CONVERSION = 10.76391042;

const RECORD_TYPE_DATA_CENTER = 'Data Center'
const FUEL_TYPE_ELECTRICITY = 'Electricity'
const FUEL_TYPE_REFRIGERANT = 'Refrigerant'
const CONSUMPTION_UNIT_KWH = 'kWh';
const UNIT_M2 = 'm2';
const UNIT_SQFT = 'sqft';
const SCOPE1 = 'Scope 1';
const SCOPE2 = 'Scope 2';
const ELECTRICITYSET = 'Electricity Emission Set';
const REFRIDGERANTSET = 'Refrigerant Emission Set';
const OTHERSETITEM = 'Emissions Item';
export default class NZC_EasyAuditStationaryCalc {
    constructor(infoObject) {
        this.info = infoObject;
        this.KWH_GIGAJOULE_CONVERSION = KWH_GIGAJOULE_CONVERSION;
        this.M2_SQFT_CONVERSION = M2_SQFT_CONVERSION;

        this.RECORD_TYPE_DATA_CENTER = RECORD_TYPE_DATA_CENTER;
        this.FUEL_TYPE_ELECTRICITY = FUEL_TYPE_ELECTRICITY;
        this.FUEL_TYPE_REFRIGERANT = FUEL_TYPE_REFRIGERANT;
        this.CONSUMPTION_UNIT_KWH = CONSUMPTION_UNIT_KWH;
        this.UNIT_M2 = UNIT_M2;
        this.UNIT_SQFT = UNIT_SQFT;
        this.SCOPE1 = SCOPE1;
        this.SCOPE2 = SCOPE2;

        this.fuelType = infoObject.FuelType || ''; //req
        this.fuelConsumption = infoObject.FuelConsumption || 0; // req
        this.fuelConsumptionUnit = infoObject.FuelConsumptionUnit
        this.fuelConsumptionKwh = 0;
        this.totalFuelConsumptionKwh = 0;
        this.fuelConsumptionGj = 0;

        // setitem Id
        this.setItemId = infoObject['otherSetItemId'];
        this.calorificValue = infoObject.CalorificValue || 0; // req
        this.calorificValueUnit = infoObject.CalorificValueUnit; // req
        this.suppliedEmssnFactorInTco2eMwh = infoObject.Co2eEmissionFactorInTco2eMwh; //req or 0 > comes from SuppliedEmissionsFactor field on set item
        this.otherSetItemCO2eFactor = infoObject.otherSetItemCO2eFactor || 0; // req or 0 > set item Co2EmissionFactor
        this.otherSetItemCO2eFactorUnit = infoObject.Co2EmissionFactorUnit; // req or 0 > set item Co2EmissionFactor
        this.OTHERSETITEM = infoObject['otherSetName'] || OTHERSETITEM;

        // elec set Id
        this.elecSetId = infoObject['ElecFactorId'];
        this.emissionsFactorType = infoObject['EmissionsFactorType']; // Factor type discriminator
        this.elecCO2EemissionsFactor = infoObject['ElectCo2eEmissionRate'] || 0; //req - location-based rate
        this.elecCO2EemissionsFactorUnit = infoObject['ElecCo2eEmissionRateUnit']; //req
        this.mktBsdElecCO2EemissionsFactor = infoObject['MktBsdElecCo2eEmissionRate'] || 0; // market-based rate
        this.mktBsdElecCO2EemissionsFactorUnit = infoObject['MktBsdElecCo2eEmissionRateUnit'];
        this.ELECTRICITYSET = infoObject['ElecFactorName'] || ELECTRICITYSET;

        // refridge set
        this.refridgeSetId = infoObject['RefrigerantId'];
        this.refrigerantGWP = infoObject['RefrigerantGWP'] || 0; // req
        this.REFRIDGERANTSET = infoObject['RefrigerantName'] || REFRIDGERANTSET;


        this.scope1SupplementalEmissions = infoObject['SuplScope1Emissions'] || 0; //req
        this.scope2SupplementalEmissions_location = infoObject['SuplScope2LocationBasedEmssn'] || 0; //req
        this.scope2SupplementalEmissions_market = infoObject['SuplScope2MarketBasedEmssn'] || 0; //req
        this.allocatedRenewableEnergyInKwh = infoObject['AllocatedRenewableEnergyInKwh'] || 0;
        this.powerUsageEffectiveness = infoObject.PowerUsageEffectiveness || 1;//req

        this.occupiedFloorAreaUnit = infoObject.OccupiedFloorAreaUnit; // req
        this.occupiedFloorArea = infoObject.OccupiedFloorArea || 0; // req
        this.occupiedFloorAreaInSqft = 0;

        this.emissionInTco2e = 0;
        this.scope2LocationBasedEmissions = 0;
        this.scope2MarketBasedEmissions = 0;

        this.recordType = infoObject['RecordTypeName'];// req
        this.isOwned = infoObject['IsOwned'];
        this.defaultScope = infoObject['Scope'];
        this.customFuelConversion = infoObject['customFuelConversion'];

        this.log = new CalculationStep(infoObject['baseUrl']);
        this.unitConversion = new UnitConversion(this.log);
    }

    FuelConsumptionInKwh = () => {
        this.log.startStep(`calculate fuel consumption in KWH`)

        if (this.fuelConsumptionUnit === this.CONSUMPTION_UNIT_KWH) {
            this.log.addLine('Consumption in Kwh already');
            this.fuelConsumptionKwh = this.fuelConsumption;
        } else {
            this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
            this.log.addLine(`unit is volumetric, convert using calorific value`)
            this.log.addLine(`fuelConsumptionKwh = fuelConsumption m3 * calorificValue kWh/m3`);

            let fuelConsumptionUsed = this.unitConversion.convertValue(this.fuelConsumption,this.fuelConsumptionUnit,'m3');
            let calorificValueUsed = this.unitConversion.convertValue(this.calorificValue, this.calorificValueUnit, 'KWH_PER_M3');

            this.log.addLine(`fuelConsumptionKwh = ${fuelConsumptionUsed} * ${calorificValueUsed}`);
            this.fuelConsumptionKwh = fuelConsumptionUsed * calorificValueUsed;

            this.fuelConsumptionKwh = isNaN(this.fuelConsumptionKwh)? '0' : this.fuelConsumptionKwh;
        }

        this.log.addLine(`fuelConsumptionKwh = ${this.fuelConsumptionKwh}`);
        this.log.addFinalValue(this.fuelConsumptionKwh);
    }

    FuelConsumptionInGigajoule = () => {
        this.log.startStep('Fuel consumption in Giga joule');
        this.log.addLine(`total fuel consumption KWH / Kwh Gigajoule conversion`);
        this.log.addLine(`${this.fuelConsumptionKwh} / ${KWH_GIGAJOULE_CONVERSION}`);
        this.fuelConsumptionGj = this.fuelConsumptionKwh / this.KWH_GIGAJOULE_CONVERSION;
        this.log.addLine(`fuelConsumptionGj = ${this.fuelConsumptionGj}`);
        this.log.addFinalValue(this.fuelConsumptionGj + '');
    }

    TotalFuelConsumptionInKwh = () => {
        this.log.startStep('Total fuel consumption Kwh');
        if (this.recordType === this.RECORD_TYPE_DATA_CENTER) {
            this.log.addLine('Data center');
            this.log.addLine(`fuel consumption KWH * Power usage effectiveness`);
            this.log.addLine(`${this.fuelConsumptionKwh} * ${this.powerUsageEffectiveness}`);
            this.totalFuelConsumptionKwh = this.fuelConsumptionKwh * this.powerUsageEffectiveness;

        } else {
            this.log.addLine('Non data center');
            this.log.addLine('total fuel consumption KWH = fuel consumption KWH');
            this.totalFuelConsumptionKwh = this.fuelConsumptionKwh;
        }
        this.log.addLine(`total fuel consumption KWH = ${this.totalFuelConsumptionKwh}`);
        this.log.addFinalValue(this.totalFuelConsumptionKwh);
    }

    OccupiedFloorAreaInSqft = () => {
        this.log.startStep('Calculate occupied floor area in sqft');
        this.log.addLine(`unit is ${this.occupiedFloorAreaUnit}`)

        if (this.occupiedFloorAreaUnit === this.UNIT_M2) {
            this.log.addLine(`occupied area sqft = occupied floor area * ${this.M2_SQFT_CONVERSION}`)
            this.log.addLine(`occupied area sqft = ${this.occupiedFloorArea} * ${this.M2_SQFT_CONVERSION}`)
            this.occupiedFloorAreaInSqft = this.occupiedFloorArea * this.M2_SQFT_CONVERSION;

        } else if (this.occupiedFloorAreaUnit === this.UNIT_SQFT) {
            this.log.addLine(`occupied area sqft = occupied floor area`)
            this.occupiedFloorAreaInSqft = this.occupiedFloorArea;
        }
        this.log.addLine(`occupied area sqft = ${this.occupiedFloorArea}`)
        this.log.addFinalValue(this.occupiedFloorAreaInSqft);
    }

    Scope1EmissionsInTco2e = () => {
        this.log.startStep('Scope 1 emissions in Tco2e');
       // this.log.addLine('currently no check for scope allocation records')
        //TODO check scope allocation records

        this.emissionInTco2e = this.scope1SupplementalEmissions;

        if (this.fuelType === this.FUEL_TYPE_ELECTRICITY) {
            this.log.addRecordLink(this.ELECTRICITYSET, this.elecSetId);
            this.log.addLine(`emissionInTco2e = totalFuelConsumptionKwh * elecCO2EemissionsFactor / 1000 + scope1SupplementalEmissions`)
            let factorUsed = this.unitConversion.convertValue(this.elecCO2EemissionsFactor, this.elecCO2EemissionsFactorUnit, 'TONNES_PER_MWH');
            this.log.addLine(`emissionInTco2e = ${this.totalFuelConsumptionKwh} * ${factorUsed} / 1000 + ${this.scope1SupplementalEmissions}`)
            this.emissionInTco2e = this.totalFuelConsumptionKwh * factorUsed / 1000 + this.scope1SupplementalEmissions
        } else if (this.fuelType === this.FUEL_TYPE_REFRIGERANT) {
            this.log.addRecordLink(this.REFRIDGERANTSET, this.refridgeSetId);
            this.log.addLine(`emissionInTco2e = fuelConsumption in kgs * refrigerantGWP / 1000 + scope1SupplementalEmissions`)
            let consumptionUsed = this.unitConversion.convertValue(this.fuelConsumption, this.fuelConsumptionUnit, 'kG')
            this.log.addLine(`emissionInTco2e = ${consumptionUsed} * ${this.refrigerantGWP} / 1000 + ${this.scope1SupplementalEmissions}`)
            this.emissionInTco2e = consumptionUsed * this.refrigerantGWP / 1000 + this.scope1SupplementalEmissions;
        }
        else {
            this.log.addLine(`Non electricity or refrigerant fuel type`)
            this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
            if (this.suppliedEmssnFactorInTco2eMwh !== 0) {
                this.log.addLine(`emissionInTco2e = totalFuelConsumptionKwh * suppliedEmssnFactorInTco2eMwh / 1000 + scope1SupplementalEmissions`);
                this.log.addLine(`emissionInTco2e = ${this.totalFuelConsumptionKwh} * ${this.suppliedEmssnFactorInTco2eMwh} / 1000 + ${this.scope1SupplementalEmissions}`);
                this.emissionInTco2e = this.totalFuelConsumptionKwh * this.suppliedEmssnFactorInTco2eMwh / 1000 + this.scope1SupplementalEmissions;
            } else {
                this.log.addLine(`emissionInTco2e = totalFuelConsumptionKwh * otherSetItemCO2eFactor / 1000 + scope1SupplementalEmissions`);
                let factorUsed = this.unitConversion.convertValue(this.otherSetItemCO2eFactor, this.otherSetItemCO2eFactorUnit, 'TONNES_PER_MWH')
                this.log.addLine(`emissionInTco2e = ${this.totalFuelConsumptionKwh} * ${factorUsed} / 1000 + ${this.scope1SupplementalEmissions}`);
                this.emissionInTco2e = this.totalFuelConsumptionKwh * factorUsed / 1000 + this.scope1SupplementalEmissions;
            }
        }

        this.log.addLine(`emissionInTco2e = ${this.emissionInTco2e}`);
        this.log.addFinalValue(this.emissionInTco2e);
    }

    Scope2LocBasedEmssnInTco2e = () => {
        //TODO check scope allocation records
        this.log.startStep('Scope 2 location based TCO2E');
        //this.log.addLine('currently no check for scope allocation records')
        this.scope2LocationBasedEmissions = this.scope2SupplementalEmissions_location;

        if (this.fuelType === this.FUEL_TYPE_ELECTRICITY) {
            this.log.addRecordLink(this.ELECTRICITYSET, this.elecSetId);

            // Determine which emission factor to use based on EmissionsFactorType
            let emissionRate = 0;
            let emissionRateUnit = this.elecCO2EemissionsFactorUnit;

            if (this.emissionsFactorType === 'MarketBased') {
                // Market-based factor assigned - no location-based rate available
                this.log.addLine(`Emissions factor type is MarketBased - location-based rate = 0`);
                emissionRate = 0;
            } else {
                // LocationBased or null - use location-based rate
                if (this.emissionsFactorType === 'LocationBased') {
                    this.log.addLine(`Emissions factor type is LocationBased - using Co2eEmissionRate`);
                }
                emissionRate = this.elecCO2EemissionsFactor;
            }

            this.log.addLine(`scope2LocationBasedEmissions = totalFuelConsumptionKwh * emissionRate / 1000 + scope2SupplementalEmissions_location`)
            let factorUsed = this.unitConversion.convertValue(emissionRate, emissionRateUnit, 'TONNES_PER_MWH')
            this.log.addLine(`scope2LocationBasedEmissions = ${this.totalFuelConsumptionKwh} * ${factorUsed} / 1000 + ${this.scope2SupplementalEmissions_location}`)
            this.scope2LocationBasedEmissions = this.totalFuelConsumptionKwh * factorUsed / 1000 + this.scope2SupplementalEmissions_location
        } else if (this.fuelType === this.FUEL_TYPE_REFRIGERANT) {
            this.log.addRecordLink(this.REFRIDGERANTSET, this.refridgeSetId);
            this.log.addLine(`scope2LocationBasedEmissions = fuelConsumption * refrigerantGWP / 1000 + scope2SupplementalEmissions_location`)
            let consumptionUsed = this.unitConversion.convertValue(this.fuelConsumption, this.fuelConsumptionUnit, 'kG');
            this.log.addLine(`scope2LocationBasedEmissions = ${consumptionUsed} * ${this.refrigerantGWP} / 1000 + ${this.scope2SupplementalEmissions_location}`)
            this.scope2LocationBasedEmissions = consumptionUsed * this.refrigerantGWP / 1000 + this.scope2SupplementalEmissions_location
        }
        else {
            this.log.addLine(`Non electricity or refrigerant fuel type`)
            this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
            if (this.suppliedEmssnFactorInTco2eMwh !== 0) {
                this.log.addLine(`scope2LocationBasedEmissions = totalFuelConsumptionKwh * suppliedEmssnFactorInTco2eMwh / 1000 + scope2SupplementalEmissions_location`);
                this.log.addLine(`scope2LocationBasedEmissions = ${this.totalFuelConsumptionKwh} * ${this.suppliedEmssnFactorInTco2eMwh} / 1000 + ${this.scope2SupplementalEmissions_location}`);
                this.scope2LocationBasedEmissions = this.totalFuelConsumptionKwh * this.suppliedEmssnFactorInTco2eMwh / 1000 + this.scope2SupplementalEmissions_location;
            } else {
                this.log.addLine(`scope2LocationBasedEmissions = totalFuelConsumptionKwh * otherSetItemCO2eFactor / 1000 + scope2SupplementalEmissions_location`);
                let factorUsed = this.unitConversion.convertValue(this.otherSetItemCO2eFactor, this.otherSetItemCO2eFactorUnit, 'TONNES_PER_MWH');
                this.log.addLine(`scope2LocationBasedEmissions = ${this.totalFuelConsumptionKwh} * ${factorUsed} / 1000 + ${this.scope2SupplementalEmissions_location}`);
                this.scope2LocationBasedEmissions = this.totalFuelConsumptionKwh * factorUsed / 1000 + this.scope2SupplementalEmissions_location;
            }
        }

        this.log.addLine(`scope2LocationBasedEmissions = ${this.scope2LocationBasedEmissions}`);
        this.log.addFinalValue(this.scope2LocationBasedEmissions);
    }

    Scope2MktBasedEmssnInTco2e = () => {
        this.log.startStep('Scope 2 market based TCO2E');
      //  this.log.addLine('currently no check for scope allocation records')
        this.scope2MarketBasedEmissions = this.scope2SupplementalEmissions_market;

        if (this.fuelType === this.FUEL_TYPE_ELECTRICITY) {
            this.log.addRecordLink(this.ELECTRICITYSET, this.elecSetId);

            // Determine which emission factor to use based on EmissionsFactorType
            let emissionRate = 0;
            let emissionRateUnit = this.mktBsdElecCO2EemissionsFactorUnit || this.elecCO2EemissionsFactorUnit;

            if (this.emissionsFactorType === 'LocationBased') {
                // Location-based factor assigned - no market-based rate available
                this.log.addLine(`Emissions factor type is LocationBased - market-based rate = 0`);
                emissionRate = 0;
            } else if (this.emissionsFactorType === 'MarketBased') {
                // Market-based factor assigned - use market-based rate
                this.log.addLine(`Emissions factor type is MarketBased - using MktBsdCo2eEmissionRate`);
                emissionRate = this.mktBsdElecCO2EemissionsFactor;
            } else {
                // No factor type specified - use location-based rate (backward compatibility)
                this.log.addLine(`Emissions factor type not specified - using Co2eEmissionRate for market calculation`);
                emissionRate = this.elecCO2EemissionsFactor;
            }

            this.log.addLine(`scope2MarketBasedEmissions = (totalFuelConsumptionKwh - allocatedRenewableEnergyKwh) * emissionRate / 1000 + scope2SupplementalEmissions_market`)
            let factorUsed = this.unitConversion.convertValue(emissionRate, emissionRateUnit, 'TONNES_PER_MWH');
            this.log.addLine(`scope2MarketBasedEmissions = (${this.totalFuelConsumptionKwh} - ${this.allocatedRenewableEnergyInKwh}) * ${factorUsed} / 1000 + ${this.scope2SupplementalEmissions_market}`)
            this.scope2MarketBasedEmissions = (this.totalFuelConsumptionKwh - this.allocatedRenewableEnergyInKwh) * factorUsed / 1000 + this.scope2SupplementalEmissions_market
        } else if (this.fuelType === this.FUEL_TYPE_REFRIGERANT) {
            this.log.addRecordLink(this.REFRIDGERANTSET, this.refridgeSetId);
            this.log.addLine(`scope2MarketBasedEmissions = fuelConsumption * refrigerantGWP / 1000 + scope2SupplementalEmissions_market`)
            let consumptionUsed = this.unitConversion.convertValue(this.fuelConsumption, this.fuelConsumptionUnit, 'kG');
            this.log.addLine(`scope2MarketBasedEmissions = ${consumptionUsed} * ${this.refrigerantGWP} / 1000 + ${this.scope2SupplementalEmissions_market}`)
            this.scope2MarketBasedEmissions = consumptionUsed * this.refrigerantGWP / 1000 + this.scope2SupplementalEmissions_market
        }
        else {
            this.log.addLine(`Non electricity or refrigerant fuel type`)
            this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
            if (this.suppliedEmssnFactorInTco2eMwh !== 0) {
                this.log.addLine(`scope2MarketBasedEmissions = totalFuelConsumptionKwh * suppliedEmssnFactorInTco2eMwh / 1000 + scope2SupplementalEmissions_market`);
                this.log.addLine(`scope2MarketBasedEmissions = ${this.totalFuelConsumptionKwh} * ${this.suppliedEmssnFactorInTco2eMwh} / 1000 + ${this.scope2SupplementalEmissions_market}`);
                this.scope2MarketBasedEmissions = this.totalFuelConsumptionKwh * this.suppliedEmssnFactorInTco2eMwh / 1000 + this.scope2SupplementalEmissions_market;
            } else {
                this.log.addLine(`scope2MarketBasedEmissions = totalFuelConsumptionKwh * otherSetItemCO2eFactor / 1000 + scope2SupplementalEmissions_market`);
                let factorUsed = this.unitConversion.convertValue(this.otherSetItemCO2eFactor, this.otherSetItemCO2eFactorUnit, 'TONNES_PER_MWH');
                this.log.addLine(`scope2MarketBasedEmissions = ${this.totalFuelConsumptionKwh} * ${factorUsed} / 1000 + ${this.scope2SupplementalEmissions_market}`);
                this.scope2MarketBasedEmissions = this.totalFuelConsumptionKwh * factorUsed / 1000 + this.scope2SupplementalEmissions_market;
            }
        }

        this.log.addLine(`scope2MarketBasedEmissions = ${this.scope2MarketBasedEmissions}`);
        this.log.addFinalValue(this.scope2MarketBasedEmissions);
    }
    run = () => {
        // if custom fuels or units are used
        this.log.logFlexibleFuels(this.customFuelConversion);
        //
        this.FuelConsumptionInKwh();
        this.FuelConsumptionInGigajoule();
        this.TotalFuelConsumptionInKwh();
        this.OccupiedFloorAreaInSqft();
        if (this.defaultScope === this.SCOPE1) {
            this.Scope1EmissionsInTco2e();
        }
        if (this.defaultScope === this.SCOPE2) {
            this.Scope2LocBasedEmssnInTco2e();
            this.Scope2MktBasedEmssnInTco2e();
        }

        return this.log.finishCalculation()
    }
}