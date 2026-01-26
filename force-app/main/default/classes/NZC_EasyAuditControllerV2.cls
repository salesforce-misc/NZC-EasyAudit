/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

public with sharing class NZC_EasyAuditControllerV2 {

    public NZC_EasyAuditInfoWrapper infoWrapper;

    public NZC_EasyAuditControllerV2(Id recordId) {
        System.debug('[NZC_EasyAuditControllerV2] Constructor - recordId: ' + recordId);
        infoWrapper = new NZC_EasyAuditInfoWrapper(recordId);
        System.debug('[NZC_EasyAuditControllerV2] Constructor - infoWrapper created, objectName: ' + infoWrapper.objectName);
    }

    public NZC_EasyAuditInfoWrapper processWrapper() {
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - Entry');
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - objectName: ' + infoWrapper.objectName);
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - objectName isBlank: ' + String.isBlank(infoWrapper.objectName));
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - OBJECT_VEHICLE_USE: ' + NZC_EasyAuditConstants.OBJECT_VEHICLE_USE);
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - OBJECT_STATIONARY_USE: ' + NZC_EasyAuditConstants.OBJECT_STATIONARY_USE);
        
        if (String.isNotBlank(infoWrapper.objectName)) {
            if (infoWrapper.objectName == NZC_EasyAuditConstants.OBJECT_VEHICLE_USE) {
                System.debug('[NZC_EasyAuditControllerV2] processWrapper - Calling getVehicleInfo');
                getVehicleInfo();
            }
            if (infoWrapper.objectName == NZC_EasyAuditConstants.OBJECT_STATIONARY_USE) {
                System.debug('[NZC_EasyAuditControllerV2] processWrapper - Calling getStationaryInfo');
                getStationaryInfo();
            }
        } else {
            System.debug('[NZC_EasyAuditControllerV2] processWrapper - objectName is blank, skipping processing');
        }
        System.debug('[NZC_EasyAuditControllerV2] processWrapper - Returning infoWrapper');
        return infoWrapper;
    }

    public void getVehicleInfo () {
        VehicleAssetEnrgyUse requestedVehicleInfo = [
                SELECT Id, FuelConsumption, FuelConsumptionUnit, FuelType,
                        Distance, DistanceUnit, OtherEmssnFctrId,
                        OtherEmssnFctr.Ch4GlblWarmingPot, OtherEmssnFctr.N2oGlblWarmingPot,
                        FlightDurationInHours, VehicleAssetEmssnSrc.RecordType.Name, VehicleAssetEmssnSrc.IsCompanyOwnedAsset,
                        AircraftFuelEconomy, AircraftFuelEconomyUnit, FuelEfficiencyUnit,
                        SuplScope1Emissions, OtherEmssnFctr.Name
                FROM VehicleAssetEnrgyUse
                WHERE Id =: this.infoWrapper.recordId
                WITH USER_MODE
        ];

        this.infoWrapper.populateVehicleValues(requestedVehicleInfo);
        this.infoWrapper.populateEmissionsValues(getSetItemInfo());

        if (this.infoWrapper.isCustomFuelOrUnit()) {
            // convert custom fuel
            this.infoWrapper.convertFuelType(getCustomFuelOrUnits(), getCustomFuelName(), getCustomFuelUnitName());
        }
    }

    private OtherEmssnFctrSetItem getSetItemInfo() {
        List<OtherEmssnFctrSetItem> items = [
                SELECT Id, Co2EmissionFactor, Co2EmissionFactorUnit,
                        Ch4EmissionFactor, Ch4EmissionFactorUnit,
                        N2oEmissionFactor, N2oEmissionFactorUnit,
                        CalorificValue, CalorificValueUnit,
                        SuppliedEmissionsFactor, SuppliedEmissionsFactorUnit, Co2eEmissionFactorInTco2eMwh
                FROM OtherEmssnFctrSetItem
                WHERE FuelType =: this.infoWrapper.FuelType
                AND ParentEmissionFactorId =: this.infoWrapper.otherSetId
                WITH USER_MODE
        ];
        return items.size() > 0? items[0] : null;
    }

    public void getStationaryInfo () {
        StnryAssetEnrgyUse requestedStationaryUse = [
                SELECT Id, FuelType, FuelConsumption, FuelConsumptionUnit,
                        SuplScope1Emissions, SuplScope2LocationBasedEmssn, SuplScope2MarketBasedEmssn,
                        PowerUsageEffectiveness, OccupiedFloorArea, OccupiedFloorAreaUnit, StnryAssetEnvrSrc.RecordType.Name,
                        ElectricityEmissionFactors.Co2eEmissionRate, ElectricityEmissionFactors.Co2eEmissionRateUnit, ElectricityEmissionFactorsId,
                        RefrigerantEmssnFctr.GlblWarmingPotInKgCo2eKg, RefrigerantEmssnFctrId ,OtherEmssnFctrId, StnryAssetEnvrSrc.IsCompanyOwnedAsset,
                        AllocatedRenewableEnergyInKwh, OtherEmssnFctr.Name, ElectricityEmissionFactors.Name, RefrigerantEmssnFctr.Name
                FROM StnryAssetEnrgyUse
                WHERE Id =: this.infoWrapper.recordId
                WITH USER_MODE
        ];

        // if fuel is electricity > pull out emissions factors

        this.infoWrapper.populateStationaryValues(requestedStationaryUse);
        this.infoWrapper.populateEmissionsValues(getSetItemInfo());

        if (this.infoWrapper.isCustomFuelOrUnit()) {
            // convert custom fuel
            this.infoWrapper.convertFuelType(getCustomFuelOrUnits(), getCustomFuelName(), getCustomFuelUnitName());
        }
    }

    private static Map<Integer, SustnUomConversion> getCustomFuelOrUnits() {
        Map<Integer, SustnUomConversion> conversionMap = new Map<Integer, SustnUomConversion>();

        for (SustnUomConversion conversion : [
                SELECT FuelType, SourceUom, TargetUom, ConversionFactor
                FROM SustnUomConversion
                WITH USER_MODE
        ]) {
            conversionMap.put((conversion.FuelType+''+conversion.SourceUom).hashCode(), conversion);
        }

        return conversionMap;
    }

    private String getCustomFuelName() {
        List<FuelType> fuels = [
                SELECT MasterLabel
                FROM FuelType
                WHERE Id =: this.infoWrapper.FuelType
                WITH USER_MODE
        ];
        if (fuels.isEmpty()) {
            return this.infoWrapper.FuelType;
        }
        return fuels.get(0).MasterLabel;
    }

    private String getCustomFuelUnitName() {
        List<SustainabilityUom> units = [
                SELECT MasterLabel
                FROM SustainabilityUom
                WHERE Id =: this.infoWrapper.FuelConsumptionUnit
                WITH USER_MODE
        ];
        if (units.isEmpty()) {
            return this.infoWrapper.FuelConsumptionUnit;
        }
        return units.get(0).MasterLabel;
    }

    @AuraEnabled
    public static NZC_EasyAuditInfoWrapper getRecordInfo(String recordId) {
        System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - Entry point called');
        System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - recordId: ' + recordId);
        System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - recordId isBlank: ' + String.isBlank(recordId));
        
        try {
            NZC_EasyAuditControllerV2 instance = new NZC_EasyAuditControllerV2(recordId);
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - Instance created, infoWrapper.objectName: ' + instance.infoWrapper.objectName);
            
            NZC_EasyAuditInfoWrapper result = instance.processWrapper();
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - processWrapper completed');
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - result.objectName: ' + result.objectName);
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - result keys: ' + JSON.serialize(result).substring(0, Math.min(500, JSON.serialize(result).length())));
            
            return result;
        } catch (Exception e) {
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - EXCEPTION: ' + e.getMessage());
            System.debug('[NZC_EasyAuditControllerV2] getRecordInfo - Stack trace: ' + e.getStackTraceString());
            throw e;
        }
    }
}