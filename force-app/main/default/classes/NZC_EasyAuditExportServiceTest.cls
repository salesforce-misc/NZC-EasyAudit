/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */
@IsTest
private class NZC_EasyAuditExportServiceTest {
  private static final String SAMPLE_JSON =
    '{"schemaVersion":"1.0","exportType":"NZC_EasyAudit","steps":[]}';
  private static final String SAMPLE_MD = '# NZC EasyAudit export\n';

  @IsTest
  static void saveAuditExport_createsTwoFilesOnRecord() {
    Account parent = new Account(Name = 'EasyAudit Export Test');
    insert parent;

    String jsonName = NZC_EasyAuditExportService.buildFileName(
      parent.Id,
      Datetime.newInstanceGmt(2026, 9, 30, 13, 4, 5),
      'json'
    );
    String mdName = NZC_EasyAuditExportService.buildFileName(
      parent.Id,
      Datetime.newInstanceGmt(2026, 9, 30, 13, 4, 5),
      'md'
    );

    Test.startTest();
    NZC_EasyAuditExportService.ExportResult result = NZC_EasyAuditExportController.saveAuditExport(
      parent.Id,
      SAMPLE_JSON,
      SAMPLE_MD,
      jsonName,
      mdName
    );
    Test.stopTest();

    Assert.isNotNull(result.jsonContentDocumentId, 'JSON ContentDocumentId');
    Assert.isNotNull(
      result.markdownContentDocumentId,
      'Markdown ContentDocumentId'
    );
    Assert.areNotEqual(
      result.jsonContentDocumentId,
      result.markdownContentDocumentId,
      'JSON and Markdown should be distinct documents'
    );
    Assert.isTrue(
      result.jsonTitle.startsWith(NZC_EasyAuditExportService.FILE_NAME_PREFIX),
      'JSON title should use discoverable prefix'
    );
    Assert.isTrue(
      jsonName.contains(String.valueOf(parent.Id)),
      'JSON file name should include record Id'
    );
    Assert.isTrue(
      jsonName.endsWith(NZC_EasyAuditExportService.FILE_NAME_KIND + '.json'),
      'JSON file name should end with _audit.json'
    );

    List<ContentDocumentLink> links = [
      SELECT ContentDocumentId
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :parent.Id
      WITH USER_MODE
    ];
    Assert.areEqual(2, links.size(), 'Both files should link to the parent');
  }

  @IsTest
  static void saveAuditExport_blankJson_throws() {
    Account parent = new Account(Name = 'EasyAudit Export Validation');
    insert parent;

    Boolean threw = false;
    try {
      NZC_EasyAuditExportService.saveAuditExport(
        parent.Id,
        '',
        SAMPLE_MD,
        'NZC_EasyAudit_x_audit.json',
        'NZC_EasyAudit_x_audit.md'
      );
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('json'),
        'Message should mention JSON: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for blank JSON');
  }

  @IsTest
  static void saveAuditExport_nullRecordId_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditExportService.saveAuditExport(
        null,
        SAMPLE_JSON,
        SAMPLE_MD,
        'NZC_EasyAudit_x_audit.json',
        'NZC_EasyAudit_x_audit.md'
      );
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('record'),
        'Message should mention record Id: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for null record Id');
  }

  @IsTest
  static void buildFileName_matchesDiscoverablePattern() {
    Account parent = new Account(Name = 'EasyAudit Naming');
    insert parent;

    String name = NZC_EasyAuditExportService.buildFileName(
      parent.Id,
      Datetime.newInstanceGmt(2026, 9, 30, 13, 4, 5),
      'json'
    );

    Assert.areEqual(
      NZC_EasyAuditExportService.FILE_NAME_PREFIX +
        String.valueOf(parent.Id) +
        '_20260930T130405Z' +
        NZC_EasyAuditExportService.FILE_NAME_KIND +
        '.json',
      name
    );
  }
}
