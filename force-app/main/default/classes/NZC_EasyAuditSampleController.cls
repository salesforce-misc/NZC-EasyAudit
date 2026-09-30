/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Thin façade for Home Page stratified energy-use sample selection and last-run persistence.
 */
public with sharing class NZC_EasyAuditSampleController {
  @AuraEnabled(cacheable=false)
  public static List<NZC_EasyAuditSampleService.SampleRecord> selectSampleRecords(
    Integer sampleSize
  ) {
    try {
      return NZC_EasyAuditSampleService.selectSampleRecords(sampleSize);
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to select sample records: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled(cacheable=false)
  public static String getLastSampleRun() {
    try {
      return NZC_EasyAuditSampleService.getLastSampleRunJson();
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to load last sample run: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled(cacheable=false)
  public static void saveLastSampleRun(String runJson) {
    try {
      NZC_EasyAuditSampleService.saveLastSampleRunJson(runJson);
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to save sample run: ' + e.getMessage()
      );
    }
  }
}
