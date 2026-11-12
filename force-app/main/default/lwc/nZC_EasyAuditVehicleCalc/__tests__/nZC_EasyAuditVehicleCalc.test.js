import VehicleCalc from 'c/nZC_EasyAuditVehicleCalc';

const litersFor = (unit, consumption = 100) => {
    const calc = new VehicleCalc({ FuelConsumption: consumption, FuelConsumptionUnit: unit, FuelType: 'Gasoline' });
    calc.calculateTotalFuelConsumption();
    return calc.totalFuelConsumptionLiters;
};

describe('nZC_EasyAuditVehicleCalc fuel consumption units', () => {
    it.each(['Gallons', 'US Gallons', 'UsGallons', 'US_GALLONS'])('converts %s to liters', (unit) => {
        expect(litersFor(unit)).toBeCloseTo(100 / 0.26417205, 4);
    });

    it('converts UK gallons to liters', () => {
        expect(litersFor('UkGallons')).toBeCloseTo(454.609, 2);
    });

    it.each(['Liters', 'Litres'])('passes %s through', (unit) => {
        expect(litersFor(unit)).toBe(100);
    });

    it('leaves liters at 0 for an unrecognized unit', () => {
        expect(litersFor('Furlongs')).toBe(0);
    });
});
