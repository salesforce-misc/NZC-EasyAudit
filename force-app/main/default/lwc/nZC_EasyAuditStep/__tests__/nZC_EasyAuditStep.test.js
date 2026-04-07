/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from 'lwc';
import NZcEasyAuditStep from 'c/nZC_EasyAuditStep';

describe('c-n-z-c-easy-audit-step', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders one lightning-tile per description line', () => {
        const element = createElement('c-n-z-c-easy-audit-step', {
            is: NZcEasyAuditStep
        });
        element.stepInstruction = {
            title: 'Calculate total',
            final: '42',
            descriptions: ['step 1', 'step 2', 'step 3']
        };
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const tiles = element.shadowRoot.querySelectorAll('lightning-tile');
            expect(tiles.length).toBe(3);
            expect(tiles[0].label).toBe('step 1');
            expect(tiles[2].label).toBe('step 3');
        });
    });

    it('renders lightning-formatted-url when record link is present', () => {
        const element = createElement('c-n-z-c-easy-audit-step', {
            is: NZcEasyAuditStep
        });
        element.stepInstruction = {
            title: 'With link',
            descriptions: ['line a'],
            recordLinkId: 'https://example.com/r/001',
            recordLinkName: 'Related record'
        };
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const url = element.shadowRoot.querySelector('lightning-formatted-url');
            expect(url).not.toBeNull();
            expect(url.value).toBe('https://example.com/r/001');
            expect(url.label).toBe('Related record');
        });
    });
});
