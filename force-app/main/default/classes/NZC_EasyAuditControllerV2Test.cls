/**
 * Created by mverigin on 12/1/23.
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

        Id recordTypeId = StnryAssetEnvrSrc.SObjectType.getDescribe().getRecordTypeInfosByDeveloperName().get('Commercial_Building')?.getRecordTypeId();
        if (recordTypeId != null)  assetRecord.put('RecordTypeId', recordTypeId);
        insert assetRecord;

        StnryAssetEnrgyUse useRecord = new StnryAssetEnrgyUse(
                Name = 'Test use record',
                StartDate = Date.today().addMonths(-1),
                EndDate = Date.today(),
                StnryAssetEnvrSrcId = assetRecord.Id,
                FuelConsumption = 100,
                FuelConsumptionUnit = 'Liters',
                FuelType = 'Diesel',
                SuplScope1Emissions = 10,
                SuplScope2MarketBasedEmssn = 10,
                SuplScope2LocationBasedEmssn = 10,
                SuplScope3UpstrmEmissions = 10,
                SuplScope3DnstrmEmissions = 10
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

        Id recordTypeId = VehicleAssetEmssnSrc.SObjectType.getDescribe().getRecordTypeInfosByDeveloperName().get('Fleet_Vehicle')?.getRecordTypeId();
        if (recordTypeId != null) vehicleAsset.put('RecordTypeId', recordTypeId);
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
                Id='0wUHn0000008ONfMAM',
                MasterLabel='TestFuel',
                DeveloperName='TestFuel'
        );
    }

    static SustainabilityUom createFuelUnit() {
        return new SustainabilityUom(
                Id='0wVHn0000008OJcMAM',
                MasterLabel='TestFuel',
                DeveloperName='TestFuel'
        );
    }

    static SustnUomConversion createFuelConversion(String fuelType, String sourceUnit, String targetUnit) {
        return new SustnUomConversion(
                Id='0wYHn0000008OJmMAM',
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

    @IsTest
    static void testCustomFuel() {
        NZC_EasyAuditInfoWrapper.OVERRIDE_CUSTOM_FUEL = true;
        NZC_EasyAuditInfoWrapper.OVERRIDE_CONVERSION = createFuelConversion(createFuel().Id, createFuelUnit().Id, 'kWH');

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
        Assert.isNotNull(result.customFuelConversion);
        System.debug(JSON.serializePretty(result));
    }
}