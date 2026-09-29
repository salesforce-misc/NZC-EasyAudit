/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Thin facade for the AI Insights panel on the EasyAudit LWC: the audit trail narrative only
 * exists client-side (built by NZC_EasyAuditLogging/CalculationStep), so the caller passes it up
 * as JSON rather than this controller re-deriving it from the record.
 */
public with sharing class NZC_EasyAuditAiController {
  private static final String SUMMARY_INSTRUCTION =
    'Summarize this emissions calculation audit trail for a business user in a short paragraph. ' +
    'Call out the final result and the one or two steps or record links that most influenced it.';

  /**
   * Generates a plain-language summary of the audit trail. Not cacheable (generative call).
   * @param recordId Energy-use record Id the audit trail was built for (used for validation only)
   * @param auditTrailJson JSON-serialized array of audit trail steps from nZC_EasyAudit
   */
  @AuraEnabled
  public static String getAuditSummary(String recordId, String auditTrailJson) {
    validateRecordId(recordId);
    try {
      return NZC_EasyAuditPromptService.ask(
        auditTrailJson,
        SUMMARY_INSTRUCTION
      );
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to summarize audit trail: ' + e.getMessage()
      );
    }
  }

  /**
   * Answers a free-text question about the audit trail. Not cacheable (generative call).
   * @param recordId Energy-use record Id the audit trail was built for (used for validation only)
   * @param auditTrailJson JSON-serialized array of audit trail steps from nZC_EasyAudit
   * @param userQuestion Natural-language question from the user
   */
  @AuraEnabled
  public static String askAuditQuestion(
    String recordId,
    String auditTrailJson,
    String userQuestion
  ) {
    validateRecordId(recordId);
    try {
      return NZC_EasyAuditPromptService.ask(auditTrailJson, userQuestion);
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to run AI prompt: ' + e.getMessage()
      );
    }
  }

  private static void validateRecordId(String recordId) {
    if (String.isBlank(recordId)) {
      throw new AuraHandledException('Record Id is required.');
    }
  }
}
