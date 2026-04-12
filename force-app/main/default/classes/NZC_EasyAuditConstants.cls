/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/Apache-2.0
 */

public with sharing class NZC_EasyAuditConstants {

    public static final String OBJECT_STATIONARY_USE = 'StnryAssetEnrgyUse';
    public static final String OBJECT_VEHICLE_USE = 'VehicleAssetEnrgyUse';

    public static final String SCOPE1 = 'Scope 1';
    public static final String SCOPE2 = 'Scope 2';
    public static final String SCOPE3 = 'Scope 3';

    public static final String FUEL_ELECTRICITY = 'Electricity';
    public static final String FUEL_CITYGAS = 'CityGas';
    public static final String FUEL_COOLING = 'Cooling';
    public static final String FUEL_DIESEL = 'Diesel';
    public static final String FUEL_FUELOIL = 'FuelOil';
    public static final String FUEL_HEAT = 'Heat';
    public static final String FUEL_HEAVYOIL = 'HeavyOil';
    public static final String FUEL_KEROSENE = 'Kerosene';
    public static final String FUEL_LIGHTOIL = 'LightOil';
    public static final String FUEL_LIQUIFIEDNATURALGAS = 'LiquidNaturalGasLNG';
    public static final String FUEL_NATURALGAS = 'NaturalGas';
    public static final String FUEL_PROPANE = 'Propane';
    public static final String FUEL_REFRIDGERANT = 'Refrigerant';
    public static final String FUEL_STEAM = 'Steam';

    public static final Map<String, String> DEFAULT_OWNED_SCOPE = new Map<String, String>{
            FUEL_ELECTRICITY => SCOPE2,
            FUEL_CITYGAS => SCOPE1,
            FUEL_COOLING => SCOPE2,
            FUEL_DIESEL => SCOPE1,
            FUEL_FUELOIL => SCOPE1,
            FUEL_HEAT => SCOPE2,
            FUEL_HEAVYOIL => SCOPE1,
            FUEL_KEROSENE => SCOPE1,
            FUEL_LIGHTOIL => SCOPE1,
            FUEL_LIQUIFIEDNATURALGAS => SCOPE1,
            FUEL_NATURALGAS => SCOPE1,
            FUEL_PROPANE => SCOPE1,
            FUEL_REFRIDGERANT => SCOPE1,
            FUEL_STEAM => SCOPE2
    };
}