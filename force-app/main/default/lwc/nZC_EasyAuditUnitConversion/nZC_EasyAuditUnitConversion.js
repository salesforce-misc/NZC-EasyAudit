/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

const CONVERSION_FACTOR_LIST = [
    ['G_PER_KL', 1, 'KG_PER_KM'],
    ['KG_PER_MJ', 1, 'KG_PER_KM'],
    ['G_PER_KM', 0.001, 'KG_PER_KM'],
    ['KG_PER_GJ', 1, 'KG_PER_KM'],
    ['KG_PER_MMBTU', 0.0023, 'KG_PER_KM'],
    ['KG_PER_KL', 1, 'KG_PER_KM'],
    ['G_PER_KWH', 0.001, 'KG_PER_KM'],
    ['KG_PER_KM', 1, 'KG_PER_KM'],
    ['G_PER_L', 0.001, 'KG_PER_KM'],
    ['KG_PER_KWH', 1, 'KG_PER_KM'],
    ['KG_PER_L', 1, 'KG_PER_KM'],
    ['KG_PER_MILES', 0.6214, 'KG_PER_KM'],
    ['KG_PER_US_GAL', 0.2642, 'KG_PER_KM'],
    ['G_PER_MILES', 0.0006214, 'KG_PER_KM'],
    ['G_PER_MMBTU', 0.0000023, 'KG_PER_KM'],
    ['G_PER_US_GAL', 0.0002642, 'KG_PER_KM'],

    ['G_PER_KL', 0.001, 'KG_PER_L'],
    ['KG_PER_MJ', 1, 'KG_PER_L'],
    ['G_PER_KM', 1000, 'KG_PER_L'],
    ['KG_PER_GJ', 1, 'KG_PER_L'],
    ['KG_PER_MMBTU', 429.9226, 'KG_PER_L'],
    ['KG_PER_KL', 1000, 'KG_PER_L'],
    ['G_PER_KWH', 1, 'KG_PER_L'],
    ['KG_PER_KM', 1000, 'KG_PER_L'],
    ['G_PER_L', 0.001, 'KG_PER_L'],
    ['KG_PER_KWH', 1, 'KG_PER_L'],
    ['KG_PER_L', 1, 'KG_PER_L'],
    ['KG_PER_MILES', 1.6093, 'KG_PER_L'],
    ['KG_PER_US_GAL', 3.7854, 'KG_PER_L'],
    ['G_PER_MILES', 0.0016093, 'KG_PER_L'],
    ['G_PER_MMBTU', 0.0004299, 'KG_PER_L'],
    ['G_PER_US_GAL', 0.0037854, 'KG_PER_L'],

    ['G_PER_KL', 0.264172, 'KG_PER_US_GAL'],
    ['KG_PER_MJ', 264.172051, 'KG_PER_US_GAL'],
    ['KG_PER_GJ', 264.172051, 'KG_PER_US_GAL'],
    ['KG_PER_MMBTU', 6292.73731, 'KG_PER_US_GAL'],
    ['KG_PER_KL', 0.264172, 'KG_PER_US_GAL'],
    ['G_PER_L', 0.264172, 'KG_PER_US_GAL'],
    ['KG_PER_L', 3.785411818, 'KG_PER_US_GAL'],
    ['KG_PER_US_GAL', 1, 'KG_PER_US_GAL'],
    ['G_PER_US_GAL', 0.001, 'KG_PER_US_GAL'],

    ['1000m3', 1000, 'm3'],
    ['ccf', 2.83168, 'm3'],
    ['GJ', 26.8, 'm3'],
    ['Kiloliters', 1, 'm3'],
    ['Liters', 0.001, 'm3'],
    ['m3', 1, 'm3'],
    ['MJ', 0.0268, 'm3'],
    ['MMBtu', 28.327, 'm3'],
    ['Therms', 2.759922027403236, 'm3'],
    ['UkGallons', 0.00454609, 'm3'],
    ['UsGallons', 0.00378541, 'm3'],

    ['KWH_PER_L', 1000, 'KWH_PER_M3'],
    ['KWH_PER_M3', 1, 'KWH_PER_M3'],
    ['KWH_PER_SCF', 35.3147248, 'KWH_PER_M3'],
    ['MMBTU_PER_GAL', 77421.1853797, 'KWH_PER_M3'],
    ['MMBTU_PER_SCF', 10349.7241955, 'KWH_PER_M3'],

    ['G_PER_KWH', 0.00100, 'TONNES_PER_MWH'],
    ['KG_PER_KWH', 1, 'TONNES_PER_MWH'],
    ['KG_PER_MWH', .001, 'TONNES_PER_MWH'],
    ['LBS_PER_GWH', 0.453592, 'TONNES_PER_MWH'],
    ['LBS_PER_MWH', 0.000453592, 'TONNES_PER_MWH'],
    ['TONNES_PER_MWH', 1, 'TONNES_PER_MWH'],
    ['TONNES_PER_KWH', 1000, 'TONNES_PER_MWH'],

    ['kG', 1, 'kG'],
    ['lbs', 0.45359, 'kG'],
    ['longTons', 1016.04700, 'kG'],
    ['shortTons', 907.18474, 'kG'],
    ['Tonnes', 1000, 'kG'],

    ['GALLONS', 3.785411818, 'LITERS'],
    ['miles', 1.60934 ,'Kilometers']
];
export default class NZcEasyAuditUnitConversion {
    constructor(log) {
        this.matrix = this.createFactorMatrix()
        this.log = log;
    }

    createFactorMatrix = () => {
        let createdMatrix = {};

        CONVERSION_FACTOR_LIST.forEach(factorSet => {
            // add to matrix
            let fromName, conversion, toName;
            [fromName, conversion, toName] = factorSet;

            if (!(fromName in createdMatrix)) {
                createdMatrix[fromName] = {};
            }
            createdMatrix[fromName][toName] = conversion;

            // add inverse to matrix
            let inverse = 1 / conversion;

            if (!(toName in createdMatrix)) {
                createdMatrix[toName] = {};
            }
            createdMatrix[toName][fromName] = inverse;
        })

        return createdMatrix
    }

    convertValue = (incomingValue, incomingUnit, expectedUnit) => {
        if ((!incomingValue || !incomingUnit || !expectedUnit) || incomingUnit === expectedUnit) {
            return incomingValue;
        }

        this.log.addLine(`Converting units from ${incomingUnit} to ${expectedUnit}`);

        let conversionFactor = this.matrix && this.matrix[incomingUnit] && this.matrix[incomingUnit][expectedUnit];
        if (!conversionFactor) {
            console.log('no factor matching', incomingUnit, expectedUnit);
            this.log.addLine(`No conversion found using -1 instead`);
            return -1;
        }

        this.log.addLine(`${incomingValue} * ${conversionFactor}`)
        let calculatedValue = incomingValue * conversionFactor;
        this.log.addLine(`converted value = ${calculatedValue}`);

        return calculatedValue;
    }
}