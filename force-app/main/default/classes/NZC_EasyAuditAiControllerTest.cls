/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * ConnectApi.EinsteinLLM cannot be invoked or mocked in an Apex test context, so these tests
 * exercise the guard clauses shared by both AI entry points (blank record Id, blank audit trail
 * JSON, blank question) rather than the generative call itself.
 */
@IsTest
private class NZC_EasyAuditAiControllerTest {
  private static final String SAMPLE_AUDIT_TRAIL_JSON = '[{"title":"Total fuel consumption Kwh","descriptions":["100 L * 10 = 1000 Kwh"],"final":"1000 Kwh"}]';

  @IsTest
  static void getAuditSummary_blankRecordId_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditAiController.getAuditSummary(null, SAMPLE_AUDIT_TRAIL_JSON);
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('record'),
        'Message should mention the missing record Id: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for blank record Id');
  }

  @IsTest
  static void askAuditQuestion_blankRecordId_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditAiController.askAuditQuestion(
        null,
        SAMPLE_AUDIT_TRAIL_JSON,
        'Why is scope 1 zero?'
      );
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('record'),
        'Message should mention the missing record Id: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for blank record Id');
  }

  @IsTest
  static void askAuditQuestion_blankQuestion_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditAiController.askAuditQuestion(
        'a01000000000001AAA',
        SAMPLE_AUDIT_TRAIL_JSON,
        '   '
      );
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('question'),
        'Message should mention the missing question: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for blank question');
  }

  @IsTest
  static void promptService_blankAuditTrailJson_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditPromptService.ask('', 'Summarize this');
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('audit trail'),
        'Message should mention the missing audit trail data: ' + e.getMessage()
      );
    }
    Assert.isTrue(
      threw,
      'Expected AuraHandledException for blank audit trail JSON'
    );
  }

  @IsTest
  static void promptService_blankUserQuery_throws() {
    Boolean threw = false;
    try {
      NZC_EasyAuditPromptService.ask(SAMPLE_AUDIT_TRAIL_JSON, '');
    } catch (AuraHandledException e) {
      threw = true;
      Assert.isTrue(
        e.getMessage().toLowerCase().contains('question'),
        'Message should mention the missing question: ' + e.getMessage()
      );
    }
    Assert.isTrue(threw, 'Expected AuraHandledException for blank user query');
  }
}
