# Issue: EasyAudit Component Uses Same Emission Factor for Market and Location-Based Calculations

**Issue ID**: NZC-EA-002  
**Severity**: Medium  
**Type**: Enhancement / Architectural Limitation  
**Discovered**: 2026-04-14  
**Affects**: Stationary Asset Energy Use - Electricity Records

---

## Summary

The EasyAudit component currently queries only ONE electricity emission factor set and uses it for both Market-Based and Location-Based Scope 2 calculations. This causes both calculations to show identical values when they should be different.

---

## Current Behavior

### What Happens Now

1. **Apex Controller** ([NZC_EasyAuditControllerV2.cls:70](force-app/main/default/classes/NZC_EasyAuditControllerV2.cls#L70)):
   ```apex
   ElectricityEmissionFactors.Co2eEmissionRate, 
   ElectricityEmissionFactors.Co2eEmissionRateUnit,
   ```
   
2. **InfoWrapper** ([NZC_EasyAuditInfoWrapper.cls:182-184](force-app/main/default/classes/NZC_EasyAuditInfoWrapper.cls#L182-L184)):
   ```apex
   this.ElecCo2eEmissionRateUnit = stationaryInfo.ElectricityEmissionFactors.Co2eEmissionRateUnit;
   this.ElectCo2eEmissionRate = stationaryInfo.ElectricityEmissionFactors.Co2eEmissionRate;
   this.ElecFactorId = stationaryInfo.ElectricityEmissionFactorsId;
   ```

3. **LWC Component** ([nZC_EasyAuditStationaryCalc.js:60](force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/nZC_EasyAuditStationaryCalc.js#L60)):
   ```javascript
   this.elecCO2EemissionsFactor = infoObject['ElectCo2eEmissionRate'] || 0;
   ```
   
   Uses this **same factor** for both:
   - **Location-Based** (line 205): `totalFuelConsumptionKwh * elecCO2EemissionsFactor / 1000`
   - **Market-Based** (line 245): `(totalFuelConsumptionKwh - allocatedRenewableEnergyInKwh) * elecCO2EemissionsFactor / 1000`

### Example Issue

**Record**: *Cat 3 - Cirrus Tower - Jul 2024 - Electricity (7LKWt000000FGYqOAO)

**Emission Factor Used**: CAMX - WECC California - (5.0) eGRID2021 - **Location Based**
- Rate: 533.6 LBS_PER_MWH
- Fuel Consumption: 1,522,850.71 kWh

**EasyAudit Component Shows**:
- Scope 2 Market-Based: **368.585747 tCO2e**
- Scope 2 Location-Based: **368.585747 tCO2e**

**Salesforce Standard Shows**:
- Scope 2 Market-Based: **0.0000 tCO2e** (no market-based factor assigned)
- Scope 2 Location-Based: **368.5857 tCO2e** (uses location-based factor)

---

## Expected Behavior

The component should:

1. Query **separate** emission factor sets:
   - `ElectricityEmssnFctrId` (current - typically location-based)
   - `MarketBasedElectricityEmssnFctrId` (NEW - market-based factor)

2. Use **different factors** for each calculation:
   - **Location-Based**: Use `ElectricityEmssnFctrId`
   - **Market-Based**: Use `MarketBasedElectricityEmssnFctrId` (if exists), otherwise 0

3. Handle cases where:
   - Only location-based factor exists → Market-based = 0
   - Only market-based factor exists → Location-based = 0
   - Both exist → Use respective factors
   - Neither exists → Both = 0

---

## Root Cause

### Data Model Investigation

**Question**: Does `StnryAssetEnvrSrc` have a field for market-based emission factors?

Need to investigate:
```apex
// Check if these fields exist:
StnryAssetEnvrSrc.ElectricityEmssnFctrId         // ✅ Exists (currently used)
StnryAssetEnvrSrc.MarketBasedElectricityEmssnFctrId  // ❓ Need to verify

// Or check if ElectricityEmssnFctrSet has both factors:
ElectricityEmssnFctrSet.LocationBasedCo2eEmissionRate   // ❓ Need to verify
ElectricityEmssnFctrSet.MarketBasedCo2eEmissionRate     // ❓ Need to verify
```

**Current Finding**: The emission factor set has:
- `LocationBasedBiomassMixPct`: 2.5
- `MarketBasedBiomassMixPct`: 2.5

This suggests the **same set** might contain both factors, or there's a separate field we're not querying.

### Salesforce Standard Behavior

Salesforce's standard calculation shows different values, which means:
1. Standard objects support separate factors, OR
2. Standard calculation uses Scope Allocation records, OR
3. Standard uses a different field we're not querying

---

## Investigation Tasks

### Phase 1: Data Model Discovery

1. **Query all fields on `StnryAssetEnvrSrc`**:
   ```apex
   Schema.DescribeSObjectResult describe = StnryAssetEnvrSrc.SObjectType.getDescribe();
   Map<String, Schema.SObjectField> fields = describe.fields.getMap();
   for(String fieldName : fields.keySet()) {
       if(fieldName.containsIgnoreCase('electric') || fieldName.containsIgnoreCase('market')) {
           System.debug(fieldName + ' : ' + fields.get(fieldName).getDescribe().getLabel());
       }
   }
   ```

2. **Query all fields on `ElectricityEmssnFctrSet`**:
   ```apex
   Schema.DescribeSObjectResult describe = ElectricityEmssnFctrSet.SObjectType.getDescribe();
   Map<String, Schema.SObjectField> fields = describe.fields.getMap();
   for(String fieldName : fields.keySet()) {
       if(fieldName.containsIgnoreCase('emission') || fieldName.containsIgnoreCase('market') || fieldName.containsIgnoreCase('location')) {
           System.debug(fieldName + ' : ' + fields.get(fieldName).getDescribe().getLabel());
       }
   }
   ```

3. **Check if `ScopEmssnAllocn` (Scope Emission Allocation) records exist**:
   ```sql
   SELECT Id, Name, ScopeEmissionsType, EmissionsValue 
   FROM ScopEmssnAllocn 
   WHERE StnryAssetEnrgyUseId = '7LKWt000000FGYqOAO'
   ```

### Phase 2: Design Solution

**Option A**: Use Separate Emission Factor Sets
- Add query for market-based factor ID
- Modify wrapper to include both factors
- Update LWC to use correct factor for each calculation

**Option B**: Use Scope Allocation Records
- Query `ScopEmssnAllocn` records
- Use allocation records to determine market vs location factors
- Align with Salesforce standard behavior

**Option C**: Query Both Factor Types from Same Set
- Check if `ElectricityEmssnFctrSet` has separate fields
- Modify query to include both rate fields
- Update calculations to use respective rates

### Phase 3: Implementation

After Phase 1 & 2 determine the approach:

1. **Update Apex Controller** ([NZC_EasyAuditControllerV2.cls](force-app/main/default/classes/NZC_EasyAuditControllerV2.cls)):
   - Add market-based factor query
   - Pass both factors to wrapper

2. **Update InfoWrapper** ([NZC_EasyAuditInfoWrapper.cls](force-app/main/default/classes/NZC_EasyAuditInfoWrapper.cls)):
   - Add properties for market-based factor
   - Populate from stationary info

3. **Update LWC Component** ([nZC_EasyAuditStationaryCalc.js](force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/nZC_EasyAuditStationaryCalc.js)):
   - Store separate factors
   - Use location-based factor for location calculation (line ~205)
   - Use market-based factor for market calculation (line ~245)

4. **Add Tests**:
   - Test with only location-based factor
   - Test with only market-based factor
   - Test with both factors (different values)
   - Test with neither factor (both should be 0)
   - Test with scope allocation records (if applicable)

---

## Impact Assessment

**Severity**: Medium
- **Functional Impact**: Calculations show incorrect values (both the same)
- **User Impact**: Users cannot see difference between market and location-based emissions
- **Data Integrity**: No data corruption (source data is correct)
- **Workaround**: Users can view standard Salesforce UI for correct values

**Affected Components**:
- `NZC_EasyAuditControllerV2.cls` (Apex query)
- `NZC_EasyAuditInfoWrapper.cls` (data mapping)
- `nZC_EasyAuditStationaryCalc.js` (LWC calculations)
- Test classes (comprehensive test coverage needed)

**Not Affected**:
- Vehicle asset calculations (separate logic)
- Non-electricity fuel types (use other emission sets)
- Refrigerant calculations

---

## Acceptance Criteria

**Must Have**:
- ✅ Market-Based and Location-Based show **different** values when factors differ
- ✅ Market-Based shows 0 when no market factor assigned
- ✅ Location-Based shows 0 when no location factor assigned
- ✅ Values match Salesforce standard UI calculations
- ✅ All existing tests pass
- ✅ New tests cover all factor combinations
- ✅ Code coverage maintained ≥85%

**Nice to Have**:
- ⚠️ Logging shows which factors are used
- ⚠️ Component displays factor names for transparency
- ⚠️ Warning message when using same factor for both (if that's the data state)

---

## Related Issues

- **NZC-EA-001**: Fixed in Phase 1 - `SuplScope2MarketBasedEmssn` field swap bug ✅
  - Commit: `fix(apex): correct SuplScope2MarketBasedEmssn field assignment`
  - This issue is SEPARATE from NZC-EA-001 and does NOT affect that fix

---

## Investigation Log

### 2026-04-14: Initial Discovery

**Record Tested**: 7LKWt000000FGYqOAO
- **Name**: *Cat 3 - Cirrus Tower - Jul 2024 - Electricity
- **Fuel Type**: Electricity
- **Fuel Consumption**: 1,522,850.71 kWh
- **SuplScope2MarketBasedEmssn**: null (in database)
- **SuplScope2LocationBasedEmssn**: null (in database)
- **Emission Factor**: CAMX - WECC California - Location Based (533.6 LBS_PER_MWH)

**Apex Controller Output**:
```
SuplScope2MarketBasedEmssn: null ✅ (correct)
SuplScope2LocationBasedEmssn: null ✅ (correct)
ElectCo2eEmissionRate: 533.600000
ElecFactorName: CAMX - WECC California - (5.0) eGRID2021 - Location Based
```

**LWC Component Shows**:
- Scope 2 Market-Based: 368.585747 tCO2e
- Scope 2 Location-Based: 368.585747 tCO2e (both use same factor)

**Salesforce Standard Shows**:
- Scope 2 Market-Based: 0.0000 tCO2e
- Scope 2 Location-Based: 368.5857 tCO2e

**Conclusion**: Component uses location-based factor for both calculations

---

## Priority & Timeline

**Priority**: Medium (Enhancement)
- Not blocking current functionality
- Users have workaround (standard UI)
- Affects user experience and accuracy

**Estimated Effort**:
- Phase 1 (Investigation): 2-4 hours
- Phase 2 (Design): 1-2 hours
- Phase 3 (Implementation): 4-6 hours
- Testing & Verification: 2-3 hours
- **Total**: 9-15 hours

**Recommended Timeline**:
- Phase 1: Immediate (next sprint)
- Phase 2-3: After investigation complete
- Target Release: Next minor version (v1.x)

---

## References

- [Net Zero Cloud Documentation - Scope 2 Emissions](https://help.salesforce.com/s/articleView?id=sf.net_zero_cloud_scope2_emissions.htm)
- [Phase 1+4 Remediation Plan](pmd-remediation-plan.md)
- [Repository Summary](REPOSITORY_SUMMARY.md)
- Salesforce Object: `StnryAssetEnvrSrc`
- Salesforce Object: `ElectricityEmssnFctrSet`
- Component: [nZC_EasyAuditStationaryCalc.js](force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/nZC_EasyAuditStationaryCalc.js)

---

**Status**: 🔍 Investigation Needed  
**Next Action**: Run Phase 1 discovery queries to determine data model structure  
**Owner**: TBD  
**Created**: 2026-04-14
