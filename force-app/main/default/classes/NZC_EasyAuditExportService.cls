/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Persists EasyAudit export artifacts as Salesforce Files on a parent record.
 * All ContentVersion DML for exports lives here so a future UnitOfWork can replace
 * these inserts without changing the controller or LWC callers.
 *
 * Filename contract (must stay aligned with c/nZC_EasyAuditExport):
 *   NZC_EasyAudit_{recordId}_{yyyyMMdd'T'HHmmss'Z'}_audit.json|.md
 */
public with sharing class NZC_EasyAuditExportService {
  public static final String FILE_NAME_PREFIX = 'NZC_EasyAudit_';
  public static final String FILE_NAME_KIND = '_audit';
  public static final String EXPORT_TYPE = 'NZC_EasyAudit';

  public class ExportResult {
    @AuraEnabled
    public String jsonTitle;
    @AuraEnabled
    public String markdownTitle;
    @AuraEnabled
    public Id jsonContentDocumentId;
    @AuraEnabled
    public Id markdownContentDocumentId;
  }

  /**
   * Creates JSON and Markdown ContentVersion rows linked to the parent record.
   * @param recordId Parent energy-use (or other) record Id (FirstPublishLocationId)
   * @param jsonBody UTF-8 JSON document body
   * @param markdownBody UTF-8 Markdown document body
   * @param jsonFileName PathOnClient ending in .json
   * @param markdownFileName PathOnClient ending in .md
   */
  public static ExportResult saveAuditExport(
    Id recordId,
    String jsonBody,
    String markdownBody,
    String jsonFileName,
    String markdownFileName
  ) {
    validateInputs(
      recordId,
      jsonBody,
      markdownBody,
      jsonFileName,
      markdownFileName
    );

    ContentVersion jsonVersion = buildVersion(
      recordId,
      jsonFileName,
      jsonBody
    );
    ContentVersion markdownVersion = buildVersion(
      recordId,
      markdownFileName,
      markdownBody
    );

    insert new List<ContentVersion>{ jsonVersion, markdownVersion };

    Map<Id, ContentVersion> inserted = new Map<Id, ContentVersion>(
      [
        SELECT Id, Title, ContentDocumentId, PathOnClient
        FROM ContentVersion
        WHERE Id IN :new Set<Id>{ jsonVersion.Id, markdownVersion.Id }
        WITH USER_MODE
      ]
    );

    ContentVersion jsonSaved = inserted.get(jsonVersion.Id);
    ContentVersion mdSaved = inserted.get(markdownVersion.Id);

    ExportResult result = new ExportResult();
    result.jsonTitle = jsonSaved.Title;
    result.markdownTitle = mdSaved.Title;
    result.jsonContentDocumentId = jsonSaved.ContentDocumentId;
    result.markdownContentDocumentId = mdSaved.ContentDocumentId;
    return result;
  }

  /**
   * Builds a discoverable PathOnClient for server-side callers that do not use the LWC builder.
   */
  public static String buildFileName(Id recordId, Datetime exportedAt, String extension) {
    if (recordId == null) {
      throw new AuraHandledException('Record Id is required.');
    }
    Datetime stampSource = exportedAt == null ? Datetime.now() : exportedAt;
    String stamp = stampSource.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
    String ext = String.isBlank(extension) ? 'bin' : extension.removeStart('.');
    return FILE_NAME_PREFIX +
      String.valueOf(recordId) +
      '_' +
      stamp +
      FILE_NAME_KIND +
      '.' +
      ext;
  }

  private static void validateInputs(
    Id recordId,
    String jsonBody,
    String markdownBody,
    String jsonFileName,
    String markdownFileName
  ) {
    if (recordId == null) {
      throw new AuraHandledException('Record Id is required.');
    }
    if (String.isBlank(jsonBody)) {
      throw new AuraHandledException('JSON export body is required.');
    }
    if (String.isBlank(markdownBody)) {
      throw new AuraHandledException('Markdown export body is required.');
    }
    if (String.isBlank(jsonFileName) || !jsonFileName.toLowerCase().endsWith('.json')) {
      throw new AuraHandledException('A .json file name is required.');
    }
    if (
      String.isBlank(markdownFileName) ||
      !markdownFileName.toLowerCase().endsWith('.md')
    ) {
      throw new AuraHandledException('A .md file name is required.');
    }
  }

  private static ContentVersion buildVersion(
    Id recordId,
    String pathOnClient,
    String body
  ) {
    ContentVersion version = new ContentVersion();
    version.Title = stripExtension(pathOnClient);
    version.PathOnClient = pathOnClient;
    version.VersionData = Blob.valueOf(body);
    version.FirstPublishLocationId = recordId;
    return version;
  }

  private static String stripExtension(String pathOnClient) {
    Integer dot = pathOnClient.lastIndexOf('.');
    return dot > 0 ? pathOnClient.substring(0, dot) : pathOnClient;
  }
}
