/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

import { createElement } from 'lwc';
import NZcEasyAuditStep, { formatAuditDisplayText } from 'c/nZC_EasyAuditStep';

describe('formatAuditDisplayText', () => {
    it('camelCases letter-only multi-word phrases', () => {
        expect(formatAuditDisplayText('fuel in liters already')).toBe('fuelInLitersAlready');
        expect(formatAuditDisplayText('Calculate fuel consumption')).toBe('calculateFuelConsumption');
    });

    it('adds commas to positive integers and decimals', () => {
        expect(formatAuditDisplayText('totalFuelConsumptionLiters = 24677.4')).toBe(
            'totalFuelConsumptionLiters = 24,677.4'
        );
        expect(formatAuditDisplayText('n = 1000')).toBe('n = 1,000');
    });

    it('does not add commas to negative numbers', () => {
        expect(formatAuditDisplayText('delta = -99.5')).toBe('delta = -99.5');
    });
});

describe('c-n-z-c-easy-audit-step', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders one formatted line per description', async () => {
        const element = createElement('c-n-z-c-easy-audit-step', {
            is: NZcEasyAuditStep
        });
        element.stepInstruction = {
            title: 'Calculate Total Value',
            final: '1234.5',
            descriptions: ['alpha beta', 'x = 5000', 'plain']
        };
        document.body.appendChild(element);

        await Promise.resolve();

        const texts = element.shadowRoot.querySelectorAll('lightning-formatted-text');
        expect(texts.length).toBe(3);
        expect(texts[0].value).toBe('alphaBeta');
        expect(texts[1].value).toBe('x = 5,000');
        expect(texts[2].value).toBe('plain');
    });

    it('renders lightning-formatted-url when record link is present', async () => {
        const element = createElement('c-n-z-c-easy-audit-step', {
            is: NZcEasyAuditStep
        });
        element.stepInstruction = {
            title: 'With link',
            descriptions: ['line a'],
            recordLinkId: 'https://example.com/r/001',
            recordLinkName: 'Related Record Name'
        };
        document.body.appendChild(element);

        await Promise.resolve();

        const url = element.shadowRoot.querySelector('lightning-formatted-url');
        expect(url).not.toBeNull();
        expect(url.value).toBe('https://example.com/r/001');
        expect(url.label).toBe('relatedRecordName');
    });
});
