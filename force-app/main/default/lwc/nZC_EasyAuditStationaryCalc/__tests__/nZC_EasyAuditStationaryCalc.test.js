import StationaryCalc from 'c/nZC_EasyAuditStationaryCalc';

const kwhFor = (unit, consumption = 2) => {
    const calc = new StationaryCalc({ FuelType: 'Electricity', FuelConsumption: consumption, FuelConsumptionUnit: unit });
    calc.FuelConsumptionInKwh();
    return calc.fuelConsumptionKwh;
};

describe('nZC_EasyAuditStationaryCalc energy consumption units', () => {
    it('passes kWh through', () => {
        expect(kwhFor('kWh')).toBe(2);
    });

    it.each([
        ['MWh', 2000],
        ['GWh', 2000000],
        ['kcal', 2 * 0.001162222]
    ])('converts %s to kWh', (unit, expected) => {
        expect(kwhFor(unit)).toBeCloseTo(expected, 6);
    });
});
