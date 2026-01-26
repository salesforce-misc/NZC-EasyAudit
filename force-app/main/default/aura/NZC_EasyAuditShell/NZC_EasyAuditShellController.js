/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

({
    doInit: function(cmp) {
        // #region agent log
        console.log('[NZC_EasyAuditShell] doInit - Aura component initialized', {
            recordId: cmp.get('v.recordId'),
            recordIdType: typeof cmp.get('v.recordId')
        });
        // #endregion
    }
});