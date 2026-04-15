# Phase 1 Investigation Findings - NZC-EA-002

**Date**: April 14, 2026  
**Investigator**: Automated queries in AF6 org  
**Test Record**: 7LKWt000000FGYqOAO (Cirrus Tower - Jul 2024 - Electricity)

---

## Executive Summary

✅ **Solution Identified**: Salesforce Net Zero Cloud stores BOTH location-based and market-based emission rates in the **SAME** `ElectricityEmssnFctrSet` object, with an `EmissionsFactorType` field that determines which calculations should use which rate.

**Key Finding**: When `EmissionsFactorType` = "LocationBased", Salesforce uses the location rate for location-based calculations and treats market-based as 0. This explains why the standard UI shows Market=0.0 and Location=368.59.

---

## Query Results

### 1. ElectricityEmssnFctrSet Schema (Step 1.1)

**Separate Rate Fields Found**:

**Location-Based Fields** (currently used by EasyAudit):
- `Co2eEmissionRate` (CO2e Emissions Rate) - Type: DOUBLE
- `Co2eEmissionRateUnit` (CO2e Emissions Rate Unit) - Type: PICKLIST
- `Co2eEmissionRateInTMwh` (CO2e Emissions Rate (tonnes/MWh)) - Type: DOUBLE

**Market-Based Fields** (NOT currently used by EasyAudit):
- `MktBsdCo2eEmissionRate` (Market-Based CO2e Emissions Rate) - Type: DOUBLE ✅ **NEW**
- `MktBsdCo2eEmissionRateUnit` (Market-Based CO2e Emissions Rate Unit) - Type: PICKLIST ✅ **NEW**
- `MktBsdCo2eEmissionRateInTMwh` (Market-Based CO2e Emissions Rate (tonnes/MWh)) - Type: DOUBLE ✅ **NEW**

**Type Discriminator Field**:
- `EmissionsFactorType` (Emissions Factor Type) - Type: PICKLIST ✅ **CRITICAL**
  - Values: "LocationBased", "MarketBased", (possibly others)

**Biomass Mix Percentages** (both exist):
- `LocationBasedBiomassMixPct` (Location-Based Biomass Mix Percentage) - Type: PERCENT
- `MarketBasedBiomassMixPct` (Market-Based Biomass Mix Percentage) - Type: PERCENT

**Additional Market-Based Fields**:
- `MktBsdCh4EmssnRate` (Market-Based CH4 Emissions Rate)
- `MktBsdCo2EmssnRate` (Market-Based CO2 Emissions Rate)
- `MktBsdN2oEmssnRate` (Market-Based N2O Emissions Rate)

---

### 2. StnryAssetEnvrSrc Schema (Step 1.2)

**Single Electricity Factor Reference**:
- `ElectricityEmssnFctrId` (Electricity Emissions Factor Set ID) - Type: REFERENCE
  - Relationship Name: `ElectricityEmssnFctr`

**NO separate `MarketBasedElectricityEmssnFctrId` field exists.**

**Conclusion**: Both location-based and market-based rates come from the SAME emission factor set object.

---

### 3. Scope Allocation Records (Step 1.3)

**Query**: `SELECT Id, Name, ScopeEmissionsType, ScopeEmissionsRefId, EmissionsValue, EmissionsValueUnit FROM ScopEmssnAllocn WHERE StnryAssetEnrgyUseId = '7LKWt000000FGYqOAO'`

**Result**: No records found (null)

**Conclusion**: Salesforce does NOT use `ScopEmssnAllocn` records to override calculations for this test record. Calculations are based purely on emission factor rates.

---

### 4. Test Record Emission Factor Data (Step 1.4)

**Emission Factor Set**: 0oTWt00000005UNMAY

```json
{
  "Name": "CAMX - WECC California - (5.0) eGRID2021 - Location Based",
  "EmissionsFactorType": "LocationBased",
  "Co2eEmissionRate": 533.6,
  "Co2eEmissionRateUnit": "LBS_PER_MWH",
  "MktBsdCo2eEmissionRate": 533.6,
  "MktBsdCo2eEmissionRateUnit": "LBS_PER_MWH",
  "LocationBasedBiomassMixPct": 2.5,
  "MarketBasedBiomassMixPct": 2.5,
  "Ch4EmissionRate": 0.031,
  "Ch4EmissionRateUnit": "LBS_PER_MWH",
  "N2oEmissionRate": 0.004,
  "N2oEmissionRateUnit": "LBS_PER_MWH"
}
```

**Key Observations**:
1. **EmissionsFactorType = "LocationBased"** ← This is the key discriminator
2. Both `Co2eEmissionRate` and `MktBsdCo2eEmissionRate` are 533.6 (identical values)
3. Name contains "Location Based" which matches the factor type

**How Salesforce Standard Uses This**:
- **Location-Based Calculation**: Uses `Co2eEmissionRate` (533.6) → Results in 368.59 tCO2e
- **Market-Based Calculation**: Sees `EmissionsFactorType` = "LocationBased", so treats market-based as 0 → Results in 0.0 tCO2e

---

## Solution Approach Determined

**Selected**: **Option A (Modified)** - Query separate rate fields from same emission factor set

### Implementation Logic

1. **Apex Query** - Add to `getStationaryInfo()` (line 70):
   ```apex
   ElectricityEmissionFactors.EmissionsFactorType,        // NEW - Type discriminator
   ElectricityEmissionFactors.Co2eEmissionRate,          // EXISTING - Location-based
   ElectricityEmissionFactors.Co2eEmissionRateUnit,      // EXISTING
   ElectricityEmissionFactors.MktBsdCo2eEmissionRate,    // NEW - Market-based
   ElectricityEmissionFactors.MktBsdCo2eEmissionRateUnit // NEW
   ```

2. **Wrapper Properties** - Add to `NZC_EasyAuditInfoWrapper`:
   ```apex
   @AuraEnabled
   public String EmissionsFactorType {get;set;}
   @AuraEnabled
   public Decimal MktBsdElecCo2eEmissionRate {get;set;}
   @AuraEnabled
   public String MktBsdElecCo2eEmissionRateUnit {get;set;}
   ```

3. **JavaScript Logic** - Update `nZC_EasyAuditStationaryCalc.js`:
   ```javascript
   // Determine which rates to use based on EmissionsFactorType
   if (this.emissionsFactorType === 'LocationBased') {
       // Use Co2eEmissionRate for location-based only
       // Market-based = 0 (no rate assigned for market methodology)
       this.locationBasedFactor = this.elecCO2EemissionsFactor;
       this.marketBasedFactor = 0;
   } else if (this.emissionsFactorType === 'MarketBased') {
       // Use MktBsdCo2eEmissionRate for market-based only
       // Location-based = 0 (no rate assigned for location methodology)
       this.locationBasedFactor = 0;
       this.marketBasedFactor = this.mktBsdElecCO2EemissionsFactor;
   } else {
       // Factor type not specified - use both rates
       this.locationBasedFactor = this.elecCO2EemissionsFactor;
       this.marketBasedFactor = this.mktBsdElecCO2EemissionsFactor;
   }
   ```

---

## Why Salesforce Shows Different Values

**Test Record Calculation**:
- Fuel Consumption: 1,522,850.71 kWh
- Location-Based Rate: 533.6 LBS/MWH
- Market-Based Rate: 0 (because EmissionsFactorType = "LocationBased")

**Location-Based**:
```
1,522,850.71 kWh * 533.6 LBS/MWH / 1000 / 2.20462 (lbs to kg) / 1000 (kg to tonnes)
= 368.5857 tCO2e
```

**Market-Based**:
```
Factor type is "LocationBased" → Market rate = 0
(1,522,850.71 - 0 renewable) * 0 / 1000 = 0.0 tCO2e
```

---

## Next Steps

**Phase 2**: Implement the solution approach (3-6 hours)

1. ✅ Findings documented (this file)
2. ⏭️ Update Apex controller query
3. ⏭️ Update InfoWrapper properties and mapping
4. ⏭️ Update JavaScript calculation logic
5. ⏭️ Add comprehensive test coverage
6. ⏭️ Verify with test record 7LKWt000000FGYqOAO

**Expected Outcome**: EasyAudit component will match Salesforce standard UI:
- Market-Based: 0.0 tCO2e
- Location-Based: 368.59 tCO2e

---

## References

- **Issue**: ISSUE-market-location-emission-factors.md
- **Plan**: /Users/carlosvillalpando/.claude/plans/lazy-snuggling-conway.md
- **Test Record**: 7LKWt000000FGYqOAO
- **Emission Factor Set**: 0oTWt00000005UNMAY
- **Objects**: ElectricityEmssnFctrSet, StnryAssetEnvrSrc, StnryAssetEnrgyUse
