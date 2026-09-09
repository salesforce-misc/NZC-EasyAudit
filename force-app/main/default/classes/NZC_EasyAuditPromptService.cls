/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 *
 * Invokes the NZC_EasyAudit_Audit_Insights Einstein Prompt Template via ConnectApi, passing the
 * client-assembled audit trail JSON and either a canned summary instruction or the user's question.
 */
public with sharing class NZC_EasyAuditPromptService {
  /** Developer API name of the bundled GenAiPromptTemplate. */
  public static final String PROMPT_TEMPLATE_API_NAME = 'NZC_EasyAudit_Audit_Insights';

  /** Matches Prompt Builder text input merge fields, e.g. {!$Input:AuditTrailJson} */
  public static final String INPUT_AUDIT_TRAIL_JSON = 'Input:AuditTrailJson';

  public static final String INPUT_USER_QUERY = 'Input:UserQuery';

  /**
   * Required for runtime generation (isPreview=false). PromptBuilderPreview with isPreview=false
   * returns empty generations in practice; Salesforce samples use this application name for
   * Apex/LWC invocation.
   */
  public static final String APPLICATION_NAME = 'PromptTemplateGenerationsInvocable';

  /**
   * @param auditTrailJson JSON-serialized audit trail steps assembled client-side by nZC_EasyAudit
   * @param userQuery Natural-language question, or a canned summary instruction
   * @return Model text from the first generation
   */
  public static String ask(String auditTrailJson, String userQuery) {
    if (String.isBlank(auditTrailJson)) {
      throw new AuraHandledException('No audit trail data is available yet.');
    }
    if (String.isBlank(userQuery)) {
      throw new AuraHandledException('Enter a question to ask.');
    }

    Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();

    ConnectApi.WrappedValue jsonWrap = new ConnectApi.WrappedValue();
    jsonWrap.value = auditTrailJson;
    inputParams.put(INPUT_AUDIT_TRAIL_JSON, jsonWrap);

    ConnectApi.WrappedValue queryWrap = new ConnectApi.WrappedValue();
    queryWrap.value = userQuery;
    inputParams.put(INPUT_USER_QUERY, queryWrap);

    ConnectApi.EinsteinPromptTemplateGenerationsInput executeInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
    executeInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
    executeInput.additionalConfig.applicationName = APPLICATION_NAME;
    executeInput.additionalConfig.numGenerations = 1;
    executeInput.isPreview = false;
    executeInput.inputParams = inputParams;

    try {
      ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
        PROMPT_TEMPLATE_API_NAME,
        executeInput
      );

      if (
        generationsOutput == null ||
        generationsOutput.generations == null ||
        generationsOutput.generations.isEmpty()
      ) {
        throw new AuraHandledException(
          'The prompt template returned no text. Check that NZC_EasyAudit_Audit_Insights is deployed and published.'
        );
      }

      ConnectApi.EinsteinLLMGenerationItemOutput first = generationsOutput.generations[0];
      return first != null && String.isNotBlank(first.text) ? first.text : '';
    } catch (AuraHandledException e) {
      throw e;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Prompt invocation failed: ' + e.getMessage()
      );
    }
  }
}
