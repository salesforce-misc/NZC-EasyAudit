# User Guide: NZC EasyAudit

> **How to use the NZC EasyAudit component**

This guide helps end users understand how to use the NZC EasyAudit component to view detailed emissions calculations for vehicle and stationary energy use records.

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing the Component](#accessing-the-component)
3. [Understanding the Display](#understanding-the-display)
4. [Viewing Calculations](#viewing-calculations)
5. [Interpreting Results](#interpreting-results)
6. [Common Questions](#common-questions)

---

## Overview

### What is NZC EasyAudit?

NZC EasyAudit is a Salesforce component that displays step-by-step emissions calculations for your Net Zero Cloud energy use records. It provides transparency into how emissions are calculated, showing:

- **Input values** (fuel consumption, distance, etc.)
- **Unit conversions** (automatic conversions between units)
- **Emission factors** (factors applied from Net Zero Cloud)
- **Calculation steps** (detailed mathematical steps)
- **Final results** (total emissions by scope and gas type)

### What Records Does It Work With?

The component works with two types of Net Zero Cloud records:

1. **Vehicle Energy Use** (`VehicleAssetEnrgyUse`)
   - Fleet vehicles
   - Aircraft
   - Other vehicle types

2. **Stationary Energy Use** (`StnryAssetEnrgyUse`)
   - Buildings
   - Data centers
   - Other stationary assets

---

## Accessing the Component

### Where to Find It

The NZC EasyAudit component appears on the record detail page for Vehicle Energy Use and Stationary Energy Use records.

**Steps to Access:**

1. Navigate to a **Vehicle Energy Use** or **Stationary Energy Use** record
2. Scroll down on the record page
3. Look for the **NZC EasyAudit** component (usually in a card format)
4. The component displays automatically when you view the record

### Component Appearance

The component appears as:
- A **Lightning Card** with the title "NZC EasyAudit"
- An **accordion interface** with expandable sections
- **Calculation steps** organized in logical groups

---

## Understanding the Display

### Component Structure

The component displays calculations in an **accordion format** with multiple sections:

```
┌─────────────────────────────────────┐
│ NZC EasyAudit                       │
├─────────────────────────────────────┤
│ ▼ Calculate fuel consumption        │
│   - Step 1: Fuel consumption value │
│   - Step 2: Unit conversion        │
│   - Final: 100 L                   │
├─────────────────────────────────────┤
│ ▼ CH4 emissions                    │
│   - Step 1: Apply emission factor │
│   - Step 2: Calculate emissions    │
│   - Final: 2.5 kgs                 │
├─────────────────────────────────────┤
│ ▼ CO2 emissions                    │
│   ...                               │
└─────────────────────────────────────┘
```

### Accordion Sections

Each section represents a **calculation step**:

- **Section Title**: Describes what's being calculated
- **Calculation Lines**: Show the mathematical steps
- **Record Links**: Links to related emission factor records (if applicable)
- **Final Value**: The result of the calculation

### Expanding and Collapsing Sections

- **Click the section header** to expand or collapse
- **Multiple sections** can be open at the same time
- **Sections expand automatically** when the component first loads

---

## Viewing Calculations

### Step-by-Step Process

1. **Navigate to Record**
   - Open a Vehicle Energy Use or Stationary Energy Use record
   - The component loads automatically

2. **Review Calculation Steps**
   - Expand accordion sections to view details
   - Read through calculation lines
   - Check unit conversions
   - Review emission factors applied

3. **Understand the Flow**
   - Calculations flow from top to bottom
   - Each step builds on previous steps
   - Final values are shown at the end of each section

### Example: Vehicle Energy Use Calculation

**Section 1: Calculate fuel consumption**
```
Fuel consumption: 100 Liters
Unit conversion: Liters to Gallons
Final: 26.4 Gallons
```

**Section 2: CH4 emissions**
```
CH4 emissions = Fuel consumption × CH4 emission factor
CH4 emissions = 26.4 Gal × 0.05 kg/Gal
Final: 1.32 kgs
```

**Section 3: CO2 emissions**
```
CO2 emissions = Fuel consumption × CO2 emission factor
CO2 emissions = 100 L × 2.31 kg/L
Final: 231 kgs
```

**Section 4: Scope 1 Emissions**
```
Scope 1 = (CO2 / 1000) + (CH4 / 1000 × GWP) + (N2O / 1000 × GWP) + Supplemental
Scope 1 = (231 / 1000) + (1.32 / 1000 × 25) + ...
Final: 0.5 tCO2e
```

---

## Interpreting Results

### Understanding Emission Scopes

The component calculates emissions by **scope**:

- **Scope 1**: Direct emissions from owned assets
- **Scope 2**: Indirect emissions from purchased energy (electricity, heat, etc.)
- **Scope 3**: Indirect emissions from leased assets or other sources

### Understanding Gas Types

Calculations include multiple greenhouse gases:

- **CO2**: Carbon dioxide
- **CH4**: Methane (converted using Global Warming Potential)
- **N2O**: Nitrous oxide (converted using Global Warming Potential)

### Final Results

The final section shows:
- **Total emissions** in tCO2e (tonnes of CO2 equivalent)
- **Breakdown by gas type** (if applicable)
- **Scope assignment** (Scope 1, 2, or 3)

### Record Links

Some sections include **links to related records**:
- Click the link to view the emission factor record
- Links open in a new tab/window
- Use links to verify emission factor values

---

## Common Questions

### Q: Why don't I see the component?

**A:** Check the following:
- Ensure you have the permission set assigned
- Verify the component was added to the Lightning page
- Check that you're viewing a Vehicle or Stationary Energy Use record
- Contact your administrator if issues persist

### Q: Why are some sections empty?

**A:** This could mean:
- Missing emission factor data
- Incomplete record data
- Calculation not applicable for this record type
- Contact your administrator to verify data completeness

### Q: How do I know if calculations are correct?

**A:** The component shows:
- Step-by-step calculations you can verify
- Links to emission factor records
- Transparent unit conversions
- Compare with Net Zero Cloud's built-in calculations

### Q: Can I export the calculations?

**A:** Currently, the component is view-only:
- Calculations are displayed in the UI
- No export functionality currently available
- Use browser print/save features if needed
- Future versions may include export capabilities

### Q: Why do I see "Custom fuel or Custom unit conversion"?

**A:** This section appears when:
- Custom fuel types are used
- Custom units of measure are used
- Flexible fuels framework is utilized
- The section shows conversion details

### Q: What if calculations seem incorrect?

**A:** Check the following:
- Verify input values on the record
- Review emission factor values (click record links)
- Check unit conversions
- Compare with Net Zero Cloud calculations
- Contact your administrator if discrepancies persist

---

## Tips for Using the Component

### Best Practices

1. **Review All Sections**
   - Expand all sections to see complete calculations
   - Don't skip steps - each builds on previous ones

2. **Check Record Links**
   - Click links to verify emission factor values
   - Review related record data
   - Ensure factors are current and accurate

3. **Understand Unit Conversions**
   - Pay attention to unit conversion steps
   - Verify conversion factors are reasonable
   - Check that final units match expectations

4. **Compare with Net Zero Cloud**
   - Use Net Zero Cloud's built-in calculations for comparison
   - Verify scope assignments are correct
   - Check that totals match expected values

### Keyboard Shortcuts

- **Tab**: Navigate between sections
- **Enter/Space**: Expand/collapse sections
- **Arrow Keys**: Navigate accordion sections

### Mobile Usage

The component is **responsive** and works on mobile devices:
- Touch to expand/collapse sections
- Swipe to scroll through calculations
- All functionality available on mobile

---

## Additional Resources

- **Admin Documentation**: See [Admin Setup Guide](admin-setup.md) for configuration details
- **Net Zero Cloud Help**: Refer to Salesforce Net Zero Cloud documentation
- **Support**: Contact your Salesforce administrator for assistance

---

## Glossary

- **Emission Factor**: A value that represents emissions per unit of activity
- **Global Warming Potential (GWP)**: A measure of how much heat a gas traps relative to CO2
- **tCO2e**: Tonnes of CO2 equivalent (standard unit for emissions)
- **Scope**: Classification of emissions by source (Scope 1, 2, or 3)
- **Unit Conversion**: Converting between different units of measure (e.g., liters to gallons)

---

**Last Updated:** January 2026  
**Version:** 1.0
