/**
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */
import CalculationStep from 'c/nZC_EasyAuditLogging';
import UnitConversion from 'c/nZC_EasyAuditUnitConversion'

const FUEL_EFFICIENCY_CONVERSION_CONSTANT_VEHICLE = 235.215;
const LITER_GALLON_CONVERSION = 0.26417205;
const MAGIC_CONVERSION_NUMBER = 1.60934;
const RECORD_TYPE_PRIVATE_JET = 'Private Jet';
const UNIT_L_100k_1 = 'L per 100 km';
const UNIT_L_100k_2 = 'LITRES_PER_100KM';
const UNIT_MPG_1 = 'Miles per Gallon';
const UNIT_MPG_2 = 'MILES_PER_GALLON';
const UNIT_STRING_MPG = 'Miles per Gallon';
const UNIT_STRING_GPERH = 'GALLONS_PER_HOUR';
const UNIT_STRING_L100K = 'L per 100 km';
const UNIT_STRING_LPERH = 'LITERS_PER_HOUR';
const UNIT_KILOMETERS = 'kilometers';
const UNIT_MILES = 'miles';
const UNIT_LITERS = 'liters';
const UNIT_GALLONS = 'gallons';

const SUPPORTED_FUEL_TYPES = {
    'Diesel' : true,
    'Autogas/LPG' : true,
    'Biodiesel' : true,
    'Compressed Natural Gas (CNG)' : true,
    'Ethanol' : true,
    'Gasoline' : true
};
const FUEL_ELECTRIC = 'Electricity';
const OTHERSETITEM = 'Emissions Item';
const OTHERSET = 'Emissions Set';
export default class NZC_EasyAuditVehicleCalc  {
    constructor(infoObject) {
        this.info = infoObject;
        this.fuelEfficiencyConversionConstantVehicle = FUEL_EFFICIENCY_CONVERSION_CONSTANT_VEHICLE;
        this.LITER_GALLON_CONVERSION = LITER_GALLON_CONVERSION;
        this.SUPPORTED_FUELS = SUPPORTED_FUEL_TYPES;
        this.FUEL_ELECTRIC = FUEL_ELECTRIC;
        this.RECORD_PRIVATE_JET = RECORD_TYPE_PRIVATE_JET;
        this.MAGIC_CONVERSION = MAGIC_CONVERSION_NUMBER;
        this.UNIT_L_100k_1 = UNIT_L_100k_1;
        this.UNIT_L_100k_2 = UNIT_L_100k_2;
        this.UNIT_MPG_1 = UNIT_MPG_1;
        this.UNIT_MPG_2 = UNIT_MPG_2;
        this.UNIT_STRING_MPG = UNIT_STRING_MPG;
        this.UNIT_STRING_GPERH = UNIT_STRING_GPERH;
        this.UNIT_STRING_L100K = UNIT_STRING_L100K;
        this.UNIT_STRING_LPERH = UNIT_STRING_LPERH;
        this.UNIT_KILOMETERS = UNIT_KILOMETERS;
        this.UNIT_MILES = UNIT_MILES;
        this.UNIT_LITERS = UNIT_LITERS;
        this.UNIT_GALLONS = UNIT_GALLONS;

        this.fuelEfficiencyUnit = infoObject.FuelEfficiencyUnit || '';
        this.fuelEfficiency = 0;
        this.fuelEfficiencyMPG = 0;

        this.aircraftFuelEconomyUnit = infoObject.AircraftFuelEconomyUnit;
        this.aircraftFuelEconomy = infoObject.AircraftFuelEconomy;
        this.aircraftFuelEconomyGpH = 0;
        this.flightDurationHours = infoObject.FlightDurationInHours || 0;

        this.recordType = infoObject['RecordTypeName'] || '';

        this.fuelConsumption = infoObject.FuelConsumption || 0;// this needs default 0
        this.fuelConsumptionUnit = infoObject.FuelConsumptionUnit;
        this.fuelType = infoObject.FuelType;
        this.totalFuelConsumptionLiters = 0;
        this.totalFuelConsumptionGallons = 0;

        this.distance = infoObject.Distance || null;//default null
        this.distanceUnit = infoObject.DistanceUnit;

        this.setItemId = infoObject['otherSetItemId'];
        this.setId = infoObject['otherSetId'];
        this.OTHERSETITEM = infoObject['otherSetName'] || OTHERSETITEM;
        this.OTHERSET = infoObject['otherSetName'] || OTHERSET;


        this.CH4EmissionFactor = infoObject.Ch4EmissionFactor || 0;
        this.CH4EmissionsFactorUnit = infoObject.Ch4EmissionFactorUnit;
        this.CH4EmissionFactorGWP = infoObject['CH4GWP'];
        this.CH4Emissions = 0;

        this.CO2EmissionFactor = infoObject.Co2EmissionFactor || 0;
        this.CO2EmissionFactorUnit = infoObject.Co2EmissionFactorUnit;
        this.CO2Emissions = 0;

        this.N2OEmissionFactor = infoObject.N2oEmissionFactor || 0;
        this.N2OEmissionFactorUnit = infoObject.N2oEmissionFactorUnit;
        this.N2OEmissionFactorGWP = infoObject['N2OGWP'];
        this.N2OEmissions = 0;

        this.isOwned = infoObject['IsOwned'];
        this.defaultScope = infoObject['Scope'];
        this.scopeEmissions = 0;

        this.CO2EEmissionsFactor = infoObject['Co2eEmissionsFactor'];
        this.CO2EEmissionsFactorUnit = infoObject['Co2eEmissionsFactorUnit'];

        this.supplementalEmissions = infoObject['SuplScope1Emissions'] || 0;// only taking into account scope 1 supplemental
        this.customFuelConversion = infoObject['customFuelConversion'];

        this.log = new CalculationStep(infoObject['baseUrl']);
        this.unitConversion = new UnitConversion(this.log);
    }

    calculateFuelEfficiencyMPG = () => {
        // call calculateFuelEfficiencyAndUnit first
        this.log.startStep('Calculate fuel efficiency MPG');
        //aircraft and vehicle use different names for the same thing :(
        if (this.fuelEfficiencyUnit && this.fuelEfficiencyUnit === this.UNIT_MPG_1 || this.fuelEfficiencyUnit === this.UNIT_MPG_2) {
            this.log.addLine('fuel is already MPG')
            this.log.addLine('fuelEfficiencyMPG = fuelEfficiency')
            this.fuelEfficiencyMPG = this.fuelEfficiency;
        }
        //different names for the same thing aircraft and vehicle do use :(
        if (this.fuelEfficiencyUnit && (this.fuelEfficiencyUnit === this.UNIT_L_100k_1 || this.fuelEfficiencyUnit === this.UNIT_L_100k_2)) {
            this.log.addLine('unit = L / 100k')
            this.log.addLine(`fuelEfficiencyMPG = conversionValue / fuelEfficiency`)
            this.fuelEfficiencyMPG = this.fuelEfficiencyConversionConstantVehicle / this.fuelEfficiency;

            this.log.addLine(`fuelEfficiencyMPG = ${this.fuelEfficiencyConversionConstantVehicle} / ${this.fuelEfficiency}(current efficiency)`)
        }
        this.log.addLine(`fuelEfficiencyMPG = ${this.fuelEfficiencyMPG}`)
        this.log.addFinalValue(`${this.fuelEfficiencyMPG}`)
    }

    calculateAircraftFuelEconomy = () => {
        this.log.startStep('Calculate Aircraft Fuel economy');
        if (this.aircraftFuelEconomyUnit && this.aircraftFuelEconomyUnit === this.UNIT_STRING_GPERH) {
            this.log.addLine(`Fuel already in Gallons per hour`)
            this.aircraftFuelEconomyGpH = this.aircraftFuelEconomy;
        }
        if (this.aircraftFuelEconomyUnit && this.aircraftFuelEconomyUnit === this.UNIT_STRING_LPERH) {
            this.log.addLine(`Fuel in Liters per hour`)
            this.log.addLine(`Gallons per hour = aircraft fuel economy / liter to gallon conversion`)
            this.log.addLine(`Gallons per hour  = ${this.aircraftFuelEconomy} / ${this.LITER_GALLON_CONVERSION}`)
            this.aircraftFuelEconomyGpH = this.aircraftFuelEconomy * this.LITER_GALLON_CONVERSION;
        }
        this.log.addLine(`Gallons per hour = ${this.aircraftFuelEconomyGpH}`)
        this.log.addFinalValue(this.aircraftFuelEconomyGpH)
    }

    calculateTotalFuelConsumption = () => {
        // call after calculateFuelEfficiencyMPG
        this.log.startStep('Calculate fuel consumption')
        if (this.recordType === this.RECORD_PRIVATE_JET) {
            if (this.fuelConsumption > 0) {
                this.totalFuelConsumptionLiters = this.convertConsumptionToLiters();
            } else {
                this.log.addLine(`Calculate fuel consumption`);
                this.log.addLine(`totalFuelConsumptionLiters = (aircraftFuelEconomyGpH * flightDurationHours) / liter gallon conversion`);
                this.log.addLine(`totalFuelConsumptionLiters = (${this.aircraftFuelEconomyGpH} * ${this.flightDurationHours}) / ${this.LITER_GALLON_CONVERSION}`);
                this.totalFuelConsumptionLiters = (this.aircraftFuelEconomyGpH * this.flightDurationHours) / this.LITER_GALLON_CONVERSION;
            }
        } else {
            // for vehicle
            if (this.fuelConsumptionUnit && this.fuelConsumptionUnit.toLowerCase() === this.UNIT_GALLONS) {
                this.log.addLine(`totalFuelConsumptionLiters = Fuel Consumption / liter gallon conversion`)
                this.log.addLine(`totalFuelConsumptionLiters = ${this.fuelConsumption} / ${this.LITER_GALLON_CONVERSION}`)
                this.totalFuelConsumptionLiters = this.fuelConsumption / this.LITER_GALLON_CONVERSION;
            }

            if (this.fuelConsumptionUnit && this.fuelConsumptionUnit.toLowerCase() === this.UNIT_LITERS) {
                this.log.addLine('fuel in liters already');
                this.log.addLine(`totalFuelConsumptionLiters = fuelConsumption`);
                this.totalFuelConsumptionLiters = this.fuelConsumption;
            }
        }
        this.log.addLine(`totalFuelConsumptionLiters = ${this.totalFuelConsumptionLiters}`)
        this.log.addFinalValue(`${this.totalFuelConsumptionLiters} L`)
    }

    convertConsumptionToLiters = () => {
        this.log.addLine(`Converting fuel consumption to Liters`);
        return this.unitConversion.convertValue(this.fuelConsumption, this.fuelConsumptionUnit, 'LITERS');
    }

    calculateTotalFuelConsumptionGal = () => {
        // call after calculateTotalFuelConsumption
        this.log.startStep('Calculate total fuel consumption gallons');
        this.log.addLine(`fuel consumptions gallons = fuel consumption liters * ${this.LITER_GALLON_CONVERSION}`)
        this.log.addLine(`${this.totalFuelConsumptionLiters} * ${this.LITER_GALLON_CONVERSION}`)
        this.totalFuelConsumptionGallons = this.totalFuelConsumptionLiters * this.LITER_GALLON_CONVERSION;
        this.log.addLine(`Total consumption gallons = ${this.totalFuelConsumptionGallons}`)
        this.log.addFinalValue(`${this.totalFuelConsumptionGallons} Gal`)
    }
    calculateCh4Emissions = () => {
        // call after calculateTotalFuelConsumptionGal
        this.log.startStep('Ch4 emissions')
        this.CH4Emissions = 0;
        this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
        if (this.recordType === this.RECORD_PRIVATE_JET) {
            this.log.addLine(`CH4 emissions = fuelConsumptionGallons * CH4EmissionFactor Kg/gallon`)
            let converted = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_US_GAL');;
            this.log.addLine(`${this.totalFuelConsumptionGallons} * ${converted}`);
            this.CH4Emissions = this.totalFuelConsumptionGallons * converted;

        } else if (this.recordType !== this.RECORD_PRIVATE_JET && !this.fuelConsumption && this.distance) {
            this.log.addLine(`CH4 emissions = Distance Km * CH4EmissionFactor Kg/Km`)
            let convertedDistance = this.unitConversion.convertValue(this.distance, this.distanceUnit, 'Kilometers');
            let convertedFactor = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_KM');
            this.log.addLine(`${convertedDistance} * ${convertedFactor}`);
            this.CH4Emissions = convertedFactor * convertedDistance;
        } else if (this.SUPPORTED_FUELS[this.fuelType]) {
            // vehicle calc
            if (this.CH4EmissionsFactorUnit === 'G_PER_KM') {
                this.log.addLine(`CH4 emissions = fuelConsumptionGallons * fuelEfficiencyMPG * ${this.MAGIC_CONVERSION} * CH4EmissionFactor Kg/Km`)
                let convertedFactor = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_KM');
                this.log.addLine(`${this.totalFuelConsumptionGallons} * ${this.fuelEfficiencyMPG} * ${this.MAGIC_CONVERSION} * ${convertedFactor}`)
                this.CH4Emissions = (this.totalFuelConsumptionGallons * this.fuelEfficiencyMPG * this.MAGIC_CONVERSION * convertedFactor)
            } else {
                this.log.addLine(`CH4 emissions = fuelConsumptionGallons * CH4EmissionFactor Kg/Gal`)
                let convertedFactor = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_US_GAL');
                this.log.addLine(convertedFactor * this.totalFuelConsumptionGallons)
                this.CH4Emissions = convertedFactor * this.totalFuelConsumptionGallons;
            }
        } else if (this.fuelType === this.FUEL_ELECTRIC) {
            this.log.addLine(`CH4 emissions = fuelConsumption * CH4EmissionFactor kg/Kwh`)
            let convertedFactor = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_KWH');
            this.log.addLine(`${this.fuelConsumption} * ${convertedFactor}`)
            this.CH4Emissions = this.fuelConsumption * convertedFactor;
        }

        this.log.addLine(`ch4 calculated ${this.CH4Emissions}`)
        this.log.addFinalValue( `${this.CH4Emissions} kgs`);
    }

    calculateCo2Emissions = () => {
        // call after calculateTotalFuelConsumptionGal
        this.log.startStep('Co2 Emissions')
        this.CO2Emissions = 0;
        this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
        if (this.recordType === this.RECORD_PRIVATE_JET) {
            this.log.addLine(`CO2 emissions = fuelConsumptionGallons * CO2EmissionFactor Kg/gallon`)
            let calculated = this.unitConversion.convertValue(this.CO2EmissionFactor, this.CO2EmissionFactorUnit, 'KG_PER_US_GAL')
            this.log.addLine(`${this.totalFuelConsumptionGallons} * ${calculated}`)
            this.CO2Emissions = this.totalFuelConsumptionGallons * calculated
        } else if (this.recordType !== this.RECORD_PRIVATE_JET && !this.fuelConsumption && this.distance) {
            this.log.addLine(`CO2 emissions  = Distance Km * CO2 emissionsFactor Kg/Km`)
            let convertedDistance = this.unitConversion.convertValue(this.distance, this.distanceUnit, 'Kilometers');
            let convertedFactor = this.unitConversion.convertValue(this.CO2EmissionFactor, this.CO2EmissionFactorUnit, 'KG_PER_KM');
            this.log.addLine(`${convertedDistance} * ${convertedFactor}`);
            this.CO2Emissions = convertedFactor * convertedDistance;
        } else if (this.SUPPORTED_FUELS[this.fuelType]) {
            // vehicle calc
            this.log.addLine(`CO2 emissions = fuelConsumptionLiters * CO2 emissionsFactor Kg/L`)
            let calculated = this.unitConversion.convertValue(this.CO2EmissionFactor, this.CO2EmissionFactorUnit, 'KG_PER_L');
            this.log.addLine(`${this.totalFuelConsumptionLiters} * ${calculated}`)
            this.CO2Emissions = this.totalFuelConsumptionLiters * calculated
        } else if (this.fuelType === this.FUEL_ELECTRIC) {
            this.log.addLine(`CO2 emissions = fuelConsumption * CO2 emissionsFactor kg/Kwh`)
            let convertedFactor = this.unitConversion.convertValue(this.CO2EmissionFactor, this.CO2EmissionFactorUnit, 'KG_PER_KWH');
            this.log.addLine(`${this.fuelConsumption} * ${convertedFactor}`)
            this.CO2Emissions = this.fuelConsumption * convertedFactor;
        }
        this.log.addLine(`Co2 calculated ${this.CO2Emissions}`)
        this.log.addFinalValue( `${this.CO2Emissions} kgs`);
    }

    calculateN2oEmissions = () => {
        // call after calculateTotalFuelConsumptionGal
        this.log.startStep('N2O Emissions')
        this.N2OEmissions = 0;
        this.log.addRecordLink(this.OTHERSETITEM, this.setItemId);
        if (this.recordType === this.RECORD_PRIVATE_JET) {
            this.log.addLine(`N2o emissions = fuelConsumptionGallons * N2OEmissionFactor Kg/gallon`)
            let calculated = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_US_GAL');
            this.log.addLine(`${this.totalFuelConsumptionGallons} * ${calculated}`)
            this.N2OEmissions = this.totalFuelConsumptionGallons * calculated
        } else if (this.recordType !== this.RECORD_PRIVATE_JET && !this.fuelConsumption && this.distance) {
            this.log.addLine(`N2O emissions = Distance Km * N20 emissionsFactor Kg/Km`)
            let convertedDistance = this.unitConversion.convertValue(this.distance, this.distanceUnit, 'Kilometers');
            let convertedFactor = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_KM');
            this.log.addLine(`${convertedDistance} * ${convertedFactor}`);
            this.N2OEmissions = convertedFactor * convertedDistance;
        } else if (this.SUPPORTED_FUELS[this.fuelType]) {
            // vehicle calc
            if (this.N2OEmissionFactorUnit === 'G_PER_KM') {
                this.log.addLine(`N2O emissions = totalFuelConsumptionGallons * fuelEfficiencyMPG * ${this.MAGIC_CONVERSION} * N20 emissionsFactor Kg/Km`)
                let convertedFactor = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_KM');
                this.log.addLine(`${this.totalFuelConsumptionGallons} * ${this.fuelEfficiencyMPG} * ${this.MAGIC_CONVERSION} * ${convertedFactor}`)
                this.N2OEmissions = (this.totalFuelConsumptionGallons * this.fuelEfficiencyMPG * this.MAGIC_CONVERSION * convertedFactor)
            } else {
                this.log.addLine(`N2O emissions = fuelConsumptionGallons * N20 emissionsFactor Kg/Gal`)
                let convertedFactor = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_US_GAL');
                this.log.addLine(convertedFactor * this.totalFuelConsumptionGallons)
                this.N2OEmissions = convertedFactor * this.totalFuelConsumptionGallons;
            }

        } else if (this.fuelType === this.FUEL_ELECTRIC) {
            this.log.addLine(`N2O emissions = fuelConsumption * N2OEmissionFactor kg/Kwh`)
            let convertedFactor = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_KWH');
            this.log.addLine(`${this.fuelConsumption} * ${convertedFactor}`)
            this.N2OEmissions = this.fuelConsumption * convertedFactor;
        }
        this.log.addLine(`N2o calculated ${this.N2OEmissions}`)
        this.log.addFinalValue( `${this.N2OEmissions} kgs`);
    }

    calculateScopeEmissions = () => {
        // call after calculateN2oEmissions
        this.log.startStep(`Calculate ${this.defaultScope} Emissions`);
        this.scopeEmissions = this.supplementalEmissions;
        
        this.log.addRecordLink(this.OTHERSET, this.setId);
        if (!this.CO2EEmissionsFactor) {
            this.log.addLine('No Co2E emissions override value provided on emissions factor')
            this.log.addLine('Calculating from individual factors')
            //TODO handle for 0 values;
            if (this.recordType === this.RECORD_PRIVATE_JET) {
                this.log.addLine('Units need to be in Kg/Gal');
                this.log.addLine(`CO2 value = ${this.CO2EmissionFactor}, units = ${this.CO2EmissionFactorUnit}`)
                let CO2calcValue = this.unitConversion.convertValue(this.CO2EmissionFactor, this.CO2EmissionFactorUnit, 'KG_PER_US_GAL');

                this.log.addLine(`CH4 value = ${this.CH4EmissionFactor} * ${this.CH4EmissionFactorGWP}, units = ${this.CH4EmissionsFactorUnit}`)
                let Ch4CalcValue = this.unitConversion.convertValue(this.CH4EmissionFactor, this.CH4EmissionsFactorUnit, 'KG_PER_US_GAL') * this.CH4EmissionFactorGWP

                this.log.addLine(`N2O value = ${this.N2OEmissionFactor} * ${this.N2OEmissionFactorGWP}, units = ${this.N2OEmissionFactorUnit}`)
                let N2OcalcValue = this.unitConversion.convertValue(this.N2OEmissionFactor, this.N2OEmissionFactorUnit, 'KG_PER_US_GAL') * this.N2OEmissionFactorGWP

                this.log.addLine(`emissionsValue = ${CO2calcValue} + ${Ch4CalcValue} + ${N2OcalcValue}`)

                let baseValue = CO2calcValue + Ch4CalcValue + N2OcalcValue;
                this.log.addLine(`scope emissions = FuelConsumptionGallons * emissionValue / 1000`);
                this.log.addLine(`scope emissions = ${this.totalFuelConsumptionGallons} * ${baseValue}/1000`);
                this.scopeEmissions = this.totalFuelConsumptionGallons * baseValue / 1000 + this.supplementalEmissions;
            } else {
                this.log.addLine(`emissions = CO2 emissions / 1000 + CH4 emissions / 1000 * CH4 GWP + N20 emissions / 1000 * N20 GWP + supplemental emissions`)
                this.log.addLine(`emissions = ${this.CO2Emissions} / 1000 + ${this.CH4Emissions} / 1000 * ${this.CH4EmissionFactorGWP} + 
                ${this.N2OEmissions} / 1000 * ${this.N2OEmissionFactorGWP} + ${this.supplementalEmissions}`)
                this.scopeEmissions = (this.CO2Emissions / 1000)
                    + (this.CH4Emissions / 1000) * this.CH4EmissionFactorGWP
                    + (this.N2OEmissions / 1000) * this.N2OEmissionFactorGWP
                    + this.supplementalEmissions
            }
        }

        if (this.CO2EEmissionsFactor) {
            if (this.recordType !== this.RECORD_PRIVATE_JET && !this.fuelConsumption && this.distance) {
                this.log.addLine(`emissions = Distance Km * CO2E Kg/Km + supplemental emissions`)
                let convertedDistance = this.unitConversion.convertValue(this.distance, this.distanceUnit, 'Kilometers');
                let convertedFactor = this.unitConversion.convertValue(this.CO2EEmissionsFactor, this.CO2EEmissionsFactorUnit, 'KG_PER_KM');
                this.log.addLine(`${convertedDistance} * ${convertedFactor} + ${this.supplementalEmissions}`);
                this.scopeEmissions = convertedFactor * convertedDistance + this.supplementalEmissions;
            } else {
                this.log.addLine('Manual CO2E override provided on emissions factor')
                this.log.addLine(`totalFuelConsumptionGallons * CO2E factor KG/Gal / 1000 + supplemental emissions`);
                let converted = this.unitConversion.convertValue(this.CO2EEmissionsFactor, this.CO2EEmissionsFactorUnit, 'KG_PER_US_GAL');
                this.log.addLine(`${this.totalFuelConsumptionGallons} * ${converted} / 1000 + ${this.supplementalEmissions}`);
                this.scopeEmissions = this.totalFuelConsumptionGallons * converted / 1000 + this.supplementalEmissions;
            }
        }
        this.log.addLine(`${this.defaultScope} Emissions calculated ${this.scopeEmissions}`);
        this.log.addFinalValue( `${this.scopeEmissions} tCO2E`);
    }

    calculateFuelEfficiencyAndUnit = () => {
        // call calculateTotalFuelConsumptionGal
        // call calculateTotalFuelConsumption
        if (this.distanceUnit.toLowerCase() === this.UNIT_MILES) {
            this.fuelEfficiency = this.distance / this.totalFuelConsumptionGallons;
            this.fuelEfficiencyUnit = this.UNIT_STRING_MPG;
        }

        if (this.distanceUnit.toLowerCase() === this.UNIT_KILOMETERS) {
            this.fuelEfficiency = this.totalFuelConsumptionLiters * 100 / this.distance
            this.fuelEfficiencyUnit = this.UNIT_STRING_L100K;
        }
    }

    calculateDistanceAndUnit = () => {
        let doOverrideUserValue = this.distance === null;
        if (this.fuelEfficiencyUnit === this.UNIT_STRING_MPG) {
            this.distanceUnit = this.UNIT_MILES;
            this.distance = doOverrideUserValue? this.fuelEfficiency * this.totalFuelConsumptionGallons : this.distance;
        }

        if (this.fuelEfficiencyUnit === this.UNIT_STRING_L100K) {
            this.distanceUnit = this.UNIT_KILOMETERS;
            this.distance = doOverrideUserValue? ( 1 / this.fuelEfficiency ) * 100 * this.totalFuelConsumptionLiters : this.distance;
        }
    }

    vehicleProcess = () => {
        // if flexible fuels or custom units are utilized
        this.log.logFlexibleFuels(this.customFuelConversion);
        //

        this.calculateTotalFuelConsumption();
        this.calculateTotalFuelConsumptionGal();
        this.calculateFuelEfficiencyAndUnit();
        this.calculateFuelEfficiencyMPG();
        this.calculateDistanceAndUnit();
    }

    airProcess = () => {
        this.calculateAircraftFuelEconomy();
        this.calculateTotalFuelConsumption();
        this.calculateTotalFuelConsumptionGal();
        this.calculateDistanceAndUnit();
    }

    run = () => {
        if (this.info && this.recordType && this.recordType === this.RECORD_PRIVATE_JET) {
            this.airProcess()
        } else {
            this.vehicleProcess();
        }

        this.calculateCh4Emissions();
        this.calculateCo2Emissions();
        this.calculateN2oEmissions();
        this.calculateScopeEmissions();

        return this.log.finishCalculation()
    }
}