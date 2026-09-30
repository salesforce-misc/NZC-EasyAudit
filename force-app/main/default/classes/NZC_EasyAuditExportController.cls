/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Thin façade for saving EasyAudit JSON/Markdown exports as Salesforce Files.
 * Body construction stays client-side (c/nZC_EasyAuditExport); this class only persists.
 */
public with sharing class NZC_EasyAuditExportController {
  /**
   * Saves the pre-built JSON and Markdown export bodies as Files on the record.
   */
  @AuraEnabled
  public static NZC_EasyAuditExportService.ExportResult saveAuditExport(
    Id recordId,
    String jsonBody,
    String markdownBody,
    String jsonFileName,
    String markdownFileName
  ) {
    try {
      return NZC_EasyAuditExportService.saveAuditExport(
        recordId,
        jsonBody,
        markdownBody,
        jsonFileName,
        markdownFileName
      );
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to save audit export: ' + e.getMessage()
      );
    }
  }
}
