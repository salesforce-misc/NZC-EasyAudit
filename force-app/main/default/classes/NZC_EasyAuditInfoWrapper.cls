/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

@SuppressWarnings('PMD.ExcessivePublicCount, PMD.PropertyNamingConventions')
public with sharing class NZC_EasyAuditInfoWrapper {
    @TestVisible
    private static Boolean overrideCustomFuel = false;
    @TestVisible
    private static SustnUomConversion overrideConversion;

    public NZC_EasyAuditInfoWrapper(Id recordId) {
        if (recordId != null) {
            this.objectName = String.valueOf(recordId.getSobjectType());
        } else {
            this.objectName = null;
        }
        
        this.recordId = recordId;
        this.populateUrl();
    }

    @AuraEnabled
    public String objectName {get;set;}
    @AuraEnabled
    public String recordId {get;set;}
    @AuraEnabled
    public String otherSetId {get;set;}
    @AuraEnabled
    public String otherSetName {get;set;}
    @AuraEnabled
    public String otherSetItemId {get;set;}

    @AuraEnabled
    public Decimal FuelConsumption {get;set;}
    @AuraEnabled
    public String FuelConsumptionUnit {get;set;}
    @AuraEnabled
    public String FuelType {get;set;}

    @AuraEnabled
    public Decimal Distance {get;set;}
    @AuraEnabled
    public String DistanceUnit {get;set;}

    @AuraEnabled
    public Decimal CH4GWP {get;set;}
    @AuraEnabled
    public Decimal Ch4EmissionFactor {get;set;}
    @AuraEnabled
    public String Ch4EmissionFactorUnit {get;set;}

    @AuraEnabled
    public Decimal N2OGWP {get;set;}
    @AuraEnabled
    public Decimal N2oEmissionFactor {get;set;}
    @AuraEnabled
    public String N2oEmissionFactorUnit {get;set;}

    @AuraEnabled
    public Decimal Co2EmissionFactor {get;set;}
    @AuraEnabled
    public String Co2EmissionFactorUnit {get;set;}
    @AuraEnabled
    public Decimal Co2eEmissionFactorInTco2eMwh {get;set;}

    @AuraEnabled
    public Decimal FlightDurationInHours {get;set;}
    @AuraEnabled
    public String RecordTypeName {get;set;}
    @AuraEnabled
    public String AircraftFuelEconomyUnit {get;set;}
    @AuraEnabled
    public Decimal AircraftFuelEconomy {get;set;}
    @AuraEnabled
    public String FuelEfficiencyUnit {get;set;}

    @AuraEnabled
    public Decimal SuplScope1Emissions {get;set;}
    @AuraEnabled
    public Decimal SuplScope2LocationBasedEmssn {get;set;}
    @AuraEnabled
    public Decimal SuplScope2MarketBasedEmssn {get;set;}
    @AuraEnabled
    public Decimal AllocatedRenewableEnergyInKwh {get;set;}
    @AuraEnabled
    public Decimal PowerUsageEffectiveness {get;set;}

    @AuraEnabled
    public Decimal ElectCo2eEmissionRate {get;set;}
    @AuraEnabled
    public String ElecCo2eEmissionRateUnit {get;set;}
    @AuraEnabled
    public String ElecFactorId {get;set;}
    @AuraEnabled
    public String ElecFactorName {get;set;}

    @AuraEnabled
    public Decimal OccupiedFloorArea {get;set;}
    @AuraEnabled
    public String OccupiedFloorAreaUnit {get;set;}

    @AuraEnabled
    public Decimal RefrigerantGWP {get;set;}
    @AuraEnabled
    public String RefrigerantId {get;set;}
    @AuraEnabled
    public String RefrigerantName {get;set;}

    @AuraEnabled
    public Decimal Co2eEmissionsFactor {get;set;}
    @AuraEnabled
    public String Co2eEmissionsFactorUnit {get;set;}

    @AuraEnabled
    public Decimal CalorificValue {get;set;}
    @AuraEnabled
    public String CalorificValueUnit {get;set;}

    @AuraEnabled
    public Boolean IsOwned {get;set;}
    @AuraEnabled
    public String Scope {get;set;}

    @AuraEnabled
    public String baseUrl {get;set;}

    @AuraEnabled
    public String customFuelConversion {get;set;}

    public void populateVehicleValues(VehicleAssetEnrgyUse vehicleInfo) {
        this.FuelConsumption = vehicleInfo.FuelConsumption;
        this.FuelConsumptionUnit = vehicleInfo.FuelConsumptionUnit;
        this.FuelType = vehicleInfo.FuelType;
        this.Distance = vehicleInfo.Distance;
        this.DistanceUnit = vehicleInfo.DistanceUnit;
        this.CH4GWP = vehicleInfo.OtherEmssnFctr.Ch4GlblWarmingPot;
        this.N2OGWP = vehicleInfo.OtherEmssnFctr.N2oGlblWarmingPot;
        this.otherSetId = vehicleInfo.OtherEmssnFctrId;
        this.FlightDurationInHours = vehicleInfo.FlightDurationInHours;
        this.RecordTypeName = vehicleInfo.VehicleAssetEmssnSrc.RecordType.Name;
        this.AircraftFuelEconomyUnit = vehicleInfo.AircraftFuelEconomyUnit;
        this.AircraftFuelEconomy = vehicleInfo.AircraftFuelEconomy;
        this.FuelEfficiencyUnit = vehicleInfo.FuelEfficiencyUnit;
        this.IsOwned = vehicleInfo.VehicleAssetEmssnSrc.IsCompanyOwnedAsset;
        this.SuplScope1Emissions = vehicleInfo.SuplScope1Emissions;
        this.otherSetName = vehicleInfo.OtherEmssnFctr.Name;

        this.populateScope();
    }

    public void populateEmissionsValues(OtherEmssnFctrSetItem emissionsItem) {
        if (emissionsItem != null) {
            this.Co2EmissionFactor = emissionsItem.Co2EmissionFactor;
            this.Co2EmissionFactorUnit = emissionsItem.Co2EmissionFactorUnit;
            this.Ch4EmissionFactor = emissionsItem.Ch4EmissionFactor;
            this.Ch4EmissionFactorUnit = emissionsItem.Ch4EmissionFactorUnit;
            this.N2oEmissionFactor = emissionsItem.N2oEmissionFactor;
            this.N2oEmissionFactorUnit = emissionsItem.N2oEmissionFactorUnit;
            this.otherSetItemId = emissionsItem.Id;
            this.CalorificValue = emissionsItem.CalorificValue;
            this.CalorificValueUnit = emissionsItem.CalorificValueUnit;
            this.Co2eEmissionFactorInTco2eMwh = emissionsItem.Co2eEmissionFactorInTco2eMwh;
            this.Co2eEmissionsFactor = emissionsItem.SuppliedEmissionsFactor;
            this.Co2eEmissionsFactorUnit = emissionsItem.SuppliedEmissionsFactorUnit;
        }
    }

    public void populateStationaryValues(StnryAssetEnrgyUse stationaryInfo) {
        this.FuelType = stationaryInfo.FuelType;
        this.FuelConsumption = stationaryInfo.FuelConsumption;
        this.FuelConsumptionUnit = stationaryInfo.FuelConsumptionUnit;
        this.RecordTypeName = stationaryInfo.StnryAssetEnvrSrc.RecordType.Name;
        this.SuplScope1Emissions = stationaryInfo.SuplScope1Emissions;
        this.SuplScope2LocationBasedEmssn = stationaryInfo.SuplScope2LocationBasedEmssn;
        this.SuplScope2MarketBasedEmssn = stationaryInfo.SuplScope2LocationBasedEmssn;
        this.PowerUsageEffectiveness = stationaryInfo.PowerUsageEffectiveness;
        this.ElecCo2eEmissionRateUnit = stationaryInfo.ElectricityEmissionFactors.Co2eEmissionRateUnit;
        this.ElectCo2eEmissionRate = stationaryInfo.ElectricityEmissionFactors.Co2eEmissionRate;
        this.ElecFactorId = stationaryInfo.ElectricityEmissionFactorsId;
        this.OccupiedFloorArea = stationaryInfo.OccupiedFloorArea;
        this.OccupiedFloorAreaUnit = stationaryInfo.OccupiedFloorAreaUnit;
        this.otherSetId = stationaryInfo.OtherEmssnFctrId;
        this.RefrigerantGWP = stationaryInfo.RefrigerantEmssnFctr.GlblWarmingPotInKgCo2eKg;
        this.RefrigerantId = stationaryInfo.RefrigerantEmssnFctrId;
        this.IsOwned = stationaryInfo.StnryAssetEnvrSrc.IsCompanyOwnedAsset;
        this.AllocatedRenewableEnergyInKwh = stationaryInfo.AllocatedRenewableEnergyInKwh;
        this.otherSetName = stationaryInfo.OtherEmssnFctr.Name;
        this.ElecFactorName = stationaryInfo.ElectricityEmissionFactors.Name;
        this.RefrigerantName = stationaryInfo.RefrigerantEmssnFctr.Name;

        this.populateScope();
    }

    private void populateScope() {
        if (this.objectName == NZC_EasyAuditConstants.OBJECT_VEHICLE_USE) {
            this.Scope = this.IsOwned? NZC_EasyAuditConstants.SCOPE1 : NZC_EasyAuditConstants.SCOPE3;
            if (this.FuelType == NZC_EasyAuditConstants.FUEL_ELECTRICITY) {
                this.Scope = NZC_EasyAuditConstants.SCOPE2;
            }
        }

        if (this.objectName == NZC_EasyAuditConstants.OBJECT_STATIONARY_USE) {
            this.Scope = NZC_EasyAuditConstants.SCOPE2;
            Boolean isOwned = this.IsOwned && String.isNotBlank(this.FuelType);

            if (isOwned) {
                this.Scope = NZC_EasyAuditConstants.DEFAULT_OWNED_SCOPE.get(this.FuelType);
            }
            // makes any fuels not standard / in lookup go to scope 1
            this.Scope = String.isBlank(this.Scope)? NZC_EasyAuditConstants.SCOPE1 : this.Scope;
        }
    }

    public Boolean isCustomFuelOrUnit() {
        Boolean isCustomFuel = false;
        Boolean isCustomUnit = false;
        try {
            Id castUnitId = (Id) this.FuelConsumptionUnit;
            isCustomUnit = castUnitId.getSobjectType() + '' == 'SustainabilityUom';
        } catch (TypeException e) {
            // FuelConsumptionUnit is a standard string value, not a custom unit ID
            // This is expected behavior when FuelConsumptionUnit is a standard unit
            isCustomUnit = false; // Explicitly set to false for standard units
        } catch (StringException e) {
            // FuelConsumptionUnit is a standard string value (e.g., "kWh"), not a valid Id
            // This is expected behavior when FuelConsumptionUnit is a standard unit
            isCustomUnit = false; // Explicitly set to false for standard units
        }
        try {
            Id castUnitId = (Id) this.FuelType;
            isCustomFuel = castUnitId.getSobjectType() + '' == 'FuelType';
        } catch (TypeException e) {
            // FuelType is a standard string value, not a custom fuel ID
            // This is expected behavior when FuelType is a standard fuel type
            isCustomFuel = false; // Explicitly set to false for standard fuel types
        } catch (StringException e) {
            // FuelType is a standard string value (e.g., "Electricity"), not a valid Id
            // This is expected behavior when FuelType is a standard fuel type
            isCustomFuel = false; // Explicitly set to false for standard fuel types
        }
        return isCustomUnit || isCustomFuel || overrideCustomFuel;
    }

    public void convertFuelType(Map<Integer, SustnUomConversion> conversions, String fuelName, String unitName) {
        Integer hashKey = (this.FuelType + this.FuelConsumptionUnit).hashCode();
        SustnUomConversion conversion = conversions.get(hashKey);

        if (overrideCustomFuel) {
            conversion = overrideConversion;
        }

        customFuelConversion = 'Flexible fuels framework used';
        customFuelConversion += ', Fuel name : ' + fuelName;
        customFuelConversion += ', Unit : ' + unitName;
        if (conversion != null) {
            customFuelConversion += ', New unit : ' +  conversion.TargetUom;
            customFuelConversion += ', With factor : ' +  conversion.ConversionFactor;
            customFuelConversion += ', ' + FuelConsumption + ' * ' + conversion.ConversionFactor;
            convertFuelUnits(conversion.ConversionFactor, conversion.TargetUom);
            customFuelConversion += ', Converted fuel value for calculations: ' + this.FuelConsumption;
        } else {
            customFuelConversion += ', Unit is standard NZC and needs no conversion';
        }
    }

    private void convertFuelUnits(Decimal conversionFactor, String newUnit) {
        this.FuelConsumption = this.FuelConsumption * conversionFactor;
        this.FuelConsumptionUnit = newUnit;
    }

    private void populateUrl() {
        this.baseUrl = Url.getOrgDomainUrl().toExternalForm();
    }
}