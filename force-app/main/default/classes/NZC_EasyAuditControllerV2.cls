/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

public with sharing class NZC_EasyAuditControllerV2 {

    public NZC_EasyAuditInfoWrapper infoWrapper;

    public NZC_EasyAuditControllerV2(Id recordId) {
        infoWrapper = new NZC_EasyAuditInfoWrapper(recordId);
    }

    public NZC_EasyAuditInfoWrapper processWrapper() {
        if (String.isNotBlank(infoWrapper.objectName)) {
            if (infoWrapper.objectName == NZC_EasyAuditConstants.OBJECT_VEHICLE_USE) {
                getVehicleInfo();
            }
            if (infoWrapper.objectName == NZC_EasyAuditConstants.OBJECT_STATIONARY_USE) {
                getStationaryInfo();
            }
        }
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
                LIMIT 10000
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
        try {
            NZC_EasyAuditControllerV2 instance = new NZC_EasyAuditControllerV2(recordId);
            NZC_EasyAuditInfoWrapper result = instance.processWrapper();
            return result;
        } catch (Exception e) {
            throw e;
        }
    }
}