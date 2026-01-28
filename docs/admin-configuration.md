# Admin Configuration Guide

> **Advanced configuration options and customization**

This guide covers advanced configuration options, customization settings, and best practices for optimizing NZC EasyAudit in your Salesforce org.

---

## Table of Contents

1. [Permission Set Customization](#permission-set-customization)
2. [Component Customization](#component-customization)
3. [Page Layout Optimization](#page-layout-optimization)
4. [Performance Optimization](#performance-optimization)
5. [Data Quality Best Practices](#data-quality-best-practices)
6. [Integration Considerations](#integration-considerations)

---

## Permission Set Customization

### Creating Custom Permission Sets

If you need different access levels for different user groups:

1. **Create Role-Based Permission Sets**
   - Create separate permission sets for different roles
   - Example: "NZC EasyAudit - View Only" vs "NZC EasyAudit - Full Access"

2. **Field-Level Security Granularity**
   - Restrict access to sensitive fields if needed
   - Use field-level security to hide certain calculation details

3. **Profile Combinations**
   - Combine permission sets with profiles for layered security
   - Use permission set groups for easier management

### Permission Set Groups

For organizations with multiple permission sets:

1. Navigate to **Setup** → **Permission Set Groups**
2. Create a new group (e.g., "NZC EasyAudit Suite")
3. Add the NZC EasyAudit permission set
4. Add related permission sets if needed
5. Assign the group to users instead of individual sets

---

## Component Customization

### Component Placement Strategies

**Option 1: Dedicated Tab**
- Create a separate tab for audit details
- Use Lightning App Builder to create a tabbed interface
- Place the component in its own tab for cleaner organization

**Option 2: Related List Alternative**
- Use the component as an alternative to related lists
- Place it in a region that's always visible
- Consider using accordion sections for space efficiency

**Option 3: Mobile Optimization**
- Ensure component is visible on mobile devices
- Test responsive behavior on different screen sizes
- Consider mobile-specific page layouts

### Component Visibility Rules

You can control component visibility using:

1. **Record Type Visibility**
   - Configure page assignments by record type
   - Show component only for specific record types

2. **Profile-Based Visibility**
   - Use page visibility settings
   - Restrict component to specific profiles

3. **Conditional Display** (Future Enhancement)
   - Component currently displays for all records
   - Future versions may support conditional display logic

---

## Page Layout Optimization

### Recommended Page Layouts

**For Vehicle Energy Use:**
```
┌─────────────────────────────────────┐
│ Record Header (Standard)            │
├─────────────────────────────────────┤
│ Record Detail (Key Fields)          │
├─────────────────────────────────────┤
│ Related Lists (Standard)             │
├─────────────────────────────────────┤
│ NZC EasyAudit Component             │ ← Place here
└─────────────────────────────────────┘
```

**For Stationary Energy Use:**
```
┌─────────────────────────────────────┐
│ Record Header (Standard)            │
├─────────────────────────────────────┤
│ Record Detail (Key Fields)          │
├─────────────────────────────────────┤
│ NZC EasyAudit Component             │ ← Place here
├─────────────────────────────────────┤
│ Related Lists (Standard)             │
└─────────────────────────────────────┘
```

### Best Practices

1. **Placement Priority**
   - Place component above the fold when possible
   - Ensure it's visible without scrolling
   - Consider user workflow and information hierarchy

2. **Spacing and Sizing**
   - Use appropriate component sizing
   - Leave adequate whitespace around the component
   - Test on different screen resolutions

3. **Multiple Page Variants**
   - Create different page layouts for different record types
   - Customize component placement per record type
   - Use Lightning App Builder's page assignment features

---

## Performance Optimization

### Query Optimization

The component uses optimized SOQL queries with:
- `WITH USER_MODE` for security
- Field-level queries (not SELECT *)
- Relationship queries for related data

**Best Practices:**
1. Ensure proper indexing on lookup fields
2. Monitor query performance in debug logs
3. Review governor limit usage

### Caching Considerations

**Current Implementation:**
- Calculations are performed client-side
- No server-side caching implemented
- Each page load triggers a new calculation

**Future Enhancements:**
- Consider implementing caching for frequently accessed records
- Use Platform Cache for emission factor data
- Implement calculation result caching

### Governor Limits

The component respects Salesforce governor limits:
- **SOQL Queries:** Uses minimal queries (typically 2-3 per record)
- **DML Operations:** None (read-only component)
- **CPU Time:** Calculations performed client-side
- **Heap Size:** Efficient data structures used

**Monitoring:**
- Enable debug logs for Apex classes
- Monitor query performance
- Review limit usage in production

---

## Data Quality Best Practices

### Emission Factor Data

**Required Data:**
- Ensure emission factor sets are complete
- Verify all fuel types have corresponding emission factors
- Check that emission factor units are correct

**Data Validation:**
- Use validation rules on emission factor records
- Ensure required fields are populated
- Verify unit consistency across related records

### Energy Use Records

**Data Completeness:**
- Ensure fuel consumption values are populated
- Verify unit fields match expected values
- Check that related records (emission sources) are linked

**Data Quality Checks:**
- Validate fuel type values
- Ensure unit conversions are possible
- Verify scope assignments are correct

### Custom Fuel/Unit Configuration

**Setup Requirements:**
- Create FuelType records for custom fuels
- Create SustainabilityUom records for custom units
- Configure SustnUomConversion records with correct factors

**Validation:**
- Test conversion factors are accurate
- Verify custom fuel names display correctly
- Ensure conversion calculations are correct

---

## Integration Considerations

### API Access

The component uses:
- **@AuraEnabled methods** for LWC communication
- **SOQL queries** for data retrieval
- **No REST/SOAP APIs** currently exposed

**Future API Considerations:**
- May expose REST API endpoints for external systems
- Consider GraphQL API for complex queries
- Evaluate API rate limits for bulk operations

### External System Integration

**Current Limitations:**
- Component is designed for Salesforce UI only
- No external API access currently available
- Calculations are performed in-browser

**Integration Options:**
1. **Screen Scraping** (Not Recommended)
   - Not supported or recommended
   - Use official APIs when available

2. **Apex REST Services** (Future)
   - May be added in future versions
   - Would enable external system integration

3. **Platform Events** (Future)
   - Could be used for real-time updates
   - Enable event-driven integrations

### Reporting Integration

**Current State:**
- Component displays calculations in UI
- Calculations are not stored as fields
- No direct reporting integration

**Workarounds:**
- Use Net Zero Cloud's built-in reporting
- Export calculation data manually if needed
- Consider custom reporting solutions

---

## Security Best Practices

### Field-Level Security

**Recommendations:**
- Grant minimum required field access
- Use field-level security for sensitive data
- Review field access regularly

### Sharing Rules

**Best Practices:**
- Configure sharing rules appropriately
- Use role hierarchies for access control
- Implement manual sharing for exceptions

### Audit Trail

**Considerations:**
- Component is read-only (no audit trail needed)
- Monitor user access via field history tracking
- Review permission set assignments regularly

---

## Maintenance

### Regular Maintenance Tasks

**Monthly:**
- Review permission set assignments
- Check for orphaned records
- Verify emission factor data accuracy

**Quarterly:**
- Review component performance
- Check for Salesforce platform updates
- Update documentation as needed

**Annually:**
- Review security settings
- Audit user access
- Evaluate component usage and effectiveness

### Monitoring

**Key Metrics to Monitor:**
- Component load times
- User adoption rates
- Error frequency
- Support requests related to component

**Tools:**
- Salesforce Debug Logs
- Lightning Usage App
- Custom dashboards (if created)

---

## Troubleshooting Configuration Issues

### Common Configuration Problems

**Issue: Component Not Appearing**
- Check page assignment
- Verify component is added to page
- Review page visibility settings

**Issue: Performance Issues**
- Review SOQL query performance
- Check for missing indexes
- Monitor governor limit usage

**Issue: Data Quality Problems**
- Validate emission factor data
- Check unit conversion factors
- Verify related record relationships

---

## Additional Resources

- **Quick Start:** [Admin Quick Start Guide](admin-quick-start.md)
- **Complete Setup:** [Admin Setup Guide](admin-setup.md)
- **Troubleshooting:** [Admin Troubleshooting Guide](admin-troubleshooting.md)
- **User Guide:** [User Guide](user-guide.md)

---

**Last Updated:** January 2026  
**Version:** 1.0
