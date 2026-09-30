/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Stratified random sampling of existing Stationary and Vehicle energy-use records
 * by object API name × FuelType, for the Home Page sample export LWC.
 */
public with sharing class NZC_EasyAuditSampleService {
  public static final Integer MAX_SAMPLE_SIZE = 50;
  public static final Integer CANDIDATE_QUERY_LIMIT = 2000;
  /** User-scoped File title for the latest Home Page sample-export run. */
  public static final String SAMPLE_RUN_FILE_TITLE = 'NZC_EasyAudit_SampleRun_Latest';

  public class SampleRecord {
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public String objectApiName;
    @AuraEnabled
    public String fuelType;
  }

  /**
   * Selects up to sampleSize existing energy-use records with coverage-first
   * stratified sampling across (objectApiName, FuelType) buckets.
   */
  public static List<SampleRecord> selectSampleRecords(Integer sampleSize) {
    Integer size = normalizeSampleSize(sampleSize);
    Map<String, List<SampleRecord>> buckets = buildBuckets();
    if (buckets.isEmpty() || size == 0) {
      return new List<SampleRecord>();
    }

    List<String> bucketKeys = new List<String>(buckets.keySet());
    shuffleStrings(bucketKeys);

    List<SampleRecord> selected = new List<SampleRecord>();
    Set<Id> selectedIds = new Set<Id>();

    Integer coverageCount = Math.min(size, bucketKeys.size());
    for (Integer i = 0; i < coverageCount; i++) {
      SampleRecord pick = takeOne(buckets.get(bucketKeys[i]));
      if (pick != null && selectedIds.add(pick.recordId)) {
        selected.add(pick);
      }
    }

    if (selected.size() < size) {
      List<SampleRecord> remainder = flattenRemaining(buckets, selectedIds);
      shuffleSamples(remainder);
      for (SampleRecord candidate : remainder) {
        if (selected.size() >= size) {
          break;
        }
        if (selectedIds.add(candidate.recordId)) {
          selected.add(candidate);
        }
      }
    }

    return selected;
  }

  /**
   * Returns the current user's latest sample-export run JSON, or null when none exists.
   */
  public static String getLastSampleRunJson() {
    List<ContentVersion> rows = [
      SELECT VersionData
      FROM ContentVersion
      WHERE Title = :SAMPLE_RUN_FILE_TITLE
        AND CreatedById = :UserInfo.getUserId()
        AND IsLatest = TRUE
      WITH USER_MODE
      ORDER BY CreatedDate DESC
      LIMIT 1
    ];
    if (rows.isEmpty() || rows[0].VersionData == null) {
      return null;
    }
    return rows[0].VersionData.toString();
  }

  /**
   * Persists the Home Page sample-export run summary as a user-owned File
   * (new version when a prior SampleRun File exists).
   */
  public static void saveLastSampleRunJson(String runJson) {
    if (String.isBlank(runJson)) {
      throw new AuraHandledException('Sample run payload is required.');
    }

    List<ContentVersion> existing = [
      SELECT ContentDocumentId
      FROM ContentVersion
      WHERE Title = :SAMPLE_RUN_FILE_TITLE
        AND CreatedById = :UserInfo.getUserId()
        AND IsLatest = TRUE
      WITH USER_MODE
      ORDER BY CreatedDate DESC
      LIMIT 1
    ];

    ContentVersion version = new ContentVersion();
    version.Title = SAMPLE_RUN_FILE_TITLE;
    version.PathOnClient = SAMPLE_RUN_FILE_TITLE + '.json';
    version.VersionData = Blob.valueOf(runJson);
    if (!existing.isEmpty()) {
      version.ContentDocumentId = existing[0].ContentDocumentId;
    } else {
      version.FirstPublishLocationId = UserInfo.getUserId();
    }
    insert version;
  }

  @TestVisible
  private static Integer normalizeSampleSize(Integer sampleSize) {
    if (sampleSize == null || sampleSize < 1) {
      return 0;
    }
    return Math.min(sampleSize, MAX_SAMPLE_SIZE);
  }

  private static Map<String, List<SampleRecord>> buildBuckets() {
    Map<String, List<SampleRecord>> buckets = new Map<String, List<SampleRecord>>();
    addCandidates(
      buckets,
      NZC_EasyAuditConstants.OBJECT_STATIONARY_USE,
      [
        SELECT Id, FuelType
        FROM StnryAssetEnrgyUse
        WHERE FuelType != NULL
        WITH USER_MODE
        LIMIT :CANDIDATE_QUERY_LIMIT
      ]
    );
    addCandidates(
      buckets,
      NZC_EasyAuditConstants.OBJECT_VEHICLE_USE,
      [
        SELECT Id, FuelType
        FROM VehicleAssetEnrgyUse
        WHERE FuelType != NULL
        WITH USER_MODE
        LIMIT :CANDIDATE_QUERY_LIMIT
      ]
    );

    for (String key : buckets.keySet()) {
      shuffleSamples(buckets.get(key));
    }
    return buckets;
  }

  private static void addCandidates(
    Map<String, List<SampleRecord>> buckets,
    String objectApiName,
    List<SObject> rows
  ) {
    for (SObject row : rows) {
      String fuelType = (String) row.get('FuelType');
      if (String.isBlank(fuelType)) {
        continue;
      }
      SampleRecord sample = new SampleRecord();
      sample.recordId = (Id) row.get('Id');
      sample.objectApiName = objectApiName;
      sample.fuelType = fuelType;
      String key = objectApiName + '|' + fuelType;
      if (!buckets.containsKey(key)) {
        buckets.put(key, new List<SampleRecord>());
      }
      buckets.get(key).add(sample);
    }
  }

  private static SampleRecord takeOne(List<SampleRecord> bucket) {
    if (bucket == null || bucket.isEmpty()) {
      return null;
    }
    return bucket.remove(0);
  }

  private static List<SampleRecord> flattenRemaining(
    Map<String, List<SampleRecord>> buckets,
    Set<Id> selectedIds
  ) {
    List<SampleRecord> remainder = new List<SampleRecord>();
    for (List<SampleRecord> bucket : buckets.values()) {
      for (SampleRecord sample : bucket) {
        if (!selectedIds.contains(sample.recordId)) {
          remainder.add(sample);
        }
      }
    }
    return remainder;
  }

  @TestVisible
  private static void shuffleStrings(List<String> values) {
    for (Integer i = values.size() - 1; i > 0; i--) {
      Integer j = Integer.valueOf(Math.floor(Math.random() * (i + 1)));
      String tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }
  }

  @TestVisible
  private static void shuffleSamples(List<SampleRecord> values) {
    for (Integer i = values.size() - 1; i > 0; i--) {
      Integer j = Integer.valueOf(Math.floor(Math.random() * (i + 1)));
      SampleRecord tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }
  }
}
