/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */
@IsTest
private class NZC_EasyAuditSampleServiceTest {
  @TestSetup
  static void setup() {
    String otherSetId = createOtherEmissionsSet();

    RefrigerantEmssnFctr refridgeSet = new RefrigerantEmssnFctr(
      Name = 'Sample Refridge Set',
      GlblWarmingPotInKgCo2eKg = 230
    );
    insert refridgeSet;

    ElectricityEmssnFctrSet elecSet = new ElectricityEmssnFctrSet(
      Name = 'Sample Elec Set',
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

    StnryAssetEnvrSrc stationaryAsset = new StnryAssetEnvrSrc(
      Name = 'Sample Stationary Asset',
      ElectricityEmssnFctrId = elecSet.Id,
      RefrigerantEmssnFctrId = refridgeSet.Id,
      OtherEmssnFctrId = otherSetId,
      OccupiedFloorArea = 100,
      OccupiedFloorAreaUnit = 'm2',
      IsCompanyOwnedAsset = true
    );
    Schema.RecordTypeInfo stnRt = Schema.SObjectType.StnryAssetEnvrSrc
      .getRecordTypeInfosByDeveloperName()
      .get('Commercial_Building');
    if (stnRt != null) {
      stationaryAsset.put('RecordTypeId', stnRt.getRecordTypeId());
    }
    insert stationaryAsset;

    List<StnryAssetEnrgyUse> stationaryUses = new List<StnryAssetEnrgyUse>{
      buildStationaryUse(stationaryAsset.Id, 'Diesel', 'Stn Diesel'),
      buildStationaryUse(stationaryAsset.Id, 'Electricity', 'Stn Electricity'),
      buildStationaryUse(stationaryAsset.Id, 'NaturalGas', 'Stn NaturalGas'),
      buildStationaryUse(stationaryAsset.Id, 'Diesel', 'Stn Diesel Extra')
    };
    insert stationaryUses;

    VehicleAssetEmssnSrc vehicleAsset = new VehicleAssetEmssnSrc(
      Name = 'Sample Vehicle Asset',
      OtherEmssnFctrId = otherSetId,
      IsCompanyOwnedAsset = true
    );
    Schema.RecordTypeInfo vehRt = Schema.SObjectType.VehicleAssetEmssnSrc
      .getRecordTypeInfosByDeveloperName()
      .get('Fleet_Vehicle');
    if (vehRt != null) {
      vehicleAsset.put('RecordTypeId', vehRt.getRecordTypeId());
    }
    insert vehicleAsset;

    List<VehicleAssetEnrgyUse> vehicleUses = new List<VehicleAssetEnrgyUse>{
      buildVehicleUse(vehicleAsset.Id, 'Diesel', 'Veh Diesel'),
      buildVehicleUse(vehicleAsset.Id, 'Propane', 'Veh Propane'),
      buildVehicleUse(vehicleAsset.Id, 'Diesel', 'Veh Diesel Extra')
    };
    insert vehicleUses;
  }

  @IsTest
  static void normalizeSampleSize_capsAndRejectsInvalid() {
    Assert.areEqual(0, NZC_EasyAuditSampleService.normalizeSampleSize(null));
    Assert.areEqual(0, NZC_EasyAuditSampleService.normalizeSampleSize(0));
    Assert.areEqual(0, NZC_EasyAuditSampleService.normalizeSampleSize(-3));
    Assert.areEqual(10, NZC_EasyAuditSampleService.normalizeSampleSize(10));
    Assert.areEqual(
      NZC_EasyAuditSampleService.MAX_SAMPLE_SIZE,
      NZC_EasyAuditSampleService.normalizeSampleSize(999)
    );
  }

  @IsTest
  static void selectSampleRecords_coversAllBucketsWhenSizeLargeEnough() {
    Test.startTest();
    List<NZC_EasyAuditSampleService.SampleRecord> selected = NZC_EasyAuditSampleController.selectSampleRecords(
      50
    );
    Test.stopTest();

    // 3 stationary fuels + 2 vehicle fuels = 5 coverage buckets
    Assert.isTrue(
      selected.size() >= 5,
      'Expected at least one record per FuelType×object bucket'
    );
    Assert.isTrue(
      selected.size() <= 7,
      'Should not exceed available eligible records'
    );

    Set<String> buckets = new Set<String>();
    for (NZC_EasyAuditSampleService.SampleRecord row : selected) {
      Assert.isNotNull(row.recordId);
      Assert.isTrue(String.isNotBlank(row.fuelType));
      Assert.isTrue(
        row.objectApiName == NZC_EasyAuditConstants.OBJECT_STATIONARY_USE ||
          row.objectApiName == NZC_EasyAuditConstants.OBJECT_VEHICLE_USE
      );
      buckets.add(row.objectApiName + '|' + row.fuelType);
    }

    Assert.isTrue(
      buckets.contains(
        NZC_EasyAuditConstants.OBJECT_STATIONARY_USE + '|Diesel'
      )
    );
    Assert.isTrue(
      buckets.contains(
        NZC_EasyAuditConstants.OBJECT_STATIONARY_USE + '|Electricity'
      )
    );
    Assert.isTrue(
      buckets.contains(
        NZC_EasyAuditConstants.OBJECT_STATIONARY_USE + '|NaturalGas'
      )
    );
    Assert.isTrue(
      buckets.contains(NZC_EasyAuditConstants.OBJECT_VEHICLE_USE + '|Diesel')
    );
    Assert.isTrue(
      buckets.contains(NZC_EasyAuditConstants.OBJECT_VEHICLE_USE + '|Propane')
    );
  }

  @IsTest
  static void selectSampleRecords_respectsRequestedSize() {
    Test.startTest();
    List<NZC_EasyAuditSampleService.SampleRecord> selected = NZC_EasyAuditSampleService.selectSampleRecords(
      2
    );
    Test.stopTest();

    Assert.areEqual(2, selected.size());
    Set<Id> ids = new Set<Id>();
    for (NZC_EasyAuditSampleService.SampleRecord row : selected) {
      Assert.isTrue(ids.add(row.recordId), 'Duplicate record Id in sample');
    }
  }

  @IsTest
  static void selectSampleRecords_zeroSize_returnsEmpty() {
    Test.startTest();
    List<NZC_EasyAuditSampleService.SampleRecord> selected = NZC_EasyAuditSampleService.selectSampleRecords(
      0
    );
    Test.stopTest();
    Assert.areEqual(0, selected.size());
  }

  @IsTest
  static void saveAndGetLastSampleRun_roundTripsJson() {
    String payload =
      '{"sampleSize":3,"successCount":2,"errorCount":0,"totalCount":2,"completedAt":"2026-09-30T15:00:00.000Z","rows":[]}';

    Test.startTest();
    NZC_EasyAuditSampleController.saveLastSampleRun(payload);
    String loaded = NZC_EasyAuditSampleController.getLastSampleRun();
    // Second save should add a new version on the same ContentDocument
    NZC_EasyAuditSampleController.saveLastSampleRun(
      '{"sampleSize":5,"successCount":1,"errorCount":0,"totalCount":1,"completedAt":"2026-09-30T16:00:00.000Z","rows":[]}'
    );
    String loadedAgain = NZC_EasyAuditSampleController.getLastSampleRun();
    Test.stopTest();

    Assert.areEqual(payload, loaded);
    Assert.isTrue(
      loadedAgain.contains('"sampleSize":5'),
      'Latest version payload should be returned'
    );

    List<ContentVersion> versions = [
      SELECT Id, ContentDocumentId
      FROM ContentVersion
      WHERE Title = :NZC_EasyAuditSampleService.SAMPLE_RUN_FILE_TITLE
        AND CreatedById = :UserInfo.getUserId()
      WITH USER_MODE
    ];
    Assert.isTrue(versions.size() >= 2, 'Expected at least two File versions');
    Assert.areEqual(
      versions[0].ContentDocumentId,
      versions[1].ContentDocumentId,
      'Versions should share one ContentDocument'
    );
  }

  @IsTest
  static void getLastSampleRun_whenMissing_returnsNull() {
    Test.startTest();
    String loaded = NZC_EasyAuditSampleController.getLastSampleRun();
    Test.stopTest();
    Assert.isNull(loaded);
  }

  @IsTest
  static void saveLastSampleRun_blank_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditSampleController.saveLastSampleRun('  ');
    } catch (AuraHandledException e) {
      threw = true;
    }
    Assert.isTrue(threw, 'Blank payload should raise AuraHandledException');
  }

  private static String createOtherEmissionsSet() {
    OtherEmssnFctrSet otherSet = new OtherEmssnFctrSet(
      Name = 'Sample Other Emissions Factor Set',
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

  private static StnryAssetEnrgyUse buildStationaryUse(
    Id assetId,
    String fuelType,
    String name
  ) {
    return new StnryAssetEnrgyUse(
      Name = name,
      StartDate = Date.today().addMonths(-1),
      EndDate = Date.today(),
      StnryAssetEnvrSrcId = assetId,
      FuelConsumption = 100,
      FuelConsumptionUnit = 'Liters',
      FuelType = fuelType,
      SuplScope1Emissions = 15.0,
      SuplScope2MarketBasedEmssn = 25.0,
      SuplScope2LocationBasedEmssn = 10.0
    );
  }

  private static VehicleAssetEnrgyUse buildVehicleUse(
    Id assetId,
    String fuelType,
    String name
  ) {
    return new VehicleAssetEnrgyUse(
      Name = name,
      StartDate = Date.today().addDays(-1),
      EndDate = Date.today(),
      FuelConsumption = 100,
      FuelConsumptionUnit = 'Liters',
      FuelType = fuelType,
      SuplScope1Emissions = 10,
      VehicleAssetEmssnSrcId = assetId,
      DistanceUnit = 'Miles',
      Distance = 1000
    );
  }
}
