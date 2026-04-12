/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

@IsTest
private class NZC_EasyAuditControllerV2Test {

    // other emission set Data
    public static String createOtherEmissionsSet() {
        OtherEmssnFctrSet otherSet = new OtherEmssnFctrSet(
                Name = 'Other Emissions Factor Set',
                Ch4GlblWarmingPot = 44,
                N2oGlblWarmingPot = 44
        );
        insert otherSet;

        OtherEmssnFctrSetItem otherSetItem = new OtherEmssnFctrSetItem(
                ParentEmissionFactorId = otherSet.Id,
                FuelType = 'Diesel',
                CalorificValue = 10,
                CalorificValueUnit = 'KWH_PER_L',
                Ch4EmissionFactor = 10,
                Ch4EmissionFactorUnit = 'G_PER_L',
                Co2EmissionFactor = 10,
                Co2EmissionFactorUnit = 'G_PER_L',
                N2oEmissionFactor = 10,
                N2oEmissionFactorUnit = 'G_PER_L'
        );
        insert otherSetItem;

        return otherSet.Id;
    }

    // stationary test data
    public static void createStationaryTestData() {
        String otherSetId = createOtherEmissionsSet();

        RefrigerantEmssnFctr refridgeSet = new RefrigerantEmssnFctr(
                Name = 'Test Refridge Set',
                GlblWarmingPotInKgCo2eKg = 230
        );
        insert refridgeSet;

        ElectricityEmssnFctrSet elecSet = new ElectricityEmssnFctrSet(
                Name = 'Test Elec Set',
                Co2eEmissionRate = 10,
                Co2eEmissionRateUnit = 'G_PER_KWH',
                Ch4EmissionRate = 10,
                Ch4EmissionRateUnit = 'G_PER_KWH',
                N2oEmissionRate = 10,
                N2oEmissionRateUnit = 'G_PER_KWH',
                LocationBasedBiomassMixPct = 100,
                MarketBasedBiomassMixPct = 100
        );
        insert elecSet;

        StnryAssetEnvrSrc assetRecord = new StnryAssetEnvrSrc(
                Name = 'Test Stationary Asset',
                ElectricityEmssnFctrId = elecSet.Id,
                RefrigerantEmssnFctrId = refridgeSet.Id,
                OtherEmssnFctrId = otherSetId,
                OccupiedFloorArea = 100,
                OccupiedFloorAreaUnit = 'm2',
                IsCompanyOwnedAsset = true
        );

        Schema.RecordTypeInfo recordTypeInfo = Schema.SObjectType.StnryAssetEnvrSrc
            .getRecordTypeInfosByDeveloperName().get('Commercial_Building');
        Id recordTypeId = recordTypeInfo != null ? recordTypeInfo.getRecordTypeId() : null;
        if (recordTypeId != null) {
            assetRecord.put('RecordTypeId', recordTypeId);
        }
        insert assetRecord;

        StnryAssetEnrgyUse useRecord = new StnryAssetEnrgyUse(
                Name = 'Test use record',
                StartDate = Date.today().addMonths(-1),
                EndDate = Date.today(),
                StnryAssetEnvrSrcId = assetRecord.Id,
                FuelConsumption = 100,
                FuelConsumptionUnit = 'Liters',
                FuelType = 'Diesel',
                SuplScope1Emissions = 15.0,
                SuplScope2MarketBasedEmssn = 25.0,
                SuplScope2LocationBasedEmssn = 10.0,
                SuplScope3UpstrmEmissions = 5.0,
                SuplScope3DnstrmEmissions = 3.0
        );
        insert useRecord;
    }

    // vehicle test data
    public static void createVehicleTestData() {
        String otherSetId = createOtherEmissionsSet();

        VehicleAssetEmssnSrc vehicleAsset = new VehicleAssetEmssnSrc(
                Name = 'Vehicle Asset',
                OtherEmssnFctrId = otherSetId,
                IsCompanyOwnedAsset = true
        );

        Schema.RecordTypeInfo recordTypeInfo = Schema.SObjectType.VehicleAssetEmssnSrc
            .getRecordTypeInfosByDeveloperName().get('Fleet_Vehicle');
        Id recordTypeId = recordTypeInfo != null ? recordTypeInfo.getRecordTypeId() : null;
        if (recordTypeId != null) {
            vehicleAsset.put('RecordTypeId', recordTypeId);
        }
        insert vehicleAsset;

        VehicleAssetEnrgyUse energyUse = new VehicleAssetEnrgyUse(
                Name = 'Test stationary Asset',
                StartDate = Date.today().addDays(-1),
                EndDate = Date.today(),
                FuelConsumption = 100,
                FuelConsumptionUnit = 'Liters',
                FuelType = 'Diesel',
                SuplScope1Emissions = 10,
                VehicleAssetEmssnSrcId = vehicleAsset.Id,
                DistanceUnit = 'Miles',
                Distance = 1000
        );
        insert energyUse;
    }

    static FuelType createFuel() {
        return new FuelType(
                MasterLabel='TestFuel',
                DeveloperName='TestFuel'
        );
    }

    static SustainabilityUom createFuelUnit() {
        return new SustainabilityUom(
                MasterLabel='TestFuel',
                DeveloperName='TestFuel'
        );
    }

    static SustnUomConversion createFuelConversion(String fuelType, String sourceUnit, String targetUnit) {
        return new SustnUomConversion(
                MasterLabel='TestFuel',
                DeveloperName='TestFuel',
                FuelType=fuelType,
                SourceUom=sourceUnit,
                TargetUom=targetUnit,
                ConversionFactor=1
        );
    }

    @TestSetup
    static void setup() {
        createStationaryTestData();
        createVehicleTestData();
    }

    @IsTest
    static void testProcessStationary() {
        StnryAssetEnrgyUse useRecord = [
                SELECT Id
                FROM StnryAssetEnrgyUse
                LIMIT 1
        ];

        Test.startTest();
        NZC_EasyAuditInfoWrapper result = NZC_EasyAuditControllerV2.getRecordInfo(useRecord.Id);
        Test.stopTest();

        Assert.areEqual(NZC_EasyAuditConstants.OBJECT_STATIONARY_USE, result.objectName);
        Assert.isNotNull(result.recordId);
        Assert.isNotNull(result.otherSetId);
        Assert.isNotNull(result.otherSetName);
        Assert.isNotNull(result.otherSetItemId);
        Assert.isNotNull(result.FuelConsumption);
        Assert.areNotEqual(0, result.FuelConsumption);
        Assert.isNotNull(result.FuelConsumptionUnit);
        Assert.isNotNull(result.FuelType);
        Assert.isNotNull(result.Ch4EmissionFactorUnit);
        Assert.isNotNull(result.Ch4EmissionFactor);
        Assert.isNotNull(result.N2oEmissionFactorUnit);
        Assert.isNotNull(result.N2oEmissionFactor);
        Assert.isNotNull(result.Co2EmissionFactorUnit);
        Assert.isNotNull(result.Co2EmissionFactor);
        Assert.isNotNull(result.RecordTypeName);
        Assert.isNotNull(result.SuplScope1Emissions);
        Assert.isNotNull(result.SuplScope2LocationBasedEmssn);
        Assert.isNotNull(result.SuplScope2MarketBasedEmssn);

        // Verify correct field mapping for market vs location based
        Assert.areNotEqual(
            result.SuplScope2LocationBasedEmssn,
            result.SuplScope2MarketBasedEmssn,
            'Market-based and Location-based emissions must be different values'
        );

        // Verify exact values match source data
        Assert.areEqual(25.0, result.SuplScope2MarketBasedEmssn,
            'Market-based emissions should be 25.0');
        Assert.areEqual(10.0, result.SuplScope2LocationBasedEmssn,
            'Location-based emissions should be 10.0');

        Assert.isNotNull(result.ElectCo2eEmissionRate);
        Assert.isNotNull(result.ElecCo2eEmissionRateUnit);
        Assert.isNotNull(result.ElecFactorName);
        Assert.isNotNull(result.ElecFactorId);
        Assert.isNotNull(result.OccupiedFloorAreaUnit);
        Assert.isNotNull(result.OccupiedFloorArea);
        Assert.isNotNull(result.RefrigerantGWP);
        Assert.isNotNull(result.RefrigerantName);
        Assert.isNotNull(result.RefrigerantId);
        Assert.isNotNull(result.CalorificValue);
        Assert.isNotNull(result.CalorificValueUnit);
        Assert.isNotNull(result.IsOwned);
        Assert.isNotNull(result.Scope);
        Assert.isNotNull(result.baseUrl);
        Assert.isNull(result.customFuelConversion);
    }

    @IsTest
    static void testProcessVehicle() {
        VehicleAssetEnrgyUse useRecord = [
                SELECT Id
                FROM VehicleAssetEnrgyUse
                LIMIT 1
        ];

        Test.startTest();
        NZC_EasyAuditInfoWrapper result = NZC_EasyAuditControllerV2.getRecordInfo(useRecord.Id);
        Test.stopTest();

        Assert.areEqual(NZC_EasyAuditConstants.OBJECT_VEHICLE_USE, result.objectName);
        Assert.isNotNull(result.recordId);
        Assert.isNotNull(result.otherSetId);
        Assert.isNotNull(result.otherSetName);
        Assert.isNotNull(result.otherSetItemId);
        Assert.isNotNull(result.FuelConsumption);
        Assert.areNotEqual(0, result.FuelConsumption);
        Assert.isNotNull(result.FuelConsumptionUnit);
        Assert.isNotNull(result.FuelType);
        Assert.isNotNull(result.Ch4EmissionFactorUnit);
        Assert.isNotNull(result.Ch4EmissionFactor);
        Assert.isNotNull(result.CH4GWP);
        Assert.isNotNull(result.N2OGWP);
        Assert.isNotNull(result.N2oEmissionFactorUnit);
        Assert.isNotNull(result.N2oEmissionFactor);
        Assert.isNotNull(result.Co2EmissionFactorUnit);
        Assert.isNotNull(result.Co2EmissionFactor);
        Assert.isNotNull(result.RecordTypeName);
        Assert.isNotNull(result.SuplScope1Emissions);
        Assert.isNotNull(result.CalorificValue);
        Assert.isNotNull(result.CalorificValueUnit);
        Assert.isNotNull(result.IsOwned);
        Assert.isNotNull(result.Scope);
        Assert.isNotNull(result.baseUrl);
        Assert.isNotNull(result.DistanceUnit);
        Assert.isNotNull(result.Distance);
        Assert.isNull(result.customFuelConversion);
    }

    private static void assertBasicRecordFields(NZC_EasyAuditInfoWrapper result, String expectedObjectName) {
        Assert.areEqual(expectedObjectName, result.objectName);
        Assert.isNotNull(result.recordId);
        Assert.isNotNull(result.otherSetId);
        Assert.isNotNull(result.otherSetName);
        Assert.isNotNull(result.otherSetItemId);
        Assert.isNotNull(result.FuelConsumption);
        Assert.areNotEqual(0, result.FuelConsumption);
        Assert.isNotNull(result.FuelConsumptionUnit);
        Assert.isNotNull(result.FuelType);
    }

    private static void assertEmissionFactors(NZC_EasyAuditInfoWrapper result) {
        Assert.isNotNull(result.Ch4EmissionFactorUnit);
        Assert.isNotNull(result.Ch4EmissionFactor);
        Assert.isNotNull(result.N2oEmissionFactorUnit);
        Assert.isNotNull(result.N2oEmissionFactor);
        Assert.isNotNull(result.Co2EmissionFactorUnit);
        Assert.isNotNull(result.Co2EmissionFactor);
        Assert.isNotNull(result.CalorificValue);
        Assert.isNotNull(result.CalorificValueUnit);
    }

    private static void assertStationarySpecificFields(NZC_EasyAuditInfoWrapper result) {
        Assert.isNotNull(result.RecordTypeName);
        Assert.isNotNull(result.SuplScope1Emissions);
        Assert.isNotNull(result.SuplScope2LocationBasedEmssn);
        Assert.isNotNull(result.SuplScope2MarketBasedEmssn);
        Assert.isNotNull(result.ElectCo2eEmissionRate);
        Assert.isNotNull(result.ElecCo2eEmissionRateUnit);
        Assert.isNotNull(result.ElecFactorName);
        Assert.isNotNull(result.ElecFactorId);
        Assert.isNotNull(result.OccupiedFloorAreaUnit);
        Assert.isNotNull(result.OccupiedFloorArea);
        Assert.isNotNull(result.RefrigerantGWP);
        Assert.isNotNull(result.RefrigerantName);
        Assert.isNotNull(result.RefrigerantId);
    }

    private static void assertCommonFields(NZC_EasyAuditInfoWrapper result) {
        Assert.isNotNull(result.IsOwned);
        Assert.isNotNull(result.Scope);
        Assert.isNotNull(result.baseUrl);
    }

    @IsTest
    static void testCustomFuel() {
        NZC_EasyAuditInfoWrapper.overrideCustomFuel = true;
        NZC_EasyAuditInfoWrapper.overrideConversion = createFuelConversion(createFuel().Id, createFuelUnit().Id, 'kWH');

        StnryAssetEnrgyUse useRecord = [
                SELECT Id
                FROM StnryAssetEnrgyUse
                LIMIT 1
        ];

        Test.startTest();
        NZC_EasyAuditInfoWrapper result = NZC_EasyAuditControllerV2.getRecordInfo(useRecord.Id);
        Test.stopTest();

        assertBasicRecordFields(result, NZC_EasyAuditConstants.OBJECT_STATIONARY_USE);
        assertEmissionFactors(result);
        assertStationarySpecificFields(result);
        assertCommonFields(result);
        Assert.isNotNull(result.customFuelConversion);
    }

    // Helper method for creating test records with custom emission values
    private static StnryAssetEnrgyUse createStationaryRecord(
        Decimal marketEmissions,
        Decimal locationEmissions
    ) {
        // Create required parent records
        StnryAssetEnvrSrc assetRecord = new StnryAssetEnvrSrc(
            Name = 'Test Asset ' + System.currentTimeMillis()
        );

        // Set RecordType if exists in org
        List<RecordType> recordTypes = [
            SELECT Id
            FROM RecordType
            WHERE SObjectType = 'StnryAssetEnvrSrc'
            AND DeveloperName = 'Facility'
            WITH USER_MODE
            LIMIT 1
        ];
        if (!recordTypes.isEmpty()) {
            assetRecord.RecordTypeId = recordTypes[0].Id;
        }
        insert assetRecord;

        // Create stationary energy use record with custom emissions
        StnryAssetEnrgyUse useRecord = new StnryAssetEnrgyUse(
            Name = 'Test Record ' + System.currentTimeMillis(),
            StartDate = Date.today().addMonths(-1),
            EndDate = Date.today(),
            StnryAssetEnvrSrcId = assetRecord.Id,
            FuelConsumption = 100,
            FuelConsumptionUnit = 'Liters',
            FuelType = 'Diesel',
            SuplScope1Emissions = 15.0,
            SuplScope2MarketBasedEmssn = marketEmissions,
            SuplScope2LocationBasedEmssn = locationEmissions,
            SuplScope3UpstrmEmissions = 5.0,
            SuplScope3DnstrmEmissions = 3.0
        );
        insert useRecord;

        return useRecord;
    }

    @IsTest
    static void testStationaryEmissions_EdgeCases() {
        // Test Case 1: Market = 0, Location > 0
        StnryAssetEnrgyUse testRecord1 = createStationaryRecord(0.0, 15.0);

        Test.startTest();
        NZC_EasyAuditInfoWrapper result1 =
            NZC_EasyAuditControllerV2.getRecordInfo(testRecord1.Id);
        Test.stopTest();

        Assert.areEqual(0.0, result1.SuplScope2MarketBasedEmssn,
            'Market emissions should be 0');
        Assert.areEqual(15.0, result1.SuplScope2LocationBasedEmssn,
            'Location emissions should be 15');

        // Test Case 2: Market > Location (valid scenario)
        StnryAssetEnrgyUse testRecord2 = createStationaryRecord(50.0, 30.0);

        result1 = NZC_EasyAuditControllerV2.getRecordInfo(testRecord2.Id);
        Assert.areEqual(50.0, result1.SuplScope2MarketBasedEmssn,
            'Market emissions should be 50');
        Assert.areEqual(30.0, result1.SuplScope2LocationBasedEmssn,
            'Location emissions should be 30');

        // Test Case 3: Both null (edge case)
        StnryAssetEnrgyUse testRecord3 = createStationaryRecord(null, null);
        result1 = NZC_EasyAuditControllerV2.getRecordInfo(testRecord3.Id);
        Assert.isNull(result1.SuplScope2MarketBasedEmssn,
            'Null market emissions should remain null');
        Assert.isNull(result1.SuplScope2LocationBasedEmssn,
            'Null location emissions should remain null');
    }

    @IsTest
    static void testStationaryEmissions_NegativeValues() {
        // Some scenarios may have negative adjustments
        StnryAssetEnrgyUse testRecord = createStationaryRecord(-5.0, 10.0);

        Test.startTest();
        NZC_EasyAuditInfoWrapper result =
            NZC_EasyAuditControllerV2.getRecordInfo(testRecord.Id);
        Test.stopTest();

        Assert.areEqual(-5.0, result.SuplScope2MarketBasedEmssn,
            'Negative market emissions should be preserved');
        Assert.areEqual(10.0, result.SuplScope2LocationBasedEmssn,
            'Location emissions should be 10');
    }

    @IsTest
    static void testGetRecordInfo_InvalidId() {
        // Test exception handling with invalid record ID
        Test.startTest();
        try {
            NZC_EasyAuditControllerV2.getRecordInfo('invalid_id');
            Assert.fail('Should have thrown AuraHandledException');
        } catch (AuraHandledException e) {
            Assert.isTrue(e.getMessage().contains('Failed to retrieve'),
                'Exception message should contain error context');
        }
        Test.stopTest();
    }
}