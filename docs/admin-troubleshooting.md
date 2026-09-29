# Admin Troubleshooting Guide

> **Solutions to common issues and problems**

This guide provides detailed troubleshooting steps for common issues administrators may encounter when configuring or using NZC EasyAudit.

---

## Table of Contents

1. [Deployment Issues](#deployment-issues)
2. [Security and Access Issues](#security-and-access-issues)
3. [Component Display Issues](#component-display-issues)
4. [AI Audit Insights Issues](#ai-audit-insights-issues)
5. [Calculation Issues](#calculation-issues)
6. [Performance Issues](#performance-issues)
7. [Data Quality Issues](#data-quality-issues)
8. [Getting Additional Help](#getting-additional-help)

---

## Deployment Issues

### Issue: Deployment Fails

**Symptoms:**
- Deployment returns errors
- Components not appearing in org
- Metadata not deployed

**Possible Causes:**
- Missing dependencies
- API version incompatibility
- Permission issues
- Validation errors

**Solutions:**

1. **Check Deployment Errors**
   ```
   - Review deployment status in Setup → Deploy → Deployment Status
   - Check for specific error messages
   - Review component dependencies
   ```

2. **Verify Prerequisites**
   - Ensure Net Zero Cloud is installed
   - Verify API version compatibility (65.0)
   - Check user deployment permissions

3. **Deploy Dependencies First**
   - Deploy Apex classes first
   - Then deploy Lightning Web Components
   - Finally deploy Aura components

4. **Check Validation Rules**
   - Temporarily disable validation rules if blocking
   - Re-enable after deployment
   - Review validation rule logic

### Issue: Components Deployed but Not Visible

**Symptoms:**
- Deployment successful
- Components not in component palette
- Cannot add component to pages

**Solutions:**

1. **Verify Component Metadata**
   - Check `isExposed=true` in component metadata
   - Verify component API names are correct
   - Check for metadata deployment errors

2. **Clear Cache**
   - Clear browser cache
   - Log out and log back in
   - Try incognito/private browsing mode

3. **Check Lightning Web Component Settings**
   - Setup → Lightning Components
   - Verify components are listed
   - Check component visibility settings

---

## Security and Access Issues

### Issue: "Insufficient Privileges" Error

**Symptoms:**
- Component loads but shows error
- "Insufficient Privileges" message displayed
- Calculations not loading

**Diagnosis Steps:**

1. **Check Permission Set Assignment**
   ```
   Setup → Users → [Select User] → Permission Set Assignments
   - Verify "NZC EasyAudit Access" is assigned
   - Check assignment is active
   ```

2. **Verify Object Permissions**
   ```
   Setup → Permission Sets → NZC EasyAudit Access → Object Settings
   - Check Vehicle Asset Energy Use: Read
   - Check Stationary Asset Energy Use: Read
   - Verify all required objects have Read access
   ```

3. **Check Field-Level Security**
   ```
   For each object → Field Permissions
   - Verify required fields have Read access
   - Check all fields listed in Field Reference
   ```

4. **Verify Apex Class Access**
   ```
   Permission Set → Apex Class Access
   - NZC_EasyAuditControllerV2: Enabled
   - NZC_EasyAuditConstants: Enabled
   - NZC_EasyAuditInfoWrapper: Enabled
   ```

**Solutions:**

1. **Assign Permission Set**
   - Navigate to Permission Sets
   - Click "Manage Assignments"
   - Add user to permission set

2. **Grant Object Access**
   - Edit permission set
   - Enable Read access for all required objects
   - Save changes

3. **Enable Field Access**
   - For each object, enable Read access for all fields
   - Use "View All" if available for faster setup
   - Save field permissions

4. **Verify Apex Access**
   - Check Apex Class Access in permission set
   - Add classes if missing
   - Save changes

### Issue: User Can See Component but No Data

**Symptoms:**
- Component appears on page
- Loading spinner shows indefinitely
- No calculation data displayed

**Possible Causes:**
- Missing object/field permissions
- Sharing rules preventing record access
- Missing related records

**Solutions:**

1. **Check Record Access**
   ```
   - Verify user can view the record itself
   - Check organization-wide defaults (OWD)
   - Review sharing rules
   - Check role hierarchy
   ```

2. **Verify Related Records**
   ```
   - Check emission factor records exist
   - Verify relationships are populated
   - Check OtherEmssnFctrSetItem records
   ```

3. **Review Debug Logs**
   ```
   Setup → Debug Logs
   - Filter by user
   - Look for SOQL errors
   - Check for permission errors
   ```

### Issue: Component Not Available in Component Palette

**Symptoms:**
- Cannot find component in Lightning App Builder
- Component not listed in Custom Components
- Cannot add to Lightning pages

**Solutions:**

1. **Verify Deployment**
   - Check deployment was successful
   - Verify all components deployed
   - Review deployment errors

2. **Check Component Metadata**
   - Verify `isExposed=true` in metadata
   - Check component API name
   - Verify target configuration

3. **Clear Browser Cache**
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear Salesforce cache
   - Log out and log back in

4. **Check Page Type**
   - Ensure editing Lightning Record Page
   - Component only available on record pages
   - Not available on Home or App pages

---

## Component Display Issues

### Issue: Component Not Visible on Page

**Symptoms:**
- Component added to page but not visible
- Page saved but component missing
- Component not rendering

**Solutions:**

1. **Verify Page Activation**
   ```
   Lightning App Builder → Activation
   - Check page is activated
   - Verify page assignment
   - Check app assignment
   ```

2. **Check Component Placement**
   ```
   - Verify component is in visible region
   - Check component is not hidden
   - Review component properties
   ```

3. **Verify User Access**
   - Check user has permission set assigned
   - Verify Lightning Web Component access
   - Check profile permissions

4. **Check Page Assignment**
   ```
   Lightning Experience App Manager
   - Verify page assigned to correct app
   - Check record type assignment
   - Verify profile visibility
   ```

### Issue: Component Shows Loading Spinner Forever

**Symptoms:**
- Component appears but never loads
- Spinner continues indefinitely
- No error message displayed

**Diagnosis:**

1. **Check Browser Console**
   ```
   Open Developer Tools (F12)
   - Check Console tab for JavaScript errors
   - Look for Apex call errors
   - Review network requests
   ```

2. **Check Debug Logs**
   ```
   Setup → Debug Logs
   - Filter by user and Apex classes
   - Look for exceptions
   - Check SOQL query errors
   ```

3. **Verify Record ID**
   ```
   - Check record ID is valid
   - Verify record exists
   - Check record access
   ```

**Solutions:**

1. **Fix Apex Errors**
   - Review debug log errors
   - Fix data quality issues
   - Verify required fields populated

2. **Check Network Issues**
   - Verify internet connection
   - Check Salesforce status
   - Review firewall settings

3. **Verify Data Completeness**
   - Check emission factor records exist
   - Verify related records linked
   - Ensure required fields populated

### Issue: Component Appears but is Empty

**Symptoms:**
- Component loads successfully
- No accordion sections visible
- No calculation steps displayed

**Possible Causes:**
- Missing emission factor data
- Invalid record type
- Calculation errors

**Solutions:**

1. **Verify Emission Factors**
   ```
   - Check OtherEmssnFctrSetItem records exist
   - Verify fuel type matches
   - Check emission factor relationships
   ```

2. **Check Record Type**
   ```
   - Verify record is Vehicle or Stationary Energy Use
   - Check record type is valid
   - Verify object type
   ```

3. **Review Calculation Logic**
   - Check browser console for errors
   - Verify data quality
   - Review calculation class logic

---

## AI Audit Insights Issues

### Issue: AI Panel Never Appears

**Symptoms:**
- Calculation accordion works, but no "Ask AI About This Audit Trail" section
- No error toast for missing AI

**Possible Causes:**
- Einstein Generative AI not activated
- Prompt Builder not available
- Prompt template not published
- User missing EasyAudit access permission set
- Org intentionally without Generative AI (expected hide behavior)

**Solutions:**

1. **Confirm Generative AI / Prompt Builder**
   - Setup → search for Einstein / Generative AI / Prompt Builder settings
   - Ensure features required for Prompt Builder templates are enabled

2. **Confirm Prompt Template**
   - Open Prompt Builder
   - Find **NZC EasyAudit Audit Insights**
   - Verify status is **Published**

3. **Confirm Permission Set**
   - Assign **NZC EasyAudit Access**
   - Verify Apex class access includes the AI controller and prompt service classes

4. **Expected Behavior**
   - If AI is unavailable, EasyAudit hides the panel on purpose
   - Core audit trail remains fully usable without AI

### Issue: AI Panel Appears but Questions Fail

**Symptoms:**
- Summary may load, but Ask returns an error toast
- Intermittent generation failures

**Solutions:**

1. Retry after confirming model / Prompt Builder health in the org
2. Verify the audit trail finished loading before asking
3. Check that the user question is not blank
4. Review Salesforce debug logs for ConnectApi / Einstein generation errors

---

## Calculation Issues

### Issue: Incorrect Calculations

**Symptoms:**
- Calculations displayed but values wrong
- Results don't match expected values
- Unit conversions incorrect

**Diagnosis:**

1. **Verify Emission Factors**
   ```
   - Check emission factor values
   - Verify units are correct
   - Compare with Net Zero Cloud values
   ```

2. **Check Unit Conversions**
   ```
   - Verify conversion factors
   - Check SustnUomConversion records
   - Review unit consistency
   ```

3. **Review Source Data**
   ```
   - Check fuel consumption values
   - Verify distance values (if applicable)
   - Review input data accuracy
   ```

**Solutions:**

1. **Correct Emission Factors**
   - Update emission factor records
   - Verify factor values are accurate
   - Check unit assignments

2. **Fix Unit Conversions**
   - Review conversion factors
   - Update SustnUomConversion records
   - Verify conversion calculations

3. **Validate Source Data**
   - Review energy use record data
   - Correct input values
   - Verify data entry accuracy

### Issue: Missing Calculation Steps

**Symptoms:**
- Some calculation steps missing
- Accordion sections incomplete
- Steps not displaying

**Solutions:**

1. **Check Data Completeness**
   - Verify all required fields populated
   - Check emission factor data complete
   - Review related record data

2. **Review Calculation Logic**
   - Check browser console for errors
   - Verify calculation class execution
   - Review step generation logic

3. **Validate Record Type**
   - Ensure correct record type
   - Check record type-specific logic
   - Verify record type assignments

### Issue: Custom Fuel Conversions Not Working

**Symptoms:**
- Custom fuel types not converting
- Custom units not recognized
- Conversion factors not applied

**Solutions:**

1. **Verify Custom Fuel Setup**
   ```
   - Check FuelType records exist
   - Verify SustainabilityUom records exist
   - Check SustnUomConversion records
   ```

2. **Review Conversion Configuration**
   ```
   - Verify conversion factors are correct
   - Check SourceUom and TargetUom values
   - Review FuelType assignments
   ```

3. **Check Data Relationships**
   - Verify fuel type IDs match
   - Check unit ID assignments
   - Review conversion factor logic

---

## Performance Issues

### Issue: Slow Component Loading

**Symptoms:**
- Component takes long time to load
- Calculations slow to display
- Page performance degraded

**Diagnosis:**

1. **Check SOQL Query Performance**
   ```
   Setup → Debug Logs
   - Review query execution times
   - Check for inefficient queries
   - Look for missing indexes
   ```

2. **Monitor Governor Limits**
   ```
   - Check SOQL query count
   - Review CPU time usage
   - Verify heap size usage
   ```

3. **Review Network Performance**
   ```
   Browser Developer Tools → Network
   - Check API call times
   - Review response sizes
   - Look for slow requests
   ```

**Solutions:**

1. **Optimize Queries**
   - Add indexes to lookup fields
   - Review query selectivity
   - Optimize field lists

2. **Reduce Data Volume**
   - Limit related record queries
   - Optimize emission factor lookups
   - Review data relationships

3. **Improve Caching**
   - Consider Platform Cache
   - Review component caching
   - Optimize data retrieval

### Issue: Timeout Errors

**Symptoms:**
- Component times out
- "Request timeout" errors
- Calculations fail to complete

**Solutions:**

1. **Increase Timeout Settings**
   - Review Salesforce timeout settings
   - Check browser timeout settings
   - Review network configuration

2. **Optimize Data Retrieval**
   - Reduce query complexity
   - Limit data volume
   - Optimize related queries

3. **Review Calculation Logic**
   - Optimize calculation algorithms
   - Reduce processing time
   - Improve efficiency

---

## Data Quality Issues

### Issue: Missing Emission Factors

**Symptoms:**
- Calculations incomplete
- Missing emission factor data
- Errors related to factors

**Solutions:**

1. **Create Missing Records**
   ```
   - Create OtherEmssnFctrSetItem records
   - Populate required fields
   - Link to emission factor sets
   ```

2. **Verify Relationships**
   ```
   - Check OtherEmssnFctrId populated
   - Verify fuel type matches
   - Review relationship integrity
   ```

3. **Validate Data**
   - Check required fields populated
   - Verify data accuracy
   - Review data quality

### Issue: Invalid Unit Values

**Symptoms:**
- Unit conversions fail
- Invalid unit errors
- Conversion calculations incorrect

**Solutions:**

1. **Verify Unit Values**
   ```
   - Check unit field values
   - Verify standard unit names
   - Review custom unit configuration
   ```

2. **Review Conversion Factors**
   ```
   - Check SustnUomConversion records
   - Verify conversion factors
   - Review unit mappings
   ```

3. **Validate Unit Consistency**
   - Ensure units match expected values
   - Check unit naming conventions
   - Review unit standardization

---

## Getting Additional Help

### Debugging Resources

1. **Salesforce Debug Logs**
   ```
   Setup → Debug Logs
   - Enable debug logs for users
   - Filter by Apex classes
   - Review exceptions and errors
   ```

2. **Browser Developer Tools**
   ```
   Press F12 to open Developer Tools
   - Console: JavaScript errors
   - Network: API call details
   - Sources: Code debugging
   ```

3. **Salesforce Developer Console**
   ```
   Setup → Developer Console
   - Execute anonymous Apex
   - Test SOQL queries
   - Review logs
   ```

### Support Channels

1. **GitHub Issues**
   - Report bugs: [GitHub Issues](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/issues)
   - Search existing issues
   - Follow issue templates

2. **Documentation**
   - [Admin Quick Start](admin-quick-start.md)
   - [Complete Setup Guide](admin-setup.md)
   - [Configuration Guide](admin-configuration.md)

3. **Community Resources**
   - Salesforce Trailblazer Community
   - Net Zero Cloud documentation
   - Salesforce Developer Forums

### Information to Provide When Seeking Help

When reporting issues, include:

1. **Environment Details**
   - Salesforce org type (Sandbox/Production)
   - API version
   - Net Zero Cloud version

2. **Error Details**
   - Exact error messages
   - Screenshots if applicable
   - Steps to reproduce

3. **Configuration**
   - Permission set assignments
   - Page configuration
   - Security settings

4. **Debug Information**
   - Debug log excerpts
   - Browser console errors
   - Network request details

---

## Quick Reference: Common Solutions

| Issue | Quick Solution |
|-------|----------------|
| Component not visible | Check page activation, verify component added |
| Insufficient privileges | Assign permission set, verify object/field access |
| Loading spinner forever | Check debug logs, verify data completeness |
| Incorrect calculations | Verify emission factors, check unit conversions |
| Slow performance | Optimize queries, review data volume |
| Missing data | Check related records, verify relationships |

---

## Additional Resources

- **Quick Start:** [Admin Quick Start Guide](admin-quick-start.md)
- **Complete Setup:** [Admin Setup Guide](admin-setup.md)
- **Configuration:** [Admin Configuration Guide](admin-configuration.md)
- **User Guide:** [User Guide](user-guide.md)

---

**Last Updated:** January 2026  
**Version:** 1.0
